<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ZIP-code centroid reference table — powers real distance/radius matching
 * in LeadRoutingService via DistanceService (haversine), replacing the
 * previous exact-ZIP/city-substring-only matching. Seeded from the free,
 * public-domain US Census Bureau 2023 ZCTA Gazetteer file (no paid
 * geocoding API) — see ZipCodeSeeder + database/data/zip_centroids.csv.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zip_codes', function (Blueprint $table) {
            $table->string('zip', 5)->primary();
            $table->decimal('latitude', 9, 6);
            $table->decimal('longitude', 9, 6);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zip_codes');
    }
};
