<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContractController extends Controller
{
    public function show($contractNumber) {
        $user = Auth::user();
        $contract = Contract::where('contract_number', $contractNumber)->firstOrFail();
        if ($contract->user_id !== $user->id && !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403);
        }
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

        $contract->update([
            'status' => 'signed',
            'signature_base64' => $request->signature_base64,
            'signed_ip' => $request->ip(),
            'signed_user_agent' => $request->userAgent(),
            'signed_at' => now(),
        ]);

        return response()->json(['message' => 'Contract signed successfully.', 'contract' => $contract]);
    }

    public function myContracts() {
        $user = Auth::user();
        return response()->json(
            Contract::where('user_id', $user->id)->orderBy('created_at', 'desc')->get()
        );
    }
}
