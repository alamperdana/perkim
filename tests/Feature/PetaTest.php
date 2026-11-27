<?php

namespace Tests\Feature;

use App\Models\PetaWilayah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PetaTest extends TestCase
{
    use RefreshDatabase;

    public function test_peta_page_is_accessible_without_login(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('peta/index'));
    }

    public function test_peta_data_returns_features_grouped_by_level(): void
    {
        PetaWilayah::create([
            'level' => 'kabkota',
            'nama' => 'Kota Jambi',
            'nama_kabkota' => 'Kota Jambi',
            'lat' => -1.6,
            'lng' => 103.6,
            'geometry' => ['type' => 'MultiPolygon', 'coordinates' => []],
        ]);

        $response = $this->getJson('/peta/data');

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.type', 'Feature');
        $response->assertJsonPath('0.properties.level', 'kabkota');
        $response->assertJsonPath('0.properties.NAMOBJ', 'Kota Jambi');
    }

    public function test_peta_data_is_empty_when_no_rows(): void
    {
        $response = $this->getJson('/peta/data');

        $response->assertOk();
        $response->assertExactJson([]);
    }
}
