<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedSearch extends Model
{
    protected $fillable = [
        'user_id', 'name', 'location', 'price_min', 'price_max',
        'beds', 'baths', 'property_type', 'alert_enabled', 'last_alert_at',
    ];

    protected function casts(): array
    {
        return [
            'alert_enabled' => 'boolean',
            'last_alert_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** Properties matching this search's criteria, newest first. */
    public function matchingProperties()
    {
        $query = Property::where('approval_status', 'approved')->where('status', 'active');

        if ($this->location) {
            $query->where(function ($q) {
                $q->where('city', 'like', "%{$this->location}%")
                    ->orWhere('state', 'like', "%{$this->location}%");
            });
        }
        if ($this->price_min) $query->where('price', '>=', $this->price_min);
        if ($this->price_max) $query->where('price', '<=', $this->price_max);
        if ($this->beds) $query->where('bedrooms', '>=', $this->beds);
        if ($this->baths) $query->where('bathrooms', '>=', $this->baths);
        if ($this->property_type) {
            $query->whereHas('propertyType', fn ($q) => $q->where('slug', $this->property_type));
        }

        return $query;
    }

    /** Count of matches created since the last alert (or since the search was saved, if never alerted). */
    public function newMatchesCount(): int
    {
        return $this->matchingProperties()
            ->where('created_at', '>=', $this->last_alert_at ?? $this->created_at)
            ->count();
    }
}
