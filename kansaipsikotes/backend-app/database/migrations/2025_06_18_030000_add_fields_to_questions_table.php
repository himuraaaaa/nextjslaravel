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
            $table->string('question_type')->default('multiple_choice')->after('question_text');
            $table->integer('points')->default(1)->after('question_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            if (Schema::hasColumn('questions', 'question_type')) {
                $table->dropColumn('question_type');
            }
            if (Schema::hasColumn('questions', 'points')) {
                $table->dropColumn('points');
            }
        });
    }
}; 