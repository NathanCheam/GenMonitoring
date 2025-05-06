<?php

namespace Database\Factories;

use App\Models\Dept;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class DeptFactory extends Factory
{
    protected $model = Dept::class;

    public function definition(): array
    {
        return [
            'nom' => $this->faker->name(),
        ];
    }
}
