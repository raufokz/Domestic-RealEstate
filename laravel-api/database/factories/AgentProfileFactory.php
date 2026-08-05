<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AgentProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'slug' => $this->faker->unique()->slug(3),
            'headline' => 'Local Real Estate Specialist',
            'bio' => $this->faker->paragraph(),
            'brokerage_name' => $this->faker->company(),
            'license_status' => 'pending',
            'status' => 'pending',
            'is_published' => false,
        ];
    }
}
