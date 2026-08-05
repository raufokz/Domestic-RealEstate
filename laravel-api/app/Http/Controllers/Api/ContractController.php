<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\ContractActivityLog;
use App\Models\ContractSigner;
use App\Services\AutomationEngine;
use App\Services\ContractPdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContractController extends Controller
{
    public function show($contractNumber) {
        $user = Auth::user();
        $contract = Contract::with(['signers', 'versions'])->where('contract_number', $contractNumber)->firstOrFail();
        if ($contract->user_id !== $user->id && !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403);
        }

        ContractActivityLog::log($contract->id, 'viewed');

        return response()->json($contract);
    }

    public function sign(Request $request, $contractNumber) {
        $request->validate([
            'signature_base64' => 'required|string',
        ]);

        $user = Auth::user();
        $contract = Contract::where('contract_number', $contractNumber)->firstOrFail();

        if ($contract->user_id !== $user->id) abort(403);
        if ($contract->status !== 'sent') {
            return response()->json(['message' => 'This contract is not available for signing.'], 422);
        }
        if ($contract->expires_at && $contract->expires_at->isPast()) {
            $contract->update(['status' => 'expired']);
            return response()->json(['message' => 'This contract has expired.'], 422);
        }

        // Contracts with explicit signer rows use the multi-party flow instead —
        // sign each party individually via signAsParty().
        if ($contract->signers()->exists()) {
            return response()->json([
                'message' => 'This contract requires multi-party signing. Sign your slot via the signers endpoint.',
            ], 422);
        }

        $contract->update([
            'status' => 'signed',
            'signature_base64' => $request->signature_base64,
            'signed_ip' => $request->ip(),
            'signed_user_agent' => $request->userAgent(),
            'signed_at' => now(),
        ]);

        ContractActivityLog::log($contract->id, 'signed');

        AutomationEngine::trigger('contract_signed', [
            'contract_id' => $contract->id,
            'contract_number' => $contract->contract_number,
            'email' => $contract->email,
            'user_id' => $contract->user_id,
        ]);

        \App\Services\Notifier::alert(
            title: 'Contract signed',
            message: "Contract {$contract->contract_number} has been signed.",
            severity: \App\Models\Notification::SEVERITY_SUCCESS,
            module: 'contracts',
            actionUrl: "/admin/contracts/{$contract->id}",
            actionLabel: 'Open contract',
            data: ['contract_id' => $contract->id, 'contract_number' => $contract->contract_number],
            event: 'contract_signed',
        );

        return response()->json(['message' => 'Contract signed successfully.', 'contract' => $contract]);
    }

    /**
     * Multi-party signing: each signer row is claimed by the authenticated
     * user whose email matches it. The contract itself flips to 'signed'
     * only once every non-declined signer row has signed.
     */
    public function signAsParty(Request $request, $contractNumber, int $signerId) {
        $request->validate([
            'signature_base64' => 'required|string',
        ]);

        $user = Auth::user();
        $contract = Contract::where('contract_number', $contractNumber)->firstOrFail();
        $signer = ContractSigner::where('contract_id', $contract->id)->findOrFail($signerId);

        if (strcasecmp($signer->email, $user->email) !== 0 && !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403);
        }
        if ($contract->status !== 'sent') {
            return response()->json(['message' => 'This contract is not available for signing.'], 422);
        }
        if ($contract->expires_at && $contract->expires_at->isPast()) {
            $contract->update(['status' => 'expired']);
            return response()->json(['message' => 'This contract has expired.'], 422);
        }
        if ($signer->status === 'signed') {
            return response()->json(['message' => 'You have already signed this contract.'], 422);
        }

        $signer->update([
            'status' => 'signed',
            'signature_base64' => $request->signature_base64,
            'signed_ip' => $request->ip(),
            'signed_user_agent' => $request->userAgent(),
            'signed_at' => now(),
        ]);

        $allSigned = ContractSigner::where('contract_id', $contract->id)
            ->where('role', 'signer')
            ->where('status', '!=', 'signed')
            ->doesntExist();

        if ($allSigned) {
            $contract->update(['status' => 'signed', 'signed_at' => now()]);
        }

        ContractActivityLog::log($contract->id, 'signed');

        if ($allSigned) {
            AutomationEngine::trigger('contract_signed', [
                'contract_id' => $contract->id,
                'contract_number' => $contract->contract_number,
                'email' => $contract->email,
                'user_id' => $contract->user_id,
            ]);

            \App\Services\Notifier::alert(
                title: 'Contract signed',
                message: "Contract {$contract->contract_number} has been signed by all parties.",
                severity: \App\Models\Notification::SEVERITY_SUCCESS,
                module: 'contracts',
                actionUrl: "/admin/contracts/{$contract->id}",
                actionLabel: 'Open contract',
                data: ['contract_id' => $contract->id, 'contract_number' => $contract->contract_number],
                event: 'contract_signed',
            );
        }

        return response()->json([
            'message' => $allSigned ? 'Contract fully signed.' : 'Your signature was recorded — waiting on other parties.',
            'contract' => $contract->fresh(['signers']),
        ]);
    }

    public function myContracts() {
        $user = Auth::user();
        return response()->json(
            Contract::where('user_id', $user->id)->orderBy('created_at', 'desc')->get()
        );
    }

    public function timeline($contractNumber) {
        $user = Auth::user();
        $contract = Contract::with(['signers', 'activityLogs.user'])->where('contract_number', $contractNumber)->firstOrFail();
        if ($contract->user_id !== $user->id && !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403);
        }

        return response()->json([
            'status' => $contract->status,
            'signers' => $contract->signers,
            'activity' => $contract->activityLogs->map(fn ($log) => [
                'action' => $log->action,
                'user' => $log->user?->name,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at,
            ]),
        ]);
    }

    public function downloadPdf($contractNumber, ContractPdfService $pdf) {
        $user = Auth::user();
        $contract = Contract::where('contract_number', $contractNumber)->firstOrFail();
        if ($contract->user_id !== $user->id && !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403);
        }

        ContractActivityLog::log($contract->id, 'downloaded');

        return $pdf->download($contract);
    }
}
