<?php

namespace App\Http\Controllers;

use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    /**
     * Get all test results with user and test details
     */
    public function getAllResults(Request $request)
    {
        $query = TestAttempt::with(['user', 'test'])
            ->completed()
            ->latest('completed_at');

        // Filter by test - only if the value is present and not empty
        if ($request->filled('test_id')) {
            $query->where('test_id', $request->test_id);
        }

        // Filter by user - only if the value is present and not empty
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range - only if the value is present and not empty
        if ($request->filled('start_date')) {
            $query->whereDate('completed_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('completed_at', '<=', $request->end_date);
        }

        $results = $query->paginate(20);

        return response()->json($results);
    }

    /**
     * Get detailed result for specific attempt
     */
    public function getAttemptDetail($attemptId)
    {
        $attempt = TestAttempt::with([
            'user', 
            'test', 
            'testAnswers.question'
        ])
        ->where('id', $attemptId)
        ->firstOrFail();

        return response()->json($attempt);
    }

    /**
     * Get test results summary by test
     */
    public function getTestResultsSummary(Request $request)
    {
        $testId = $request->test_id;
        
        if (!$testId) {
            return response()->json(['error' => 'Test ID is required'], 400);
        }

        $test = Test::with(['questions'])->findOrFail($testId);
        
        $attempts = TestAttempt::with(['user'])
            ->where('test_id', $testId)
            ->completed()
            ->get();

        $summary = [
            'test' => $test,
            'total_attempts' => $attempts->count(),
            'unique_users' => $attempts->unique('user_id')->count(),
            'average_score' => $attempts->avg('score'),
            'highest_score' => $attempts->max('score'),
            'lowest_score' => $attempts->min('score'),
            'score_distribution' => [
                'excellent' => $attempts->where('score', '>=', 90)->count(),
                'good' => $attempts->whereBetween('score', [80, 89])->count(),
                'fair' => $attempts->whereBetween('score', [70, 79])->count(),
                'poor' => $attempts->whereBetween('score', [60, 69])->count(),
                'fail' => $attempts->where('score', '<', 60)->count(),
            ],
            'recent_attempts' => $attempts->take(10)->sortByDesc('completed_at')->values(),
        ];

        return response()->json($summary);
    }

    /**
     * Get user results summary
     */
    public function getUserResultsSummary(Request $request)
    {
        $userId = $request->user_id;
        
        if (!$userId) {
            return response()->json(['error' => 'User ID is required'], 400);
        }

        $user = User::findOrFail($userId);
        
        $attempts = TestAttempt::with(['test'])
            ->where('user_id', $userId)
            ->completed()
            ->get();

        $summary = [
            'user' => $user,
            'total_attempts' => $attempts->count(),
            'unique_tests' => $attempts->unique('test_id')->count(),
            'average_score' => $attempts->avg('score'),
            'highest_score' => $attempts->max('score'),
            'lowest_score' => $attempts->min('score'),
            'total_time_spent' => $attempts->sum(function ($attempt) {
                return $attempt->getDurationInSeconds();
            }),
            'recent_attempts' => $attempts->take(10)->sortByDesc('completed_at')->values(),
        ];

        return response()->json($summary);
    }

    /**
     * Get overall statistics
     */
    public function getOverallStatistics()
    {
        $stats = [
            'total_tests' => Test::count(),
            'active_tests' => Test::active()->count(),
            'total_users' => User::where('role', 'user')->count(),
            'total_attempts' => TestAttempt::completed()->count(),
            'total_questions' => DB::table('questions')->count(),
            'average_score_all_tests' => TestAttempt::completed()->avg('score'),
            'recent_activity' => TestAttempt::with(['user', 'test'])
                ->completed()
                ->latest('completed_at')
                ->take(10)
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Get question analysis for a specific test
     */
    public function getQuestionAnalysis(Request $request)
    {
        $testId = $request->test_id;
        
        if (!$testId) {
            return response()->json(['error' => 'Test ID is required'], 400);
        }

        $test = Test::with(['questions'])->findOrFail($testId);
        
        $questionAnalysis = [];
        
        foreach ($test->questions as $question) {
            $answers = DB::table('test_answers')
                ->join('test_attempts', 'test_answers.attempt_id', '=', 'test_attempts.id')
                ->where('test_attempts.test_id', $testId)
                ->where('test_attempts.status', 'completed')
                ->where('test_answers.question_id', $question->id)
                ->select('test_answers.is_correct', DB::raw('count(*) as count'))
                ->groupBy('test_answers.is_correct')
                ->get();

            $totalAnswers = $answers->sum('count');
            $correctAnswers = $answers->where('is_correct', true)->first()->count ?? 0;
            $incorrectAnswers = $answers->where('is_correct', false)->first()->count ?? 0;
            $nullAnswers = $answers->where('is_correct', null)->first()->count ?? 0;

            $questionAnalysis[] = [
                'question_id' => $question->id,
                'question_text' => $question->question_text,
                'question_type' => $question->question_type,
                'total_answers' => $totalAnswers,
                'correct_answers' => $correctAnswers,
                'incorrect_answers' => $incorrectAnswers,
                'null_answers' => $nullAnswers,
                'success_rate' => $totalAnswers > 0 ? round(($correctAnswers / $totalAnswers) * 100, 2) : 0,
            ];
        }

        return response()->json([
            'test' => $test,
            'question_analysis' => $questionAnalysis
        ]);
    }

    /**
     * Export test results to CSV
     */
    public function exportResults(Request $request)
    {
        $testId = $request->test_id;
        
        if (!$testId) {
            return response()->json(['error' => 'Test ID is required'], 400);
        }

        $query = TestAttempt::with(['user', 'testAnswers.question'])
            ->where('test_id', $testId)
            ->completed();

        // Add filters
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('start_date')) {
            $query->whereDate('completed_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('completed_at', '<=', $request->end_date);
        }

        $attempts = $query->get();

        $test = Test::findOrFail($testId);

        $csvData = [];
        // Add header
        $csvData[] = [
            'User ID',
            'User Name',
            'User Email',
            'Attempt Number',
            'Score',
            'Started At',
            'Completed At',
            'Duration (seconds)',
            'Duration (formatted)'
        ];
        // Add data rows
        foreach ($attempts as $attempt) {
            $csvData[] = [
                $attempt->user->id,
                $attempt->user->name,
                $attempt->user->email,
                $attempt->attempt_number,
                $attempt->score,
                $attempt->started_at,
                $attempt->completed_at,
                $attempt->getDurationInSeconds(),
                $attempt->getFormattedDuration(),
            ];
        }
        return response()->json([
            'test' => $test,
            'csv_data' => $csvData,
            'total_records' => count($csvData) - 1 // Exclude header
        ]);
    }

    /**
     * Get all questions, options, and correct answers for a test (for review)
     */
    public function getReviewQuestions($testId)
    {
        $test = Test::with(['questions'])->findOrFail($testId);
        $questions = $test->questions->map(function ($q) {
            return [
                'id' => $q->id,
                'question_text' => $q->question_text,
                'question_type' => $q->question_type,
                'question_image_url' => $q->question_image_url,
                'options' => $q->options,
                'correct_answer' => $q->correct_answer,
            ];
        });
        return response()->json([
            'test' => [
                'id' => $test->id,
                'title' => $test->title ?? $test->name,
                'code' => $test->code,
            ],
            'questions' => $questions
        ]);
    }

    /**
     * Get user attempts for a specific test
     */
    public function getUserTestAttempts(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'test_id' => 'required|integer|exists:tests,id',
        ]);

        $user = User::findOrFail($request->user_id);
        $test = Test::findOrFail($request->test_id);

        $attempts = TestAttempt::where('user_id', $request->user_id)
            ->where('test_id', $request->test_id)
            ->orderBy('attempt_number', 'desc')
            ->get();

        $completedAttempts = $attempts->where('status', 'completed')->count();
        $remainingAttempts = $test->hasUnlimitedAttempts() 
            ? null 
            : max(0, $test->allowed_attempts - $completedAttempts);

        return response()->json([
            'user' => $user,
            'test' => $test,
            'attempts' => $attempts,
            'completed_attempts' => $completedAttempts,
            'remaining_attempts' => $remainingAttempts,
            'can_take_test' => $test->hasUnlimitedAttempts() || $remainingAttempts > 0
        ]);
    }

    /**
     * Reset user attempts for a specific test (Admin only)
     */
    public function resetUserAttempts(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'test_id' => 'required|integer|exists:tests,id',
            'reset_type' => 'required|in:all,completed,ongoing',
            'reason' => 'nullable|string|max:500'
        ]);

        $user = User::findOrFail($request->user_id);
        $test = Test::findOrFail($request->test_id);

        $query = TestAttempt::where('user_id', $request->user_id)
            ->where('test_id', $request->test_id);

        // Filter based on reset type
        switch ($request->reset_type) {
            case 'all':
                $attemptsToDelete = $query->get();
                break;
            case 'completed':
                $attemptsToDelete = $query->where('status', 'completed')->get();
                break;
            case 'ongoing':
                $attemptsToDelete = $query->where('status', 'started')->get();
                break;
            default:
                return response()->json(['error' => 'Invalid reset type'], 400);
        }

        if ($attemptsToDelete->isEmpty()) {
            return response()->json([
                'message' => 'Tidak ada attempts yang dapat di-reset.',
                'reset_type' => $request->reset_type
            ]);
        }

        // Delete attempts and related answers
        DB::transaction(function () use ($attemptsToDelete) {
            foreach ($attemptsToDelete as $attempt) {
                // Delete related test answers first
                $attempt->testAnswers()->delete();
                // Delete the attempt
                $attempt->delete();
            }
        });

        // Log the reset action
        \Log::info('Admin reset user attempts', [
            'admin_id' => auth()->id(),
            'user_id' => $request->user_id,
            'test_id' => $request->test_id,
            'reset_type' => $request->reset_type,
            'reason' => $request->reason,
            'attempts_deleted' => $attemptsToDelete->count()
        ]);

        return response()->json([
            'message' => 'User attempts berhasil di-reset.',
            'reset_type' => $request->reset_type,
            'attempts_deleted' => $attemptsToDelete->count(),
            'user' => $user,
            'test' => $test
        ]);
    }

    /**
     * Get all users with their test attempts summary
     */
    public function getUsersAttemptsSummary(Request $request)
    {
        $query = User::where('role', 'user');

        // Filter by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->with(['testAttempts.test'])
            ->get()
            ->map(function ($user) {
                $attempts = $user->testAttempts;
                $completedAttempts = $attempts->where('status', 'completed');
                
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                    'total_attempts' => $attempts->count(),
                    'completed_attempts' => $completedAttempts->count(),
                    'ongoing_attempts' => $attempts->where('status', 'started')->count(),
                    'average_score' => $completedAttempts->avg('score'),
                    'tests_taken' => $attempts->unique('test_id')->count(),
                    'last_activity' => $attempts->max('updated_at'),
                ];
            });

        return response()->json([
            'users' => $users,
            'total_users' => $users->count()
        ]);
    }

    /**
     * Give extra attempts to user for a specific test
     */
    public function giveExtraAttempts(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'test_id' => 'required|integer|exists:tests,id',
            'extra_attempts' => 'required|integer|min:1|max:10',
            'reason' => 'nullable|string|max:500'
        ]);

        $user = User::findOrFail($request->user_id);
        $test = Test::findOrFail($request->test_id);

        // Create a special record to track extra attempts given
        // This could be stored in a separate table or as a note in the existing structure
        // For now, we'll just log it and return success
        
        \Log::info('Admin gave extra attempts', [
            'admin_id' => auth()->id(),
            'user_id' => $request->user_id,
            'test_id' => $request->test_id,
            'extra_attempts' => $request->extra_attempts,
            'reason' => $request->reason
        ]);

        return response()->json([
            'message' => "Berhasil memberikan {$request->extra_attempts} kesempatan tambahan kepada user.",
            'user' => $user,
            'test' => $test,
            'extra_attempts_given' => $request->extra_attempts
        ]);
    }

    public function getUserSnapshots($userId)
    {
        $user = \App\Models\User::findOrFail($userId);
        // Ambil semua snapshot milik user (dari semua attempt)
        $snapshots = \App\Models\TestSnapshot::whereHas('testAttempt', function($q) use ($userId) {
            $q->where('user_id', $userId);
        })
        ->with(['testAttempt.test'])
        ->orderBy('taken_at', 'desc')
        ->get();

        // Format snapshot agar ada test_id dan test_title
        $snapshotsArr = $snapshots->map(function($snap) {
            return [
                'id' => $snap->id,
                'test_id' => $snap->testAttempt->test->id ?? null,
                'test_title' => $snap->testAttempt->test->title ?? '-',
                'image_url' => $snap->image_url,
                'taken_at' => $snap->taken_at,
            ];
        });

        // Daftar test unik
        $tests = $snapshots->pluck('testAttempt.test')->unique('id')->filter()->map(function($test) {
            return [
                'id' => $test->id,
                'title' => $test->title
            ];
        })->values();

        return response()->json([
            'snapshots' => $snapshotsArr,
            'tests' => $tests
        ]);
    }
} 