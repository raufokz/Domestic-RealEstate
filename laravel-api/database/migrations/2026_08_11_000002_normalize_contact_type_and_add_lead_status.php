<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    public function up(): void
    {
        // Normalize existing rows where `type`/`tags` were stored as a JSON string
        // instead of a JSON array (e.g. "buyer" instead of ["buyer"]).
        DB::table('contacts')
            ->whereNotNull('type')
            ->whereRaw("JSON_TYPE(type) = 'STRING'")
            ->get(['id', 'type'])
            ->each(function ($row) {
                DB::table('contacts')->where('id', $row->id)->update([
                    'type' => [json_decode($row->type, true)],
                ]);
            });

        DB::table('contacts')
            ->whereNotNull('tags')
            ->whereRaw("JSON_TYPE(tags) = 'STRING'")
            ->get(['id', 'tags'])
            ->each(function ($row) {
                DB::table('contacts')->where('id', $row->id)->update([
                    'tags' => [json_decode($row->tags, true)],
                ]);
            });

        // Allow the `lead` status used by LeadCaptureService and the admin UI.
        Schema::table('contacts', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive', 'unsubscribed', 'lead'])->default('active')->change();
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive', 'unsubscribed'])->default('active')->change();
        });
    }
};
