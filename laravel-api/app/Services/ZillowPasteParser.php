<?php

namespace App\Services;

/**
 * Extracts property listings from raw pasted Zillow search results.
 *
 * The Zillow clipboard/paste format is tab-separated: each property row is a
 * line holding the homedetails URL, price, bed/bath/sqft tokens, a status,
 * a full "street, City, ST ZIP" address, a "LISTING BY: ..." broker, and one
 * or more photos.zillowstatic.com URLs. Rows sometimes also carry a
 * schema.org Event JSON cell (open-house times + geo coordinates). Rows are
 * de-duplicated by zpid and merged so a JSON row + its plain row collapse
 * into one listing.
 */
class ZillowPasteParser
{
    private const HOMEDETAILS_RE = '#https://www\.zillow\.com/homedetails/[^\s"\'/]+/(\d+)_zpid/#';

    /**
     * @return array<int, array<string, mixed>> normalized listings
     */
    public static function parse(string $text): array
    {
        $byKey = [];
        foreach (preg_split('/\r\n|\r|\n/', $text) ?: [] as $rawLine) {
            $line = trim($rawLine);
            if ($line === '' || $line === 'Loading...') {
                continue;
            }

            $tokens = preg_split('/\t+/', $line) ?: [];
            $listing = self::parseTokens($tokens);
            if ($listing === null) {
                continue;
            }

            $key = (string) ($listing['zpid'] ?? $listing['address'] ?? $listing['source_url'] ?? '');
            if ($key === '') {
                continue;
            }

            $byKey[$key] = array_merge($byKey[$key] ?? [], array_filter($listing, fn ($v) => $v !== null));
        }

        return array_values($byKey);
    }

    /**
     * @param array<int, string> $tokens
     * @return array<string, mixed>|null
     */
    private static function parseTokens(array $tokens): ?array
    {
        $listing = [
            'zpid' => null,
            'source_url' => null,
            'price' => null,
            'bedrooms' => null,
            'bathrooms' => null,
            'sqft' => null,
            'status' => null,
            'address' => null,
            'city' => null,
            'state' => null,
            'zip' => null,
            'listing_broker' => null,
            'photos' => [],
            'open_house_date' => null,
            'open_house_end' => null,
            'latitude' => null,
            'longitude' => null,
            'image' => null,
        ];

        foreach ($tokens as $i => $token) {
            $token = trim($token);
            if ($token === '') {
                continue;
            }

            // JSON schema.org Event cell ("{""@type"":""Event"", ...}")
            if (str_starts_with($token, '"{"') || str_starts_with($token, '{"')) {
                $json = self::decodeJsonCell($token);
                if ($json !== null) {
                    self::mergeJson($listing, $json);
                }
                continue;
            }

            if (preg_match(self::HOMEDETAILS_RE, $token, $m)) {
                $listing['zpid'] = (int) $m[1];
                $listing['source_url'] = $token;
                continue;
            }

            if (preg_match('/^\$([\d,]+(?:\.\d+)?)$/', $token, $m)) {
                $listing['price'] = (float) str_replace(',', '', $m[1]);
                continue;
            }

            if (isset($tokens[$i + 1]) && trim($tokens[$i + 1]) === 'bds') {
                $listing['bedrooms'] = self::toInt($token);
                continue;
            }
            if (isset($tokens[$i + 1]) && trim($tokens[$i + 1]) === 'ba') {
                $listing['bathrooms'] = self::toFloat($token);
                continue;
            }
            if (isset($tokens[$i + 1]) && strtolower(trim($tokens[$i + 1])) === 'sqft') {
                $listing['sqft'] = self::toInt(str_replace(',', '', $token));
                continue;
            }

            // Full "street, City, ST ZIP" address
            if (preg_match('/^(.+?),\s*([A-Za-z .]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/', $token, $a)) {
                $listing['address'] = trim($a[1]);
                $listing['city'] = trim($a[2]);
                $listing['state'] = trim($a[3]);
                $listing['zip'] = trim($a[4]);
                continue;
            }

            if (preg_match('/^LISTING\s+BY:\s*(.+)$/i', $token, $b)) {
                $listing['listing_broker'] = trim($b[1]);
                continue;
            }

            if (str_starts_with($token, 'https://photos.zillowstatic.com/fp/')) {
                $listing['photos'][] = $token;
                continue;
            }

            if (in_array($token, ['House for sale', 'Condo for sale', 'Townhouse for sale', 'Active', 'Sold'], true)) {
                $listing['status'] = $token;
                continue;
            }
        }

        if ($listing['address'] === null && $listing['zpid'] === null && $listing['source_url'] === null) {
            return null;
        }

        $listing['photos'] = array_values(array_unique($listing['photos']));
        if ($listing['image'] !== null) {
            array_unshift($listing['photos'], $listing['image']);
        }

        // Same photo ships as .jpg (schema image) and .webp (search row);
        // collapse by the fp-hash before the -p_e. marker.
        $byHash = [];
        foreach (array_values(array_unique($listing['photos'])) as $photo) {
            $key = preg_replace('/-p_e\.[a-z]+$/', '', $photo);
            $byHash[$key] = $photo;
        }
        $listing['photos'] = array_values($byHash);

        return $listing;
    }

    /** @return array<string, mixed>|null */
    private static function decodeJsonCell(string $cell): ?array
    {
        // Cells are CSV-quoted, so inner quotes are doubled: ""@type"":""Event"".
        $raw = trim($cell, "\"");
        $raw = str_replace('""', '"', $raw);
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : null;
    }

    /** @param array<string, mixed> $listing @param array<string, mixed> $json */
    private static function mergeJson(array &$listing, array $json): void
    {
        if (!empty($json['url']) && $listing['source_url'] === null) {
            $listing['source_url'] = (string) $json['url'];
            if (preg_match(self::HOMEDETAILS_RE, $json['url'], $m)) {
                $listing['zpid'] = (int) $m[1];
            }
        }

        if (!empty($json['offers']['price']) && $listing['price'] === null) {
            $listing['price'] = (float) $json['offers']['price'];
        }
        if (!empty($json['image']) && $listing['image'] === null) {
            $listing['image'] = (string) $json['image'];
        }
        // Only real "Open House" events carry open-house windows; 3D-tour
        // availability uses the same startDate/endDate but isn't a showing.
        $name = (string) ($json['name'] ?? '');
        if (stripos($name, 'Open House') !== false && $listing['open_house_date'] === null) {
            $listing['open_house_date'] = !empty($json['startDate']) ? self::normalizeDate((string) $json['startDate']) : null;
            $listing['open_house_end'] = !empty($json['endDate']) ? self::normalizeDate((string) $json['endDate']) : null;
        }

        $location = $json['location'] ?? null;
        $locations = is_array($location) && array_is_list($location) ? $location : (is_array($location) ? [$location] : []);
        foreach ($locations as $loc) {
            if (!is_array($loc)) {
                continue;
            }
            $geo = $loc['geo'] ?? null;
            if (is_array($geo) && !empty($geo['latitude']) && !empty($geo['longitude'])) {
                $listing['latitude'] = (float) $geo['latitude'];
                $listing['longitude'] = (float) $geo['longitude'];
            }
            $addr = $loc['address'] ?? null;
            if (is_array($addr) && $listing['address'] === null) {
                $listing['address'] = $addr['streetAddress'] ?? null;
                $listing['city'] = $addr['addressLocality'] ?? null;
                $listing['state'] = $addr['addressRegion'] ?? null;
                $listing['zip'] = $addr['postalCode'] ?? null;
            }
        }
    }

    private static function normalizeDate(string $value): string
    {
        $parsed = strtotime($value);
        return $parsed !== false ? date('Y-m-d H:i:s', $parsed) : $value;
    }

    private static function toInt(mixed $value): ?int
    {
        $value = trim((string) $value);
        return $value === '' || !is_numeric($value) ? null : (int) $value;
    }

    private static function toFloat(mixed $value): ?float
    {
        $value = trim((string) $value);
        return $value === '' || !is_numeric($value) ? null : (float) $value;
    }
}
