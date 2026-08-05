@component('mail::message')
# Your Contract Expires Soon, {{ $firstName }}

Contract **{{ $contractNumber }}** ({{ $templateName }}) is awaiting your signature and expires on **{{ $expiresAt }}**.

@component('mail::button', ['url' => $signUrl, 'color' => 'primary'])
Review &amp; Sign Contract
@endcomponent

If you have questions, reply to this email or contact us at info@domesticrealestate.us.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
