<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MembershipPlan;
use App\Models\LeadPackage;

class PlanPricingSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            ['slug' => 'starter', 'price_monthly' => 49.99, 'price_yearly' => 479.88, 'badge' => null],
            ['slug' => 'professional', 'price_monthly' => 99.99, 'price_yearly' => 959.88, 'is_popular' => true, 'badge' => 'Most Popular'],
            ['slug' => 'premium', 'price_monthly' => 199.99, 'price_yearly' => 1919.88, 'badge' => 'Best Value'],
            ['slug' => 'enterprise', 'price_monthly' => 499.99, 'price_yearly' => 4799.88, 'badge' => 'Enterprise'],
        ];

        foreach ($plans as $plan) {
            MembershipPlan::where('slug', $plan['slug'])->update($plan);
        }

        $packages = [
            ['slug' => 'starter-leads', 'price' => 29.99, 'price_per_lead' => 9.99],
            ['slug' => 'pro-leads', 'price' => 99.99, 'price_per_lead' => 6.99, 'is_popular' => true],
            ['slug' => 'premium-leads', 'price' => 199.99, 'price_per_lead' => 3.99],
        ];

        foreach ($packages as $pkg) {
            LeadPackage::where('slug', $pkg['slug'])->update($pkg);
        }
    }
}
