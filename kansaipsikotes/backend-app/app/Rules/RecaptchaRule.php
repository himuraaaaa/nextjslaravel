<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecaptchaRule implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        try {
            $response = Http::timeout(10)
                ->withOptions([
                    'verify' => false, // Disable SSL verification for local development
                ])
                ->asForm()
                ->post('https://www.google.com/recaptcha/api/siteverify', [
                    'secret' => config('services.recaptcha.secret'),
                    'response' => $value,
                    'remoteip' => request()->ip(),
                ]);

            $body = $response->json();

            if (!$response->successful() || !isset($body['success']) || !$body['success']) {
                Log::error('reCAPTCHA validation failed', [
                    'response' => $body,
                    'status' => $response->status(),
                ]);
                $fail('The reCAPTCHA verification failed. Please try again.');
            }
        } catch (\Exception $e) {
            Log::error('reCAPTCHA validation error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            // For development, allow the request to proceed if reCAPTCHA fails
            if (app()->environment('local')) {
                Log::warning('Allowing reCAPTCHA bypass in local environment');
                return;
            }
            
            $fail('The reCAPTCHA verification failed. Please try again.');
        }
    }
} 