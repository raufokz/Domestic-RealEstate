<?php

namespace App\Traits;

use App\Models\ContentRevision;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Auth;

/**
 * Snapshots a model's pre-edit state into content_revisions on every update,
 * so "Restore Previous Version" has something real to restore. Add
 * `use HasRevisions;` to a model to opt in — no per-model registration
 * needed elsewhere (mirrors the self-booting HasAdminActivityLog trait).
 */
trait HasRevisions
{
    public static function bootHasRevisions(): void
    {
        static::updating(function ($model) {
            $model->snapshotRevision();
        });
    }

    public function revisions(): MorphMany
    {
        return $this->morphMany(ContentRevision::class, 'revisionable')->latest('created_at');
    }

    /** Fields never worth diffing/restoring (noise, not content). */
    protected function revisionExcludedAttributes(): array
    {
        return array_merge(['updated_at', 'created_at', 'view_count', 'like_count', 'share_count'], $this->revisionExclude ?? []);
    }

    public function snapshotRevision(): void
    {
        $data = collect($this->getOriginal())
            ->except($this->revisionExcludedAttributes())
            ->toArray();

        if (empty($data)) {
            return;
        }

        $this->revisions()->create([
            'data' => $data,
            'created_by' => Auth::id(),
            'created_at' => now(),
        ]);

        // Keep only the most recent 20 snapshots per record.
        $staleIds = $this->revisions()->skip(20)->take(10000)->pluck('id');
        if ($staleIds->isNotEmpty()) {
            ContentRevision::whereIn('id', $staleIds)->delete();
        }
    }

    /** Restores this model's attributes from a stored revision (itself snapshotting the current state first). */
    public function restoreRevision(int $revisionId): static
    {
        $revision = $this->revisions()->findOrFail($revisionId);
        $this->fill($revision->data)->save();

        return $this;
    }
}
