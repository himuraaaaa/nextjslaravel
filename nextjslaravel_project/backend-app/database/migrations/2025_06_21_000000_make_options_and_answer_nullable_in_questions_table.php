<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->json('options')->nullable()->change();
            $table->string('correct_answer')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            // Reverting this might be tricky if data that doesn't conform
            // to the original constraints has been added.
            // For simplicity, we'll just change the column type back,
            // but in a real-world scenario, you'd need to handle data cleanup.
            $table->json('options')->nullable(false)->change();
            $table->string('correct_answer')->nullable(false)->change();
        });
    }
}; 