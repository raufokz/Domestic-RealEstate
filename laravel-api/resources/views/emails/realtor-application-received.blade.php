@component('mail::message')
# Thanks for Applying, {{ $firstName }}

We received your realtor application (reference **{{ $reference }}**). Our team reviews new applications within 24-48 hours and will email you as soon as there's an update.

@component('mail::button', ['url' => $statusUrl, 'color' => 'primary'])
Check Application Status
@endcomponent

If you didn't submit this application, you can ignore this email.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
