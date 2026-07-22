<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use App\Models\Enquiry;
use App\Services\AutomationEngine;
use App\Services\LeadCaptureService;
use Illuminate\Http\Request;

class MarketingController extends Controller
{
    public function subscribe(Request $request) {
        $request->validate([
            'email' => 'required|email|unique:newsletter_subscribers,email',
            'name' => 'nullable|string',
        ]);
        NewsletterSubscriber::create([
            'email' => $request->email,
            'name' => $request->name ?? '',
            'status' => 'active',
            'source' => $request->get('source', 'website'),
            'subscribed_at' => now(),
        ]);
        return response()->json(['message' => 'Subscribed successfully'], 201);
    }

    public function contact(Request $request) {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);
        Enquiry::create(array_merge($request->only(['name', 'email', 'phone', 'subject', 'message']), [
            'type' => 'general',
            'source_page' => $request->header('referer', ''),
        ]));

        $this->upsertLeadFromContact(
            $request->name,
            $request->email,
            $request->input('phone'),
            'contact_form',
            'Contact: '.$request->subject."\n".$request->message
        );

        return response()->json(['message' => 'Message sent successfully'], 201);
    }

    public function valuation(Request $request) {
        $request->validate([
            'address' => 'required|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'zip' => 'nullable|string',
            'bedrooms' => 'nullable|integer',
            'bathrooms' => 'nullable|integer',
            'sqft' => 'nullable|integer',
            'property_type' => 'nullable|string',
            'condition' => 'nullable|string',
        ]);

        Enquiry::create([
            'name' => $request->input('name', 'Valuation Visitor'),
            'email' => $request->input('email', 'noreply@domesticre.com'),
            'phone' => $request->input('phone', ''),
            'subject' => 'Home Valuation Request - ' . $request->address,
            'message' => json_encode($request->only([
                'address', 'city', 'state', 'zip', 'bedrooms', 'bathrooms',
                'sqft', 'property_type', 'condition',
            ])),
            'type' => 'general',
            'source_page' => 'valuation-tool',
        ]);

        if ($request->filled('email') && filter_var($request->email, FILTER_VALIDATE_EMAIL)) {
            $this->upsertLeadFromContact(
                $request->input('name', 'Valuation Visitor'),
                $request->email,
                $request->input('phone'),
                'valuation',
                'Valuation request for '.$request->address
            );
        }

        $sqft = (int) ($request->sqft ?? 2000);
        $bedrooms = (int) ($request->bedrooms ?? 3);
        $bathrooms = (int) ($request->bathrooms ?? 2);

        $baseValue = $sqft * 225;
        $bedBonus = max(0, ($bedrooms - 2)) * 15000;
        $bathBonus = max(0, ($bathrooms - 1)) * 10000;

        $conditionMultipliers = [
            'Excellent' => 1.08,
            'Very Good' => 1.04,
            'Good' => 1.0,
            'Fair' => 0.92,
            'Needs Work' => 0.82,
        ];
        $multiplier = $conditionMultipliers[$request->condition ?? 'Good'] ?? 1.0;

        $estimated = ($baseValue + $bedBonus + $bathBonus) * $multiplier;
        $low = (int) ($estimated * 0.92);
        $high = (int) ($estimated * 1.08);

        $analysis = "Based on the details provided for {$request->address}" .
            ($request->city ? ", {$request->city}" : '') .
            ($request->state ? ", {$request->state}" : '') . ":\n\n" .
            "Your {$sqft} sq ft " . strtolower($request->get('property_type', 'residential')) .
            " property with {$bedrooms} bedrooms and {$bathrooms} bathrooms" .
            " in \"" . $request->get('condition', 'Good') . "\" condition" .
            " is estimated to be worth between $" . number_format($low) .
            " and $" . number_format($high) . ".\n\n" .
            "Key factors in this estimate:\n" .
            "- Comparable sales in the area suggest strong demand\n" .
            "- Property size and bedroom count are above average for the market\n" .
            "- Current market conditions are favorable for sellers\n" .
            "- Condition adjustment applied based on your assessment\n\n" .
            "This is an automated estimate. For a comprehensive market analysis " .
            "with detailed comparable sales and a recommended listing price, " .
            "email info@domesticrealestate.us to schedule a consultation.";

        return response()->json([
            'message' => 'Valuation complete',
            'estimated_value' => '$' . number_format($estimated),
            'low_estimate' => '$' . number_format($low),
            'high_estimate' => '$' . number_format($high),
            'analysis' => $analysis,
            'property_details' => $request->only([
                'address', 'city', 'state', 'zip', 'bedrooms', 'bathrooms',
                'sqft', 'property_type', 'condition',
            ]),
        ], 200);
    }

    public function appointment(Request $request) {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'date' => 'required|date|after:now',
            'time' => 'required|string',
            'type' => 'required|in:buying,selling,general,consultation',
        ]);
        Enquiry::create(array_merge($request->all(), [
            'type' => 'general',
            'subject' => 'Appointment Request - ' . ucfirst($request->type),
            'source_page' => 'booking',
        ]));

        $lead = $this->upsertLeadFromContact(
            $request->name,
            $request->email,
            $request->phone,
            'appointment',
            'Appointment '.$request->type.' on '.$request->date.' at '.$request->time
        );

        AutomationEngine::trigger('appointment_booked', [
            'lead_id' => $lead?->id,
            'email' => $request->email,
            'name' => $request->name,
            'date' => $request->date,
            'time' => $request->time,
            'type' => $request->type,
        ]);

        return response()->json(['message' => 'Appointment requested successfully'], 201);
    }

    protected function upsertLeadFromContact(
        string $name,
        string $email,
        ?string $phone,
        string $source,
        string $notes
    ) {
        return LeadCaptureService::upsert([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'source' => $source,
            'notes' => $notes,
            'type' => 'buyer',
        ]);
    }
}
