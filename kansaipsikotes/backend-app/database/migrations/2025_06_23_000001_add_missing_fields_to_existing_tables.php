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
        // Add missing fields to users table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'created_by')) {
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            }
        });

        // Add missing fields to tests table
        Schema::table('tests', function (Blueprint $table) {
            if (!Schema::hasColumn('tests', 'code')) {
                $table->string('code')->nullable()->unique()->after('allowed_attempts');
            }
            if (!Schema::hasColumn('tests', 'created_by')) {
                // First add as nullable, then we can update with default values
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('cascade')->after('status');
            }
        });

        // Clean up questions table - remove old fields if they exist
        Schema::table('questions', function (Blueprint $table) {
            if (Schema::hasColumn('questions', 'question_image')) {
                $table->dropColumn('question_image');
            }
            if (Schema::hasColumn('questions', 'points')) {
                $table->dropColumn('points');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove fields from users table
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'created_by')) {
                $table->dropForeign(['created_by']);
                $table->dropColumn('created_by');
            }
        });

        // Remove fields from tests table
        Schema::table('tests', function (Blueprint $table) {
            if (Schema::hasColumn('tests', 'code')) {
                $table->dropColumn('code');
            }
            if (Schema::hasColumn('tests', 'created_by')) {
                $table->dropForeign(['created_by']);
                $table->dropColumn('created_by');
            }
        });
    }
}; 