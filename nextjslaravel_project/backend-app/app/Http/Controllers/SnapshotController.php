<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TestSnapshot;
use App\Models\TestAttempt;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;

class SnapshotController extends Controller
{
    /**
     * Upload snapshot from user during test
     */
    public function uploadSnapshot(Request $request)
    {
        // Validasi token manual untuk kompatibilitas dengan frontend
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $token = substr($authHeader, 7);
        $accessToken = PersonalAccessToken::findToken($token);
        $user = $accessToken ? $accessToken->tokenable : null;
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'image' => 'required|string', // Base64 image data
            'attempt_id' => 'required|integer|exists:test_attempts,id',
            'question_index' => 'nullable|integer',
            'question_id' => 'nullable|integer',
            'user_answer' => 'nullable|string'
        ]);

        // Verify that the attempt belongs to the user
        $attempt = TestAttempt::where('id', $request->attempt_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$attempt) {
            return response()->json(['message' => 'Attempt not found or unauthorized'], 404);
        }

        try {
            // Decode base64 image
            $imageData = $request->input('image');
            $imageData = str_replace('data:image/png;base64,', '', $imageData);
            $imageData = str_replace(' ', '+', $imageData);
            $imageData = base64_decode($imageData);

            if ($imageData === false) {
                return response()->json(['message' => 'Invalid image data'], 400);
            }

            // Generate unique filename
            $filename = 'snapshot_' . $attempt->id . '_' . time() . '_' . uniqid() . '.png';
            $path = 'snapshots/' . $filename;

            // Store image
            Storage::disk('public')->put($path, $imageData);

            // Save to database
            $snapshot = TestSnapshot::create([
                'test_attempt_id' => $attempt->id,
                'image_path' => $path,
                'image_url' => Storage::disk('public')->url($path),
                'question_index' => $request->question_index,
                'question_id' => $request->question_id,
                'user_answer_at_time' => $request->user_answer,
                'taken_at' => now()
            ]);

            return response()->json([
                'message' => 'Snapshot uploaded successfully',
                'snapshot_id' => $snapshot->id,
                'image_url' => $snapshot->image_url
            ]);

        } catch (\Exception $e) {
            \Log::error('Snapshot upload failed', [
                'attempt_id' => $request->attempt_id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to upload snapshot',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get snapshots for an attempt (admin only)
     */
    public function getSnapshots(Request $request, $attemptId)
    {
        $request->validate([
            'attempt_id' => 'required|integer|exists:test_attempts,id'
        ]);

        $snapshots = TestSnapshot::where('test_attempt_id', $attemptId)
            ->orderBy('taken_at', 'asc')
            ->get();

        return response()->json($snapshots);
    }
}
