<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DeptRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
