<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\TestAttempt;

class AdminTestCompletionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $testAttempt;
    public $test;
    public $user;
    public $score;
    public $totalQuestions;
    public $correctAnswers;
    public $completionTime;

    /**
     * Create a new message instance.
     */
    public function __construct(TestAttempt $testAttempt)
    {
        $this->testAttempt = $testAttempt;
        $this->test = $testAttempt->test;
        $this->user = $testAttempt->user;
        
        // Calculate score details
        $this->totalQuestions = $this->test->questions()->count();
        $this->correctAnswers = $this->testAttempt->testAnswers()->where('is_correct', true)->count();
        $this->score = $this->testAttempt->score ?? 0;
        
        // Calculate completion time
        $startTime = \Carbon\Carbon::parse($this->testAttempt->started_at);
        $endTime = \Carbon\Carbon::parse($this->testAttempt->completed_at);
        $this->completionTime = $endTime->diffInMinutes($startTime);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Notifikasi: User Menyelesaikan Test - ' . $this->test->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-test-completion',
            with: [
                'user' => $this->user,
                'test' => $this->test,
                'testResult' => $this->testAttempt,
                'score' => $this->score,
                'totalQuestions' => $this->totalQuestions,
                'correctAnswers' => $this->correctAnswers,
                'completionTime' => $this->completionTime,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
} 