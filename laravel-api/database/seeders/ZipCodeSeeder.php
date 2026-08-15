<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Imports database/data/zip_centroids.csv (zip,lat,lng — derived from the
 * free, public-domain US Census Bureau 2023 ZCTA Gazetteer file) into
 * zip_codes. Idempotent: upserts, so re-running is safe.
 */
class ZipCodeSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/zip_centroids.csv');

        if (!file_exists($path)) {
            $this->command?->error("ZIP centroid data file not found at {$path} — skipping.");
            return;
        }

        $handle = fopen($path, 'r');
        $batch = [];
        $count = 0;

        while (($line = fgetcsv($handle)) !== false) {
            if (count($line) < 3) {
                continue;
            }

            [$zip, $lat, $lng] = $line;
            $batch[] = [
                'zip' => str_pad(trim($zip), 5, '0', STR_PAD_LEFT),
                'latitude' => (float) $lat,
                'longitude' => (float) $lng,
            ];

            if (count($batch) >= 1000) {
                DB::table('zip_codes')->upsert($batch, ['zip'], ['latitude', 'longitude']);
                $count += count($batch);
                $batch = [];
            }
        }

        if (!empty($batch)) {
            DB::table('zip_codes')->upsert($batch, ['zip'], ['latitude', 'longitude']);
            $count += count($batch);
        }

        fclose($handle);

        $this->command?->info("Seeded {$count} ZIP code centroids.");
    }
}
