<?php

namespace App\Http\Controllers\Konfigurasi;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogActivityController extends Controller
{
    /**
     * Jenis aksi yang bisa difilter. Kunci = nilai kolom `event`.
     */
    private const EVENT = [
        'created' => 'Tambah',
        'updated' => 'Ubah',
        'deleted' => 'Hapus',
        'forceDeleted' => 'Hapus permanen',
        'restored' => 'Pulihkan',
        'login' => 'Login',
        'login_gagal' => 'Login gagal',
        'logout' => 'Logout',
        'akses_diubah' => 'Ubah akses',
        'pengaturan_diubah' => 'Ubah pengaturan',
    ];

    /**
     * Nilai khusus untuk filter user pelaku.
     */
    private const USER_SISTEM = 'sistem';
    private const USER_LOGIN_GAGAL = 'login_gagal';

    public function index(Request $request)
    {
        $this->authorize('read konfigurasi/log-activity');

        $validated = $request->validate([
            'tanggal_dari' => ['nullable', 'date_format:Y-m-d'],
            'tanggal_sampai' => ['nullable', 'date_format:Y-m-d'],
            'event' => ['nullable', 'in:' . implode(',', array_keys(self::EVENT))],
            'user' => ['nullable', 'string', 'max:20'],
            'q' => ['nullable', 'string', 'max:255'],
        ]);

        $tanggalSampai = $validated['tanggal_sampai'] ?? now()->format('Y-m-d');
        $tanggalDari = $validated['tanggal_dari'] ?? now()->subDays(30)->format('Y-m-d');

        if ($tanggalDari > $tanggalSampai) {
            return back()->withErrors(['tanggal_dari' => 'Tanggal dari tidak boleh lebih besar dari tanggal sampai.'])
                ->withInput();
        }

        $query = ActivityLog::query()
            ->with('user:id,name')
            ->whereBetween('created_at', [$tanggalDari . ' 00:00:00', $tanggalSampai . ' 23:59:59']);

        if (!empty($validated['event'])) {
            $query->where('event', $validated['event']);
        }

        $user = $validated['user'] ?? null;
        if ($user === self::USER_SISTEM) {
            $query->whereNull('user_id')->whereNot('event', 'login_gagal');
        } elseif ($user === self::USER_LOGIN_GAGAL) {
            $query->where('event', 'login_gagal');
        } elseif (is_numeric($user)) {
            $query->where('user_id', (int) $user);
        }

        if (!empty($validated['q'])) {
            $query->where('deskripsi', 'ilike', '%' . $validated['q'] . '%');
        }

        $logs = $query->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (ActivityLog $log) => [
                'id' => $log->id,
                'created_at' => $log->created_at?->format('d-m-Y H:i:s'),
                'user' => $log->user?->name ?? ($log->event === 'login_gagal' ? 'Login gagal' : 'Sistem'),
                'event' => $log->event,
                'label_event' => self::EVENT[$log->event] ?? $log->event,
                'deskripsi' => $log->deskripsi,
                'properti' => $log->properti,
                'ip_address' => $log->ip_address,
            ]);

        return Inertia::render('konfigurasi/log-activity', [
            'logs' => $logs,
            'daftarUser' => User::orderBy('name')->get(['id', 'name']),
            'daftarEvent' => collect(self::EVENT)->map(fn (string $label, string $kunci) => [
                'value' => $kunci,
                'label' => $label,
            ])->values(),
            'filters' => [
                'tanggal_dari' => $tanggalDari,
                'tanggal_sampai' => $tanggalSampai,
                'event' => $validated['event'] ?? '',
                'user' => $user ?? '',
                'q' => $validated['q'] ?? '',
            ],
        ]);
    }
}
