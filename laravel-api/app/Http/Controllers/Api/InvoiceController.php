<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
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

    public function markPaid(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        $request->validate(['payoneer_transaction_id' => 'nullable|string']);

        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payoneer_invoice_id' => $request->payoneer_transaction_id ?? $invoice->payoneer_invoice_id,
        ]);

        return response()->json($invoice);
    }

    public function sendInvoice(Request $request, $id)
    {
        $invoice = Invoice::with('user')->findOrFail($id);
        $invoice->update(['status' => 'sent', 'sent_at' => now()]);

        return response()->json([
            'message' => 'Invoice marked as sent',
            'invoice' => $invoice,
            'payoneer_link' => "https://www.payoneer.com/pay?voucher_code=MANUAL&invoice={$invoice->invoice_number}",
        ]);
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
            'status' => 'nullable|string|in:pending,sent,paid,voided',
            'due_date' => 'nullable|date',
        ]);

        $invoice->update($request->only([
            'amount', 'currency', 'description', 'status', 'due_date',
        ]));

        return response()->json($invoice);
    }
}
