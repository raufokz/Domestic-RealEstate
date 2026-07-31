<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * property_images has existed since day one but every upload actually wrote
     * into properties.photos (JSON) instead. Backfill so property_images becomes
     * the single source of truth going forward. properties.photos is left in
     * place (non-destructive legacy fallback).
     */
    public function up(): void
    {
        $properties = DB::table('properties')
            ->whereNotNull('photos')
            ->where('photos', '!=', '[]')
            ->where('photos', '!=', '')
            ->get(['id', 'photos']);

        $now = now();

        foreach ($properties as $property) {
            $paths = json_decode($property->photos, true);
            if (! is_array($paths)) {
                continue;
            }

            foreach (array_values($paths) as $index => $path) {
                $path = trim((string) $path);
                if ($path === '') {
                    continue;
                }

                DB::table('property_images')->insert([
                    'property_id' => $property->id,
                    'path' => $path,
                    'is_featured' => $index === 0,
                    'sort_order' => $index,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        // Non-reversible in a targeted way (backfilled rows are indistinguishable
        // from later real uploads); intentionally left as a no-op.
    }
};
