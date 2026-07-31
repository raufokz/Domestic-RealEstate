<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Clean non-numeric data before changing types
        DB::statement('UPDATE leads SET bedrooms = NULL WHERE bedrooms IS NOT NULL AND bedrooms NOT REGEXP \'^[0-9]+$\'');
        DB::statement('UPDATE leads SET bathrooms = NULL WHERE bathrooms IS NOT NULL AND bathrooms NOT REGEXP \'^[0-9]+(\\.[0-9])?$\'');
        DB::statement('UPDATE leads SET credit_score = NULL WHERE credit_score IS NOT NULL AND credit_score NOT REGEXP \'^[0-9]+$\'');

        // Fix data types on leads table
        DB::statement('ALTER TABLE leads MODIFY bedrooms TINYINT UNSIGNED NULL');
        DB::statement('ALTER TABLE leads MODIFY bathrooms DECIMAL(3,1) NULL');
        DB::statement('ALTER TABLE leads MODIFY credit_score SMALLINT UNSIGNED NULL');

        // Shrink oversized varchar columns
        DB::statement('ALTER TABLE leads MODIFY ip_address VARCHAR(45) NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE leads MODIFY bedrooms VARCHAR(255) NULL');
        DB::statement('ALTER TABLE leads MODIFY bathrooms VARCHAR(255) NULL');
        DB::statement('ALTER TABLE leads MODIFY credit_score VARCHAR(255) NULL');
        DB::statement('ALTER TABLE leads MODIFY ip_address VARCHAR(255) NULL');
    }
};
