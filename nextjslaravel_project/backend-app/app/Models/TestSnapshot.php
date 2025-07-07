<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestSnapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_attempt_id',
        'image_path',
        'image_url',
        'question_index',
        'question_id',
        'user_answer_at_time',
        'taken_at'
    ];

    protected $casts = [
        'taken_at' => 'datetime',
        'user_answer_at_time' => 'array'
    ];

    public function testAttempt()
    {
        return $this->belongsTo(TestAttempt::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
