<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-email', function () {
    \Mail::raw('Ini email percobaan dari Laravel SMTP!', function ($message) {
        $message->to('your_email@example.com') // Ganti dengan email tujuan
                ->subject('Percobaan SMTP Laravel');
    });
    return 'Email terkirim!';
});
