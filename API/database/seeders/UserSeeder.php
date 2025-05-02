<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::factory([
            'name' => "Cheam Nathan",
            'email' => "cheam.nathan@pasdecalais.fr",
            'email_verified_at' => now(),
            'password' => Hash::make('GrosSecret'),
            'remember_token' => Str::random(10),
        ])->create();
    }
}
