<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $namaWebsite = \App\Models\Setting::get('app_name', config('app.name', 'PERKIM'));
            $faviconPath = \App\Models\Setting::get('favicon_path');
        @endphp

        <title inertia>{{ $namaWebsite }}</title>
        <link rel="icon" href="{{ $faviconPath ? \Illuminate\Support\Facades\Storage::disk('public')->url($faviconPath) : asset('favicon.ico') }}">


        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-background text-foreground min-h-screen">
        @inertia
    </body>
</html>
