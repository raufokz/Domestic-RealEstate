<?php

namespace Database\Seeders;

use App\Models\NavigationMenu;
use App\Models\FooterLink;
use App\Models\EmailSetting;
use App\Models\WebsiteTemplate;
use App\Models\AdminRole;
use Illuminate\Database\Seeder;

class NavigationFooterSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Navigation Menus ───
        $headerItems = [
            ['label' => 'Buy', 'url' => '/properties?type=buy', 'position' => 'header', 'group' => 'Properties', 'sort_order' => 1, 'is_active' => true],
            ['label' => 'Sell', 'url' => '/sell', 'position' => 'header', 'group' => 'Properties', 'sort_order' => 2, 'is_active' => true],
            ['label' => 'Properties', 'url' => '/properties', 'position' => 'header', 'group' => 'Properties', 'sort_order' => 3, 'is_active' => true, 'children' => [
                ['label' => 'All Properties', 'url' => '/properties'],
                ['label' => 'For Sale', 'url' => '/properties?type=sale'],
                ['label' => 'For Rent', 'url' => '/properties?type=rent'],
                ['label' => 'New Construction', 'url' => '/properties?new=true'],
            ]],
            ['label' => 'Agents', 'url' => '/agents', 'position' => 'header', 'group' => 'Company', 'sort_order' => 4, 'is_active' => true],
            ['label' => 'Invest', 'url' => '/investors', 'position' => 'header', 'group' => 'Investment', 'sort_order' => 5, 'is_active' => true],
            ['label' => 'Blog', 'url' => '/blog', 'position' => 'header', 'group' => 'Resources', 'sort_order' => 6, 'is_active' => true],
            ['label' => 'Contact', 'url' => '/contact', 'position' => 'header', 'group' => 'Company', 'sort_order' => 7, 'is_active' => true],
        ];

        $footerItems = [
            ['label' => 'About Us', 'url' => '/about', 'position' => 'footer', 'group' => 'Company', 'sort_order' => 1, 'is_active' => true],
            ['label' => 'Contact', 'url' => '/contact', 'position' => 'footer', 'group' => 'Company', 'sort_order' => 2, 'is_active' => true],
            ['label' => 'Blog', 'url' => '/blog', 'position' => 'footer', 'group' => 'Company', 'sort_order' => 3, 'is_active' => true],
            ['label' => 'Privacy Policy', 'url' => '/privacy', 'position' => 'footer', 'group' => 'Legal', 'sort_order' => 4, 'is_active' => true],
            ['label' => 'Terms of Service', 'url' => '/terms', 'position' => 'footer', 'group' => 'Legal', 'sort_order' => 5, 'is_active' => true],
            ['label' => 'FAQ', 'url' => '/faq', 'position' => 'footer', 'group' => 'Resources', 'sort_order' => 6, 'is_active' => true],
        ];

        foreach (array_merge($headerItems, $footerItems) as $item) {
            NavigationMenu::create($item);
        }

        // ─── Footer Links ───
        $footerLinks = [
            ['label' => 'Buy a Home', 'url' => '/properties?type=buy', 'group' => 'Properties', 'sort_order' => 1, 'is_active' => true],
            ['label' => 'Sell Your Home', 'url' => '/sell', 'group' => 'Properties', 'sort_order' => 2, 'is_active' => true],
            ['label' => 'Property Valuation', 'url' => '/sellers/home-valuation', 'group' => 'Properties', 'sort_order' => 3, 'is_active' => true],
            ['label' => 'Find an Agent', 'url' => '/agents', 'group' => 'Properties', 'sort_order' => 4, 'is_active' => true],
            ['label' => 'Investment Properties', 'url' => '/investors', 'group' => 'Properties', 'sort_order' => 5, 'is_active' => true],
            ['label' => 'About Us', 'url' => '/about', 'group' => 'Company', 'sort_order' => 1, 'is_active' => true],
            ['label' => 'Contact Us', 'url' => '/contact', 'group' => 'Company', 'sort_order' => 2, 'is_active' => true],
            ['label' => 'Blog', 'url' => '/blog', 'group' => 'Company', 'sort_order' => 3, 'is_active' => true],
            ['label' => 'Careers', 'url' => '/about#careers', 'group' => 'Company', 'sort_order' => 4, 'is_active' => true],
            ['label' => 'Privacy Policy', 'url' => '/privacy', 'group' => 'Legal', 'sort_order' => 1, 'is_active' => true],
            ['label' => 'Terms of Service', 'url' => '/terms', 'group' => 'Legal', 'sort_order' => 2, 'is_active' => true],
            ['label' => 'Accessibility', 'url' => '/accessibility', 'group' => 'Legal', 'sort_order' => 3, 'is_active' => true],
            ['label' => 'FAQ', 'url' => '/faq', 'group' => 'Resources', 'sort_order' => 1, 'is_active' => true],
            ['label' => 'First Time Buyers', 'url' => '/buyers/first-time', 'group' => 'Resources', 'sort_order' => 2, 'is_active' => true],
            ['label' => 'Home Valuation', 'url' => '/sellers/home-valuation', 'group' => 'Resources', 'sort_order' => 3, 'is_active' => true],
            ['label' => 'SEO Services', 'url' => '/services/seo', 'group' => 'Resources', 'sort_order' => 4, 'is_active' => true],
        ];

        foreach ($footerLinks as $link) {
            FooterLink::create($link);
        }

        // ─── Email Settings ───
        $emailSettings = [
            ['key' => 'from_name', 'value' => 'Domestic Real Estate', 'type' => 'string', 'group' => 'general', 'description' => 'Sender name'],
            ['key' => 'from_email', 'value' => 'noreply@domesticrealestate.us', 'type' => 'string', 'group' => 'general', 'description' => 'Sender email'],
            ['key' => 'reply_to', 'value' => 'support@domesticrealestate.us', 'type' => 'string', 'group' => 'general', 'description' => 'Reply-to email'],
            ['key' => 'smtp_host', 'value' => '', 'type' => 'string', 'group' => 'smtp', 'description' => 'SMTP server host'],
            ['key' => 'smtp_port', 'value' => '587', 'type' => 'integer', 'group' => 'smtp', 'description' => 'SMTP server port'],
            ['key' => 'smtp_username', 'value' => '', 'type' => 'string', 'group' => 'smtp', 'description' => 'SMTP username'],
            ['key' => 'smtp_password', 'value' => '', 'type' => 'string', 'group' => 'smtp', 'description' => 'SMTP password'],
            ['key' => 'smtp_encryption', 'value' => 'tls', 'type' => 'string', 'group' => 'smtp', 'description' => 'SMTP encryption (tls/ssl)'],
            ['key' => 'sendgrid_api_key', 'value' => '', 'type' => 'string', 'group' => 'sendgrid', 'description' => 'SendGrid API key'],
            ['key' => 'mailgun_domain', 'value' => '', 'type' => 'string', 'group' => 'mailgun', 'description' => 'Mailgun domain'],
            ['key' => 'mailgun_secret', 'value' => '', 'type' => 'string', 'group' => 'mailgun', 'description' => 'Mailgun secret'],
            ['key' => 'campaign_daily_limit', 'value' => '500', 'type' => 'integer', 'group' => 'templates', 'description' => 'Max emails per day'],
        ];

        foreach ($emailSettings as $setting) {
            EmailSetting::create($setting);
        }

        // ─── Website Templates ───
        $templates = [
            ['name' => 'Classic Realty', 'slug' => 'classic-realty', 'description' => 'Traditional real estate website template', 'category' => 'real_estate', 'is_active' => true],
            ['name' => 'Modern Agent', 'slug' => 'modern-agent', 'description' => 'Modern, clean agent portfolio template', 'category' => 'real_estate', 'is_active' => true],
            ['name' => 'Property Landing', 'slug' => 'property-landing', 'description' => 'Single property landing page template', 'category' => 'landing', 'is_active' => true],
        ];

        foreach ($templates as $template) {
            WebsiteTemplate::create($template);
        }

        // ─── Admin Roles ───
        $roles = [
            ['name' => 'super_admin', 'display_name' => 'Super Admin', 'description' => 'Full system access', 'is_active' => true],
            ['name' => 'admin', 'display_name' => 'Admin', 'description' => 'Admin access with some restrictions', 'is_active' => true],
            ['name' => 'editor', 'display_name' => 'Editor', 'description' => 'Content editing access only', 'is_active' => true],
        ];

        foreach ($roles as $role) {
            AdminRole::create($role);
        }
    }
}
