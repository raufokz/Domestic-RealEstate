<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PropertyImagesSeeder extends Seeder
{
    public function run(): void
    {
        $propertyImages = [
            1 => [
                ['path' => '/modern_tech_penthouse_1784681963946.jpg', 'is_featured' => true, 'sort_order' => 0],
                ['path' => '/hero-slide-1.jpg', 'is_featured' => false, 'sort_order' => 1],
                ['path' => '/variant2-hero.jpg', 'is_featured' => false, 'sort_order' => 2],
            ],
            2 => [
                ['path' => '/minimalist_villa_1784681974667.jpg', 'is_featured' => true, 'sort_order' => 0],
                ['path' => '/hero-slide-2.jpg', 'is_featured' => false, 'sort_order' => 1],
                ['path' => '/variant3-hero.jpg', 'is_featured' => false, 'sort_order' => 2],
            ],
            3 => [
                ['path' => '/luxury_mansion_twilight_1784681953891.jpg', 'is_featured' => true, 'sort_order' => 0],
                ['path' => '/hero-slide-3.jpg', 'is_featured' => false, 'sort_order' => 1],
                ['path' => '/variant1-hero.jpg', 'is_featured' => false, 'sort_order' => 2],
            ],
            4 => [
                ['path' => '/suburban_family_home_1784681985256.jpg', 'is_featured' => true, 'sort_order' => 0],
                ['path' => '/variant4-hero.jpg', 'is_featured' => false, 'sort_order' => 1],
                ['path' => '/hero-slide-1.jpg', 'is_featured' => false, 'sort_order' => 2],
            ],
            5 => [
                ['path' => '/modern_tech_penthouse_1784681963946.jpg', 'is_featured' => true, 'sort_order' => 0],
                ['path' => '/variant2-hero.jpg', 'is_featured' => false, 'sort_order' => 1],
                ['path' => '/hero-slide-2.jpg', 'is_featured' => false, 'sort_order' => 2],
            ],
            6 => [
                ['path' => '/minimalist_villa_1784681974667.jpg', 'is_featured' => true, 'sort_order' => 0],
                ['path' => '/suburban_family_home_1784681985256.jpg', 'is_featured' => false, 'sort_order' => 1],
                ['path' => '/hero-slide-3.jpg', 'is_featured' => false, 'sort_order' => 2],
            ],
        ];

        foreach ($propertyImages as $propertyId => $images) {
            foreach ($images as $img) {
                DB::table('property_images')->updateOrInsert(
                    ['property_id' => $propertyId, 'path' => $img['path']],
                    [
                        'original_name' => basename($img['path']),
                        'mime_type' => 'image/jpeg',
                        'size' => 500000,
                        'is_featured' => $img['is_featured'],
                        'sort_order' => $img['sort_order'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
