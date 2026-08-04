<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeoAccessLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'ip_address', 'country_code', 'country_name', 'city', 'asn', 'isp',
        'is_vpn', 'is_tor', 'is_datacenter', 'reason', 'url', 'method', 'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'is_vpn' => 'boolean',
            'is_tor' => 'boolean',
            'is_datacenter' => 'boolean',
            'asn' => 'integer',
        ];
    }
}
