<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_id', 
        'question_text', 
        'question_image_url',
        'question_type',
        'options', 
        'correct_answer'
    ];

    protected $casts = [
        'options' => 'array',
    ];

    // Custom accessor to ensure options is always an array
    public function getOptionsAttribute($value)
    {
        if (is_null($value)) {
            return [];
        }
        
        // If it's already an array, return it
        if (is_array($value)) {
            return $value;
        }
        
        // If it's a JSON string, decode it
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }
        
        return [];
    }

    // Custom mutator to handle options setting
    public function setOptionsAttribute($value)
    {
        if (is_null($value) || empty($value)) {
            $this->attributes['options'] = null;
        } else {
            $this->attributes['options'] = is_array($value) ? json_encode($value) : $value;
        }
    }

    // Relationships
    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    public function testAnswers()
    {
        return $this->hasMany(TestAnswer::class);
    }

    // Helper methods
    public function isMultipleChoice()
    {
        return $this->question_type === 'multiple_choice';
    }

    public function isEssay()
    {
        return $this->question_type === 'essay';
    }

    public function checkAnswer($userAnswer)
    {
        if ($this->isEssay()) {
            return null; // Essay questions need manual grading
        }
        if ($this->isMultipleChoice()) {
            // Jawaban user dan correct_answer sama-sama index (string/number)
            return (string)$this->correct_answer === (string)$userAnswer;
        }
        // true_false
        return $this->correct_answer === $userAnswer;
    }
}
