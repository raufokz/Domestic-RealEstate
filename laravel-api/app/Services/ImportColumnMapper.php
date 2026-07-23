<?php

namespace App\Services;

/**
 * Detects which spreadsheet column holds which lead field.
 *
 * The important behaviour here is that email detection is driven by the actual
 * cell VALUES, not by the header text. A file whose first column is a timestamp
 * ("13/02/2025 16:31:35") must never be treated as the email column just because
 * the header was missing or ambiguous — that produced the "3183 invalid / 0 valid"
 * import result previously reported.
 */
class ImportColumnMapper
{
    /** Header aliases, checked only as a tie-breaker / fallback. */
    private const ALIASES = [
        'email' => ['email', 'emailaddress', 'email_address', 'e_mail', 'mail', 'contactemail', 'contact_email', 'primaryemail'],
        'first_name' => ['firstname', 'first_name', 'fname', 'givenname', 'given_name'],
        'last_name' => ['lastname', 'last_name', 'lname', 'surname', 'familyname', 'family_name'],
        'name' => ['name', 'fullname', 'full_name', 'contactname', 'contact_name'],
        'phone' => ['phone', 'phonenumber', 'phone_number', 'mobile', 'cell', 'telephone', 'tel', 'contactnumber'],
        'type' => ['type', 'leadtype', 'lead_type', 'category'],
        'source' => ['source', 'leadsource', 'lead_source', 'origin'],
        'notes' => ['notes', 'note', 'comment', 'comments', 'message', 'description'],
        'city' => ['city', 'town', 'address_level2'],
        'state' => ['state', 'province', 'region', 'address_level1'],
        'budget' => ['budget', 'price', 'pricerange', 'price_range', 'maxbudget'],
    ];

    /** Max rows sampled when scoring a column's contents. */
    private const SAMPLE_SIZE = 200;

    /**
     * Build a field => header map.
     *
     * @param  array<int, string>          $headers
     * @param  array<int, array<int, mixed>> $rows  Raw positional rows (no header row).
     * @return array<string, string>       e.g. ['email' => 'Email Address', 'first_name' => 'First']
     */
    public static function detect(array $headers, array $rows): array
    {
        $map = [];

        $emailHeader = self::detectEmailColumn($headers, $rows);
        if ($emailHeader !== null) {
            $map['email'] = $emailHeader;
        }

        foreach (self::ALIASES as $field => $aliases) {
            if ($field === 'email' || isset($map[$field])) {
                continue;
            }
            foreach ($headers as $header) {
                if (in_array(self::normalize($header), $aliases, true)) {
                    // Never let another field claim the column already used for email.
                    if (($map['email'] ?? null) === $header) {
                        continue;
                    }
                    $map[$field] = $header;
                    break;
                }
            }
        }

        return $map;
    }

    /**
     * Pick the column that actually contains email addresses.
     *
     * A column qualifies only if at least 30% of its non-empty sampled values
     * parse as valid email addresses. This is what stops date, ID, and timestamp
     * columns from being mis-detected as emails.
     *
     * @param  array<int, string>          $headers
     * @param  array<int, array<int, mixed>> $rows
     */
    public static function detectEmailColumn(array $headers, array $rows): ?string
    {
        $sample = array_slice($rows, 0, self::SAMPLE_SIZE);
        $best = null;
        $bestRatio = 0.0;

        foreach ($headers as $index => $header) {
            $nonEmpty = 0;
            $valid = 0;

            foreach ($sample as $row) {
                $value = trim((string) ($row[$index] ?? ''));
                if ($value === '') {
                    continue;
                }
                $nonEmpty++;
                if (filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $valid++;
                }
            }

            if ($nonEmpty === 0) {
                continue;
            }

            $ratio = $valid / $nonEmpty;

            // Header name acts only as a tie-breaker between genuine candidates.
            if (in_array(self::normalize($header), self::ALIASES['email'], true)) {
                $ratio += 0.05;
            }

            if ($ratio > $bestRatio) {
                $bestRatio = $ratio;
                $best = $header;
            }
        }

        return $bestRatio >= 0.30 ? $best : null;
    }

    /** Lowercase and strip non-word characters so "Email Address" == "email_address". */
    public static function normalize(string $header): string
    {
        return strtolower(preg_replace('/[^\w]/', '', $header) ?? '');
    }

    /**
     * Human-readable explanation when no email column could be found.
     * Surfaced directly to the admin so the failure is actionable.
     */
    public static function noEmailColumnMessage(array $headers): string
    {
        $list = implode(', ', array_map(fn ($h) => '"'.$h.'"', array_slice($headers, 0, 10)));

        return 'No valid email column was detected. Columns found: '.$list.'. '
            .'These records can still be imported as non-email leads, but they cannot receive '
            .'email campaigns until a valid email address is added. To fix this, re-upload with '
            .'an "email" column, or choose the correct column mapping before importing.';
    }
}
