<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionDocument extends Model
{
    protected $fillable = [
        'user_id', 'property_id', 'name', 'document_type',
        'file_path', 'original_name', 'size_bytes', 'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
