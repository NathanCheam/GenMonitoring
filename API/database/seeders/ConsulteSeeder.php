<?php
namespace Database\Seeders;

use App\Models\Dept;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ConsulteSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $depts = Dept::all();

        foreach($users as $user) {
            $user->departements()->attach(
                $depts->pluck('id')->toArray()
            );
        }
    }
}
