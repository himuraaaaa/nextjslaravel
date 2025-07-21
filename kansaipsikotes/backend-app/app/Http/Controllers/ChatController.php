<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Chat;
use App\Models\User;

class ChatController extends Controller
{
    // Simpan pesan chat
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'sender' => 'required|in:user,admin',
            'message' => 'required|string',
        ]);

        $chat = Chat::create([
            'user_id' => $request->user_id,
            'sender' => $request->sender,
            'message' => $request->message,
        ]);

        return response()->json(['success' => true, 'chat' => $chat]);
    }

    // Ambil history chat per user
    public function history(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);
        $chats = Chat::where('user_id', $request->user_id)
            ->orderBy('created_at', 'asc')
            ->get();
        return response()->json(['messages' => $chats]);
    }

    // Daftar user yang pernah chat
    public function chatUsers()
    {
        $userIds = \App\Models\Chat::select('user_id')->distinct()->pluck('user_id');
        $users = \App\Models\User::whereIn('id', $userIds)->get(['id', 'name', 'email']);
        // Format: { user_id, name }
        $result = $users->map(fn($u) => [
            'user_id' => $u->id,
            'name' => $u->name ?? $u->email,
        ])->values();
        return response()->json(['users' => $result]);
    }
} 