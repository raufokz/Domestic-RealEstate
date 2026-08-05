@component('mail::message')
# Invoice {{ $invoiceNumber }}

Hi {{ $firstName }}, you have a new invoice from {{ config('app.name') }}.

- **Description:** {{ $description }}
- **Amount:** {{ $currency }} {{ $amount }}

@component('mail::button', ['url' => $checkoutUrl, 'color' => 'primary'])
Pay Invoice Securely via Payoneer
@endcomponent

If the button above doesn't work, copy and paste this link into your browser:
{{ $checkoutUrl }}

Thanks,<br>
{{ config('app.name') }}
@endcomponent
