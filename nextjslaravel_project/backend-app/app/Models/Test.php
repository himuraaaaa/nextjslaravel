<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Test extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 
        'description', 
        'duration', 
        'allowed_attempts', 
        'code',
        'status',
        'created_by'
    ];

    protected $casts = [
        'duration' => 'integer',
        'allowed_attempts' => 'integer',
    ];

    // Relationships
    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function testAttempts()
    {
        return $this->hasMany(TestAttempt::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Helper methods
    public function isActive()
    {
        return $this->status === 'active';
    }

    public function hasUnlimitedAttempts()
    {
        return $this->allowed_attempts === 0;
    }

    public function hasCode()
    {
        return !empty($this->code);
    }

    public function validateCode($inputCode)
    {
        if (!$this->hasCode()) {
            return true; // No code required
        }
        
        return strtolower(trim($this->code)) === strtolower(trim($inputCode));
    }

    public function getCodeHint()
    {
        if (!$this->hasCode()) {
            return null;
        }
        
        // Return first and last character with asterisks in between
        $code = $this->code;
        if (strlen($code) <= 2) {
            return str_repeat('*', strlen($code));
        }
        
        return $code[0] . str_repeat('*', strlen($code) - 2) . $code[strlen($code) - 1];
    }
}
