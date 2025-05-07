<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dept extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'consulte')
            ->as('consultants');
    }

    public function temps()
    {
        return $this->hasMany(Temp::class, 'dept_id', 'id');
    }
}
