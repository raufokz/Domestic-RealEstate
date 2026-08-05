<?php

namespace App\Services;

/**
 * Substitutes {{tag}} placeholders in campaign email subject/body with
 * per-recipient values. Unknown tags are left as-is rather than blanked,
 * so a typo in a template is visible instead of silently disappearing.
 */
class MergeTagService
{
    /**
     * @param  array{name?: ?string, email?: ?string}  $recipient
     */
    public static function apply(string $content, array $recipient): string
    {
        $name = trim((string) ($recipient['name'] ?? ''));
        $parts = $name !== '' ? preg_split('/\s+/', $name) : [];
        $firstName = $parts[0] ?? 'there';
        $lastName = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '';

        $tags = [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'name' => $name !== '' ? $name : 'there',
            'email' => (string) ($recipient['email'] ?? ''),
        ];

        $search = array_map(fn ($tag) => '{{'.$tag.'}}', array_keys($tags));

        return str_replace($search, array_values($tags), $content);
    }
}
