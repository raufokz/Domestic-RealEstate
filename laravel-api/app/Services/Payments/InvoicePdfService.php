<?php

namespace App\Services\Payments;

use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\Response;

/**
 * Real PDF generation for invoices — same barryvdh/laravel-dompdf package
 * already used by ProcessDataExport for data-export PDFs.
 */
class InvoicePdfService
{
    public function render(Invoice $invoice): string
    {
        $invoice->loadMissing('user');

        return Pdf::loadView('pdf.invoice', ['invoice' => $invoice])->output();
    }

    public function download(Invoice $invoice): Response
    {
        $invoice->loadMissing('user');

        return Pdf::loadView('pdf.invoice', ['invoice' => $invoice])
            ->download("{$invoice->invoice_number}.pdf");
    }
}
