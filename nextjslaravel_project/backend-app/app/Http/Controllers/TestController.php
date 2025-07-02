<?php

namespace App\Http\Controllers;

use App\Models\Test;
use Illuminate\Http\Request;

class TestController extends Controller
{
    public function index()
    {
        return Test::with('questions')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'duration' => 'required|integer|min:1',
            'allowed_attempts' => 'required|integer|min:0',
            'code' => 'nullable|string|unique:tests,code',
            'status' => 'required|in:active,draft,archived',
        ]);

        return Test::create($data);
    }

    public function show(Test $test)
    {
        return $test->load('questions');
    }

    public function update(Request $request, Test $test)
    {
        $data = $request->validate([
            'title' => 'sometimes|string',
            'description' => 'nullable|string',
            'duration' => 'sometimes|integer|min:1',
            'allowed_attempts' => 'sometimes|integer|min:0',
            'code' => 'nullable|string|unique:tests,code,' . $test->id,
            'status' => 'sometimes|in:active,draft,archived',
        ]);

        $test->update($data);
        return $test;
    }

    public function destroy(Test $test)
    {
        $test->delete();
        return response()->json(['message' => 'Test deleted']);
    }
}

