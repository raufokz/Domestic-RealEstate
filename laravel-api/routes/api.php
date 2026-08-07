<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\OfferController;
use App\Http\Controllers\Api\WholesalerPortalController;
use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\SeoController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\MarketingController;
use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\AiAgentController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ServiceRequestController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\ContractTemplateController;
use App\Http\Controllers\Api\EmailWebhookController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\AffiliateController;
use App\Http\Controllers\Api\SocialController;
use App\Http\Controllers\Api\IntegrationController;
use App\Http\Controllers\Api\AutomationController;
use App\Http\Controllers\Api\WebsiteController;
use App\Http\Controllers\Api\CampaignEmailController;
use App\Http\Controllers\Api\NavigationController;
use App\Http\Controllers\Api\FooterLinkController;
use App\Http\Controllers\Api\MediaLibraryController;
use App\Http\Controllers\Api\DataExportController;
use App\Http\Controllers\Api\WebsiteTemplateController;
use App\Http\Controllers\Api\EmailSettingController;
use App\Http\Controllers\Api\EmailAutomationController;
use App\Http\Controllers\Api\EmailTrackingController;
use App\Http\Controllers\Api\PipelineController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\PortalController;
use App\Http\Controllers\Api\SystemController;
use App\Http\Controllers\Api\TestingController;
use App\Http\Controllers\Api\PropertyManagementController;
use App\Http\Controllers\Api\PageBuilderController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\AiPromptController;
use App\Http\Controllers\Api\FormSubmissionController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\AgentPortalController;
use App\Http\Controllers\Api\AdminRealtorController;
use App\Http\Controllers\Api\GeoCheckController;
use App\Http\Controllers\Api\GeoWhitelistController;
use App\Http\Controllers\Api\GeoBlacklistController;
use App\Http\Controllers\Api\GeoAccessLogController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\RealtorApplicationController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Geo Access Control — internal cross-service check used by the Next.js
// edge middleware, gated by X-Geo-Internal-Secret (not by normal auth).
Route::post('/geo/check', [GeoCheckController::class, 'check'])->middleware('throttle:120,1');

// Auth
Route::prefix('auth')->group(function () {
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });
    Route::middleware('throttle:otp')->group(function () {
        Route::post('/send-otp', [AuthController::class, 'sendOtp']);
        Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
        Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
        Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    });
});

// Properties (public)
Route::prefix('properties')->group(function () {
    Route::get('/', [PropertyController::class, 'index']);
    Route::get('/featured', [PropertyController::class, 'featured']);
    Route::get('/premium', [PropertyController::class, 'premium']);
    Route::get('/search', [PropertyController::class, 'search']);
    Route::get('/{slug}', [PropertyController::class, 'show']);
    Route::post('/{id}/inquiry', [PropertyController::class, 'inquiry']);
});

// Agents (public)
Route::prefix('agents')->group(function () {
    Route::get('/', [AgentController::class, 'index']);
    Route::get('/featured', [AgentController::class, 'featured']);
    Route::get('/{slug}', [AgentController::class, 'show']);
    Route::post('/{id}/contact', [AgentController::class, 'contact']);
});

// SEO Pages
Route::prefix('seo-pages')->group(function () {
    Route::get('/', [SeoController::class, 'landingPages']);
    Route::get('/{slug}', [SeoController::class, 'showLandingPage']);
});

// Blogs
Route::prefix('blogs')->group(function () {
    Route::get('/', [BlogController::class, 'index']);
    Route::get('/{slug}', [BlogController::class, 'show']);
    Route::post('/{slug}/view', [BlogController::class, 'incrementView']);
});
Route::middleware('auth:sanctum')->post('/blogs/{id}/like', [BlogController::class, 'like']);

// Content
Route::get('/testimonials', [SeoController::class, 'testimonials']);
Route::get('/faqs', [SeoController::class, 'faqs']);

// Marketing
Route::prefix('marketing')->group(function () {
    Route::post('/newsletter', [MarketingController::class, 'subscribe']);
    Route::post('/contact', [MarketingController::class, 'contact']);
    Route::post('/valuations', [MarketingController::class, 'valuation']);
    Route::post('/appointments', [MarketingController::class, 'appointment']);
});

// Realtor application status/resubmission (public — no login exists at this stage)
Route::prefix('realtor-applications')->group(function () {
    Route::get('/{reference}/status', [RealtorApplicationController::class, 'status']);
    Route::post('/{reference}/resubmit', [RealtorApplicationController::class, 'resubmit']);
});

// Universal Form Submissions (public)
Route::prefix('forms')->group(function () {
    Route::post('/realtor-application', [FormSubmissionController::class, 'submitRealtorApplication']);
    Route::post('/agent-application', [FormSubmissionController::class, 'submitAgentApplication']);
    Route::post('/investor-inquiry', [FormSubmissionController::class, 'submitInvestorInquiry']);
    Route::post('/seller-request', [FormSubmissionController::class, 'submitSellerRequest']);
    Route::post('/buyer-request', [FormSubmissionController::class, 'submitBuyerRequest']);
    Route::post('/contact', [FormSubmissionController::class, 'submitContactForm']);
});

// Service Requests (public — unauthenticated users can submit)
Route::post('/service-requests', [ServiceRequestController::class, 'store']);

// Public lead capture (homepage forms — no auth)
Route::post('/leads/capture', [LeadController::class, 'capture'])->middleware('throttle:5,1');

// AI (public chat + property recommendation)
Route::prefix('ai')->group(function () {
    Route::post('/chat', [AiController::class, 'chat']);
    Route::post('/save-progress', [AiController::class, 'saveProgress']);
    Route::post('/recommend-property', [AiController::class, 'recommendProperty']);
    Route::post('/property-description', [AiController::class, 'propertyDescription']);
});

// Affiliate click tracking
Route::get('/affiliate/{code}/track', [AffiliateController::class, 'trackClick']);

// Plans & Packages (public display)
Route::get('/plans', [InvoiceController::class, 'plans']);
Route::get('/lead-packages', [InvoiceController::class, 'leadPackages']);

// Navigation & Footer (Public)
Route::get('/navigation/header', [NavigationController::class, 'getHeaderMenu']);
Route::get('/navigation/footer', [NavigationController::class, 'getFooterMenu']);
Route::get('/footer-links', [FooterLinkController::class, 'getLinks']);

// Email Tracking (Public)
Route::get('/email/track/{trackingId}/open', [EmailTrackingController::class, 'trackOpen']);
Route::get('/email/track/{trackingId}/click/{linkIndex}', [EmailTrackingController::class, 'trackClick']);
Route::get('/email/unsubscribe/{token}', [EmailTrackingController::class, 'unsubscribe']);
Route::post('/email/unsubscribe', [EmailTrackingController::class, 'processUnsubscribe']);

// Payment Webhooks (Public)
Route::post('/marketplace/webhook', [MarketplaceController::class, 'handleWebhook'])->middleware('throttle:120,1');
Route::post('/marketplace/payouts/webhook', [MarketplaceController::class, 'handlePayoutWebhook'])->middleware('throttle:120,1');
Route::post('/invoices/webhook', [InvoiceController::class, 'handlePayoneerWebhook'])->middleware('throttle:120,1');
Route::post('/webhooks/email/bounce', [EmailWebhookController::class, 'bounce'])->middleware('throttle:120,1');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
        Route::post('/avatar-upload', [AuthController::class, 'uploadAvatar']);
    });

    // Properties
    Route::prefix('properties')->group(function () {
        Route::post('/', [PropertyController::class, 'store']);
        Route::post('/import', [PropertyController::class, 'import']);
        Route::put('/{id}', [PropertyController::class, 'update']);
        Route::delete('/{id}', [PropertyController::class, 'destroy']);
        Route::post('/{id}/images', [PropertyController::class, 'uploadImages']);
        Route::delete('/{propertyId}/images/{imageId}', [PropertyController::class, 'destroyImage']);
        Route::post('/{propertyId}/images/{imageId}/primary', [PropertyController::class, 'setPrimaryImage']);
        Route::post('/{propertyId}/images/reorder', [PropertyController::class, 'reorderImages']);
        Route::post('/{id}/favorite', [PropertyController::class, 'toggleFavorite']);
        Route::get('/{id}/analytics', [PropertyController::class, 'analytics']);
    });

    // Agents (profile management lives under /agent-profile/me)

    // Leads CRM (read/update require auth)
    Route::prefix('leads')->group(function () {
        Route::get('/', [LeadController::class, 'index']);
        Route::get('/{id}', [LeadController::class, 'show']);
        Route::put('/{id}', [LeadController::class, 'update']);
        Route::delete('/{id}', [LeadController::class, 'destroy']);
        Route::put('/{id}/status', [LeadController::class, 'updateStatus']);
        Route::post('/{id}/notes', [LeadController::class, 'addNote']);
        Route::post('/{id}/tasks', [LeadController::class, 'addTask']);
        Route::post('/{id}/assign', [LeadController::class, 'assign']);
        Route::post('/import', [LeadController::class, 'import']);
        Route::post('/reassign', [LeadController::class, 'bulkReassign']);
        Route::post('/qualify', [LeadController::class, 'qualify']);
    });

    // Pay-Per-Lead Marketplace (authenticated users)
    Route::prefix('marketplace')->group(function () {
        Route::get('/', [MarketplaceController::class, 'index']);
        Route::get('/my-purchases', [MarketplaceController::class, 'myPurchases']);
        Route::get('/leads/{id}', [MarketplaceController::class, 'show']);
        Route::post('/leads/{id}/reserve', [MarketplaceController::class, 'reserve']);
        Route::post('/leads/{id}/purchase', [MarketplaceController::class, 'purchase']);
        Route::post('/leads/{id}/process-payment', [MarketplaceController::class, 'purchase']);
        Route::post('/leads/{id}/claim', [MarketplaceController::class, 'claim']);
        Route::post('/leads/{id}/release', [MarketplaceController::class, 'release']);
        Route::get('/leads/{id}/details', [MarketplaceController::class, 'details']);
        Route::get('/purchases/{id}/invoice', [MarketplaceController::class, 'getInvoice']);
        Route::get('/purchases/{id}/export', [MarketplaceController::class, 'exportLead']);
    });

    // User notifications
    Route::prefix('my')->group(function () {
        Route::get('/notifications', [MarketplaceController::class, 'notifications']);
        Route::post('/notifications/read', [MarketplaceController::class, 'markNotificationsRead']);
    });

    // AI Agent Management
    Route::prefix('ai-agents')->group(function () {
        Route::get('/', [AiAgentController::class, 'index']);
        Route::get('/stats', [AiAgentController::class, 'stats']);
        Route::put('/{key}', [AiAgentController::class, 'update']);
        Route::post('/{key}/test', [AiAgentController::class, 'test']);
        Route::get('/{key}/logs', [AiAgentController::class, 'logs']);
    });

    // AI Chat (authenticated)
    Route::post('/ai/improve-email', [AiController::class, 'emailWriter']);

    // AI (authenticated)
    Route::prefix('ai')->group(function () {
        Route::post('/lead-qualify', [AiController::class, 'leadQualify']);
        Route::post('/seller-agent', [AiController::class, 'sellerAgent']);
        Route::post('/investor-agent', [AiController::class, 'investorAgent']);
        Route::post('/email-writer', [AiController::class, 'emailWriter']);
        Route::post('/social-agent', [AiController::class, 'socialAgent']);
        Route::post('/seo-agent', [AiController::class, 'seoAgent']);
        Route::get('/crm-assistant', [AiController::class, 'crmAssistant']);
        Route::post('/analytics-agent', [AiController::class, 'analyticsAgent']);
        Route::post('/voice', [AiController::class, 'voice']);
    });

    // Service Requests (authenticated — own requests + submit)
    Route::prefix('service-requests')->group(function () {
        Route::get('/my', [ServiceRequestController::class, 'myRequests']);
        Route::get('/{requestNumber}', [ServiceRequestController::class, 'show']);
    });

    // Contracts
    Route::prefix('contracts')->group(function () {
        Route::get('/my', [ContractController::class, 'myContracts']);
        Route::get('/{contractNumber}', [ContractController::class, 'show']);
        Route::post('/{contractNumber}/sign', [ContractController::class, 'sign']);
        Route::post('/{contractNumber}/signers/{signerId}/sign', [ContractController::class, 'signAsParty']);
        Route::get('/{contractNumber}/timeline', [ContractController::class, 'timeline']);
        Route::get('/{contractNumber}/download', [ContractController::class, 'downloadPdf']);
    });

    // Invoices
    Route::prefix('invoices')->group(function () {
        Route::get('/my', [InvoiceController::class, 'myInvoices']);
        Route::get('/{invoiceNumber}', [InvoiceController::class, 'show']);
    });

    // Affiliate
    Route::prefix('affiliate')->group(function () {
        Route::get('/dashboard', [AffiliateController::class, 'dashboard']);
    });

    // Social CRM
    Route::prefix('social')->group(function () {
        Route::get('/accounts', [SocialController::class, 'indexAccounts']);
        Route::post('/accounts', [SocialController::class, 'storeAccount']);
        Route::delete('/accounts/{id}', [SocialController::class, 'destroyAccount']);
        Route::post('/accounts/{id}/test', [SocialController::class, 'testAccount']);
        Route::get('/posts', [SocialController::class, 'indexPosts']);
        Route::post('/posts', [SocialController::class, 'storePost']);
        Route::get('/posts/{id}', [SocialController::class, 'showPost']);
        Route::put('/posts/{id}', [SocialController::class, 'updatePost']);
        Route::delete('/posts/{id}', [SocialController::class, 'destroyPost']);
        Route::post('/posts/{id}/retry', [SocialController::class, 'retryPost']);
        Route::get('/templates', [SocialController::class, 'indexTemplates']);
        Route::post('/templates', [SocialController::class, 'storeTemplate'])->middleware('role:staff,admin,super_admin');
        Route::put('/templates/{id}', [SocialController::class, 'updateTemplate'])->middleware('role:staff,admin,super_admin');
        Route::delete('/templates/{id}', [SocialController::class, 'destroyTemplate'])->middleware('role:staff,admin,super_admin');
        Route::post('/share-listing', [SocialController::class, 'shareListing']);
        Route::get('/calendar', [SocialController::class, 'calendar']);
        Route::get('/analytics', [SocialController::class, 'analytics']);
    });

    // Email Campaigns (frontend uses /email-campaigns path)
    Route::middleware('role:staff,admin,super_admin')->group(function () {
        Route::prefix('email-campaigns')->group(function () {
            Route::get('/', [CampaignEmailController::class, 'index']);
            Route::post('/', [CampaignEmailController::class, 'store']);
            Route::post('/bulk-followup', [CampaignEmailController::class, 'bulkFollowUp']);
            Route::post('/send-test', [CampaignEmailController::class, 'sendTestEmail']);
            Route::get('/{id}', [CampaignEmailController::class, 'show']);
            Route::put('/{id}', [CampaignEmailController::class, 'update']);
            Route::delete('/{id}', [CampaignEmailController::class, 'destroy']);
            Route::post('/{id}/send', [CampaignEmailController::class, 'send']);
            Route::get('/{id}/progress', [CampaignEmailController::class, 'progress']);
            Route::get('/{id}/recipients', [CampaignEmailController::class, 'recipients']);
            Route::post('/{id}/recipients/import', [CampaignEmailController::class, 'importRecipients']);
        });

        // Email Campaigns (original path)
        Route::prefix('campaigns')->group(function () {
            Route::get('/', [CampaignEmailController::class, 'index']);
            Route::post('/', [CampaignEmailController::class, 'store']);
            Route::get('/{id}', [CampaignEmailController::class, 'show']);
            Route::put('/{id}', [CampaignEmailController::class, 'update']);
            Route::delete('/{id}', [CampaignEmailController::class, 'destroy']);
            Route::post('/{id}/send', [CampaignEmailController::class, 'send']);
            Route::get('/{id}/progress', [CampaignEmailController::class, 'progress']);
            Route::get('/{id}/recipients', [CampaignEmailController::class, 'recipients']);
            Route::post('/{id}/recipients/import', [CampaignEmailController::class, 'importRecipients']);
        });

        // Sent Emails
        Route::prefix('sent-emails')->group(function () {
            Route::get('/', [CampaignEmailController::class, 'indexSentEmails']);
        });

        // Email Templates
        Route::get('/email-templates', [CampaignEmailController::class, 'templates']);
        Route::post('/email-templates', [CampaignEmailController::class, 'storeTemplate']);
        Route::post('/email-templates/preview', [CampaignEmailController::class, 'previewTemplate']);
        Route::put('/email-templates/{id}', [CampaignEmailController::class, 'updateTemplate']);
        Route::delete('/email-templates/{id}', [CampaignEmailController::class, 'destroyTemplate']);
    });

    // Unsubscribe (public token-based)
    Route::post('/unsubscribe', [CampaignEmailController::class, 'unsubscribe']);

    // Pipelines & Deals
    Route::middleware('role:staff,admin,super_admin')->prefix('pipelines')->group(function () {
        Route::get('/', [PipelineController::class, 'index']);
        Route::post('/', [PipelineController::class, 'store']);
        Route::get('/{id}', [PipelineController::class, 'show']);
        Route::put('/{id}', [PipelineController::class, 'update']);
        Route::delete('/{id}', [PipelineController::class, 'destroy']);
        Route::post('/{pipelineId}/stages', [PipelineController::class, 'storeStage']);
        Route::post('/{pipelineId}/deals', [PipelineController::class, 'storeDeal']);
        Route::put('/{pipelineId}/deals/{dealId}/move', [PipelineController::class, 'moveDeal']);
        Route::post('/{pipelineId}/deals/bulk-move', [PipelineController::class, 'bulkMoveDeals']);
        Route::post('/{pipelineId}/deals/bulk-archive', [PipelineController::class, 'bulkArchiveDeals']);
        Route::delete('/{pipelineId}/deals/{dealId}', [PipelineController::class, 'destroyDeal']);
    });

    Route::get('/super-admin/dashboard', [PortalController::class, 'superAdminDashboard']);
});

// Lead capture (public — no auth required)
Route::post('/leads', [LeadController::class, 'capture']);

/*
|--------------------------------------------------------------------------
| Agent Portal — RBAC enforced at the route level (agent/admin/super_admin).
| Every endpoint is additionally scoped to the signed-in user's own data.
|--------------------------------------------------------------------------
*/
    Route::middleware(['auth:sanctum', 'role:agent,admin,super_admin'])->prefix('agent')->group(function () {
    Route::get('/dashboard', [AgentPortalController::class, 'dashboard']);
    Route::get('/stats', [AgentController::class, 'stats']);
    Route::get('/enquiries', [AgentController::class, 'enquiries']);

    // Compose & send a one-off email to a client/contact
    Route::post('/emails/send', [CampaignEmailController::class, 'sendDirectEmail']);

    // Properties (own listings only)
    Route::get('/properties', [AgentPortalController::class, 'properties']);
    Route::post('/properties/{id}/duplicate', [AgentPortalController::class, 'duplicateProperty']);
    Route::post('/properties/{id}/submit', [AgentPortalController::class, 'submitProperty']);

    // Leads / Clients / CRM
    Route::get('/clients', [AgentPortalController::class, 'clients']);

    // Tasks
    Route::get('/tasks', [AgentPortalController::class, 'tasks']);
    Route::post('/tasks', [AgentPortalController::class, 'storeTask']);
    Route::put('/tasks/{id}', [AgentPortalController::class, 'updateTask']);

    // Calendar / Appointments
    Route::get('/appointments', [AgentPortalController::class, 'appointments']);
    Route::post('/appointments', [AgentPortalController::class, 'storeAppointment']);
    Route::put('/appointments/{id}', [AgentPortalController::class, 'updateAppointment']);
    Route::delete('/appointments/{id}', [AgentPortalController::class, 'destroyAppointment']);

    // Messages / Analytics / Earnings
    Route::get('/messages', [AgentPortalController::class, 'messages']);
    Route::get('/analytics', [AgentPortalController::class, 'analytics']);
    Route::get('/pay-at-closing', [AgentPortalController::class, 'payAtClosingLeads']);
    Route::put('/leads/{purchasedLeadId}/payout-email', [MarketplaceController::class, 'updatePayoutEmail']);
    Route::get('/sent-emails', [CampaignEmailController::class, 'indexSentEmails']);

    // Documents (own profile only)
    Route::get('/documents', [AgentController::class, 'myDocuments']);
    Route::post('/documents', [AgentController::class, 'storeMyDocument']);
    Route::get('/documents/{id}/download', [AgentController::class, 'downloadMyDocument']);
    Route::delete('/documents/{id}', [AgentController::class, 'destroyMyDocument']);
});

/*
|--------------------------------------------------------------------------
| Offers — buyer/seller negotiation. Deliberately NOT reusing PortalController's
| buyer/seller stub routes above (those are broken — nested under /admin and
| never queried the DB). Every query is pre-scoped to the signed-in user.
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:buyer,admin,super_admin'])->prefix('buyer')->group(function () {
    Route::get('/offers', [OfferController::class, 'buyerIndex']);
    Route::post('/offers', [OfferController::class, 'store']);
    Route::post('/offers/{id}/respond', [OfferController::class, 'buyerRespond']);
    Route::post('/offers/{id}/withdraw', [OfferController::class, 'withdraw']);
});

Route::middleware(['auth:sanctum', 'role:seller,agent,broker,admin,super_admin'])->prefix('seller')->group(function () {
    Route::get('/offers', [OfferController::class, 'sellerIndex']);
    Route::post('/offers/{id}/respond', [OfferController::class, 'sellerRespond']);
    Route::get('/properties', [PropertyController::class, 'myListings']);
});

/*
|--------------------------------------------------------------------------
| Wholesaler Portal — deal pipeline + cash-buyer list.
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:wholesaler,admin,super_admin'])->prefix('wholesaler')->group(function () {
    Route::get('/dashboard', [WholesalerPortalController::class, 'dashboard']);
    Route::get('/deals', [WholesalerPortalController::class, 'deals']);
    Route::post('/deals', [WholesalerPortalController::class, 'storeDeal']);
    Route::get('/deals/{id}', [WholesalerPortalController::class, 'showDeal']);
    Route::put('/deals/{id}', [WholesalerPortalController::class, 'updateDeal']);
    Route::get('/buyers', [WholesalerPortalController::class, 'buyers']);
    Route::post('/buyers', [WholesalerPortalController::class, 'storeBuyer']);
    Route::put('/buyers/{id}', [WholesalerPortalController::class, 'updateBuyer']);
});

/*
|--------------------------------------------------------------------------
| Admin Routes (admin + super_admin only)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:staff,admin,super_admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/analytics', [AdminController::class, 'analytics']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::post('/users', [AdminController::class, 'storeUser']);
    Route::get('/users/{id}', [AdminController::class, 'showUser']);
    Route::put('/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/users/{id}', [AdminController::class, 'destroyUser']);
    Route::get('/properties', [AdminController::class, 'properties']);
    Route::post('/properties', [AdminController::class, 'storeProperty']);
    Route::put('/properties/{id}', [AdminController::class, 'updateProperty']);
    Route::delete('/properties/{id}', [AdminController::class, 'destroyProperty']);
    Route::post('/properties/{id}/approval', [AdminController::class, 'updatePropertyApproval']);
    Route::get('/agents', [AdminController::class, 'agents']);
    Route::post('/agents', [AdminController::class, 'storeAgent']);
    Route::put('/agents/{id}', [AdminController::class, 'updateAgent']);
    Route::delete('/agents/{id}', [AdminController::class, 'destroyAgent']);
    Route::post('/agents/{id}/send-payment-link', [AdminController::class, 'sendAgentPaymentLink']);
    // Realtor Profile Self-Management (RBAC)
    Route::withoutMiddleware('role:staff,admin,super_admin')->middleware('role:agent,broker,staff,admin,super_admin')->group(function () {
        Route::get('/agent-profile/me', [AgentController::class, 'me']);
        Route::put('/agent-profile/me', [AgentController::class, 'updateMe']);
        Route::patch('/agent-profile/me/publish', [AgentController::class, 'publishMe']);
        Route::post('/agent-profile/me/media', [AgentController::class, 'uploadMediaMe']);
        Route::get('/agent-profile/me/documents', [AgentController::class, 'myDocuments']);
        Route::post('/agent-profile/me/documents', [AgentController::class, 'storeMyDocument']);
        Route::get('/agent-profile/me/documents/{id}/download', [AgentController::class, 'downloadMyDocument']);
        Route::delete('/agent-profile/me/documents/{id}', [AgentController::class, 'destroyMyDocument']);
    });

    // Admin Realtor Management & Verification Portal
    Route::get('/realtors', [AdminRealtorController::class, 'index']);
    Route::get('/realtors/{id}', [AdminRealtorController::class, 'show']);
    Route::put('/realtors/{id}', [AdminRealtorController::class, 'update']);
    Route::post('/realtors/{id}/status', [AdminRealtorController::class, 'updateStatus']);
    Route::post('/realtors/{id}/media', [AdminRealtorController::class, 'uploadMedia']);
    Route::get('/realtors/{id}/audits', [AdminRealtorController::class, 'audits']);
    Route::post('/realtors/{id}/documents', [AdminRealtorController::class, 'uploadDocument']);
    Route::delete('/realtors/{id}/documents/{docId}', [AdminRealtorController::class, 'destroyDocument']);

    Route::get('/leads', [AdminController::class, 'leads']);
    Route::get('/enquiries', [AdminController::class, 'enquiries']);
    Route::put('/enquiries/{id}', [AdminController::class, 'updateEnquiry']);

    // Pay-Per-Lead Marketplace (admin)
    Route::prefix('marketplace')->group(function () {
        Route::get('/', [MarketplaceController::class, 'adminIndex']);
        Route::get('/analytics', [MarketplaceController::class, 'adminAnalytics']);
        Route::get('/payment-logs', [MarketplaceController::class, 'adminPaymentLogs']);
        Route::get('/users', [MarketplaceController::class, 'adminUserPermissions']);
        Route::post('/users/{id}/permissions', [MarketplaceController::class, 'adminToggleUserPpl']);
        Route::post('/leads', [MarketplaceController::class, 'adminStore']);
        Route::put('/leads/{id}', [MarketplaceController::class, 'adminUpdate']);
        Route::post('/leads/{id}/publish', [MarketplaceController::class, 'adminPublish']);
        Route::post('/leads/{id}/unpublish', [MarketplaceController::class, 'adminUnpublish']);
        Route::post('/leads/{id}/relist', [MarketplaceController::class, 'adminRelist']);
        Route::post('/leads/{id}/assign', [MarketplaceController::class, 'adminAssignLead']);
        Route::get('/purchases', [MarketplaceController::class, 'adminPurchases']);
        Route::post('/purchases/{purchaseId}/confirm', [MarketplaceController::class, 'adminConfirmPayment']);
        Route::post('/purchases/{purchaseId}/cancel', [MarketplaceController::class, 'adminCancelPurchase']);
        Route::post('/purchases/{purchaseId}/refund', [MarketplaceController::class, 'adminRefund']);
        Route::get('/payouts', [MarketplaceController::class, 'adminPayouts']);
        Route::post('/payouts/{purchasedLeadId}/status', [MarketplaceController::class, 'adminMarkPayout']);
        Route::get('/payouts/export', [MarketplaceController::class, 'exportPayouts']);
    });
    Route::get('/settings', [AdminController::class, 'settings']);
    Route::put('/settings', [AdminController::class, 'updateSettings']);

    // Service Requests (admin)
    Route::get('/service-requests', [AdminController::class, 'serviceRequests']);
    Route::put('/service-requests/{id}', [AdminController::class, 'updateServiceRequest']);

    // Contracts (admin)
    Route::get('/contracts', [AdminController::class, 'contracts']);
    Route::get('/contracts/available', [AdminController::class, 'contractsAvailable']);
    Route::post('/contracts', [AdminController::class, 'storeContract']);
    Route::get('/contracts/{id}', [AdminController::class, 'contract']);
    Route::get('/contracts/{id}/pdf', [AdminController::class, 'contractPdf']);
    Route::put('/contracts/{id}', [AdminController::class, 'updateContract']);
    Route::post('/contracts/{id}/send', [AdminController::class, 'sendContract']);
    Route::get('/contracts/{id}/versions', [AdminController::class, 'contractVersions']);
    Route::post('/contracts/{id}/signers', [AdminController::class, 'addContractSigners']);
    Route::post('/contracts/{id}/renew', [AdminController::class, 'renewContract']);

    // Contract Templates (admin)
    Route::get('/contract-templates', [ContractTemplateController::class, 'index']);
    Route::post('/contract-templates', [ContractTemplateController::class, 'store']);
    Route::get('/contract-templates/{id}', [ContractTemplateController::class, 'show']);
    Route::put('/contract-templates/{id}', [ContractTemplateController::class, 'update']);
    Route::delete('/contract-templates/{id}', [ContractTemplateController::class, 'destroy']);

    // Invoices (Admin)
    Route::prefix('invoices')->group(function () {
        Route::get('/', [InvoiceController::class, 'adminIndex']);
        Route::post('/', [InvoiceController::class, 'createInvoice']);
        Route::get('/stats', [InvoiceController::class, 'getInvoiceStats']);
        Route::put('/{id}', [InvoiceController::class, 'updateInvoice']);
        Route::post('/{id}/send', [InvoiceController::class, 'sendInvoice']);
        Route::post('/{id}/record-manual-payment', [InvoiceController::class, 'recordManualPayment']);
        Route::get('/{id}/pdf', [InvoiceController::class, 'downloadPdf']);
        Route::post('/{id}/void', [InvoiceController::class, 'voidInvoice']);
    });

    // Newsletter Subscribers
    Route::get('/newsletter-subscribers', [AdminController::class, 'newsletterSubscribers']);
    Route::delete('/newsletter-subscribers/{id}', [AdminController::class, 'removeNewsletterSubscriber']);

    // Contacts (Admin)
    Route::prefix('contacts')->group(function () {
        Route::get('/', [ContactController::class, 'index']);
        Route::get('/search', [ContactController::class, 'index']);
        Route::get('/stats', [ContactController::class, 'stats']);
        Route::post('/', [ContactController::class, 'store']);
        Route::get('/{id}', [ContactController::class, 'show']);
        Route::put('/{id}', [ContactController::class, 'update']);
        Route::delete('/{id}', [ContactController::class, 'destroy']);
    });
    Route::prefix('contact-groups')->group(function () {
        Route::get('/', [ContactController::class, 'groups']);
        Route::post('/', [ContactController::class, 'storeGroup']);
        Route::put('/{id}', [ContactController::class, 'updateGroup']);
        Route::delete('/{id}', [ContactController::class, 'destroyGroup']);
    });

    // Activity Logs
    Route::get('/activity-logs', [AdminController::class, 'activityLogs']);

    // Admin Notifications
    Route::get('/notifications', [AdminController::class, 'notifications']);
    Route::post('/notifications/mark-all-read', [AdminController::class, 'markAllNotificationsRead']);
    Route::post('/notifications/{id}/read', [AdminController::class, 'markNotificationRead']);
    Route::post('/notifications/{id}/resolve', [AdminController::class, 'resolveNotification']);
    Route::delete('/notifications/{id}', [AdminController::class, 'destroyNotification']);

    // Integrations Hub
    Route::prefix('integrations')->group(function () {
        Route::get('/', [IntegrationController::class, 'index']);
        Route::get('/seed', [IntegrationController::class, 'seed']);
        Route::get('/{key}', [IntegrationController::class, 'show']);
        Route::put('/{key}', [IntegrationController::class, 'update']);
        Route::post('/{key}/test', [IntegrationController::class, 'test']);
        Route::post('/{key}/connect', [IntegrationController::class, 'connect']);
        Route::post('/{key}/disconnect', [IntegrationController::class, 'disconnect']);
        Route::get('/{key}/logs', [IntegrationController::class, 'logs']);
    });

    // Automation Workflows
    Route::prefix('automation')->group(function () {
        Route::get('/triggers', [AutomationController::class, 'triggers']);
        Route::get('/actions', [AutomationController::class, 'actions']);
        Route::get('/workflows', [AutomationController::class, 'index']);
        Route::post('/workflows', [AutomationController::class, 'store']);
        Route::get('/workflows/{id}', [AutomationController::class, 'show']);
        Route::put('/workflows/{id}', [AutomationController::class, 'update']);
        Route::delete('/workflows/{id}', [AutomationController::class, 'destroy']);
        Route::post('/workflows/{id}/toggle', [AutomationController::class, 'toggle']);
        Route::get('/workflows/{id}/logs', [AutomationController::class, 'logs']);
    });

    // Website Builder
    Route::prefix('websites')->group(function () {
        Route::get('/', [WebsiteController::class, 'index']);
        Route::post('/', [WebsiteController::class, 'store']);
        Route::get('/{id}', [WebsiteController::class, 'show']);
        Route::put('/{id}', [WebsiteController::class, 'update']);
        Route::delete('/{id}', [WebsiteController::class, 'destroy']);
        Route::post('/{id}/duplicate', [WebsiteController::class, 'duplicate']);
        Route::post('/{id}/deploy', [WebsiteController::class, 'deploy']);
        Route::post('/{id}/suspend', [WebsiteController::class, 'suspend']);
        Route::post('/{id}/pages', [WebsiteController::class, 'storePage']);
        Route::put('/{id}/pages/{pageId}', [WebsiteController::class, 'updatePage']);
        Route::delete('/{id}/pages/{pageId}', [WebsiteController::class, 'destroyPage']);
        Route::post('/{id}/domains', [WebsiteController::class, 'storeDomain']);
        Route::post('/{id}/domains/{domainId}/verify', [WebsiteController::class, 'verifyDomain']);
        Route::post('/{id}/domains/{domainId}/primary', [WebsiteController::class, 'verifyDomain']);
        Route::delete('/{id}/domains/{domainId}', [WebsiteController::class, 'destroyDomain']);
        Route::get('/{id}/settings', [WebsiteController::class, 'show']);
        Route::put('/{id}/settings', [WebsiteController::class, 'update']);
        Route::get('/{id}/seo', [WebsiteController::class, 'show']);
        Route::put('/{id}/seo', [WebsiteController::class, 'update']);
        Route::get('/{id}/analytics', [WebsiteController::class, 'analytics']);
    });

    // Navigation (Admin)
    Route::get('/navigation', [NavigationController::class, 'getAll']);
    Route::post('/navigation', [NavigationController::class, 'store']);
    Route::put('/navigation/{id}', [NavigationController::class, 'update']);
    Route::delete('/navigation/{id}', [NavigationController::class, 'destroy']);
    Route::post('/navigation/reorder', [NavigationController::class, 'reorder']);
    Route::patch('/navigation/{id}/toggle', [NavigationController::class, 'toggleActive']);

    // Footer Links (Admin)
    Route::get('/footer-links', [FooterLinkController::class, 'getAll']);
    Route::post('/footer-links', [FooterLinkController::class, 'store']);
    Route::put('/footer-links/{id}', [FooterLinkController::class, 'update']);
    Route::delete('/footer-links/{id}', [FooterLinkController::class, 'destroy']);
    Route::post('/footer-links/reorder', [FooterLinkController::class, 'reorder']);
    Route::patch('/footer-links/{id}/toggle', [FooterLinkController::class, 'toggleActive']);

    // Media Library
    Route::get('/media', [MediaLibraryController::class, 'index']);
    Route::post('/media', [MediaLibraryController::class, 'store']);
    Route::get('/media/collections', [MediaLibraryController::class, 'getCollections']);
    Route::get('/media/{id}', [MediaLibraryController::class, 'show']);
    Route::put('/media/{id}', [MediaLibraryController::class, 'update']);
    Route::delete('/media/{id}', [MediaLibraryController::class, 'destroy']);
    Route::post('/media/bulk-delete', [MediaLibraryController::class, 'bulkDestroy']);

    // Data Exports
    Route::get('/exports', [DataExportController::class, 'index']);
    Route::post('/exports', [DataExportController::class, 'store']);
    Route::get('/exports/{id}/download', [DataExportController::class, 'download']);
    Route::delete('/exports/{id}', [DataExportController::class, 'destroy']);

    // Website Templates
    Route::get('/website-templates', [WebsiteTemplateController::class, 'index']);
    Route::get('/website-templates/{id}', [WebsiteTemplateController::class, 'show']);
    Route::post('/website-templates', [WebsiteTemplateController::class, 'store']);
    Route::put('/website-templates/{id}', [WebsiteTemplateController::class, 'update']);
    Route::delete('/website-templates/{id}', [WebsiteTemplateController::class, 'destroy']);
    Route::post('/website-templates/{id}/duplicate', [WebsiteTemplateController::class, 'duplicate']);

    // Email Settings
    Route::get('/email-settings', [EmailSettingController::class, 'index']);
    Route::put('/email-settings', [EmailSettingController::class, 'update']);
    Route::get('/email-settings/{group}', [EmailSettingController::class, 'getGroup']);
    Route::post('/email-settings/test', [EmailSettingController::class, 'testEmail']);

    // Email Automation
    Route::get('/email-automation', [EmailAutomationController::class, 'index']);
    Route::get('/email-automation/triggers', [EmailAutomationController::class, 'getTriggers']);
    Route::get('/email-automation/{id}', [EmailAutomationController::class, 'show']);
    Route::post('/email-automation', [EmailAutomationController::class, 'store']);
    Route::put('/email-automation/{id}', [EmailAutomationController::class, 'update']);
    Route::delete('/email-automation/{id}', [EmailAutomationController::class, 'destroy']);
    Route::patch('/email-automation/{id}/toggle', [EmailAutomationController::class, 'toggleActive']);

    // Blog Management (Admin)
    Route::prefix('blog')->group(function () {
        Route::get('/posts', [BlogController::class, 'adminIndex']);
        Route::post('/posts', [BlogController::class, 'store']);
        Route::get('/posts/trashed', [BlogController::class, 'trashed']);
        Route::post('/posts/bulk-delete', [BlogController::class, 'bulkDestroy']);
        Route::post('/posts/bulk-restore', [BlogController::class, 'bulkRestore']);
        Route::post('/posts/bulk-publish', [BlogController::class, 'bulkPublish']);
        Route::post('/posts/bulk-draft', [BlogController::class, 'bulkDraft']);
        Route::get('/posts/{id}', [BlogController::class, 'showAdmin']);
        Route::put('/posts/{id}', [BlogController::class, 'update']);
        Route::delete('/posts/{id}', [BlogController::class, 'destroy']);
        Route::match(['patch', 'post'], '/posts/{id}/publish', [BlogController::class, 'togglePublish']);
        Route::post('/posts/{id}/duplicate', [BlogController::class, 'duplicatePost']);
        Route::post('/posts/{id}/restore', [BlogController::class, 'restore']);
        Route::delete('/posts/{id}/force', [BlogController::class, 'forceDelete']);
        Route::get('/posts/{id}/revisions', [BlogController::class, 'revisions']);
        Route::post('/posts/{id}/revisions/{revisionId}/restore', [BlogController::class, 'restoreRevision']);
        Route::post('/posts/{id}/images', [BlogController::class, 'storeImage']);
        Route::put('/posts/{id}/images/{imageId}', [BlogController::class, 'updateImageMeta']);
        Route::delete('/posts/{id}/images/{imageId}', [BlogController::class, 'destroyImage']);
        Route::post('/posts/{id}/images/reorder', [BlogController::class, 'reorderImages']);
    });

    // SEO Pages (Admin)
    Route::prefix('seo-pages')->group(function () {
        Route::get('/', [SeoController::class, 'adminIndex']);
        Route::post('/', [SeoController::class, 'storeLandingPage']);
        Route::get('/{id}', [SeoController::class, 'showLandingPageAdmin']);
        Route::put('/{id}', [SeoController::class, 'updateLandingPage']);
        Route::delete('/{id}', [SeoController::class, 'destroyLandingPage']);
    });

    // Audit Logs
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::get('/audit-logs/stats', [AuditLogController::class, 'stats']);

    // AI Agents (admin alias - frontend calls /admin/ai-agents)
    Route::prefix('ai-agents')->group(function () {
        Route::get('/', [AiAgentController::class, 'index']);
        Route::get('/stats', [AiAgentController::class, 'stats']);
        Route::put('/{key}', [AiAgentController::class, 'update']);
        Route::post('/{key}/test', [AiAgentController::class, 'test']);
        Route::get('/{key}/logs', [AiAgentController::class, 'logs']);
    });

    // Agent Email Routes
    Route::prefix('agent')->group(function () {
        Route::post('/emails/send', [CampaignEmailController::class, 'sendDirectEmail']);
        Route::get('/sent-emails', [CampaignEmailController::class, 'indexSentEmails']);
    });

    // Blog Categories (Admin)
    Route::prefix('blog-categories')->group(function () {
        Route::get('/', [BlogController::class, 'categories']);
        Route::post('/', [BlogController::class, 'storeCategory']);
        Route::put('/{id}', [BlogController::class, 'updateCategory']);
        Route::delete('/{id}', [BlogController::class, 'destroyCategory']);
    });

    // Blog Tags (Admin)
    Route::prefix('blog-tags')->group(function () {
        Route::get('/', [BlogController::class, 'tags']);
        Route::post('/', [BlogController::class, 'storeTag']);
        Route::delete('/{id}', [BlogController::class, 'destroyTag']);
    });

    // System Health
    Route::get('/system-health', [SystemController::class, 'systemHealth']);
    Route::get('/logs', [SystemController::class, 'logs']);

    // Backups
    Route::get('/backups', [SystemController::class, 'backups']);
    Route::get('/backups/{id}/download', [SystemController::class, 'downloadBackup']);
    Route::post('/backups/create', [SystemController::class, 'createBackup']);
    Route::post('/backups/{id}/restore', [SystemController::class, 'restoreBackup']);
    Route::post('/backups/{id}/delete', [SystemController::class, 'deleteBackup']);

    // Cache
    Route::get('/cache', [SystemController::class, 'cacheStats']);
    Route::post('/cache/clear', [SystemController::class, 'clearCache']);
    Route::post('/cache/warm', [SystemController::class, 'warmCache']);
    Route::get('/cache/{key}', [SystemController::class, 'cacheGet']);
    Route::delete('/cache/{key}', [SystemController::class, 'cacheForget']);

    // Queue
    Route::get('/queue', [SystemController::class, 'queueStats']);
    Route::post('/queue/{jobId}/retry', [SystemController::class, 'retryQueueJob']);
    Route::delete('/queue/{jobId}', [SystemController::class, 'deleteQueueJob']);

    // Cron Jobs
    Route::get('/cron-jobs', [SystemController::class, 'cronJobs']);
    Route::post('/cron-jobs/{id}/run', [SystemController::class, 'runCronJob']);
    Route::post('/cron-jobs/{id}/toggle', [SystemController::class, 'toggleCronJob']);

    // Imports
    Route::get('/imports', [SystemController::class, 'imports']);
    Route::get('/imports/{id}/errors', [SystemController::class, 'importErrors']);
    Route::get('/imports/{id}/errors/download', [SystemController::class, 'downloadImportErrors']);
    Route::post('/imports/{id}/retry', [SystemController::class, 'retryImport']);

    // Testing
    Route::prefix('testing')->group(function () {
        Route::post('/email/smtp-test', [TestingController::class, 'smtpTest']);
        Route::post('/email/spam-score', [TestingController::class, 'spamScore']);
        Route::post('/email/dns-check', [TestingController::class, 'dnsCheck']);
        Route::post('/email/send-test', [TestingController::class, 'sendTestEmail']);
        Route::get('/payments/recent', [TestingController::class, 'recentPayments']);
        Route::post('/payments/generate-invoice', [TestingController::class, 'generateTestInvoice']);
        Route::post('/payments/send-test', [TestingController::class, 'sendTestPayment']);
        Route::post('/payments/simulate', [TestingController::class, 'simulatePayment']);
        Route::get('/sms/webhooks', [TestingController::class, 'smsWebhooks']);
        Route::post('/sms/send', [TestingController::class, 'sendTestSms']);
        Route::post('/sms/lookup', [TestingController::class, 'smsLookup']);
        Route::get('/webhooks/endpoints', [TestingController::class, 'webhookEndpoints']);
        Route::get('/webhooks/history', [TestingController::class, 'webhookHistory']);
        Route::post('/webhooks/send-test', [TestingController::class, 'sendTestWebhook']);
        Route::post('/forms/validate', [TestingController::class, 'formsValidate']);
        Route::post('/forms/test', [TestingController::class, 'formsTest']);
    });

    // Property Management
    Route::get('/property-types', [PropertyManagementController::class, 'propertyTypes'])->withoutMiddleware('role:staff,admin,super_admin')->middleware('role:agent,broker,staff,admin,super_admin');
    Route::post('/property-types', [PropertyManagementController::class, 'storePropertyType']);
    Route::put('/property-types/{id}', [PropertyManagementController::class, 'updatePropertyType']);
    Route::delete('/property-types/{id}', [PropertyManagementController::class, 'destroyPropertyType']);
    Route::get('/property-categories', [PropertyManagementController::class, 'propertyCategories']);
    Route::post('/property-categories', [PropertyManagementController::class, 'storePropertyCategory']);
    Route::put('/property-categories/{id}', [PropertyManagementController::class, 'updatePropertyCategory']);
    Route::delete('/property-categories/{id}', [PropertyManagementController::class, 'destroyPropertyCategory']);
    Route::get('/amenities', [PropertyManagementController::class, 'amenities']);
    Route::post('/amenities', [PropertyManagementController::class, 'storeAmenity']);
    Route::put('/amenities/{id}', [PropertyManagementController::class, 'updateAmenity']);
    Route::delete('/amenities/{id}', [PropertyManagementController::class, 'destroyAmenity']);
    Route::get('/properties/analytics', [PropertyManagementController::class, 'propertiesAnalytics']);

    // Page Builder
    Route::get('/pages', [PageBuilderController::class, 'pages']);
    Route::post('/pages', [PageBuilderController::class, 'storePage']);
    Route::put('/pages/{id}', [PageBuilderController::class, 'updatePage']);
    Route::delete('/pages/{id}', [PageBuilderController::class, 'destroyPage']);
    Route::get('/pages/{id}/sections', [PageBuilderController::class, 'pageSections']);
    Route::post('/pages/{id}/sections', [PageBuilderController::class, 'storePageSection']);
    Route::put('/pages/{id}/sections/reorder', [PageBuilderController::class, 'reorderPageSections']);
    Route::put('/pages/{id}/sections/{sectionId}', [PageBuilderController::class, 'updatePageSection']);
    Route::delete('/pages/{id}/sections/{sectionId}', [PageBuilderController::class, 'destroyPageSection']);
    Route::post('/pages/{id}/publish', [PageBuilderController::class, 'publishPage']);
    Route::get('/page-templates', [PageBuilderController::class, 'pageTemplates']);
    Route::post('/page-templates', [PageBuilderController::class, 'storePageTemplate']);
    Route::delete('/page-templates/{id}', [PageBuilderController::class, 'destroyPageTemplate']);
    Route::post('/page-templates/{id}/use', [PageBuilderController::class, 'usePageTemplate']);
    Route::get('/content-blocks', [PageBuilderController::class, 'contentBlocks']);
    Route::put('/content-blocks', [PageBuilderController::class, 'updateContentBlocks']);

    // Settings (individual)
    Route::get('/settings/seo', [SettingsController::class, 'getSeoSettings']);
    Route::put('/settings/seo', [SettingsController::class, 'updateSeoSettings']);
    Route::get('/settings/appearance', [SettingsController::class, 'getAppearanceSettings']);
    Route::put('/settings/appearance', [SettingsController::class, 'updateAppearanceSettings']);
    Route::get('/settings/security', [SettingsController::class, 'getSecuritySettings']);
    Route::put('/settings/security', [SettingsController::class, 'updateSecuritySettings']);
    Route::get('/settings/notifications', [SettingsController::class, 'getNotificationSettings']);
    Route::put('/settings/notifications', [SettingsController::class, 'updateNotificationSettings']);
    Route::get('/settings/geo-access', [SettingsController::class, 'getGeoSettings']);
    Route::put('/settings/geo-access', [SettingsController::class, 'updateGeoSettings']);
    Route::get('/settings/ai', [SettingsController::class, 'getAiSettings']);
    Route::put('/settings/ai', [SettingsController::class, 'updateAiSettings']);
    Route::get('/ai/usage-analytics', [SettingsController::class, 'getAiUsageAnalytics']);

    // Realtor Application Verification Queue
    Route::middleware('permission:realtors.verify')->group(function () {
        Route::get('/realtor-applications', [RealtorApplicationController::class, 'index']);
        Route::get('/realtor-applications/{id}', [RealtorApplicationController::class, 'show']);
        Route::get('/realtor-applications/{id}/documents/{type}', [RealtorApplicationController::class, 'downloadDocument']);
        Route::post('/realtor-applications/{id}/approve', [RealtorApplicationController::class, 'approve']);
        Route::post('/realtor-applications/{id}/reject', [RealtorApplicationController::class, 'reject']);
        Route::post('/realtor-applications/{id}/request-more-info', [RealtorApplicationController::class, 'requestMoreInfo']);
    });

    // Roles & Permissions (real spatie/laravel-permission-backed RBAC)
    Route::middleware('permission:roles.manage')->group(function () {
        Route::get('/roles', [RoleController::class, 'index']);
        Route::get('/roles/permissions', [RoleController::class, 'permissions']);
        Route::put('/roles/{id}', [RoleController::class, 'updateRolePermissions']);
        Route::get('/roles/{roleName}/users', [RoleController::class, 'usersByRole']);
    });

    // Geo Access Control
    Route::get('/geo-whitelist', [GeoWhitelistController::class, 'index']);
    Route::post('/geo-whitelist', [GeoWhitelistController::class, 'store']);
    Route::put('/geo-whitelist/{id}', [GeoWhitelistController::class, 'update']);
    Route::delete('/geo-whitelist/{id}', [GeoWhitelistController::class, 'destroy']);
    Route::get('/geo-whitelist/export', [GeoWhitelistController::class, 'export']);
    Route::post('/geo-whitelist/import', [GeoWhitelistController::class, 'import']);

    Route::get('/geo-blacklist', [GeoBlacklistController::class, 'index']);
    Route::post('/geo-blacklist', [GeoBlacklistController::class, 'store']);
    Route::put('/geo-blacklist/{id}', [GeoBlacklistController::class, 'update']);
    Route::delete('/geo-blacklist/{id}', [GeoBlacklistController::class, 'destroy']);
    Route::get('/geo-blacklist/export', [GeoBlacklistController::class, 'export']);
    Route::post('/geo-blacklist/import', [GeoBlacklistController::class, 'import']);

    Route::get('/geo-access-logs', [GeoAccessLogController::class, 'index']);
    Route::get('/geo-access-logs/export', [GeoAccessLogController::class, 'export']);

    // AI Chat (admin)
    Route::prefix('ai-chat')->group(function () {
        Route::get('/conversations', [AiChatController::class, 'conversations']);
        Route::get('/conversations/{id}', [AiChatController::class, 'conversation']);
        Route::post('/conversations/{id}/messages', [AiChatController::class, 'storeMessage']);
        Route::put('/conversations/{id}/status', [AiChatController::class, 'updateStatus']);
        Route::put('/conversations/{id}/assign', [AiChatController::class, 'assignAgent']);
        Route::put('/conversations/{id}/notes', [AiChatController::class, 'updateNotes']);
        Route::delete('/conversations/{id}', [AiChatController::class, 'destroy']);
        Route::get('/analytics', [AiChatController::class, 'analytics']);
    });
    Route::get('/ai-chat-logs', [AiChatController::class, 'logs']);

    // AI Prompts
    Route::get('/ai-prompts', [AiPromptController::class, 'index']);
    Route::post('/ai-prompts', [AiPromptController::class, 'store']);
    Route::put('/ai-prompts/{id}', [AiPromptController::class, 'update']);
    Route::delete('/ai-prompts/{id}', [AiPromptController::class, 'destroy']);

    // Portal Routes
    Route::get('/buyer/searches', [PortalController::class, 'buyerSearches']);
    Route::delete('/buyer/searches/{id}', [PortalController::class, 'destroyBuyerSearch']);
    Route::get('/buyer/offers', [PortalController::class, 'buyerOffers']);
    Route::get('/buyer/mortgage', [PortalController::class, 'buyerMortgage']);
    Route::get('/buyer/messages', [PortalController::class, 'buyerMessages']);
    Route::post('/buyer/messages', [PortalController::class, 'storeBuyerMessage']);
    Route::get('/buyer/documents', [PortalController::class, 'buyerDocuments']);
    Route::get('/buyer/appointments', [PortalController::class, 'buyerAppointments']);
    Route::get('/seller/appointments', [PortalController::class, 'sellerAppointments']);
    Route::get('/seller/valuations', [PortalController::class, 'sellerValuations']);
    Route::get('/seller/offers', [PortalController::class, 'sellerOffers']);
    Route::get('/seller/documents', [PortalController::class, 'sellerDocuments']);
    Route::get('/investor/opportunities', [PortalController::class, 'investorOpportunities']);
    Route::get('/investor/documents', [PortalController::class, 'investorDocuments']);
    Route::get('/investor/analytics', [PortalController::class, 'investorAnalytics']);
    Route::get('/investor/alerts', [PortalController::class, 'investorAlerts']);
    Route::get('/lender/dashboard', [PortalController::class, 'lenderDashboard']);
    Route::get('/title/dashboard', [PortalController::class, 'titleDashboard']);
    Route::get('/super-admin/dashboard', [PortalController::class, 'superAdminDashboard']);
    Route::get('/staff/dashboard', [PortalController::class, 'staffDashboard']);
    Route::get('/staff/dashboard/tasks', [PortalController::class, 'staffDashboardTasks']);
});
