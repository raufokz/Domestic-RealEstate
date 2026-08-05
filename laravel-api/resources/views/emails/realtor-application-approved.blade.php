@component('mail::message')
# Welcome to Domestic Real Estate, {{ $firstName }} 🎉

Your realtor application has been reviewed and **approved**. Your agent account is ready — set your password to log in.

@component('mail::button', ['url' => $setPasswordUrl, 'color' => 'primary'])
Set Your Password
@endcomponent

If the button above doesn't work, copy and paste this link into your browser:
{{ $setPasswordUrl }}

Welcome aboard,<br>
{{ config('app.name') }}
@endcomponent
