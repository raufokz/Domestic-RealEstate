<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    use HasFactory;

    protected $fillable = ['key_name', 'value', 'group_name'];

    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key_name', $key)->first();
        if (!$setting) {
            return $default;
        }
        $val = $setting->value;
        if ($val === 'true') return true;
        if ($val === 'false') return false;
        if (is_numeric($val)) return $val + 0;
        return $val;
    }

    public static function set(string $key, mixed $value, string $group = 'general'): static
    {
        $stringValue = is_bool($value) ? ($value ? 'true' : 'false') : (is_array($value) ? json_encode($value) : (string) $value);
        return static::updateOrCreate(
            ['key_name' => $key],
            ['value' => $stringValue, 'group_name' => $group]
        );
    }
}
