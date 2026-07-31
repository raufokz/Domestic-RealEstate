<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * properties.amenities stores a JSON string array while the amenities lookup
     * table sits empty and unjoinable. Backfill: dedupe the JSON values into
     * amenities, then link via amenity_property. properties.amenities is left in
     * place (non-destructive) so nothing reading it directly breaks.
     */
    public function up(): void
    {
        $properties = DB::table('properties')
            ->whereNotNull('amenities')
            ->where('amenities', '!=', '[]')
            ->where('amenities', '!=', '')
            ->get(['id', 'amenities']);

        $nameToId = [];
        $now = now();

        foreach ($properties as $property) {
            $names = json_decode($property->amenities, true);
            if (! is_array($names)) {
                continue;
            }

            foreach ($names as $name) {
                $name = trim((string) $name);
                if ($name === '') {
                    continue;
                }

                $key = Str::lower($name);
                if (! isset($nameToId[$key])) {
                    $slug = Str::slug($name);
                    $existing = DB::table('amenities')->where('slug', $slug)->first();
                    if ($existing) {
                        $nameToId[$key] = $existing->id;
                    } else {
                        $nameToId[$key] = DB::table('amenities')->insertGetId([
                            'name' => $name,
                            'slug' => $slug,
                            'is_active' => 1,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                    }
                }

                DB::table('amenity_property')->insertOrIgnore([
                    'amenity_id' => $nameToId[$key],
                    'property_id' => $property->id,
                ]);
            }
        }
    }

    public function down(): void
    {
        DB::table('amenity_property')->truncate();
    }
};
