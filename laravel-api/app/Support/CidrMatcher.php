<?php

namespace App\Support;

class CidrMatcher
{
    /**
     * Whether $ip falls inside $cidr (e.g. "203.0.113.0/24"). Supports IPv4
     * and IPv6 by comparing the packed binary address up to the prefix length.
     */
    public static function matches(string $ip, string $cidr): bool
    {
        if (!str_contains($cidr, '/')) {
            return self::ipsEqual($ip, $cidr);
        }

        [$subnet, $prefixLength] = explode('/', $cidr, 2);
        $prefixLength = (int) $prefixLength;

        $ipBin = @inet_pton($ip);
        $subnetBin = @inet_pton($subnet);
        if ($ipBin === false || $subnetBin === false || strlen($ipBin) !== strlen($subnetBin)) {
            return false;
        }

        $bytes = intdiv($prefixLength, 8);
        $bits = $prefixLength % 8;

        if ($bytes > 0 && substr($ipBin, 0, $bytes) !== substr($subnetBin, 0, $bytes)) {
            return false;
        }

        if ($bits === 0) {
            return true;
        }

        $mask = chr((0xFF << (8 - $bits)) & 0xFF);
        $ipByte = substr($ipBin, $bytes, 1);
        $subnetByte = substr($subnetBin, $bytes, 1);

        return ($ipByte & $mask) === ($subnetByte & $mask);
    }

    private static function ipsEqual(string $a, string $b): bool
    {
        $binA = @inet_pton($a);
        $binB = @inet_pton($b);

        return $binA !== false && $binA === $binB;
    }
}
