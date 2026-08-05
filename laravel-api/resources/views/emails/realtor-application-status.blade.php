@component('mail::message')
@if ($status === 'rejected')
# Update on Your Application, {{ $firstName }}

Thank you for applying to become a realtor with Domestic Real Estate. After review, we're unable to approve your application at this time.
@if ($reviewNotes)

**Reviewer notes:** {{ $reviewNotes }}
@endif
@elseif ($status === 'more_info_requested')
# We Need a Bit More Information, {{ $firstName }}

Your application (reference **{{ $reference }}**) is almost through review, but we need some additional information before we can proceed.

**What's needed:** {{ $reviewNotes }}

@component('mail::button', ['url' => $statusUrl, 'color' => 'primary'])
View Application &amp; Resubmit
@endcomponent
@else
# Application Status Update, {{ $firstName }}

Your application (reference **{{ $reference }}**) status has changed to **{{ str_replace('_', ' ', $status) }}**.
@endif

Thanks,<br>
{{ config('app.name') }}
@endcomponent
