<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // footer_links.group -> group_name
        Schema::table('footer_links', function (Blueprint $table) {
            $table->renameColumn('group', 'group_name');
        });

        // navigation_menus.group -> group_name
        Schema::table('navigation_menus', function (Blueprint $table) {
            $table->renameColumn('group', 'group_name');
        });

        // ai_agent_configs.key -> config_key
        Schema::table('ai_agent_configs', function (Blueprint $table) {
            $table->renameColumn('key', 'config_key');
        });

        // ai_prompts.key -> prompt_key
        Schema::table('ai_prompts', function (Blueprint $table) {
            $table->renameColumn('key', 'prompt_key');
        });

        // integrations.key -> integration_key
        Schema::table('integrations', function (Blueprint $table) {
            $table->renameColumn('key', 'integration_key');
        });

        // email_settings.key -> setting_key, email_settings.group -> setting_group
        Schema::table('email_settings', function (Blueprint $table) {
            $table->renameColumn('key', 'setting_key');
            $table->renameColumn('group', 'setting_group');
        });
    }

    public function down(): void
    {
        Schema::table('footer_links', function (Blueprint $table) {
            $table->renameColumn('group_name', 'group');
        });
        Schema::table('navigation_menus', function (Blueprint $table) {
            $table->renameColumn('group_name', 'group');
        });
        Schema::table('ai_agent_configs', function (Blueprint $table) {
            $table->renameColumn('config_key', 'key');
        });
        Schema::table('ai_prompts', function (Blueprint $table) {
            $table->renameColumn('prompt_key', 'key');
        });
        Schema::table('integrations', function (Blueprint $table) {
            $table->renameColumn('integration_key', 'key');
        });
        Schema::table('email_settings', function (Blueprint $table) {
            $table->renameColumn('setting_key', 'key');
            $table->renameColumn('setting_group', 'group');
        });
    }
};
