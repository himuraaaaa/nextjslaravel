<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Mail\TestCompletionMail;
use App\Mail\AdminTestCompletionMail;
use Illuminate\Support\Facades\Mail;

class TestEmailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test {--user=} {--admin}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email functionality for test completion notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing email functionality...');

        // Get or create test data
        $user = $this->getTestUser();
        $test = $this->getTestData();
        
        // Create test attempt
        $testAttempt = TestAttempt::create([
            'user_id' => $user->id,
            'test_id' => $test->id,
            'attempt_number' => 1,
            'status' => 'completed',
            'score' => 80,
            'started_at' => now()->subMinutes(45),
            'completed_at' => now()
        ]);

        try {
            if ($this->option('admin')) {
                // Test admin email
                $this->info('Sending admin notification email...');
                Mail::to('admin@example.com')->send(new AdminTestCompletionMail($testAttempt));
                $this->info('✅ Admin email sent successfully!');
            } else {
                // Test user email
                $this->info('Sending user notification email...');
                Mail::to($user->email)->send(new TestCompletionMail($testAttempt));
                $this->info('✅ User email sent successfully!');
            }

            $this->info('📧 Email test completed!');
            $this->info('Check your email configuration and logs.');
            
            if (config('mail.default') === 'log') {
                $this->info('📝 Email content saved to: storage/logs/laravel.log');
            }

        } catch (\Exception $e) {
            $this->error('❌ Email test failed: ' . $e->getMessage());
            $this->error('Check your email configuration in .env file');
            return 1;
        }

        return 0;
    }

    private function getTestUser()
    {
        $email = $this->option('user') ?: 'test@example.com';
        
        return User::firstOrCreate(
            ['email' => $email],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'role' => 'user'
            ]
        );
    }

    private function getTestData()
    {
        return Test::firstOrCreate(
            ['title' => 'Test Email Test'],
            [
                'description' => 'Test untuk email functionality',
                'duration' => 60,
                'code' => 'EMAILTEST',
                'is_active' => true,
                'allowed_attempts' => 1
            ]
        );
    }
} 