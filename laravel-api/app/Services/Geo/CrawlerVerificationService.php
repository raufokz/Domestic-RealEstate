<?php

namespace App\Services\Geo;

use Illuminate\Support\Facades\Cache;

/**
 * Identifies genuine search-engine crawlers by IP.
 *
 * Why this exists: crawlers run from cloud/datacenter ASNs, so the geo
 * decision service classified Googlebot as a datacenter IP and denied it. The
 * frontend then served a 403 carrying <meta name="robots" content="noindex">,
 * which meant no search engine could index any public page.
 *
 * Verification is forward-confirmed reverse DNS, the method Google and Bing
 * both document:
 *
 *   1. Reverse-resolve the IP to a hostname.
 *   2. Require that hostname to sit under an official crawler domain.
 *   3. Forward-resolve that hostname and require it to map back to the same IP.
 *
 * User-Agent is deliberately never consulted — it is trivially spoofed, and
 * trusting it would hand anyone a way around the geo block. Passing all three
 * DNS steps requires control of the crawler operator's DNS.
 */
class CrawlerVerificationService
{
    /** Cache lifetime for a verdict, in seconds. */
    private const CACHE_TTL = 86400;

    /**
     * Hostname suffixes operated by search engines whose crawling we want.
     * Suffixes are matched against the full reverse-DNS hostname, so a
     * lookalike such as "googlebot.com.attacker.net" cannot match.
     */
    private const CRAWLER_DOMAINS = [
        '.googlebot.com',
        '.google.com',
        '.crawl.yahoo.net',
        '.search.msn.com',
        '.crawl.baidu.com',
        '.crawl.baidu.jp',
        '.yandex.ru',
        '.yandex.net',
        '.yandex.com',
        '.applebot.apple.com',
        '.duckduckgo.com',
    ];

    public function isVerifiedCrawler(string $ip): bool
    {
        if (filter_var($ip, FILTER_VALIDATE_IP) === false) {
            return false;
        }

        return Cache::remember(
            'geo:crawler_verified:' . $ip,
            self::CACHE_TTL,
            fn (): bool => $this->verify($ip)
        );
    }

    private function verify(string $ip): bool
    {
        $hostname = @gethostbyaddr($ip);

        // gethostbyaddr returns the input unchanged when it cannot resolve.
        if ($hostname === false || $hostname === $ip) {
            return false;
        }

        $hostname = rtrim(strtolower($hostname), '.');

        if (!$this->hostnameIsCrawlerOwned($hostname)) {
            return false;
        }

        return $this->forwardResolvesTo($hostname, $ip);
    }

    private function hostnameIsCrawlerOwned(string $hostname): bool
    {
        foreach (self::CRAWLER_DOMAINS as $domain) {
            if (str_ends_with($hostname, $domain)) {
                return true;
            }
        }

        return false;
    }

    /**
     * The confirming step: without it, anyone controlling reverse DNS for their
     * own IP could claim a crawler hostname.
     */
    private function forwardResolvesTo(string $hostname, string $ip): bool
    {
        if (str_contains($ip, ':')) {
            $records = @dns_get_record($hostname, DNS_AAAA);
            foreach ($records ?: [] as $record) {
                if (isset($record['ipv6']) && strcasecmp(
                    (string) inet_ntop(inet_pton($record['ipv6'])),
                    (string) inet_ntop(inet_pton($ip))
                ) === 0) {
                    return true;
                }
            }

            return false;
        }

        $resolved = @gethostbynamel($hostname);

        return is_array($resolved) && in_array($ip, $resolved, true);
    }
}
