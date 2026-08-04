<?php

namespace App\Console\Commands;

use App\Models\GeoTorExitNode;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

class RefreshGeoIntelligence extends Command
{
    protected $signature = 'geo:refresh-intelligence';

    protected $description = 'Refresh the Tor exit node list and (if GEOIP_LICENSE_KEY is set) the MaxMind GeoLite2 databases used by Geo Access Control.';

    public function handle(): int
    {
        $this->refreshTorExitNodes();
        $this->refreshMaxMindDatabases();

        return self::SUCCESS;
    }

    private function refreshTorExitNodes(): void
    {
        $this->info('Downloading Tor exit node list…');

        try {
            $response = Http::timeout(30)->get(config('geo.tor_list_url'));
            if (!$response->successful()) {
                $this->warn('Tor list download failed with HTTP ' . $response->status() . ' — keeping existing list.');
                return;
            }

            $ips = collect(preg_split('/\r?\n/', $response->body()))
                ->map(fn ($line) => trim($line))
                ->filter(fn ($line) => $line !== '' && filter_var($line, FILTER_VALIDATE_IP))
                ->unique()
                ->values();

            if ($ips->isEmpty()) {
                $this->warn('Tor list came back empty — keeping existing list.');
                return;
            }

            GeoTorExitNode::query()->delete();
            $ips->chunk(500)->each(function ($chunk) {
                GeoTorExitNode::insert(
                    $chunk->map(fn ($ip) => ['ip_address' => $ip, 'created_at' => now(), 'updated_at' => now()])->all()
                );
            });

            Cache::forget('geo:tor_set');
            $this->info("Tor exit list refreshed: {$ips->count()} IPs.");
        } catch (\Throwable $e) {
            $this->error('Tor list refresh failed: ' . $e->getMessage());
        }
    }

    private function refreshMaxMindDatabases(): void
    {
        $licenseKey = config('geo.geoip_license_key');
        if (!$licenseKey) {
            $this->comment('GEOIP_LICENSE_KEY not set — skipping MaxMind download. Country-based blocking will stay disabled (fails open) until this is configured. See GEO_ACCESS_CONTROL.md.');
            return;
        }

        $editions = [
            'GeoLite2-Country' => config('geo.mmdb_country_path'),
            'GeoLite2-ASN' => config('geo.mmdb_asn_path'),
        ];

        foreach ($editions as $edition => $destPath) {
            $this->info("Downloading {$edition}…");
            try {
                $url = 'https://download.maxmind.com/app/geoip_download';
                $response = Http::timeout(60)->get($url, [
                    'edition_id' => $edition,
                    'license_key' => $licenseKey,
                    'suffix' => 'tar.gz',
                ]);

                if (!$response->successful()) {
                    $this->warn("{$edition} download failed with HTTP {$response->status()} — keeping existing file if any.");
                    continue;
                }

                $this->extractMmdb($response->body(), $destPath);
                $this->info("{$edition} updated.");
            } catch (\Throwable $e) {
                $this->error("{$edition} refresh failed: " . $e->getMessage());
            }
        }

        // Per-IP lookup results (cache key geoip:{ip}) aren't individually
        // trackable to bulk-invalidate on the file/database cache driver
        // this app runs — they simply expire on their normal 12h TTL and
        // pick up the refreshed database after that.
    }

    private function extractMmdb(string $tarGzContents, string $destPath): void
    {
        $tmpFile = tempnam(sys_get_temp_dir(), 'geoip') . '.tar.gz';
        File::put($tmpFile, $tarGzContents);

        $tmpDir = sys_get_temp_dir() . '/geoip-extract-' . uniqid();
        File::makeDirectory($tmpDir, 0755, true);

        try {
            $phar = new \PharData($tmpFile);
            $phar->extractTo($tmpDir);

            $mmdbFiles = File::allFiles($tmpDir);
            foreach ($mmdbFiles as $file) {
                if ($file->getExtension() === 'mmdb') {
                    File::ensureDirectoryExists(dirname($destPath));
                    File::copy($file->getPathname(), $destPath);
                    return;
                }
            }

            throw new \RuntimeException('No .mmdb file found in downloaded archive.');
        } finally {
            File::delete($tmpFile);
            File::deleteDirectory($tmpDir);
        }
    }
}
