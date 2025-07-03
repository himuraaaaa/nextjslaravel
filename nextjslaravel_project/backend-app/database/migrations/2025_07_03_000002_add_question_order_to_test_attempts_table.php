<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('test_attempts', function (Blueprint $table) {
            $table->text('question_order')->nullable()->after('last_question_id');
        });
    }

    public function down()
    {
        Schema::table('test_attempts', function (Blueprint $table) {
            $table->dropColumn('question_order');
        });
    }
}; 