<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('test_attempts', function (Blueprint $table) {
            $table->unsignedBigInteger('last_question_id')->nullable()->after('status');
            $table->integer('last_question_index')->nullable()->after('last_question_id');
        });
    }

    public function down()
    {
        Schema::table('test_attempts', function (Blueprint $table) {
            $table->dropColumn('last_question_id');
            $table->dropColumn('last_question_index');
        });
    }
}; 