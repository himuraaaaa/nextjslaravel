<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    protected function redirectTo($request): ?string
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            // Tambahkan detail error untuk debugging
            abort(response()->json([
                'message' => 'Unauthenticated.',
                'debug' => [
                    'expectsJson' => $request->expectsJson(),
                    'path' => $request->path(),
                    'user' => $request->user(),
                    'headers' => $request->headers->all(),
                ]
            ], 401));
        }
        // return route('login'); // Hapus/comment agar tidak error
        return null;
    }
}
