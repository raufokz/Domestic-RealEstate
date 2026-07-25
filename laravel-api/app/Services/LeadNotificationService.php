<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\Notification;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class LeadNotificationService
{
    /**
     * Dispatch all notifications and automations for a newly captured/completed lead.
     */
    public static function dispatch(Lead $lead, string $type, array $extraData = [])
    {
        // 1. Create System Notifications for all admins (Dashboard Bell)
        $score = $lead->score ?: ($lead->chat_metadata['qualification_score'] ?? 0);
        $title = "New " . ucfirst($type) . " Lead: " . $lead->first_name . " " . $lead->last_name;
        $message = "A new " . $type . " lead has been captured via " . ($lead->source ?? 'website') . ". Score: " . $score . "%.";
        
        try {
            Notification::notifyAdmins($type, $title, $message, [
                'lead_id' => $lead->id,
                'email' => $lead->email,
                'name' => $lead->first_name . ' ' . $lead->last_name,
                'score' => $score,
            ]);
        } catch (\Exception $e) {
            Log::warning("Failed to create system notifications: " . $e->getMessage());
        }

        // 2. Log Activity for Admin Logs
        try {
            AdminActivityLog::create([
                'user_id' => null, // Lead interaction, not admin action
                'action' => 'lead_captured_' . $type,
                'subject_type' => Lead::class,
                'subject_id' => $lead->id,
                'details' => json_encode([
                    'email' => $lead->email,
                    'type' => $type,
                    'source' => $lead->source,
                ]),
                'ip_address' => request()->ip(),
            ]);
        } catch (\Exception $e) {
            Log::warning("Failed to log lead capture activity: " . $e->getMessage());
        }

        // 3. Send email notifications to admin
        try {
            $adminEmail = config('mail.from.address', 'admin@domesticrealestate.us');
            Mail::send([], [], function ($msg) use ($adminEmail, $lead, $type, $score) {
                $msg->to($adminEmail)
                    ->subject("NEW " . strtoupper($type) . " LEAD - {$lead->first_name} {$lead->last_name}")
                    ->html("
                        <h2>New {$type} Lead Captured</h2>
                        <p><strong>Name:</strong> {$lead->first_name} {$lead->last_name}</p>
                        <p><strong>Email:</strong> {$lead->email}</p>
                        <p><strong>Phone:</strong> {$lead->phone}</p>
                        <p><strong>Source:</strong> {$lead->source}</p>
                        <p><strong>Qualification Score:</strong> {$score}%</p>
                        <p><strong>Qualifications:</strong></p>
                        <ul>
                            <li>Budget Max: " . ($lead->budget_max ?? 'N/A') . "</li>
                            <li>Looking in: " . ($lead->location ?? 'N/A') . "</li>
                            <li>Timeline: " . ($lead->timeline ?? 'N/A') . "</li>
                        </ul>
                        <p><a href='" . config('app.url') . "/admin/leads/{$lead->id}'>View Lead Details in CRM</a></p>
                    ");
            });
        } catch (\Exception $e) {
            Log::warning("Admin lead alert email failed: " . $e->getMessage());
        }

        // 4. Send Welcome Email with PDF attachments
        if ($lead->email) {
            try {
                $guideFile = self::getGuidePath($type);
                
                Mail::send([], [], function ($msg) use ($lead, $type, $guideFile) {
                    $msg->to($lead->email)
                        ->subject(self::getWelcomeSubject($type))
                        ->html(self::getWelcomeHtml($lead, $type));

                    if ($guideFile && file_exists($guideFile)) {
                        $msg->attach($guideFile, [
                            'as' => self::getGuideDisplayName($type),
                            'mime' => 'application/pdf',
                        ]);
                    }
                });
            } catch (\Exception $e) {
                Log::warning("Welcome email to lead failed: " . $e->getMessage());
            }
        }
    }

    private static function getGuidePath(string $type): ?string
    {
        $fileName = match ($type) {
            'buyer' => 'buyer_guide.pdf',
            'seller' => 'home_valuation_guide.pdf',
            'investor' => 'investment_strategy_guide.pdf',
            'realtor' => 'welcome_onboarding_guide.pdf',
            default => null,
        };

        if (!$fileName) return null;

        $dir = storage_path('app/public/guides');
        if (!file_exists($dir)) {
            mkdir($dir, 0755, true);
        }

        $path = $dir . DIRECTORY_SEPARATOR . $fileName;

        // Auto-generate a dummy PDF text file if not exists
        if (!file_exists($path)) {
            $pdfContent = "%PDF-1.4\n1 0 obj\n<<\n/Title (Domestic Real Estate - Guide)\n/Creator (Domestic RE AI)\n>>\nendobj\nxref\n0 1\n0000000000 65535 f\ntrailer\n<<\n/Root 1 0 R\n>>\nstartxref\n0\n%%EOF\n";
            file_put_contents($path, $pdfContent);
        }

        return $path;
    }

    private static function getGuideDisplayName(string $type): string
    {
        return match ($type) {
            'buyer' => 'Domestic_RE_Buyer_Guide.pdf',
            'seller' => 'Domestic_RE_Home_Valuation_Guide.pdf',
            'investor' => 'Domestic_RE_Investment_Strategy_Guide.pdf',
            'realtor' => 'Domestic_RE_Welcome_Onboarding_Guide.pdf',
            default => 'Domestic_RE_Guide.pdf',
        };
    }

    private static function getWelcomeSubject(string $type): string
    {
        return match ($type) {
            'buyer' => 'Welcome to Domestic Real Estate! Finding your dream home',
            'seller' => 'Your Property Valuation details & Guide - Domestic RE',
            'investor' => 'Commercial & Residential Investment strategies - Domestic RE',
            'realtor' => 'Welcome to the Realtor Network Onboarding Guide - Domestic RE',
            default => 'Welcome to Domestic Real Estate',
        };
    }

    private static function getWelcomeHtml(Lead $lead, string $type): string
    {
        $guideName = match ($type) {
            'buyer' => 'Buyer Guide.pdf',
            'seller' => 'Home Valuation Guide.pdf',
            'investor' => 'Investment Strategy Guide.pdf',
            'realtor' => 'Welcome Onboarding Guide.pdf',
            default => 'Welcome Guide.pdf',
        };

        return "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333333;'>
                <div style='background-color: #0A2647; padding: 20px; text-align: center;'>
                    <h1 style='color: #FFFFFF; margin: 0;'>Domestic Real Estate</h1>
                </div>
                <div style='padding: 20px; background-color: #F8F9FA; border: 1px solid #E9ECEF;'>
                    <h2 style='color: #0A2647;'>Hi " . htmlspecialchars($lead->first_name) . ",</h2>
                    <p>Thank you for reaching out to us. We have successfully registered your request as a <strong>" . ucfirst($type) . "</strong>.</p>
                    <p>Attached to this email, you will find your complimentary copy of our detailed <strong>" . htmlspecialchars($guideName) . "</strong> to help you get started immediately.</p>
                    <p>One of our specialized coordinators will review your files and contact you shortly.</p>
                    <hr style='border: none; border-top: 1px solid #DCE1E7; margin: 20px 0;'>
                    <p style='font-size: 12px; color: #777777;'>If you did not submit this request, please ignore this email or contact support.</p>
                </div>
            </div>
        ";
    }
}
