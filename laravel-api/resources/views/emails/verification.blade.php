@component('mail::message')
# Welcome, {{ $firstName }} 🎉

Thanks for joining Domestic Real Estate. Before you can access your account, please confirm your email address.

Click the button below to verify your email:

@component('mail::button', ['url' => $verifyUrl, 'color' => 'primary'])
Verify My Email Address
@endcomponent

If the button above doesn't work, copy and paste this link into your browser:
{{ $verifyUrl }}

This link expires in 24 hours. If you didn't create an account with Domestic Real Estate, you can safely ignore this email.

Questions? Reach us at [info@domesticrealestate.us](mailto:info@domesticrealestate.us).

Thanks,<br>
The Domestic Real Estate Team
@endcomponent
