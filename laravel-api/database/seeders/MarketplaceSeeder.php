<?php

namespace Database\Seeders;

use App\Models\Lead;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class MarketplaceSeeder extends Seeder
{
    public function run(): void
    {
        $marketplaceLeads = [
            // Pay Per Close Lead 1
            [
                'lead_number' => 'LEAD-PPC-1001',
                'first_name' => 'Jonathan',
                'last_name' => 'Miller',
                'email' => 'j.miller@example.com',
                'phone' => '(512) 555-0192',
                'type' => 'buyer',
                'status' => 'new',
                'priority' => 'urgent',
                'score' => 95,
                'budget_min' => 550000.00,
                'budget_max' => 650000.00,
                'timeline' => '1-3 months',
                'motivation' => 'Relocating for tech executive role, pre-approved with Chase Bank.',
                'location' => 'Austin, TX',
                'state' => 'TX',
                'city' => 'Austin',
                'property_type' => 'Single Family Home',
                'bedrooms' => 4,
                'bathrooms' => 3.0,
                'financing' => 'Pre-Approved Conventional',
                'pre_approved' => true,
                'credit_score' => 760,
                'marketplace_status' => 'available',
                'marketplace_title' => 'Pre-Approved Tech Executive Buyer ($650k) - Pay Per Close',
                'marketplace_category' => 'Pay Per Close',
                'marketplace_description' => 'High-intent buyer relocating to Austin. Fully pre-approved up to $650,000 for a 4-bed single family home in North Austin or Round Rock. $0 upfront cost. 25% closing referral fee upon escrow settlement.',
                'marketplace_price' => 0.00,
                'pricing_model' => 'pay_at_closing',
                'commission_rate' => 2.50,
                'payout_method' => 'payoneer',
                'payout_email' => 'leads-payoneer@domesticrealestate.us',
                'listed_at' => Carbon::now()->subMinutes(15),
            ],
            // Pay Per Close Lead 2
            [
                'lead_number' => 'LEAD-PPC-1002',
                'first_name' => 'Sophia',
                'last_name' => 'Rodriguez',
                'email' => 'sophia.r@example.com',
                'phone' => '(305) 555-0843',
                'type' => 'seller',
                'status' => 'new',
                'priority' => 'high',
                'score' => 90,
                'budget_min' => 850000.00,
                'budget_max' => 950000.00,
                'timeline' => 'Immediate',
                'motivation' => 'Downsizing luxury waterfront condo, highly motivated for fast sale.',
                'location' => 'Miami, FL',
                'state' => 'FL',
                'city' => 'Miami',
                'property_type' => 'Condo',
                'bedrooms' => 3,
                'bathrooms' => 2.5,
                'financing' => 'Cash / Equity',
                'pre_approved' => true,
                'credit_score' => 790,
                'marketplace_status' => 'available',
                'marketplace_title' => 'Waterfront Condo Seller ($950k) - Pay Per Close',
                'marketplace_category' => 'Pay Per Close',
                'marketplace_description' => 'Prime Miami waterfront property seller ready to list immediately. Estimated listing price $950,000. Seeking top local listing agent on a 30% closing referral arrangement.',
                'marketplace_price' => 0.00,
                'pricing_model' => 'pay_at_closing',
                'commission_rate' => 3.00,
                'payout_method' => 'payoneer',
                'payout_email' => 'leads-payoneer@domesticrealestate.us',
                'listed_at' => Carbon::now()->subHours(1),
            ],
            // Pay Per Close Lead 3
            [
                'lead_number' => 'LEAD-PPC-1003',
                'first_name' => 'Ethan',
                'last_name' => 'Vance',
                'email' => 'ethan.vance@example.com',
                'phone' => '(415) 555-0371',
                'type' => 'investor',
                'status' => 'new',
                'priority' => 'urgent',
                'score' => 98,
                'budget_min' => 1200000.00,
                'budget_max' => 1500000.00,
                'timeline' => '30 days',
                'motivation' => '1031 Exchange buyer seeking multi-family value-add property.',
                'location' => 'San Francisco, CA',
                'state' => 'CA',
                'city' => 'San Francisco',
                'property_type' => 'Multi-Family',
                'bedrooms' => 6,
                'bathrooms' => 4.0,
                'financing' => 'All Cash 1031 Funds',
                'pre_approved' => true,
                'credit_score' => 810,
                'marketplace_status' => 'available',
                'marketplace_title' => '1031 Exchange Cash Investor ($1.5M) - Pay Per Close',
                'marketplace_category' => 'Pay Per Close',
                'marketplace_description' => 'Experienced commercial & multi-family investor looking to complete a $1.5M 1031 exchange within 45 days. Pay-per-close agreement with 25% referral fee at closing.',
                'marketplace_price' => 0.00,
                'pricing_model' => 'pay_at_closing',
                'commission_rate' => 2.50,
                'payout_method' => 'payoneer',
                'payout_email' => 'leads-payoneer@domesticrealestate.us',
                'listed_at' => Carbon::now()->subHours(3),
            ],
            // Pay Per Lead (Standard) 1
            [
                'lead_number' => 'LEAD-PPL-2001',
                'first_name' => 'Amanda',
                'last_name' => 'Foster',
                'email' => 'afoster@example.com',
                'phone' => '(206) 555-0912',
                'type' => 'buyer',
                'status' => 'new',
                'priority' => 'normal',
                'score' => 88,
                'budget_min' => 450000.00,
                'budget_max' => 520000.00,
                'timeline' => '3-6 months',
                'motivation' => 'First-time homebuyer looking in suburban Seattle area.',
                'location' => 'Seattle, WA',
                'state' => 'WA',
                'city' => 'Seattle',
                'property_type' => 'Townhouse',
                'bedrooms' => 3,
                'bathrooms' => 2.0,
                'financing' => 'FHA Pre-Approved',
                'pre_approved' => true,
                'credit_score' => 710,
                'marketplace_status' => 'available',
                'marketplace_title' => 'First-Time Townhouse Buyer ($520k) - Exclusive PPL',
                'marketplace_category' => 'Exclusive Buyer',
                'marketplace_description' => 'Verified first-time buyer with active FHA pre-approval looking for modern townhome in Bellevue/Seattle.',
                'marketplace_price' => 49.00,
                'listed_at' => Carbon::now()->subHours(5),
            ],
            // Pay Per Lead (Standard) 2
            [
                'lead_number' => 'LEAD-PPL-2002',
                'first_name' => 'Marcus',
                'last_name' => 'Sterling',
                'email' => 'msterling@example.com',
                'phone' => '(312) 555-0724',
                'type' => 'seller',
                'status' => 'new',
                'priority' => 'high',
                'score' => 92,
                'budget_min' => 700000.00,
                'budget_max' => 780000.00,
                'timeline' => 'Immediate',
                'motivation' => 'Listing single family home in Lincoln Park.',
                'location' => 'Chicago, IL',
                'state' => 'IL',
                'city' => 'Chicago',
                'property_type' => 'Single Family Home',
                'bedrooms' => 4,
                'bathrooms' => 3.5,
                'financing' => 'Clear Title',
                'pre_approved' => true,
                'credit_score' => 775,
                'marketplace_status' => 'available',
                'marketplace_title' => 'Lincoln Park Seller Lead ($780k) - Verified Listing Lead',
                'marketplace_category' => 'Exclusive Seller',
                'marketplace_description' => 'High-value seller lead in prime Chicago neighborhood. Ready to interview agents this week.',
                'marketplace_price' => 75.00,
                'listed_at' => Carbon::now()->subHours(6),
            ]
        ];

        foreach ($marketplaceLeads as $leadData) {
            Lead::updateOrCreate(
                ['lead_number' => $leadData['lead_number']],
                $leadData
            );
        }

        // Backfill existing unlisted leads to make marketplace rich with real data
        $unlistedLeads = Lead::where(function ($q) {
            $q->whereNull('marketplace_status')
              ->orWhere('marketplace_status', 'none');
        })->limit(30)->get();

        $categories = ['Pay Per Close', 'Residential', 'Commercial', 'Luxury', 'Investment', 'Land', 'Exclusive Buyer', 'Exclusive Seller'];
        $prices = [0.00, 29.00, 49.00, 69.00, 89.00, 99.00];

        foreach ($unlistedLeads as $index => $lead) {
            $cat = $categories[$index % count($categories)];
            $price = $prices[$index % count($prices)];
            $isPpc = $cat === 'Pay Per Close' || $price == 0;

            $title = $lead->first_name 
                ? "{$lead->type} Lead - {$lead->first_name} ({$lead->location})" 
                : "Qualified {$lead->type} Lead in " . ($lead->city ?: $lead->state ?: 'US');

            if ($isPpc) {
                $title .= ' - Pay Per Close';
                $price = 0.00;
            }

            $lead->forceFill([
                'marketplace_status' => 'available',
                'marketplace_title' => $lead->marketplace_title ?: $title,
                'marketplace_category' => $lead->marketplace_category ?: $cat,
                'marketplace_description' => $lead->marketplace_description ?: ($lead->motivation ?? "High quality verified {$lead->type} lead seeking professional real estate assistance."),
                'marketplace_price' => $price,
                'pricing_model' => $isPpc ? 'pay_at_closing' : 'pay_per_lead',
                'commission_rate' => $isPpc ? 2.50 : null,
                'payout_method' => $isPpc ? 'payoneer' : null,
                'payout_email' => $isPpc ? 'leads-payoneer@domesticrealestate.us' : null,
                'listed_at' => Carbon::now()->subMinutes(rand(5, 1440)),
            ])->save();
        }
    }
}
