<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PetaWilayah extends Model
{
    protected $table = 'peta_wilayah';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'level',
        'nama',
        'kode_kecamatan',
        'kode_kelurahan',
        'nama_kecamatan',
        'nama_kabkota',
        'lat',
        'lng',
        'geometry',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'geometry' => 'array',
            'lat' => 'float',
            'lng' => 'float',
        ];
    }
}
