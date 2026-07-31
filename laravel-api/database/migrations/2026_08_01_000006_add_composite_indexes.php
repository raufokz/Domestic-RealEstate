<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // user_roles: index on role_name + assigned_by for dashboard queries
        Schema::table('user_roles', function (Blueprint $table) {
            $table->index(['role_name', 'assigned_by'], 'idx_user_roles_role_assigned');
        });
    }

    public function down(): void
    {
        Schema::table('user_roles', function (Blueprint $table) {
            $table->dropIndex('idx_user_roles_role_assigned');
        });
    }
};
