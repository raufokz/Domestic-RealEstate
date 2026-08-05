<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContractFactory extends Factory
{
    public function definition(): array
    {
        return [
            'contract_number' => 'CTR-' . $this->faker->unique()->numerify('######'),
            'user_id' => User::factory(),
            'template_name' => 'Standard Listing Agreement',
            'template_html' => '<p>Contract terms placeholder.</p>',
            'status' => 'draft',
        ];
    }
}
