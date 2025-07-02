<?php

namespace App\Http\Controllers;

use App\Models\TestResult;
use App\Models\Test;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TestAnswerController extends Controller
{
    // Auto-save jawaban saat user menjawab soal
    public function autoSave(Request $request, $testId)
    {
        $request->validate([
            'question_id' => 'required|integer',
            'answer' => 'present|nullable|string',
        ]);
        
        $user = Auth::user();
        $testResult = TestResult::where('user_id', $user->id)
            ->where('test_id', $testId)
            ->where('status', 'started')
            ->latest()
            ->firstOrFail();

        $answers = json_decode($testResult->answers, true);
        $answers[$request->question_id] = $request->answer;
        $testResult->answers = json_encode($answers);
        $testResult->save();

        return response()->json(['message' => 'Answer saved.']);
    }

    // Mulai test (set started_at)
    public function startTest(Request $request, $testId)
    {
        $user = Auth::user();
        $test = Test::findOrFail($testId);

        // Check if the user has attempts left
        if ($test->allowed_attempts > 0) {
            $completedAttempts = TestResult::where('user_id', $user->id)
                ->where('test_id', $test->id)
                ->where('status', 'completed') // Only count completed tests
                ->count();
            
            if ($completedAttempts >= $test->allowed_attempts) {
                return response()->json(['message' => 'Anda telah mencapai batas maksimal pengerjaan untuk test ini.'], 403);
            }
        }

        // Find or create a test result for this attempt
        $testResult = TestResult::updateOrCreate(
            [
                'user_id' => $user->id,
                'test_id', $testId,
                'status' => 'started',
            ],
            [
                'score' => 0,
                'answers' => json_encode([]),
                'correct_answers' => 0,
                'total_questions' => $test->questions()->count(),
            ]
        );
        
        return response()->json(['message' => 'Test started successfully.', 'result_id' => $testResult->id]);
    }

    // Selesai test (set completed_at)
    public function completeTest(Request $request, $testId)
    {
        $request->validate(['answers' => 'required|array']);
        
        $user = Auth::user();
        $test = Test::with('questions')->findOrFail($testId);
        
        $testResult = TestResult::where('user_id', $user->id)
            ->where('test_id', $testId)
            ->where('status', 'started')
            ->latest()
            ->firstOrFail();

        $correctCount = 0;
        $questions = $test->questions->keyBy('id');
        
        foreach ($request->answers as $questionId => $userAnswer) {
            if (isset($questions[$questionId])) {
                $question = $questions[$questionId];
                if ($question->question_type !== 'essay' && $question->correct_answer === $userAnswer) {
                    $correctCount++;
                }
            }
        }

        $totalQuestions = $questions->count();
        $score = ($totalQuestions > 0) ? round(($correctCount / $totalQuestions) * 100) : 0;
        
        $testResult->update([
            'answers' => json_encode($request->answers),
            'correct_answers' => $correctCount,
            'total_questions' => $totalQuestions,
            'score' => $score,
            'status' => 'completed',
        ]);

        return response()->json(['message' => 'Test completed!', 'result' => $testResult]);
    }

    // Admin: Ambil semua test results dengan detail jawaban
    public function getAllResults()
    {
        return TestResult::with('user', 'test')->latest()->get();
    }

    // Admin: Ambil detail test result tertentu
    public function getResultDetail($resultId)
    {
        return TestResult::with('user', 'test.questions')->findOrFail($resultId);
    }

    // Admin: Statistik test results
    public function getStatistics()
    {
        // Placeholder for statistics
        return response()->json(['message' => 'Statistics endpoint not implemented.']);
    }
}
