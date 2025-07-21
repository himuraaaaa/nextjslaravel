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
        Schema::dropIfExists('video_recordings');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('video_recordings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_attempt_id')->constrained('test_attempts')->onDelete('cascade');
            $table->string('video_path');
            $table->string('video_url')->nullable();
            $table->integer('duration')->nullable(); // in seconds
            $table->string('file_size')->nullable();
            $table->timestamps();
        });
    }
};
