<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'invoice_number' => 'INV-' . $this->faker->unique()->numerify('######'),
            'user_id' => User::factory(),
            'description' => $this->faker->sentence(),
            'amount' => $this->faker->randomFloat(2, 50, 5000),
            'currency' => 'USD',
            'status' => 'draft',
        ];
    }
}
