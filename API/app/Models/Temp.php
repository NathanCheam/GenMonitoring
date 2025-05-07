<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Temp extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'heure',
        'valeur',
        'idDepartement'
    ];

    function dept() {
        return $this->belongsTo(Dept::class);
    }
}
