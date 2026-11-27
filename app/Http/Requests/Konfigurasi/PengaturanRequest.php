<?php

namespace App\Http\Requests\Konfigurasi;

use Illuminate\Foundation\Http\FormRequest;

class PengaturanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'app_name' => 'required|string|max:100',
            'app_full_name' => 'nullable|string|max:150',
            'description' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:150',
            'copyright' => 'nullable|string|max:150',
            'logo' => 'nullable|file|mimes:png,jpg,jpeg,svg,webp|max:2048',
        ];
    }
}
