<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MailSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'smtp_host', 'smtp_port', 'smtp_encryption', 'smtp_username',
        'smtp_password', 'from_name', 'from_email', 'is_active',
    ];

    protected function casts(): array { return ['smtp_port' => 'integer', 'is_active' => 'boolean']; }
}
