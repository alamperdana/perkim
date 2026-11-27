<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'event',
        'model_type',
        'model_id',
        'deskripsi',
        'properti',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'properti' => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
