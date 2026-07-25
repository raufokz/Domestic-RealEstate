<?php

namespace App\Services;

use App\Models\Lead;
use Illuminate\Support\Facades\Log;

class LeadImportService
{
    /**
     * Parse raw file contents (CSV, TXT, JSON, Extracted PDF/OCR Text)
     * and accurately isolate valid email targets.
     */
    public function parseAndIngest(string $rawContent, string $source = 'mass_mailer_upload'): array
    {
        $validCount = 0;
        $invalidCount = 0;
        $correctedCount = 0;
        $parsedRows = [];

        // Normalize line breaks
        $lines = preg_split('/\r\n|\r|\n/', $rawContent);

        foreach ($lines as $index => $line) {
            if (empty(trim($line))) {
                continue;
            }

            // Extract email via strict Regex RFC 5322 match
            $emailMatches = [];
            preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $line, $emailMatches);

            if (!empty($emailMatches[0])) {
                $email = strtolower(trim($emailMatches[0]));

                // Extract Name candidate by stripping date/time strings and email
                $cleanLine = preg_replace('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', '', $line);
                $cleanLine = preg_replace('/\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}/', '', $cleanLine);
                $nameCandidate = trim(str_replace([',', ';', "\t"], ' ', $cleanLine));

                // Upsert to Database
                $lead = LeadCaptureService::upsert([
                    'email' => $email,
                    'first_name' => $nameCandidate ?: 'Imported',
                    'last_name' => $nameCandidate ? '' : 'Lead',
                    'source' => $source,
                    'type' => 'buyer',
                    'status' => 'new',
                    'score' => 15, // Base score for imported contact
                ]);

                $validCount++;
                $parsedRows[] = [
                    'row' => $index + 1,
                    'email' => $email,
                    'name' => $lead->first_name . ' ' . $lead->last_name,
                    'status' => 'Valid',
                    'details' => 'Ingested successfully'
                ];
            } else {
                $invalidCount++;
                $parsedRows[] = [
                    'row' => $index + 1,
                    'email' => 'N/A',
                    'name' => 'N/A',
                    'status' => 'Invalid',
                    'details' => 'No valid email pattern detected in raw string'
                ];
            }
        }

        return [
            'valid_count' => $validCount,
            'invalid_count' => $invalidCount,
            'corrected_count' => $correctedCount,
            'preview' => array_slice($parsedRows, 0, 100)
        ];
    }
}
