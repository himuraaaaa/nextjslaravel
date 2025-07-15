<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Rules\RecaptchaRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role'     => 'in:admin,user', // optional
            'g-recaptcha-response' => ['required', new RecaptchaRule], // Custom reCAPTCHA validation
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => bcrypt($request->password),
            'role'     => $request->role ?? 'user',
        ]);

        // Kirim email notifikasi ke user baru
        $user->notify(new \App\Notifications\UserCreatedNotification());

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
        'message' => 'Register success',
        'token' => $token,
        'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {


        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
            'g-recaptcha-response' => ['required', new RecaptchaRule], // Custom reCAPTCHA validation
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login success',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function adminCreateUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            // 'position' => 'required|string|max:255', // Dihapus
            'position_applied' => 'nullable|string|max:255',
            'schedule_date' => 'required|date',
            'schedule_time' => 'required|date_format:H:i',
        ]);

        $admin = $request->user();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => 'user',
            'position_applied' => $request->position_applied,
            'schedule_date' => $request->schedule_date,
            'schedule_time' => $request->schedule_time,
            'created_by' => $admin->id,
        ]);

        // Kirim email notifikasi ke user baru
        $user->notify(new \App\Notifications\UserCreatedNotification(
            $request->schedule_date,
            $request->schedule_time,
            $request->position_applied
        ));

        // Kirim email verifikasi ke user yang baru dibuat
        // $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    public function adminGetUsers()
    {
        return response()->json(\App\Models\User::all());
    }

    public function adminGetUser($id)
    {
        $user = \App\Models\User::findOrFail($id);
        return response()->json($user);
    }

    public function adminUpdateUser(Request $request, $id)
    {
        $user = \App\Models\User::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:6',
            'role' => 'sometimes|in:admin,user',
            'position_applied' => 'nullable|string|max:255',
        ]);
        if (!empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }
        $user->update($data);
        return response()->json($user);
    }

    public function adminDeleteUser($id)
    {
        $user = \App\Models\User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }
}
