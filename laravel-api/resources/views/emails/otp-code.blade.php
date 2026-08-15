@component('mail::message')
# Verify your email

Use this code to {{ $purpose }}:

@component('mail::panel')
<div style="font-size:28px;font-weight:700;letter-spacing:6px;text-align:center;">{{ $code }}</div>
@endcomponent

This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.

Thanks,<br>
The Domestic Real Estate Team
@endcomponent
