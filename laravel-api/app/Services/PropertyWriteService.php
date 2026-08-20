<?php

namespace App\Services;

use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Single place where a listing and everything hanging off it is written.
 *
 * One request -> one transaction. A listing is only useful with its media and
 * amenities attached, so a half-written listing (row saved, gallery lost) is
 * worse than no listing at all. Every write here is wrapped in
 * DB::transaction, which rolls back on any exception.
 *
 * Remote file deletes are the one thing that CANNOT be rolled back, so they
 * never happen inside the transaction. Paths are collected while the
 * transaction runs and only unlinked once it has committed — otherwise a
 * rollback would restore rows pointing at files that were already gone.
 */
class PropertyWriteService
{
    /** Fields only staff may set. An agent sending these has them ignored. */
    private const STAFF_ONLY_FIELDS = [
        'featured', 'premium', 'is_verified', 'verified_at', 'verified_by',
        'approval_status', 'realtor_id', 'broker_id', 'seller_id', 'view_count', 'inquiry_count',
    ];

    /**
     * Create a listing with its gallery and amenities atomically.
     *
     * @param  array  $data     validated payload
     * @param  User   $actor    the authenticated writer
     */
    public function create(array $data, User $actor): Property
    {
        $media = $this->pullMedia($data);
        $amenities = $this->pullAmenities($data);

        $data = $this->applyRolePolicy($data, $actor, isCreate: true);

        return DB::transaction(function () use ($data, $media, $amenities, $actor) {
            $data['uuid'] = (string) Str::uuid();
            $data['slug'] = $this->uniqueSlug($data['title'] ?? $data['address'] ?? 'listing');
            $data['created_by'] = $actor->id;

            if ($amenities !== null) {
                $data['amenities'] = $amenities;
            }

            $property = Property::create($data);

            $this->writeMedia($property, $media['add'] ?? [], replaceAll: true);
            // A gallery with no cover leaves every listing card blank, so pick
            // one on create too — the caller's choice, else the first image.
            $this->normaliseCover($property, $media['cover_id'] ?? null);

            return $property->fresh('images');
        });
    }

    /**
     * Update core fields, add media, remove media by id, and re-order — all in
     * one call so the gallery never sits in a half-updated state.
     */
    public function update(Property $property, array $data, User $actor): Property
    {
        $media = $this->pullMedia($data);
        $amenities = $this->pullAmenities($data);

        $data = $this->applyRolePolicy($data, $actor, isCreate: false);

        // Filled inside the transaction, unlinked only after it commits.
        $orphanPaths = [];

        $fresh = DB::transaction(function () use ($property, $data, $media, $amenities, $actor, &$orphanPaths) {
            if (array_key_exists('title', $data) && $data['title'] !== $property->title) {
                $data['slug'] = $this->uniqueSlug($data['title'], $property->id);
            }
            if ($amenities !== null) {
                $data['amenities'] = $amenities;
            }
            $data['updated_by'] = $actor->id;

            $property->fill($data)->save();

            // 1. Remove the images the caller listed, scoped to this property so
            //    an id from someone else's listing cannot be passed in.
            if (!empty($media['remove'])) {
                $doomed = $property->images()->whereIn('id', $media['remove'])->get();
                foreach ($doomed as $image) {
                    $orphanPaths[] = $image->path;
                    $image->delete();
                }
            }

            // 2. Append new images after whatever is already there.
            $this->writeMedia($property, $media['add'] ?? [], replaceAll: false);

            // 3. Apply an explicit order if one was sent.
            if (!empty($media['order'])) {
                $this->applyOrder($property, $media['order']);
            }

            // 4. Exactly one cover, chosen last so it survives adds and removes.
            $this->normaliseCover($property, $media['cover_id'] ?? null);

            return $property->fresh('images');
        });

        $this->deleteFiles($orphanPaths);

        return $fresh;
    }

    /**
     * Soft-delete the listing, hard-delete its media rows and stored files.
     * The listing stays recoverable; the storage bill does not keep running.
     */
    public function delete(Property $property): void
    {
        $orphanPaths = [];

        DB::transaction(function () use ($property, &$orphanPaths) {
            foreach ($property->images as $image) {
                $orphanPaths[] = $image->path;
                $image->delete();
            }
            $property->delete(); // SoftDeletes -> sets deleted_at
        });

        $this->deleteFiles($orphanPaths);
    }

    // ---------------------------------------------------------------- helpers

    /**
     * Strip privileged fields from a non-staff payload and pin ownership.
     *
     * Mirrors PropertyPolicy: an agent creates listings they own and cannot
     * promote or self-approve them. Values are dropped silently rather than
     * rejected so a stray field in a form post is not a hard failure.
     */
    private function applyRolePolicy(array $data, User $actor, bool $isCreate): array
    {
        // Identity and counters are derived, never client-supplied — for anyone.
        // Letting a caller post its own slug/uuid would let it collide with, or
        // impersonate, another listing's canonical URL.
        foreach (['uuid', 'slug', 'view_count', 'inquiry_count', 'created_by', 'updated_by'] as $derived) {
            unset($data[$derived]);
        }

        $isStaff = $actor->hasAnyRole(['admin', 'super_admin', 'staff']);

        if (!$isStaff) {
            foreach (self::STAFF_ONLY_FIELDS as $field) {
                unset($data[$field]);
            }
            if ($isCreate) {
                /*
                 * Two ownership paths, matching what the existing controller
                 * already did: a homeowner listing their own place owns it via
                 * seller_id, everyone else via realtor_id. Dropping the seller
                 * branch would silently reassign self-listings to an agent.
                 */
                if ($actor->role === 'seller') {
                    $data['seller_id'] = $actor->id;
                    $data['listed_by_type'] = 'owner';
                } else {
                    $data['realtor_id'] = $actor->id;
                    $data['listed_by_type'] = $actor->role === 'broker' ? 'broker' : 'agent';
                }
                // Moderation queue, never straight to live.
                $data['approval_status'] = 'pending';
                $data['status'] = $data['status'] ?? 'draft';
            }
        } elseif ($isCreate) {
            $data['realtor_id'] = $data['realtor_id'] ?? $actor->id;
            $data['approval_status'] = $data['approval_status'] ?? 'approved';
        }

        return $data;
    }

    /** @return array{add?:array,remove?:array,order?:array,cover_id?:int|null} */
    private function pullMedia(array &$data): array
    {
        $media = [
            'add' => $data['media']['add'] ?? [],
            'remove' => $data['media']['remove'] ?? [],
            'order' => $data['media']['order'] ?? [],
            'cover_id' => $data['media']['cover_id'] ?? null,
        ];
        unset($data['media']);

        return $media;
    }

    private function pullAmenities(array &$data): ?array
    {
        if (!array_key_exists('amenities', $data)) {
            return null;
        }
        $list = array_values(array_unique(array_filter(
            (array) $data['amenities'],
            fn ($a) => is_string($a) && trim($a) !== ''
        )));
        unset($data['amenities']);

        return $list;
    }

    /**
     * Insert media rows, continuing the existing sort_order sequence.
     */
    private function writeMedia(Property $property, array $items, bool $replaceAll): void
    {
        if ($items === []) {
            return;
        }

        $next = $replaceAll ? 0 : (int) $property->images()->max('sort_order') + 1;

        foreach ($items as $item) {
            PropertyImage::create([
                'property_id' => $property->id,
                'path' => $item['file_url'] ?? $item['path'],
                'public_id' => $item['public_id'] ?? null,
                'media_type' => $item['media_type'] ?? 'image',
                'caption' => $item['caption'] ?? null,
                'original_name' => $item['original_name'] ?? null,
                'mime_type' => $item['mime_type'] ?? null,
                'size' => $item['size'] ?? null,
                'is_featured' => false, // normaliseCover decides the cover
                'sort_order' => $item['display_order'] ?? $next++,
            ]);
        }
    }

    /** @param array<int,int> $orderedIds image ids in the order they should show */
    private function applyOrder(Property $property, array $orderedIds): void
    {
        $owned = $property->images()->pluck('id')->all();
        $position = 0;
        foreach ($orderedIds as $id) {
            if (!in_array((int) $id, $owned, true)) {
                continue; // ignore ids that are not on this listing
            }
            PropertyImage::where('id', $id)->update(['sort_order' => $position++]);
        }
    }

    /**
     * Guarantee exactly one cover image. Falls back to the first image so a
     * listing is never left without one after the old cover was deleted.
     */
    private function normaliseCover(Property $property, ?int $coverId): void
    {
        $images = $property->images()->orderBy('sort_order')->get();
        if ($images->isEmpty()) {
            return;
        }

        $target = $coverId
            ? $images->firstWhere('id', $coverId)
            : $images->firstWhere('is_featured', true);

        $target = $target ?: $images->first();

        PropertyImage::where('property_id', $property->id)->update(['is_featured' => false]);
        PropertyImage::where('id', $target->id)->update(['is_featured' => true]);
    }

    private function uniqueSlug(string $source, ?int $ignoreId = null): string
    {
        $base = Str::slug(Str::limit($source, 120, '')) ?: 'listing';
        $slug = $base;
        $n = 2;

        while (
            Property::withTrashed()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.$n++;
        }

        return $slug;
    }

    /** Post-commit cleanup. Never called from inside a transaction. */
    private function deleteFiles(array $paths): void
    {
        foreach (array_filter($paths) as $path) {
            // Remote URLs are managed by their provider, not the local disk.
            if (Str::startsWith($path, ['http://', 'https://'])) {
                continue;
            }
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}
