<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('peta_wilayah', function (Blueprint $table) {
            $table->id();
            $table->string('level', 20)->index();
            $table->string('nama');
            $table->string('kode_kecamatan')->nullable();
            $table->string('kode_kelurahan')->nullable();
            $table->string('nama_kecamatan')->nullable();
            $table->string('nama_kabkota');
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->jsonb('geometry');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peta_wilayah');
    }
};
