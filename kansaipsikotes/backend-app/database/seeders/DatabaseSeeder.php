<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        \App\Models\User::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test1@example.com',
            'password' => bcrypt('test123'),
            'role' => 'user',
        ]);
        // Akun admin default
        \App\Models\User::create([
            'name' => 'Fayyadh Abdillah',
            'email' => 'xzanovpro14@gmail.com',
            'password' => bcrypt('game12345678'),
            'role' => 'admin',
        ]);
        // Seeder test multiple choice dengan opsi jawaban teks panjang
        $test = \App\Models\Test::create([
            'title' => 'Tes Opsi Panjang',
            'description' => 'Contoh test dengan opsi jawaban berupa teks panjang.',
            'duration' => 30,
            'allowed_attempts' => 2,
            'code' => null,
            'status' => 'active',
        ]);
        \App\Models\Question::create([
            'test_id' => $test->id,
            'question_text' => 'Pilih jawaban yang paling sesuai:',
            'question_type' => 'multiple_choice',
            'options' => [
                'Opsi A: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi vel consectetur euismod, nisl nisi consectetur nisi, euismod euismod nisi nisi euismod nisi.',
                'Opsi B: Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. In condimentum facilisis porta.',
                'Opsi C: Sed nec diam eu diam mattis viverra. Nulla fringilla, orci ac euismod semper, magna diam.',
                'Opsi D: Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.'
            ],
            'correct_answer' => 1,
        ]);
    }
}
