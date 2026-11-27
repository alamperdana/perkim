<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\LogsActivity;

class Tahun extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'tahun';
    
    protected $fillable = ['tahun'];
}
