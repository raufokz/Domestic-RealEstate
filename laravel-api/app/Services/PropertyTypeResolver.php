<?php

namespace App\Services;

use App\Models\PropertyType;

/**
 * Resolves free-text property type strings from an imported spreadsheet (e.g.
 * "House", "Condominium") to a real property_types.id. No such "FK from free
 * text" helper existed anywhere in the codebase before this — matches are
 * normalized the same way ImportColumnMapper::normalize() does, so "Single
 * Family Home" and "single-family-home" both hit the same lookup key.
 */
class PropertyTypeResolver
{
    /** Common synonyms that don't literally match a property_types.name/slug. */
    private const SYNONYMS = [
        'house' => 'single-family',
        'singlefamilyhome' => 'single-family',
        'singlefamily' => 'single-family',
        'condominium' => 'condo',
        'townhome' => 'townhouse',
        'town house' => 'townhouse',
        'multifamily' => 'multi-family',
        'duplex' => 'multi-family',
        'lot' => 'land',
        'vacantland' => 'land',
        'apt' => 'apartment',
        'flat' => 'apartment',
    ];

    private static ?array $lookup = null;

    /** @return int|null The matching property_types.id, or null if nothing matched. */
    public static function resolve(?string $rawText): ?int
    {
        if ($rawText === null || trim($rawText) === '') {
            return null;
        }

        $normalized = ImportColumnMapper::normalize($rawText);
        $lookup = self::buildLookup();

        if (isset($lookup[$normalized])) {
            return $lookup[$normalized];
        }

        $synonym = self::SYNONYMS[$normalized] ?? null;
        if ($synonym !== null) {
            $synonymNormalized = ImportColumnMapper::normalize($synonym);
            return $lookup[$synonymNormalized] ?? null;
        }

        return null;
    }

    /** Cached for the lifetime of the request — avoids re-querying per row. */
    private static function buildLookup(): array
    {
        if (self::$lookup !== null) {
            return self::$lookup;
        }

        $lookup = [];
        foreach (PropertyType::all(['id', 'name', 'slug']) as $type) {
            $lookup[ImportColumnMapper::normalize($type->name)] = $type->id;
            $lookup[ImportColumnMapper::normalize($type->slug)] = $type->id;
        }

        return self::$lookup = $lookup;
    }
}
