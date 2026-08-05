<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PropertyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'slug' => $this->faker->unique()->slug(4),
            'title' => $this->faker->streetAddress(),
            'description' => $this->faker->paragraph(),
            'status' => 'active',
            'approval_status' => 'approved',
            'price' => $this->faker->numberBetween(150000, 2500000),
            'price_type' => 'sale',
            'bedrooms' => $this->faker->numberBetween(1, 6),
            'bathrooms' => $this->faker->randomFloat(1, 1, 4),
            'sqft' => $this->faker->numberBetween(600, 6000),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->stateAbbr(),
            'zip' => $this->faker->postcode(),
            'country' => 'US',
        ];
    }
}
