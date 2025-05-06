<?php
namespace Database\Seeders;

use App\Models\Dept;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DeptSeeder extends Seeder
{
    public function run(): void
    {
        $depts=[
            'Pas-de-Calais',
            'Nord',
            'Ardèche',
            'Hautes-Alpes',
            'Vosges',
        ];
        foreach($depts as $dept) {
            Dept::factory()->create([
                'nom' => $dept,
            ]);
        }
    }
}
