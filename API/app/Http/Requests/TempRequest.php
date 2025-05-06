<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TempRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'valeur' => ['nullable', 'numeric'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
