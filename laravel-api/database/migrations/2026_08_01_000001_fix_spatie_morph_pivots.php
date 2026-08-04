<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            // Fix model_has_roles: remove surrogate id, use composite PK
            DB::statement('ALTER TABLE model_has_roles MODIFY COLUMN id BIGINT UNSIGNED NOT NULL');
            Schema::table('model_has_roles', function (Blueprint $table) {
                $table->dropPrimary('PRIMARY');
                $table->dropColumn('id');
                $table->primary(['role_id', 'model_id', 'model_type']);
            });

            // Fix model_has_permissions: remove surrogate id, use composite PK
            DB::statement('ALTER TABLE model_has_permissions MODIFY COLUMN id BIGINT UNSIGNED NOT NULL');
            Schema::table('model_has_permissions', function (Blueprint $table) {
                $table->dropPrimary('PRIMARY');
                $table->dropColumn('id');
                $table->primary(['permission_id', 'model_id', 'model_type']);
            });
        }
    }

    public function down(): void
    {
        // Restore model_has_roles
        Schema::table('model_has_roles', function (Blueprint $table) {
            $table->dropPrimary();
            $table->id()->first();
            $table->primary('id');
        });

        // Restore model_has_permissions
        Schema::table('model_has_permissions', function (Blueprint $table) {
            $table->dropPrimary();
            $table->id()->first();
            $table->primary('id');
        });
    }
};
