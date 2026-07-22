<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid', 'slug', 'title', 'description', 'property_type_id', 'sub_type',
        'status', 'price', 'price_type', 'bedrooms', 'bathrooms', 'sqft',
        'lot_size', 'year_built', 'parking_spaces', 'floors', 'hoa_fees',
        'address', 'city', 'state', 'zip', 'country', 'neighborhood', 'county',
        'latitude', 'longitude', 'school_district', 'walkscore', 'photos',
        'gallery', 'video_url', 'virtual_tour_url', 'floor_plan_url',
        'amenities', 'nearby_places', 'tags', 'featured', 'premium',
        'open_house_date', 'open_house_end', 'realtor_id', 'broker_id',
        'listed_by_type', 'approval_status', 'view_count', 'inquiry_count',
    ];

    protected function casts(): array {
        return [
            'photos' => 'array', 'gallery' => 'array', 'amenities' => 'array',
            'nearby_places' => 'array', 'tags' => 'array',
            'price' => 'decimal:2', 'hoa_fees' => 'decimal:2', 'lot_size' => 'decimal:2',
            'featured' => 'boolean', 'premium' => 'boolean',
            'open_house_date' => 'datetime', 'open_house_end' => 'datetime',
            'bedrooms' => 'integer', 'bathrooms' => 'decimal:1',
            'sqft' => 'integer', 'year_built' => 'integer',
            'parking_spaces' => 'integer', 'floors' => 'integer',
            'view_count' => 'integer', 'inquiry_count' => 'integer',
            'walkscore' => 'integer', 'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    protected static function boot() {
        parent::boot();
        static::creating(function ($model) {
            if (!$model->uuid) $model->uuid = Str::uuid();
            if (!$model->slug) $model->slug = Str::slug($model->title) . '-' . Str::random(5);
        });
    }

    public function propertyType() { return $this->belongsTo(PropertyType::class); }
    public function realtor() { return $this->belongsTo(User::class, 'realtor_id'); }
    public function broker() { return $this->belongsTo(User::class, 'broker_id'); }
    public function favorites() { return $this->hasMany(PropertyFavorite::class); }
    public function comments() { return $this->hasMany(PropertyComment::class); }
    public function analytics() { return $this->hasMany(PropertyAnalytics::class); }
    public function enquiries() { return $this->hasMany(Enquiry::class); }

    public function getRouteKeyName() { return 'slug'; }
}
