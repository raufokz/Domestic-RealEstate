<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    body { font-family: Helvetica, Arial, sans-serif; color: #1C2430; font-size: 12px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    h1 { color: #0A2647; font-size: 22px; margin: 0 0 4px; }
    .muted { color: #6B7280; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { text-align: left; background: #0A2647; color: #fff; padding: 8px 10px; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px 10px; border-bottom: 1px solid #E5E7EB; }
    .total-row td { font-weight: bold; font-size: 14px; border-top: 2px solid #0A2647; border-bottom: none; }
    .status { display: inline-block; padding: 4px 10px; border-radius: 10px; font-size: 11px; text-transform: uppercase; font-weight: bold; }
    .status-paid { background: #D1FAE5; color: #065F46; }
    .status-sent { background: #FEF3C7; color: #92400E; }
    .status-draft { background: #E5E7EB; color: #374151; }
</style>
</head>
<body>
    <div class="header">
        <div>
            <h1>{{ config('app.name') }}</h1>
            <p class="muted">Invoice {{ $invoice->invoice_number }}</p>
        </div>
        <div style="text-align:right;">
            <span class="status status-{{ $invoice->status }}">{{ $invoice->status }}</span>
            <p class="muted">Issued: {{ $invoice->created_at?->format('M j, Y') }}</p>
            @if ($invoice->due_at)
                <p class="muted">Due: {{ $invoice->due_at->format('M j, Y') }}</p>
            @endif
        </div>
    </div>

    <p><strong>Billed to:</strong><br>
    {{ $invoice->user?->name }}<br>
    {{ $invoice->user?->email }}</p>

    <table>
        <thead>
            <tr><th>Description</th><th style="text-align:right;">Amount</th></tr>
        </thead>
        <tbody>
            @if (is_array($invoice->items) && count($invoice->items))
                @foreach ($invoice->items as $item)
                    <tr>
                        <td>{{ $item['description'] ?? $invoice->description }}</td>
                        <td style="text-align:right;">${{ number_format($item['amount'] ?? 0, 2) }}</td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <td>{{ $invoice->description }}</td>
                    <td style="text-align:right;">${{ number_format($invoice->amount, 2) }}</td>
                </tr>
            @endif
            <tr class="total-row">
                <td>Total ({{ $invoice->currency }})</td>
                <td style="text-align:right;">${{ number_format($invoice->amount, 2) }}</td>
            </tr>
        </tbody>
    </table>

    @if ($invoice->status === 'paid')
        <p style="margin-top: 30px;" class="muted">Paid {{ $invoice->paid_at?->format('M j, Y') }}
            @if ($invoice->gateway_transaction_id) via {{ ucfirst($invoice->payment_gateway ?? 'gateway') }} (ref: {{ $invoice->gateway_transaction_id }}) @endif
        </p>
    @endif

    @if ($invoice->notes)
        <p style="margin-top: 20px;"><strong>Notes:</strong> {{ $invoice->notes }}</p>
    @endif
</body>
</html>
