<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    public const SEVERITY_CRITICAL = 'critical';
    public const SEVERITY_WARNING = 'warning';
    public const SEVERITY_INFO = 'info';
    public const SEVERITY_SUCCESS = 'success';

    protected $fillable = [
        'user_id', 'type', 'severity', 'module', 'title', 'message', 'fix',
        'action_url', 'action_label', 'data', 'read_at', 'resolved_at',
        'resolved_by', 'dedupe_key', 'occurrences',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'read_at' => 'datetime',
            'resolved_at' => 'datetime',
            'occurrences' => 'integer',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }

    /** Unresolved alerts only — what an operator actually needs to act on. */
    public function scopeOpen($query) { return $query->whereNull('resolved_at'); }

    public function scopeUnread($query) { return $query->whereNull('read_at'); }

    /**
     * Back-compat entry point: existing callers pass (type, title, message, data)
     * and keep working. New callers should use Notifier::alert() directly so they
     * can supply severity, module, fix guidance, and an action link.
     *
     * @param  string|null  $event  Business event key honoured against Admin →
     *                              Notification Settings toggles (e.g. new_lead).
     */
    public static function notifyAdmins(string $type, string $title, string $message, ?array $data = null, ?string $event = null)
    {
        $severity = in_array($type, ['error', 'failure'], true)
            ? self::SEVERITY_CRITICAL
            : self::SEVERITY_INFO;

        return \App\Services\Notifier::alert(
            title: $title,
            message: $message,
            severity: $severity,
            module: $type,
            data: $data,
            event: $event,
        );
    }
}
