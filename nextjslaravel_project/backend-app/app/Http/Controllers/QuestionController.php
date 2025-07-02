<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        $query = Question::with('test');
        if ($request->has('test_id')) {
            $query->where('test_id', $request->test_id);
        }
        return $query->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'test_id' => 'required|exists:tests,id',
            'question_text' => 'required|string',
            'question_image_url' => 'nullable|string|max:2048',
            'question_type' => 'required|in:multiple_choice,true_false,essay',
            'points' => 'required|integer|min:1',
            'options' => ['required_if:question_type,multiple_choice', 'array', 'min:2'],
            'options.*.text' => ['nullable', 'string'],
            'options.*.image_url' => ['nullable', 'string', 'max:2048'],
            'correct_answer' => ['required_if:question_type,multiple_choice,true_false', 'string'],
        ]);

        if ($data['question_type'] === 'multiple_choice') {
            $options = $data['options'];
            $correctIndex = (int) $data['correct_answer'];
            if (!isset($options[$correctIndex])) {
                return response()->json(['message' => 'Jawaban benar harus salah satu dari opsi yang diberikan.'], 422);
            }
        }

        $question = Question::create($data);
        return response()->json($question, 201);
    }

    public function show(Question $question)
    {
        return $question->load('test');
    }

    public function update(Request $request, Question $question)
    {
        $data = $request->validate([
            'question_text' => 'sometimes|string',
            'question_image_url' => 'nullable|string|max:2048',
            'question_type' => 'sometimes|in:multiple_choice,true_false,essay',
            'points' => 'sometimes|integer|min:1',
            'options' => ['sometimes', 'required_if:question_type,multiple_choice', 'array', 'min:2'],
            'options.*.text' => ['nullable', 'string'],
            'options.*.image_url' => ['nullable', 'string', 'max:2048'],
            'correct_answer' => ['sometimes', 'required_if:question_type,multiple_choice,true_false', 'string', 'nullable'],
        ]);
        $type = $data['question_type'] ?? $question->question_type;
        if ($type === 'multiple_choice') {
            $options = $data['options'] ?? $question->options;
            $correctIndex = isset($data['correct_answer']) ? (int) $data['correct_answer'] : null;
            if ($correctIndex === null || !isset($options[$correctIndex])) {
                return response()->json(['message' => 'Jawaban benar harus salah satu dari opsi yang diberikan.'], 422);
            }
        }
        $question->update($data);
        return response()->json($question);
    }

    public function destroy(Question $question)
    {
        $question->delete();
        return response()->json(['message' => 'Soal berhasil dihapus']);
    }
    
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
        $path = $request->file('image')->store('questions', 'public');
            \Log::info('File stored', ['path' => $path]);
        $url = asset('storage/' . $path);
        return response()->json(['url' => $url]);
        } catch (\Exception $e) {
            \Log::error('Upload image failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Gagal upload gambar', 'error' => $e->getMessage()], 500);
        }
    }
}
