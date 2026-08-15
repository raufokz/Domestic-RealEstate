<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Supports the progressive-capture buy/sell/invest funnels:
 * - source_intent: immutable dedup key for LeadCaptureService::upsertForIntent()
 *   (deliberately separate from the admin-mutable `type` column — see
 *   the plan's design note on why keying dedup on `type` is unsafe).
 * - funnel_completed_at: null = partial/abandoned after the checkpoint
 *   screen, set = the full funnel finished. Never published to the
 *   marketplace based on this alone — admin still curates listings.
 * - quality_tier: advisory classification from LeadQualityService,
 *   signal-based only, never a fabricated numeric score.
 * - consent_text/version/given_at: TCPA consent snapshot scoped to the
 *   specific consent event, distinct from the lead's general
 *   created_at/ip_address (which may predate this consent if the lead
 *   already existed from an earlier partial submission or another
 *   capture path like chat/marketing).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('source_intent')->nullable()->after('type');
            $table->timestamp('funnel_completed_at')->nullable()->after('consent_given');
            $table->string('quality_tier')->nullable()->after('funnel_completed_at');
            $table->text('consent_text')->nullable()->after('quality_tier');
            $table->string('consent_version')->nullable()->after('consent_text');
            $table->timestamp('consent_given_at')->nullable()->after('consent_version');

            $table->index('source_intent');
            $table->index('funnel_completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn(['source_intent', 'funnel_completed_at', 'quality_tier', 'consent_text', 'consent_version', 'consent_given_at']);
        });
    }
};
