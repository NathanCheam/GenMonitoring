<?php

namespace Database\Factories;

use App\Models\Temp;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class TempFactory extends Factory
{
    protected $model = Temp::class;

    public function definition(): array
    {
        return [
            'date' => Carbon::now(),
            'heure' => Carbon::now(),
            'valeur' => $this->faker->randomFloat(),
        ];
    }
}
