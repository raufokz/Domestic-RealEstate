<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Renames columns that collide with SQL reserved words (`key`, `group`) so
 * they're safe to reference unquoted across drivers. Matches the column
 * names the models/controllers actually use today: Integration::$fillable
 * (integration_key), AiPrompt::$fillable (prompt_key), EmailSetting::$fillable
 * (setting_key/setting_group), AiAgentController's DB::table('ai_agent_configs')
 * queries (config_key).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('integrations', function (Blueprint $table) {
            $table->renameColumn('key', 'integration_key');
        });

        Schema::table('email_settings', function (Blueprint $table) {
            $table->renameColumn('key', 'setting_key');
            $table->renameColumn('group', 'setting_group');
        });

        Schema::table('ai_prompts', function (Blueprint $table) {
            $table->renameColumn('key', 'prompt_key');
        });

        Schema::table('ai_agent_configs', function (Blueprint $table) {
            $table->renameColumn('key', 'config_key');
        });
    }

    public function down(): void
    {
        Schema::table('integrations', function (Blueprint $table) {
            $table->renameColumn('integration_key', 'key');
        });

        Schema::table('email_settings', function (Blueprint $table) {
            $table->renameColumn('setting_key', 'key');
            $table->renameColumn('setting_group', 'group');
        });

        Schema::table('ai_prompts', function (Blueprint $table) {
            $table->renameColumn('prompt_key', 'key');
        });

        Schema::table('ai_agent_configs', function (Blueprint $table) {
            $table->renameColumn('config_key', 'key');
        });
    }
};
