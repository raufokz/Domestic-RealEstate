<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('contact_group_members')) {
            Schema::table('contact_group_members', function (Blueprint $table) {
                if (Schema::hasColumn('contact_group_members', 'contact_group_id') && !Schema::hasColumn('contact_group_members', 'contact_id')) {
                    $table->renameColumn('contact_group_id', 'contact_id');
                } elseif (!Schema::hasColumn('contact_group_members', 'contact_id')) {
                    $table->foreignId('contact_id')->nullable()->after('group_id')->constrained('contacts')->cascadeOnDelete();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('contact_group_members') && Schema::hasColumn('contact_group_members', 'contact_id')) {
            Schema::table('contact_group_members', function (Blueprint $table) {
                $table->renameColumn('contact_id', 'contact_group_id');
            });
        }
    }
};
