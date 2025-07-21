<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Test;
use App\Models\Question;
use Illuminate\Support\Str;

class TestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user (jika belum ada)
        $admin = \App\Models\User::firstOrCreate([
            'email' => 'admin@example.com',
        ], [
            'name' => 'Admin User',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Buat 60 test
        for ($i = 1; $i <= 60; $i++) {
            $test = \App\Models\Test::create([
                'title' => 'Test ' . $i,
                'description' => 'Deskripsi untuk Test ' . $i,
                'duration' => rand(20, 90),
                'allowed_attempts' => rand(1, 3),
                'code' => null,
                'status' => 'active',
                'created_by' => $admin->id,
            ]);

            // Buat 3 soal dummy untuk setiap test
            for ($j = 1; $j <= 3; $j++) {
                $opsi = [
                    'A' => 'Opsi A soal ' . $j,
                    'B' => 'Opsi B soal ' . $j,
                    'C' => 'Opsi C soal ' . $j,
                    'D' => 'Opsi D soal ' . $j,
                ];
                \App\Models\Question::create([
                    'test_id' => $test->id,
                    'question_text' => "Soal ke-$j untuk Test $i",
                    'question_type' => 'multiple_choice',
                    'options' => $opsi,
                    'correct_answer' => array_rand($opsi),
                ]);
            }
        }
        $this->command->info('Seeder 60 test + 3 soal per test selesai!');
    }
} 