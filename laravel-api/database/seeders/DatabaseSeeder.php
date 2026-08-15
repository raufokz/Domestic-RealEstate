<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\MembershipPlan;
use App\Models\PropertyType;
use App\Models\SiteSetting;
use App\Models\AgentProfile;
use App\Models\Property;
use App\Models\Blog;
use App\Models\Testimonial;
use App\Models\Faq;
use App\Models\LeadPackage;
use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(NavigationFooterSeeder::class);
        $this->call(RolePermissionSeeder::class);
        $this->call(ZipCodeSeeder::class);
        // ─── Users ───
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@domesticrealestate.us',
            'password' => Hash::make('Admin@123456'),
            'role' => 'super_admin',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $agent1 = User::create([
            'name' => 'Sarah Johnson',
            'email' => 'agent@domesticrealestate.us',
            'password' => Hash::make('Agent@123456'),
            'role' => 'agent',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $agent2 = User::create([
            'name' => 'Marcus Williams',
            'email' => 'marcus@domesticrealestate.us',
            'password' => Hash::make('password'),
            'role' => 'agent',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $agent3 = User::create([
            'name' => 'Emily Chen',
            'email' => 'emily@domesticrealestate.us',
            'password' => Hash::make('password'),
            'role' => 'agent',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $agent4 = User::create([
            'name' => 'David Martinez',
            'email' => 'david@domesticrealestate.us',
            'password' => Hash::make('password'),
            'role' => 'agent',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $demoBuyer = User::create([
            'name' => 'Demo Buyer',
            'email' => 'buyer@domesticrealestate.us',
            'password' => Hash::make('Buyer@123456'),
            'role' => 'buyer',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $demoSeller = User::create([
            'name' => 'Demo Seller',
            'email' => 'seller@domesticrealestate.us',
            'password' => Hash::make('Seller@123456'),
            'role' => 'seller',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // ─── Agent Profiles ───
        $agentProfiles = [
            ['user_id' => $agent1->id, 'slug' => 'sarah-johnson', 'bio' => 'Senior listing agent with 12+ years of luxury home experience in Manhattan and surrounding areas.', 'brokerage_name' => 'Domestic RE Realty', 'license_number' => 'NY-2014-12345', 'license_status' => 'active', 'years_experience' => 12, 'specialties' => ['Luxury Homes', 'Penthouses', 'Waterfront'], 'languages' => ['English', 'French'], 'service_areas' => ['Manhattan', 'Brooklyn', 'Westchester'], 'rating' => 4.9, 'review_count' => 127, 'sales_count' => 280, 'is_featured' => true, 'is_published' => true, 'status' => 'approved'],
            ['user_id' => $agent2->id, 'slug' => 'marcus-williams', 'bio' => 'Dedicated buyer\'s agent specializing in helping first-time buyers navigate the market with confidence.', 'brokerage_name' => 'Domestic RE Realty', 'license_number' => 'FL-2018-67890', 'license_status' => 'active', 'years_experience' => 7, 'specialties' => ['First-Time Buyers', 'Suburban Homes', 'Investment Properties'], 'languages' => ['English', 'Spanish'], 'service_areas' => ['Miami', 'Fort Lauderdale', 'West Palm Beach'], 'rating' => 4.8, 'review_count' => 89, 'sales_count' => 190, 'is_featured' => true, 'is_published' => true, 'status' => 'approved'],
            ['user_id' => $agent3->id, 'slug' => 'emily-chen', 'bio' => 'Investment specialist with a background in commercial and residential real estate analysis.', 'brokerage_name' => 'Domestic RE Realty', 'license_number' => 'CA-2016-11223', 'license_status' => 'active', 'years_experience' => 9, 'specialties' => ['Commercial', 'Residential', 'Investment Analysis'], 'languages' => ['English', 'Mandarin'], 'service_areas' => ['San Francisco', 'Oakland', 'San Jose'], 'rating' => 4.9, 'review_count' => 103, 'sales_count' => 150, 'is_featured' => true, 'is_published' => true, 'status' => 'approved'],
            ['user_id' => $agent4->id, 'slug' => 'david-martinez', 'bio' => 'Relocation expert helping families and professionals seamlessly transition to their new homes.', 'brokerage_name' => 'Domestic RE Realty', 'license_number' => 'TX-2015-44556', 'license_status' => 'active', 'years_experience' => 10, 'specialties' => ['Corporate Relocations', 'Family Homes', 'School Districts'], 'languages' => ['English', 'Spanish', 'Portuguese'], 'service_areas' => ['Austin', 'San Antonio', 'Houston'], 'rating' => 4.7, 'review_count' => 95, 'sales_count' => 220, 'is_featured' => true, 'is_published' => true, 'status' => 'approved'],
        ];
        foreach ($agentProfiles as $profile) {
            AgentProfile::create($profile);
        }

        // ─── Property Types ───
        $types = [
            ['name' => 'Single Family Home', 'slug' => 'single-family', 'icon' => 'home'],
            ['name' => 'Condo', 'slug' => 'condo', 'icon' => 'building'],
            ['name' => 'Townhouse', 'slug' => 'townhouse', 'icon' => 'home-modern'],
            ['name' => 'Multi-Family', 'slug' => 'multi-family', 'icon' => 'building-office'],
            ['name' => 'Land', 'slug' => 'land', 'icon' => 'map'],
            ['name' => 'Commercial', 'slug' => 'commercial', 'icon' => 'building-storefront'],
            ['name' => 'Apartment', 'slug' => 'apartment', 'icon' => 'home-stack'],
            ['name' => 'Luxury', 'slug' => 'luxury', 'icon' => 'sparkles'],
        ];
        foreach ($types as $type) {
            PropertyType::create($type);
        }

        // ─── Properties (featured listings) ───
        $properties = [
            ['title' => 'Modern Penthouse Suite', 'slug' => 'modern-penthouse-suite', 'description' => 'Stunning penthouse with floor-to-ceiling windows, panoramic city views, and premium finishes throughout.', 'address' => '1200 Park Avenue', 'city' => 'New York', 'state' => 'NY', 'zip' => '10029', 'country' => 'US', 'price' => 2450000, 'bedrooms' => 3, 'bathrooms' => 3, 'sqft' => 2800, 'property_type_id' => 3, 'status' => 'active', 'approval_status' => 'approved', 'featured' => true, 'realtor_id' => $agent1->id, 'year_built' => 2022, 'parking_spaces' => 2, 'amenities' => ['Rooftop Access', 'Concierge', 'Gym', 'Pool', 'Smart Home']],
            ['title' => 'Waterfront Villa Estate', 'slug' => 'waterfront-villa-estate', 'description' => 'Exquisite waterfront estate with private dock, infinity pool, and lush tropical gardens.', 'address' => '455 Ocean Drive', 'city' => 'Miami Beach', 'state' => 'FL', 'zip' => '33139', 'country' => 'US', 'price' => 4750000, 'bedrooms' => 5, 'bathrooms' => 4, 'sqft' => 5200, 'property_type_id' => 1, 'status' => 'active', 'approval_status' => 'approved', 'featured' => true, 'realtor_id' => $agent2->id, 'year_built' => 2020, 'parking_spaces' => 3, 'amenities' => ['Private Dock', 'Infinity Pool', 'Wine Cellar', 'Home Theater']],
            ['title' => 'Urban Loft Residence', 'slug' => 'urban-loft-residence', 'description' => 'Industrial-chic loft in the heart of the city with exposed brick, soaring ceilings, and modern amenities.', 'address' => '88 Folsom Street', 'city' => 'San Francisco', 'state' => 'CA', 'zip' => '94105', 'country' => 'US', 'price' => 1850000, 'bedrooms' => 2, 'bathrooms' => 2, 'sqft' => 1900, 'property_type_id' => 2, 'status' => 'active', 'approval_status' => 'approved', 'featured' => true, 'realtor_id' => $agent3->id, 'year_built' => 2018, 'parking_spaces' => 1, 'amenities' => ['Exposed Brick', 'High Ceilings', 'Open Floor Plan', 'Rooftop Deck']],
            ['title' => 'Luxury Family Home', 'slug' => 'luxury-family-home', 'description' => 'Spacious family home in a top-rated school district with a gourmet kitchen and resort-style backyard.', 'address' => '2200 Lakeshore Blvd', 'city' => 'Chicago', 'state' => 'IL', 'zip' => '60614', 'country' => 'US', 'price' => 1250000, 'bedrooms' => 4, 'bathrooms' => 3, 'sqft' => 3400, 'property_type_id' => 1, 'status' => 'active', 'approval_status' => 'approved', 'featured' => true, 'realtor_id' => $agent4->id, 'year_built' => 2019, 'parking_spaces' => 2, 'amenities' => ['Gourmet Kitchen', 'Pool', 'Home Office', 'Playroom']],
            ['title' => 'Skyline Tower Apartment', 'slug' => 'skyline-tower-apartment', 'description' => 'Contemporary apartment with stunning skyline views, premium building amenities, and walkable location.', 'address' => '1000 Pike Street', 'city' => 'Seattle', 'state' => 'WA', 'zip' => '98101', 'country' => 'US', 'price' => 985000, 'bedrooms' => 2, 'bathrooms' => 2, 'sqft' => 1650, 'property_type_id' => 2, 'status' => 'active', 'approval_status' => 'approved', 'featured' => true, 'realtor_id' => $agent1->id, 'year_built' => 2023, 'parking_spaces' => 1, 'amenities' => ['City Views', 'Concierge', 'Gym', 'Dog Park']],
            ['title' => 'Suburban Paradise', 'slug' => 'suburban-paradise', 'description' => 'Charming suburban home with a large backyard, updated kitchen, and excellent community amenities.', 'address' => '45 Oak Lane', 'city' => 'Austin', 'state' => 'TX', 'zip' => '78701', 'country' => 'US', 'price' => 725000, 'bedrooms' => 4, 'bathrooms' => 3, 'sqft' => 2900, 'property_type_id' => 1, 'status' => 'active', 'approval_status' => 'approved', 'featured' => true, 'realtor_id' => $agent2->id, 'year_built' => 2021, 'parking_spaces' => 2, 'amenities' => ['Large Backyard', 'Updated Kitchen', 'Community Pool', 'Walking Trails']],
        ];
        foreach ($properties as $prop) {
            Property::create($prop);
        }

        // ─── Membership Plans (NO prices) ───
        $plans = [
            ['name' => 'Starter', 'slug' => 'starter', 'role' => 'agent', 'description' => 'Perfect for new agents getting started', 'lead_quota' => 10, 'listing_limit' => 5, 'priority_level' => 1, 'status' => 'active', 'features' => ['10 leads/month', '5 listings', 'Basic CRM', 'Email support']],
            ['name' => 'Professional', 'slug' => 'professional', 'role' => 'agent', 'description' => 'For established agents ready to grow', 'lead_quota' => 50, 'listing_limit' => 25, 'priority_level' => 2, 'status' => 'active', 'features' => ['50 leads/month', '25 listings', 'Full CRM', 'AI Assistant', 'Priority support']],
            ['name' => 'Enterprise', 'slug' => 'enterprise', 'role' => 'broker', 'description' => 'For brokerages and teams', 'lead_quota' => 500, 'listing_limit' => 100, 'priority_level' => 3, 'status' => 'active', 'features' => ['Unlimited leads', '100 listings', 'Full CRM', 'AI Suite', 'Team management', 'White-label']],
        ];
        foreach ($plans as $plan) {
            MembershipPlan::create($plan);
        }

        // ─── Lead Packages (NO prices) ───
        $packages = [
            ['name' => 'Starter Pack', 'slug' => 'starter-pack', 'lead_count' => 25, 'description' => '25 exclusive leads per month. Perfect for solo agents.', 'is_active' => true],
            ['name' => 'Growth Pack', 'slug' => 'growth-pack', 'lead_count' => 100, 'description' => '100 exclusive leads per month. For growing teams.', 'is_active' => true],
            ['name' => 'Enterprise Pack', 'slug' => 'enterprise-pack', 'lead_count' => 500, 'description' => '500 leads per month. Full market coverage.', 'is_active' => true],
        ];
        foreach ($packages as $package) {
            LeadPackage::create($package);
        }

        // ─── Site Settings ───
        $settings = [
            ['key_name' => 'site_name', 'value' => 'Domestic Real Estate', 'group_name' => 'general'],
            ['key_name' => 'site_tagline', 'value' => 'Your Key to Home', 'group_name' => 'general'],
            ['key_name' => 'site_description', 'value' => 'AI-powered real estate platform for the US & Canada', 'group_name' => 'general'],
            ['key_name' => 'site_email', 'value' => 'info@domesticrealestate.us', 'group_name' => 'contact'],
            ['key_name' => 'site_phone', 'value' => 'Coming Soon', 'group_name' => 'contact'],
            ['key_name' => 'site_address', 'value' => 'New York, NY 10001', 'group_name' => 'contact'],
            ['key_name' => 'primary_color', 'value' => '#0A2647', 'group_name' => 'design'],
            ['key_name' => 'accent_color', 'value' => '#C9A227', 'group_name' => 'design'],
            ['key_name' => 'meta_title', 'value' => 'Domestic Real Estate - Your Key to Home', 'group_name' => 'seo'],
            ['key_name' => 'meta_description', 'value' => 'Find your dream home across the US & Canada with AI-powered search, verified agents, and seamless closings.', 'group_name' => 'seo'],
            ['key_name' => 'google_analytics_id', 'value' => '', 'group_name' => 'analytics'],
            ['key_name' => 'facebook_pixel_id', 'value' => '', 'group_name' => 'analytics'],
        ];
        foreach ($settings as $setting) {
            SiteSetting::create($setting);
        }

        // ─── Testimonials ───
        $testimonials = [
            ['name' => 'Michael & Jennifer Thompson', 'role' => 'First-Time Homebuyers', 'location' => 'Austin, TX', 'content' => 'The AI assistant helped us find our dream home in just 2 weeks! The neighborhood reports and school data made our decision easy. We couldn\'t be happier with our new home.', 'rating' => 5, 'type' => 'text', 'featured' => true],
            ['name' => 'Robert Chen', 'role' => 'Real Estate Investor', 'location' => 'San Francisco, CA', 'content' => 'As an investor, the market analytics and ROI projections are invaluable. I\'ve grown my portfolio by 40% using the insights from DomesticRE.', 'rating' => 5, 'type' => 'text', 'featured' => true],
            ['name' => 'Sarah Martinez', 'role' => 'Home Seller', 'location' => 'Miami, FL', 'content' => 'Sold my home for $50K above asking price thanks to the professional marketing and AI-powered pricing strategy. The entire process was smooth.', 'rating' => 5, 'type' => 'text', 'featured' => true],
        ];
        foreach ($testimonials as $testimonial) {
            Testimonial::create($testimonial);
        }

        // ─── FAQs ───
        $faqs = [
            ['question' => 'How does the AI property matching work?', 'answer' => 'Our AI analyzes your preferences, budget, lifestyle needs, and commute requirements to find properties that best match your criteria. It learns from your interactions and improves recommendations over time.', 'category' => 'general', 'sort_order' => 1],
            ['question' => 'Is the home valuation really free?', 'answer' => 'Yes! Our AI-powered home valuation is completely free with no obligation. We use comparable sales data, market trends, and property characteristics to provide an accurate estimate.', 'category' => 'valuation', 'sort_order' => 2],
            ['question' => 'How long does it take to sell a home?', 'answer' => 'The average time on market varies by location and pricing strategy. With our AI-powered pricing and marketing, our listed properties sell 30% faster than the market average, typically within 21-45 days.', 'category' => 'selling', 'sort_order' => 3],
            ['question' => 'Do you offer virtual tours?', 'answer' => 'Yes, all our premium listings include 3D virtual tours and 360-degree walkthroughs. Our AI assistant can also provide instant neighborhood insights during virtual consultations.', 'category' => 'general', 'sort_order' => 4],
            ['question' => 'What areas do you serve?', 'answer' => 'We currently serve major metropolitan areas across the United States and Canada, with expanding coverage in suburban and rural markets.', 'category' => 'general', 'sort_order' => 5],
            ['question' => 'How does the Payoneer payment work?', 'answer' => 'After we agree on a custom quote, our team sends you a Payoneer invoice link. Once payment is confirmed, your account is activated and services are unlocked.', 'category' => 'billing', 'sort_order' => 6],
        ];
        foreach ($faqs as $faq) {
            Faq::create($faq);
        }

        // ─── Blog Categories ───
        \App\Models\BlogCategory::create(['name' => 'Market Trends', 'slug' => 'market-trends']);
        \App\Models\BlogCategory::create(['name' => 'Buyer Guide', 'slug' => 'buyer-guide']);
        \App\Models\BlogCategory::create(['name' => 'Technology', 'slug' => 'technology']);

        // ─── Blog Posts ───
        $catTrends = \App\Models\BlogCategory::where('slug', 'market-trends')->first();
        $catBuyer = \App\Models\BlogCategory::where('slug', 'buyer-guide')->first();
        $catTech = \App\Models\BlogCategory::where('slug', 'technology')->first();

        $blogs = [
            ['title' => 'Where to Buy Real Estate in NYC: Complete Guide to New York City Real Estate Listings & Homes', 'slug' => 'where-to-buy-real-estate-in-nyc-guide', 'excerpt' => 'Comprehensive buyer and investor guide detailing where to buy real estate in NYC, analyzing top New York City real estate listings, property in NYC, and houses in NYC across all five boroughs.', 'content' => '<h2>Mastering the New York City Real Estate Market</h2><p>Navigating <strong>new york city real estate</strong> requires a strategic approach whether you are a first-time homebuyer, relocating professional, or institutional investor. From iconic Manhattan condos to historic brownstones and spacious <strong>houses in nyc</strong>, the market offers unmatched diversity and long-term equity growth.</p><h2>Where to Buy Real Estate in NYC: Borough Breakdown</h2><p>Deciding <strong>where to buy real estate in nyc</strong> depends heavily on your lifestyle preferences, commute requirements, and target investment yields:</p><ul><li><strong>Manhattan:</strong> Ideal for luxury high-rise condos, co-ops, and premier commercial <strong>new york city properties</strong>. Prime locations include Upper West Side, SoHo, and Tribeca.</li><li><strong>Brooklyn:</strong> Known for historic brownstones, modern waterfront developments in Williamsburg, and family-friendly <strong>new york city homes</strong> in Park Slope.</li><li><strong>Queens:</strong> Long Island City and Astoria offer exceptional modern <strong>property in nyc</strong> with rapid transit access to Midtown Manhattan.</li><li><strong>The Bronx & Staten Island:</strong> Emerging neighborhoods providing high rental yields and affordable single-family <strong>real estate in new york city</strong>.</li></ul><h2>Navigating New York City Real Estate Listings</h2><p>Finding verified <strong>new york city real estate listings</strong> is essential in a competitive market. When reviewing <strong>nyc real estate</strong> properties, pay close attention to property tax abatements (such as 421-a or 17-J), monthly HOA/common charges, and co-op board approval requirements.</p><h2>Why Invest in Real Estate New York City?</h2><p>The market for <strong>real estate new york city</strong> has consistently outperformed broader macroeconomic benchmarks. Strong rental demand, limited inventory supply, and global financial liquidity make premium <strong>new york city properties</strong> an cornerstone asset class for portfolio preservation.</p>', 'category_id' => $catBuyer?->id, 'status' => 'published', 'published_at' => now(), 'author_id' => $admin->id, 'seo_title' => 'Where to Buy Real Estate in NYC | New York City Listings Guide', 'meta_description' => 'Expert guide on where to buy real estate in NYC. Explore verified New York City real estate listings, houses in NYC, property in NYC, and market trends.', 'reading_time' => 7],
            ['title' => '2026 Real Estate Market Forecast: What Buyers and Sellers Need to Know', 'slug' => '2026-market-forecast', 'excerpt' => 'A comprehensive look at the 2026 housing market trends, interest rate predictions, and strategic advice for buyers and sellers.', 'content' => '<p>The 2026 real estate market is shaping up to be one of the most dynamic in recent years. With interest rates stabilizing and inventory levels improving, both buyers and sellers have unique opportunities ahead.</p>', 'category_id' => $catTrends?->id, 'status' => 'published', 'published_at' => now(), 'author_id' => $admin->id, 'seo_title' => '2026 Real Estate Market Forecast', 'meta_description' => 'Comprehensive analysis of 2026 housing market trends.', 'reading_time' => 8],
            ['title' => 'First-Time Homebuyer Checklist: 15 Essential Steps', 'slug' => 'first-time-buyer-checklist', 'excerpt' => 'Your complete guide to navigating the home buying process from pre-approval to closing day.', 'content' => '<p>Buying your first home is exciting but can feel overwhelming. This 15-step checklist will guide you through every stage of the process.</p>', 'category_id' => $catBuyer?->id, 'status' => 'published', 'published_at' => now(), 'author_id' => $admin->id, 'seo_title' => 'First-Time Homebuyer Checklist', 'meta_description' => '15 essential steps for first-time homebuyers.', 'reading_time' => 12],
            ['title' => 'How AI is Revolutionizing Property Search and Valuation', 'slug' => 'ai-revolutionizing-real-estate', 'excerpt' => 'Discover how artificial intelligence is transforming the way we search for, evaluate, and transact real estate.', 'content' => '<p>Artificial intelligence is no longer a futuristic concept in real estate — it\'s here and transforming the industry.</p>', 'category_id' => $catTech?->id, 'status' => 'published', 'published_at' => now(), 'author_id' => $admin->id, 'seo_title' => 'AI in Real Estate', 'meta_description' => 'How AI is transforming property search and valuation.', 'reading_time' => 6],
        ];
        foreach ($blogs as $blog) {
            Blog::create($blog);
        }

        // ─── Marketplace Leads (PPL & PPC) ───
        $this->call(MarketplaceSeeder::class);

        $this->call(KeywordContentSeeder::class);
    }
}
