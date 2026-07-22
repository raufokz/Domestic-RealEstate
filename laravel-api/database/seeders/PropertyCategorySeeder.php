<?php

namespace Database\Seeders;

use App\Models\PropertyCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PropertyCategorySeeder extends Seeder
{
    public function run(): void
    {
        // Use-class groupings that sit above property types. Idempotent via slug.
        $categories = [
            ['name' => 'Residential', 'description' => 'Homes and dwellings for living.', 'sort_order' => 1],
            ['name' => 'Commercial', 'description' => 'Offices, retail and business properties.', 'sort_order' => 2],
            ['name' => 'Land', 'description' => 'Vacant land, lots and acreage.', 'sort_order' => 3],
            ['name' => 'Industrial', 'description' => 'Warehouses, factories and industrial sites.', 'sort_order' => 4],
            ['name' => 'Multi-Family', 'description' => 'Duplexes, apartment buildings and complexes.', 'sort_order' => 5],
        ];

        foreach ($categories as $category) {
            PropertyCategory::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                array_merge($category, ['slug' => Str::slug($category['name']), 'is_active' => true])
            );
        }
    }
}
