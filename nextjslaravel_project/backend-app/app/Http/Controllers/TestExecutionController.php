<?php

namespace App\Http\Controllers;

use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\TestAnswer;
use App\Models\Question;
use App\Models\User;
use App\Mail\TestCompletionMail;
use App\Mail\AdminTestCompletionMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class TestExecutionController extends Controller
{
    /**
     * Get available tests for user with attempt information
     */
    public function availableTests()
    {
        $user = Auth::user();
        $tests = Test::active()->with(['questions'])->get();

        $testsWithAttempts = $tests->map(function ($test) use ($user) {
            $completedAttempts = TestAttempt::forUser($user->id)
                ->forTest($test->id)
                ->completed()
                ->count();
            
            $testData = $test->toArray();
            $testData['completed_attempts'] = $completedAttempts;
            
            // Calculate remaining attempts
            if ($test->hasUnlimitedAttempts()) {
                $testData['remaining_attempts'] = null; // null for unlimited
            } else {
                $testData['remaining_attempts'] = max(0, $test->allowed_attempts - $completedAttempts);
            }

            return $testData;
        });

        return response()->json($testsWithAttempts);
    }

    /**
     * Get test questions
     */
    public function testQuestions(Request $request, Test $test)
    {
        if (!$test->isActive()) {
            throw ValidationException::withMessages([
                'test' => ['Test tidak aktif atau tidak ditemukan.']
            ]);
        }

        $attemptId = $request->input('attempt_id');
        if ($attemptId) {
            $attempt = \App\Models\TestAttempt::where('id', $attemptId)
                ->where('test_id', $test->id)
                ->first();
            if ($attempt && is_array($attempt->question_order) && count($attempt->question_order)) {
                // Ambil soal sesuai urutan question_order
                $questions = $test->questions()
                    ->whereIn('id', $attempt->question_order)
                    ->select('id', 'question_text', 'question_image_url', 'question_type', 'options')
                    ->get()
                    ->keyBy('id');
                // Urutkan sesuai question_order
                $ordered = [];
                foreach ($attempt->question_order as $qid) {
                    if (isset($questions[$qid])) {
                        $ordered[] = $questions[$qid];
                    }
                }
                return $ordered;
            }
        }
        // Default: random order lama
        return $test->questions()
            ->inRandomOrder()
            ->select('id', 'question_text', 'question_image_url', 'question_type', 'options')
            ->get();
    }

    /**
     * Validate test code before starting
     */
    public function validateTestCode(Request $request, Test $test)
    {
        $request->validate([
            'code' => 'required|string|max:50'
        ]);

        if (!$test->isActive()) {
            throw ValidationException::withMessages([
                'test' => ['Test tidak aktif atau tidak ditemukan.']
            ]);
        }

        if (!$test->hasCode()) {
            return response()->json([
                'message' => 'Test tidak memerlukan kode.',
                'code_required' => false
            ]);
        }

        $isValid = $test->validateCode($request->code);
        
        if (!$isValid) {
            throw ValidationException::withMessages([
                'code' => ['Kode test tidak valid. Silakan coba lagi.']
            ]);
        }

        return response()->json([
            'message' => 'Kode test valid.',
            'code_required' => true,
            'code_valid' => true
        ]);
    }

    /**
     * Start a test attempt
     */
    public function startTest(Request $request, Test $test)
    {
        $user = Auth::user();

        if (!$test->isActive()) {
            throw ValidationException::withMessages([
                'test' => ['Test tidak aktif atau tidak ditemukan.']
            ]);
        }
        
        // If the test requires a code, we must validate it here.
        if ($test->hasCode()) {
            $request->validate(['code' => 'required|string']);
            if (!$test->validateCode($request->code)) {
                throw ValidationException::withMessages([
                    'code' => ['Kode test tidak valid.']
                ]);
            }
        }
        
        if (!$test->hasUnlimitedAttempts()) {
            $completedAttempts = TestAttempt::forUser($user->id)
                ->forTest($test->id)
                ->completed()
                ->count();
            
            if ($completedAttempts >= $test->allowed_attempts) {
                throw ValidationException::withMessages([
                    'test' => ['Anda telah mencapai batas maksimal pengerjaan untuk test ini.']
                ]);
            }
        }

        $ongoingAttempt = TestAttempt::forUser($user->id)
            ->forTest($test->id)
            ->started()
            ->first();

        if ($ongoingAttempt) {
            return response()->json([
                'message' => 'Test attempt already in progress.',
                'attempt_id' => $ongoingAttempt->id,
                'started_at' => $ongoingAttempt->started_at,
                'last_question_id' => $ongoingAttempt->last_question_id,
            ]);
        }

        $attemptNumber = TestAttempt::forUser($user->id)
            ->forTest($test->id)
            ->count() + 1;

        // Random urutan soal dan simpan ke question_order
        $questionIds = $test->questions()->pluck('id')->toArray();
        shuffle($questionIds);

        $testAttempt = TestAttempt::create([
            'user_id' => $user->id,
        'test_id' => $test->id,
            'attempt_number' => $attemptNumber,
            'status' => 'started',
            'score' => 0,
            'started_at' => now(),
            'question_order' => $questionIds,
        ]);

        return response()->json([
            'message' => 'Test started successfully.',
            'attempt_id' => $testAttempt->id,
            'started_at' => $testAttempt->started_at,
            'duration_minutes' => $test->duration
        ]);
    }

    /**
     * Auto-save answer for a question
     */
    public function autoSaveAnswer(Request $request, Test $test)
    {
        $request->validate([
            'attempt_id' => 'required|integer|exists:test_attempts,id',
            'question_id' => 'required|integer|exists:questions,id',
            'answer' => 'nullable', // bisa string (general) atau array (DISC)
            'question_index' => 'nullable|integer',
        ]);

        $user = Auth::user();
        
        // Verify the attempt belongs to the user and is for this test
        $testAttempt = TestAttempt::where('id', $request->attempt_id)
            ->where('user_id', $user->id)
            ->where('test_id', $test->id)
            ->started()
            ->firstOrFail();

        // Get the question
        $question = Question::where('id', $request->question_id)
            ->where('test_id', $test->id)
            ->firstOrFail();

        // General
        TestAnswer::updateOrCreate(
            [
                'attempt_id' => $testAttempt->id,
                'question_id' => $question->id,
            ],
            [
                'answer' => $request->answer,
                'is_correct' => $question->checkAnswer($request->answer)
            ]
        );

        // Update last_question_id dan last_question_index di test_attempts
        $testAttempt->last_question_id = $question->id;
        if ($request->has('question_index')) {
            $testAttempt->last_question_index = $request->question_index;
        }
        $testAttempt->save();

        return response()->json([
            'message' => 'Answer saved successfully.',
            'answer_id' => TestAnswer::where('attempt_id', $testAttempt->id)->where('question_id', $question->id)->first()->id
        ]);
    }

    /**
     * Submit test attempt
     */
    public function submitTest(Request $request, Test $test)
    {
        \Log::info('Submit test request', [
            'test_id' => $test->id,
            'attempt_id' => $request->attempt_id,
            'answers_count' => count($request->answers ?? []),
            'user_id' => Auth::id()
        ]);

        $request->validate([
            'attempt_id' => 'required|integer|exists:test_attempts,id',
            'answers' => 'required|array',
        ]);

        $user = Auth::user();
        
        // Verify the attempt belongs to the user and is for this test
        $testAttempt = TestAttempt::where('id', $request->attempt_id)
            ->where('user_id', $user->id)
            ->where('test_id', $test->id)
            ->first();

        \Log::info('TestAttempt found', [
            'attempt_id' => $request->attempt_id,
            'found' => $testAttempt ? true : false,
            'status' => $testAttempt ? $testAttempt->status : null
        ]);

        if (!$testAttempt) {
            \Log::warning('TestAttempt not found', [
                'attempt_id' => $request->attempt_id,
                'user_id' => $user->id,
                'test_id' => $test->id
            ]);
            return response()->json([
                'message' => 'Test attempt tidak ditemukan atau tidak valid.',
                'error' => 'attempt_not_found'
            ], 404);
        }

        if ($testAttempt->status === 'completed') {
            \Log::info('TestAttempt already completed', [
                'attempt_id' => $testAttempt->id,
                'score' => $testAttempt->score,
                'completed_at' => $testAttempt->completed_at
            ]);
            return response()->json([
                'message' => 'Test attempt sudah selesai.',
                'error' => 'attempt_already_completed',
                'score' => $testAttempt->score,
                'completed_at' => $testAttempt->completed_at
            ], 400);
        }

        // Get all questions for this test
        $questions = $test->questions()->get();
        
        \Log::info('Processing test submission', [
            'questions_count' => $questions->count(),
            'answers_count' => count($request->answers)
        ]);
        
        try {
            DB::transaction(function () use ($testAttempt, $questions, $request, $test, $user) {
                $correctCount = 0;
                $totalQuestions = $questions->count();

                // Process each answer
                foreach ($questions as $question) {
                    $userAnswer = $request->answers[$question->id] ?? null;
                    $isCorrect = $question->checkAnswer($userAnswer);
                    
                    if ($isCorrect === true) {
                        $correctCount++;
                    }

                    // Update or create answer
                    TestAnswer::updateOrCreate(
                        [
                            'attempt_id' => $testAttempt->id,
                            'question_id' => $question->id,
                        ],
                        [
                            'answer' => $userAnswer,
                            'is_correct' => $isCorrect
                        ]
                    );
                }

                // Calculate score
                $score = $totalQuestions > 0 ? round(($correctCount / $totalQuestions) * 100) : 0;

                // Mark attempt as completed
                $testAttempt->update([
                    'status' => 'completed',
                    'score' => $score,
                    'completed_at' => now()
                ]);

                \Log::info('Test submission completed', [
                    'attempt_id' => $testAttempt->id,
                    'score' => $testAttempt->score,
                    'correct_count' => $testAttempt->score, // Assuming score is correct_count for non-DISC
                    'total_questions' => $questions->count()
                ]);
            });

            // Send email notifications
            try {
                // Refresh the test attempt to get latest data
                $testAttempt->refresh();
                
                // Send email to user
                Mail::to($user->email)->send(new TestCompletionMail($testAttempt));

                // Send email to admin (get admin users)
                $adminUsers = User::where('role', 'admin')->get();
                foreach ($adminUsers as $admin) {
                    Mail::to($admin->email)->send(new AdminTestCompletionMail($testAttempt));
                }
            } catch (\Exception $e) {
                \Log::error('Failed to send email notifications', [
                    'attempt_id' => $testAttempt->id,
                    'error' => $e->getMessage()
                ]);
                // Don't fail the test submission if email fails
            }

            return response()->json([
                'message' => 'Test submitted successfully.',
                'score' => $testAttempt->fresh()->score,
                'total_questions' => $questions->count(),
                'completed_at' => $testAttempt->fresh()->completed_at
            ]);
        } catch (\Exception $e) {
            \Log::error('Test submission failed', [
                'attempt_id' => $testAttempt->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan hasil test.',
                'error' => 'submission_failed'
            ], 500);
        }
    }

    /**
     * Get test history for user
     */
    public function testHistory()
    {
        $user = Auth::user();
        
        $attempts = TestAttempt::with(['test'])
            ->forUser($user->id)
            ->completed()
            ->latest('completed_at')
            ->get();

        return response()->json($attempts);
    }

    /**
     * Get detailed attempt result
     */
    public function attemptResult($attemptId)
    {
        $user = Auth::user();
        $attempt = TestAttempt::with(['test', 'testAnswers.question'])
            ->where('id', $attemptId)
            ->where('user_id', $user->id)
            ->firstOrFail();
        return response()->json([
            'attempt' => $attempt,
        ]);
    }

    /**
     * Get all answers for a test attempt (for resume)
     */
    public function answersForAttempt(Request $request, Test $test)
    {
        $request->validate([
            'attempt_id' => 'required|integer|exists:test_attempts,id',
        ]);
        $user = Auth::user();
        $attempt = TestAttempt::where('id', $request->attempt_id)
            ->where('user_id', $user->id)
            ->where('test_id', $test->id)
            ->firstOrFail();
        $answers = $attempt->testAnswers()->get(['question_id', 'answer']);
        $result = [];
        foreach ($answers as $ans) {
            $result[$ans->question_id] = $ans->answer;
        }
        return response()->json($result);
    }


}


