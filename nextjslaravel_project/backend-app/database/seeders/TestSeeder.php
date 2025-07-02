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
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Create regular user
        $user = User::create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
            'created_by' => $admin->id,
        ]);

        // Create test
        $test = Test::create([
            'title' => 'Sample Test - Programming Basics',
            'description' => 'Test dasar pemrograman untuk mengukur pemahaman konsep fundamental.',
            'duration' => 30, // 30 minutes
            'allowed_attempts' => 2,
            'code' => 'PROG123',
            'status' => 'active',
            'created_by' => $admin->id,
        ]);

        // Create questions
        $questions = [
            [
                'question_text' => 'Apa yang dimaksud dengan variabel dalam pemrograman?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => 'Tempat penyimpanan data sementara',
                    'B' => 'Jenis data',
                    'C' => 'Fungsi program',
                    'D' => 'Loop statement'
                ],
                'correct_answer' => 'A'
            ],
            [
                'question_text' => 'Manakah yang merupakan tipe data integer?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => '"Hello World"',
                    'B' => '3.14',
                    'C' => '42',
                    'D' => 'true'
                ],
                'correct_answer' => 'C'
            ],
            [
                'question_text' => 'Apa fungsi dari loop dalam pemrograman?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => 'Menyimpan data',
                    'B' => 'Mengulang eksekusi kode',
                    'C' => 'Mendeklarasikan variabel',
                    'D' => 'Menampilkan output'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question_text' => 'Jelaskan perbedaan antara array dan object dalam pemrograman.',
                'question_type' => 'essay',
                'options' => null,
                'correct_answer' => null
            ],
            [
                'question_text' => 'Apa output dari kode berikut: console.log(2 + "2")?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => '4',
                    'B' => '22',
                    'C' => 'Error',
                    'D' => 'undefined'
                ],
                'correct_answer' => 'B'
            ]
        ];

        foreach ($questions as $questionData) {
            Question::create([
                'test_id' => $test->id,
                'question_text' => $questionData['question_text'],
                'question_type' => $questionData['question_type'],
                'options' => $questionData['options'],
                'correct_answer' => $questionData['correct_answer'],
            ]);
        }

        // Create another test
        $test2 = Test::create([
            'title' => 'Sample Test - Web Development',
            'description' => 'Test untuk mengukur pengetahuan dasar web development.',
            'duration' => 45, // 45 minutes
            'allowed_attempts' => 0, // unlimited attempts
            'code' => null, // No code required
            'status' => 'active',
            'created_by' => $admin->id,
        ]);

        $webQuestions = [
            [
                'question_text' => 'Apa kepanjangan dari HTML?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => 'HyperText Markup Language',
                    'B' => 'High Tech Modern Language',
                    'C' => 'Home Tool Markup Language',
                    'D' => 'Hyperlink and Text Markup Language'
                ],
                'correct_answer' => 'A'
            ],
            [
                'question_text' => 'Tag HTML manakah yang digunakan untuk membuat paragraf?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => '<p>',
                    'B' => '<paragraph>',
                    'C' => '<text>',
                    'D' => '<div>'
                ],
                'correct_answer' => 'A'
            ],
            [
                'question_text' => 'Jelaskan perbedaan antara GET dan POST method dalam HTTP.',
                'question_type' => 'essay',
                'options' => null,
                'correct_answer' => null
            ]
        ];

        foreach ($webQuestions as $questionData) {
            Question::create([
                'test_id' => $test2->id,
                'question_text' => $questionData['question_text'],
                'question_type' => $questionData['question_type'],
                'options' => $questionData['options'],
                'correct_answer' => $questionData['correct_answer'],
            ]);
        }

        $this->command->info('Test data seeded successfully!');
        $this->command->info('Admin: admin@example.com / password');
        $this->command->info('User: user@example.com / password');
    }
} 