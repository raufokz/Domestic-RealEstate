<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZipCode extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'zip';
    public $timestamps = false;

    protected $fillable = ['zip', 'latitude', 'longitude'];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }
}
