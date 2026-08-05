<?php

namespace App\Services;

use App\Models\Contract;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\Response;

/**
 * Real PDF generation for contracts — same barryvdh/laravel-dompdf package
 * already used by InvoicePdfService, rendering embedded signature image(s)
 * for both the legacy single-signature path and the new multi-party path.
 */
class ContractPdfService
{
    public function render(Contract $contract): string
    {
        $contract->loadMissing('user', 'signers');

        return Pdf::loadView('pdf.contract', ['contract' => $contract])->output();
    }

    public function download(Contract $contract): Response
    {
        $contract->loadMissing('user', 'signers');

        return Pdf::loadView('pdf.contract', ['contract' => $contract])
            ->download("{$contract->contract_number}.pdf");
    }
}
