@component('mail::message')
# Welcome, {{ $firstName }} 👋

You're one step away from activating your **Preferred Agent** placement on Domestic Real Estate.

## Your Plan

- **Plan:** {{ $planName }}
- **Billing Cycle:** {{ $billingCycle }}

@if (count($services))
## Services Needed

@foreach ($services as $service)
- {{ $service }}
@endforeach
@endif

Click below to securely finalize your activation via Payoneer. Once payment is confirmed, your Preferred Agent profile and lead routing go live.

@component('mail::button', ['url' => $checkoutUrl, 'color' => 'primary'])
Complete Your Activation via Payoneer
@endcomponent

If the button above doesn't work, copy and paste this link into your browser:
{{ $checkoutUrl }}

Questions about your plan or activation? Reach our onboarding team at [info@domesticrealestate.us](mailto:info@domesticrealestate.us).

Thanks,<br>
The Domestic Real Estate Team
@endcomponent
