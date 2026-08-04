<?php

namespace App\Observers;

use App\Models\AdminActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Generic audit trail for any model using the HasAdminActivityLog trait.
 * Writes to admin_activity_logs the same way AdminController::logActivity()
 * always has, but automatically on create/update/delete/restore instead of
 * requiring every controller method to remember to call it.
 */
class AdminActivityObserver
{
    public function created(Model $model): void
    {
        $this->log('created', $model);
    }

    public function updated(Model $model): void
    {
        $changes = $model->getChanges();
        unset($changes['updated_at']);
        if (empty($changes)) {
            return;
        }
        $this->log('updated', $model, $changes);
    }

    public function deleted(Model $model): void
    {
        $this->log('deleted', $model);
    }

    public function restored(Model $model): void
    {
        $this->log('restored', $model);
    }

    protected function log(string $action, Model $model, ?array $details = null): void
    {
        if (!Auth::check()) {
            // Console/seeder/job-driven changes aren't admin actions.
            return;
        }

        AdminActivityLog::create([
            'user_id' => Auth::id(),
            'action' => $action . ' ' . class_basename($model),
            'subject_type' => get_class($model),
            'subject_id' => $model->getKey(),
            'details' => $details,
            'ip_address' => request()->ip(),
        ]);
    }
}
