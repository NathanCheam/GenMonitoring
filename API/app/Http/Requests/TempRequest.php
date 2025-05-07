<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TempRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'heure' => ['required', 'date_format:H:i:s'],
            'valeur' => ['nullable', 'numeric'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
