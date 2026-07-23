<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PagesSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'about',
                'title' => 'About Domestic Real Estate',
                'content' => '<h1>About Domestic Real Estate</h1><p>Domestic Real Estate is the premier technology platform connecting buyers, sellers, investors, realtors, and lenders across the nation.</p>',
                'status' => 'published',
                'is_footer_nav' => true,
                'seo_title' => 'About Us | Domestic Real Estate',
                'meta_description' => 'Learn about Domestic Real Estate, our mission, leadership, and property ecosystem.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'contact',
                'title' => 'Contact Us',
                'content' => '<h1>Contact Domestic Real Estate</h1><p>Get in touch with our support and concierge team at info@domesticrealestate.us.</p>',
                'status' => 'published',
                'is_footer_nav' => true,
                'seo_title' => 'Contact Us | Domestic Real Estate',
                'meta_description' => 'Contact our team for inquiries regarding buying, selling, or investing in real estate.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'privacy-policy',
                'title' => 'Privacy Policy',
                'content' => '<h1>Privacy Policy</h1><p>Your privacy is paramount. Read our comprehensive data processing and privacy practices.</p>',
                'status' => 'published',
                'is_footer_nav' => true,
                'seo_title' => 'Privacy Policy | Domestic Real Estate',
                'meta_description' => 'Domestic Real Estate privacy policy and data security practices.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'terms-of-service',
                'title' => 'Terms of Service',
                'content' => '<h1>Terms of Service</h1><p>Welcome to Domestic Real Estate. By accessing our platform, you agree to these terms.</p>',
                'status' => 'published',
                'is_footer_nav' => true,
                'seo_title' => 'Terms of Service | Domestic Real Estate',
                'meta_description' => 'Domestic Real Estate platform terms of service and user agreements.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'services',
                'title' => 'Real Estate Services & Solutions',
                'content' => '<h1>Our Services</h1><p>Explore comprehensive tools for buyers, sellers, wholesalers, realtors, and institutional investors.</p>',
                'status' => 'published',
                'is_footer_nav' => true,
                'seo_title' => 'Services & Solutions | Domestic Real Estate',
                'meta_description' => 'Comprehensive real estate tools, valuations, and deal pipelines.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($pages as $p) {
            DB::table('pages')->updateOrInsert(
                ['slug' => $p['slug']],
                $p
            );
        }
    }
}
