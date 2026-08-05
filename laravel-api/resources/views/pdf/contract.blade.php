<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    body { font-family: Helvetica, Arial, sans-serif; color: #1C2430; font-size: 12px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    h1 { color: #0A2647; font-size: 22px; margin: 0 0 4px; }
    .muted { color: #6B7280; }
    .content { margin-top: 20px; line-height: 1.5; }
    .status { display: inline-block; padding: 4px 10px; border-radius: 10px; font-size: 11px; text-transform: uppercase; font-weight: bold; }
    .status-signed { background: #D1FAE5; color: #065F46; }
    .status-sent { background: #FEF3C7; color: #92400E; }
    .status-draft { background: #E5E7EB; color: #374151; }
    .status-expired { background: #FEE2E2; color: #991B1B; }
    .signatures { margin-top: 40px; }
    .signature-block { border-top: 1px solid #E5E7EB; padding-top: 12px; margin-top: 20px; }
    .signature-img { max-width: 220px; max-height: 80px; display: block; margin-bottom: 6px; }
</style>
</head>
<body>
    <div class="header">
        <div>
            <h1>{{ config('app.name') }}</h1>
            <p class="muted">Contract {{ $contract->contract_number }} — {{ $contract->template_name }}</p>
        </div>
        <div style="text-align:right;">
            <span class="status status-{{ $contract->status }}">{{ $contract->status }}</span>
            <p class="muted">Issued: {{ $contract->created_at?->format('M j, Y') }}</p>
            @if ($contract->expires_at)
                <p class="muted">Expires: {{ $contract->expires_at->format('M j, Y') }}</p>
            @endif
        </div>
    </div>

    <p><strong>Party:</strong><br>
    {{ $contract->user?->name }}<br>
    {{ $contract->user?->email }}</p>

    <div class="content">
        {!! $contract->template_html ?: '<p>No content on file for this contract.</p>' !!}
    </div>

    <div class="signatures">
        @if ($contract->signers->isNotEmpty())
            @foreach ($contract->signers as $signer)
                <div class="signature-block">
                    <p><strong>{{ ucfirst($signer->role) }}:</strong> {{ $signer->name }} ({{ $signer->email }})</p>
                    @if ($signer->signature_base64)
                        <img class="signature-img" src="{{ $signer->signature_base64 }}" alt="Signature" />
                        <p class="muted">Signed {{ $signer->signed_at?->format('M j, Y g:i A') }} — IP {{ $signer->signed_ip }}</p>
                    @else
                        <p class="muted">Awaiting signature</p>
                    @endif
                </div>
            @endforeach
        @elseif ($contract->signature_base64)
            <div class="signature-block">
                <p><strong>Signed by:</strong> {{ $contract->user?->name }}</p>
                <img class="signature-img" src="{{ $contract->signature_base64 }}" alt="Signature" />
                <p class="muted">Signed {{ $contract->signed_at?->format('M j, Y g:i A') }} — IP {{ $contract->signed_ip }}</p>
            </div>
        @endif
    </div>
</body>
</html>
