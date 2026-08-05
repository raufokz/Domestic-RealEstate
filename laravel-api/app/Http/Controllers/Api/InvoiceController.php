<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Invoice;
use App\Services\Payments\InvoicePdfService;
use App\Services\Payments\PayoneerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    public function __construct(
        private PayoneerService $payments,
        private InvoicePdfService $pdf,
    ) {
    }

    public function show($invoiceNumber) {
        $user = Auth::user();
        $invoice = Invoice::where('invoice_number', $invoiceNumber)->firstOrFail();
        if ($invoice->user_id !== $user->id && !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403);
        }
        return response()->json($invoice);
    }

    public function myInvoices() {
        $user = Auth::user();
        return response()->json(
            Invoice::where('user_id', $user->id)->orderBy('created_at', 'desc')->get()
        );
    }

    public function plans() {
        return response()->json(
            \App\Models\MembershipPlan::where('status', 'active')->get()
        );
    }

    public function leadPackages() {
        return response()->json(
            \App\Models\LeadPackage::where('is_active', true)->get()
        );
    }

    public function createInvoice(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'description' => 'nullable|string',
            'items' => 'nullable|array',
            'due_date' => 'nullable|date',
        ]);

        $invoiceNumber = 'INV-' . strtoupper(Str::random(8));

        $invoice = Invoice::create([
            'invoice_number' => $invoiceNumber,
            'user_id' => $request->user_id,
            'amount' => $request->amount,
            'currency' => $request->get('currency', 'USD'),
            'status' => 'pending',
            'description' => $request->description,
            'items' => $request->items,
            'due_date' => $request->due_date,
            'created_at' => now(),
        ]);

        return response()->json($invoice, 201);
    }

    /**
     * Staff-only reconciliation for payments that happened OUTSIDE Payoneer
     * (wire transfer, check) — not reachable by the invoice's own owner,
     * requires a real reference note, and is fully audit-logged. This is
     * NOT how a Payoneer-checkout invoice gets marked paid — that only
     * ever happens via handlePayoneerWebhook() below, signature-verified.
     */
    public function recordManualPayment(Request $request, $id)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['staff', 'admin', 'super_admin'], true)) {
            abort(403, 'Unauthorized. Staff access required.');
        }

        $invoice = Invoice::findOrFail($id);
        if ($invoice->status === 'paid') {
            return response()->json(['message' => 'Invoice is already paid.'], 422);
        }

        $validated = $request->validate([
            'reference' => 'required|string|max:255',
            'method' => 'required|string|in:bank_transfer,check,other',
            'note' => 'nullable|string|max:1000',
        ]);

        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_gateway' => $validated['method'],
            'gateway_transaction_id' => $validated['reference'],
        ]);

        AuditLog::log('invoice.manual_payment_recorded', 'Invoice', $invoice->id, null, [
            'method' => $validated['method'],
            'reference' => $validated['reference'],
            'note' => $validated['note'] ?? null,
            'recorded_by' => $user->id,
        ]);

        return response()->json($invoice->fresh());
    }

    public function sendInvoice(Request $request, $id)
    {
        $invoice = Invoice::with('user')->findOrFail($id);

        $session = $this->payments->createCheckoutSession([
            'amount' => $invoice->amount,
            'currency' => $invoice->currency ?? 'USD',
            'description' => $invoice->description ?: "Invoice {$invoice->invoice_number}",
            'reference_id' => (string) $invoice->id,
            'customer_email' => $invoice->user?->email,
        ]);

        $invoice->update([
            'status' => 'sent',
            'sent_at' => now(),
            'payment_gateway' => 'payoneer',
            'payoneer_invoice_id' => $session['checkout_id'],
        ]);

        if ($invoice->user?->email) {
            try {
                \Illuminate\Support\Facades\Mail::to($invoice->user->email)
                    ->queue(new \App\Mail\InvoiceSent($invoice, $session['checkout_url']));
            } catch (\Throwable $e) {
                Log::warning('Invoice email failed to send', ['invoice_id' => $invoice->id, 'error' => $e->getMessage()]);
            }
        }

        return response()->json([
            'message' => 'Invoice sent with a real Payoneer checkout link.',
            'invoice' => $invoice->fresh(),
            'payoneer_link' => $session['checkout_url'],
        ]);
    }

    /**
     * Payoneer webhook for invoice payments — signature-verified, the only
     * path that can flip a Payoneer-gateway invoice to paid.
     */
    public function handlePayoneerWebhook(Request $request)
    {
        $signature = $request->header('X-Payoneer-Signature'); // VERIFY header name against live docs
        if (!$this->payments->verifyWebhookSignature($request->getContent(), $signature)) {
            Log::warning('Rejected invoice webhook with invalid/missing signature', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        $event = $request->input('event', 'payment.succeeded');
        $invoiceId = $request->input('reference_id') ?: $request->input('data.reference_id');
        $txnId = $request->input('transaction_id') ?: $request->input('data.id');

        $invoice = Invoice::find($invoiceId);
        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found.'], 404);
        }

        if ($event === 'payment.succeeded' && $invoice->status !== 'paid') {
            $invoice->update([
                'status' => 'paid',
                'paid_at' => now(),
                'gateway_transaction_id' => $txnId,
                'gateway_status_raw' => $request->all(),
            ]);

            \App\Services\Notifier::alert(
                title: 'Payment received',
                message: "Payment recorded for invoice {$invoice->invoice_number}.",
                severity: \App\Models\Notification::SEVERITY_SUCCESS,
                module: 'finance',
                actionUrl: "/admin/invoices/{$invoice->id}",
                actionLabel: 'Open invoice',
                data: ['invoice_id' => $invoice->id, 'invoice_number' => $invoice->invoice_number],
                event: 'payment_received',
            );
        }

        return response()->json(['message' => 'Webhook processed successfully.']);
    }

    public function downloadPdf($id)
    {
        $user = Auth::user();
        $invoice = Invoice::with('user')->findOrFail($id);
        if ($invoice->user_id !== $user->id && !in_array($user->role, ['staff', 'admin', 'super_admin'])) {
            abort(403);
        }

        return $this->pdf->download($invoice);
    }

    public function voidInvoice(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->update(['status' => 'voided']);
        return response()->json($invoice);
    }

    public function getInvoiceStats()
    {
        $stats = [
            'total_invoices' => Invoice::count(),
            'total_revenue' => Invoice::where('status', 'paid')->sum('amount'),
            'pending_amount' => Invoice::where('status', 'pending')->sum('amount'),
            'sent_amount' => Invoice::where('status', 'sent')->sum('amount'),
            'overdue_amount' => Invoice::where('status', 'sent')->where('due_at', '<', now())->sum('amount'),
            'invoices_by_status' => Invoice::select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))->groupBy('status')->get(),
            'recent_invoices' => Invoice::with('user')->latest()->limit(10)->get(),
            'monthly_revenue' => Invoice::where('status', 'paid')
                ->select(DB::raw('DATE_FORMAT(paid_at, "%Y-%m") as month'), DB::raw('SUM(amount) as revenue'))
                ->groupBy('month')
                ->orderBy('month')
                ->get(),
        ];

        return response()->json($stats);
    }

    public function adminIndex(Request $request)
    {
        $query = Invoice::with('user');

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('invoice_number', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $invoices = $query->latest()->paginate($request->get('per_page', 15));
        return response()->json($invoices);
    }

    public function updateInvoice(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        $request->validate([
            'amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'description' => 'nullable|string',
            // 'paid' is deliberately NOT an allowed value here — status can
            // only become paid via the signature-verified Payoneer webhook
            // (handlePayoneerWebhook) or the audited recordManualPayment()
            // action. Allowing it through this generic update would let
            // anyone with invoice-edit access self-report payment.
            'status' => 'nullable|string|in:draft,pending,sent,voided',
            'due_date' => 'nullable|date',
        ]);

        $invoice->update($request->only([
            'amount', 'currency', 'description', 'status', 'due_date',
        ]));

        return response()->json($invoice);
    }
}
