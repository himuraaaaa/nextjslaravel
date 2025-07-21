<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\TestExecutionController;
use App\Http\Controllers\TestAnswerController;
use App\Http\Controllers\AdminReportController;
use App\Http\Controllers\SnapshotController;
use App\Http\Controllers\ChatController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Test endpoint
Route::get('/test', function () {
    return response()->json(['message' => 'Backend is working!']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Route untuk mendapatkan daftar test yang tersedia
Route::middleware('auth:sanctum')->get('/tests', [TestExecutionController::class, 'availableTests']);

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/tests', [TestController::class, 'index']);
    Route::post('/tests', [TestController::class, 'store']);
    Route::get('/tests/{test}', [TestController::class, 'show']);
    Route::put('/tests/{test}', [TestController::class, 'update']);
    Route::delete('/tests/{test}', [TestController::class, 'destroy']);
    Route::post('/tests/bulk-delete', [TestController::class, 'bulkDelete']);
    Route::post('/tests/bulk-update-status', [TestController::class, 'bulkUpdateStatus']);
    
    Route::get('/questions', [QuestionController::class, 'index']);
    Route::post('/questions', [QuestionController::class, 'store']);
    Route::post('/upload-image', [QuestionController::class, 'uploadImage']);
    Route::get('/questions/{question}', [QuestionController::class, 'show']);
    Route::put('/questions/{question}', [QuestionController::class, 'update']);
    Route::delete('/questions/{question}', [QuestionController::class, 'destroy']);

    Route::get('/results', [AdminReportController::class, 'getAllResults']);
    Route::get('/results/{attemptId}', [AdminReportController::class, 'getAttemptDetail']);
    Route::get('/test-summary', [AdminReportController::class, 'getTestResultsSummary']);
    Route::get('/user-summary', [AdminReportController::class, 'getUserResultsSummary']);
    Route::get('/statistics', [AdminReportController::class, 'getOverallStatistics']);
    Route::get('/question-analysis', [AdminReportController::class, 'getQuestionAnalysis']);
    Route::get('/export-results', [AdminReportController::class, 'exportResults']);
    Route::get('/users', [AuthController::class, 'adminGetUsers']);
    Route::post('/users', [AuthController::class, 'adminCreateUser']);
    Route::get('/users/{id}', [AuthController::class, 'adminGetUser']);
    Route::put('/users/{id}', [AuthController::class, 'adminUpdateUser']);
    Route::delete('/users/{id}', [AuthController::class, 'adminDeleteUser']);
    Route::get('/tests/{test}/review-questions', [AdminReportController::class, 'getReviewQuestions']);
    
    // User attempts management routes
    Route::get('/user-attempts', [AdminReportController::class, 'getUserTestAttempts']);
    Route::post('/reset-user-attempts', [AdminReportController::class, 'resetUserAttempts']);
    Route::get('/users-attempts-summary', [AdminReportController::class, 'getUsersAttemptsSummary']);
    Route::post('/give-extra-attempts', [AdminReportController::class, 'giveExtraAttempts']);
    Route::get('/snapshots/{attemptId}', [SnapshotController::class, 'getSnapshots']);
    Route::get('/user-snapshots/{userId}', [AdminReportController::class, 'getUserSnapshots']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/available-tests', [TestExecutionController::class, 'availableTests']);
    Route::get('/tests/{test}/questions', [TestExecutionController::class, 'testQuestions']);
    Route::post('/tests/{test}/validate-code', [TestExecutionController::class, 'validateTestCode']);
    Route::post('/tests/{test}/start', [TestExecutionController::class, 'startTest']);
    Route::post('/tests/{test}/auto-save', [TestExecutionController::class, 'autoSaveAnswer']);
    Route::post('/tests/{test}/submit', [TestExecutionController::class, 'submitTest']);

    Route::get('/test-history', [TestExecutionController::class, 'testHistory']);
    Route::get('/attempt-result/{attemptId}', [TestExecutionController::class, 'attemptResult']);
    Route::get('/tests/{test}/answers', [TestExecutionController::class, 'answersForAttempt']);
    Route::post('/upload-snapshot', [SnapshotController::class, 'uploadSnapshot']);
});

// Chat routes
Route::post('/chat', [ChatController::class, 'store']);
Route::get('/chat/history', [ChatController::class, 'history']);
Route::get('/chat-users', [ChatController::class, 'chatUsers']);

