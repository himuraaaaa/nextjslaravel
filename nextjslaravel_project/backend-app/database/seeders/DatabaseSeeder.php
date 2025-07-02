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
    }
}
