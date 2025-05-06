<?php
namespace Database\Seeders;

use App\Models\Temp;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TempSeeder extends Seeder
{
    public function run(): void
    {
        $dates=[
            '2025-05-01',
            '2025-05-02',
            '2025-05-03',
            '2025-05-04',
            '2025-05-05',
        ];
        $idDepts=[
            1,
            2,
            3,
            4,
            5,
        ];
        foreach($dates as $date) {
            foreach ($idDepts as $idDept) {
                Temp::factory()->create([
                    'date' => $date,
                    'valeur' => round(mt_rand(-100, 300) / 10, 1),
                    'dept_id' => $idDept,
                ]);
            }
        }
    }
}
