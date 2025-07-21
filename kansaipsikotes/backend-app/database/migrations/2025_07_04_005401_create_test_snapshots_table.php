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
        Schema::create('test_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_attempt_id')->constrained('test_attempts')->onDelete('cascade');
            $table->string('image_path');
            $table->string('image_url')->nullable();
            $table->integer('question_index')->nullable(); // Index soal saat snapshot diambil
            $table->integer('question_id')->nullable(); // ID soal saat snapshot diambil
            $table->text('user_answer_at_time')->nullable(); // Jawaban user saat snapshot
            $table->timestamp('taken_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_snapshots');
    }
};
