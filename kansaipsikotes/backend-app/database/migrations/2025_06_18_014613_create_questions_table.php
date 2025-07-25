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
        Schema::create('questions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('test_id')->constrained()->onDelete('cascade');
        $table->text('question_text');
        $table->string('question_image')->nullable()->comment('URL gambar soal');
        $table->json('options'); // e.g. ["A", "B", "C", "D"]
        $table->string('correct_answer'); // e.g. "A"
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
