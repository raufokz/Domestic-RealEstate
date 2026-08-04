<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_documents', function (Blueprint $table) {
            $table->string('document_type')->change();
        });
    }

    public function down(): void
    {
        // No down migration needed for expanding enum to string
    }
};
