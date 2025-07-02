<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TestAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'attempt_id',
        'question_id',
        'answer',
        'is_correct'
    ];

    protected $casts = [
        'is_correct' => 'boolean',
    ];

    // Relationships
    public function testAttempt()
    {
        return $this->belongsTo(TestAttempt::class, 'attempt_id');
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    // Helper methods
    public function isCorrect()
    {
        return $this->is_correct === true;
    }

    public function isIncorrect()
    {
        return $this->is_correct === false;
    }

    public function needsManualGrading()
    {
        return $this->is_correct === null;
    }
} 