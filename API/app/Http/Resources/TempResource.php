<?php

namespace App\Http\Resources;

use App\Models\Temp;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Temp */
class TempResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->date,
            'heure' => $this->heure,
            'valeur' => $this->valeur,
            'departement' => new DeptResource($this->whenLoaded('dept')),
        ];
    }
}
