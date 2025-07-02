<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TestAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'test_id',
        'attempt_number',
        'status',
        'score',
        'started_at',
        'completed_at'
    ];

    protected $casts = [
        'attempt_number' => 'integer',
        'score' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    public function testAnswers()
    {
        return $this->hasMany(TestAnswer::class, 'attempt_id');
    }

    // Scopes
    public function scopeStarted($query)
    {
        return $query->where('status', 'started');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForTest($query, $testId)
    {
        return $query->where('test_id', $testId);
    }

    // Helper methods
    public function isStarted()
    {
        return $this->status === 'started';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now()
        ]);
    }

    public function getDurationInSeconds()
    {
        if (!$this->started_at || !$this->completed_at) {
            return 0;
        }
        
        return $this->started_at->diffInSeconds($this->completed_at);
    }

    public function getFormattedDuration()
    {
        $seconds = $this->getDurationInSeconds();
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $secs = $seconds % 60;
        
        if ($hours > 0) {
            return sprintf('%02d:%02d:%02d', $hours, $minutes, $secs);
        }
        
        return sprintf('%02d:%02d', $minutes, $secs);
    }
} 