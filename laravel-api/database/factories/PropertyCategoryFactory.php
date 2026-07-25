<?php

namespace Database\Factories;

use App\Models\PropertyCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PropertyCategoryFactory extends Factory
{
    protected $model = PropertyCategory::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->randomElement([
            'Residential', 'Commercial', 'Land', 'Industrial', 'Multi-Family',
        ]);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $this->faker->sentence(),
            'icon' => null,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
