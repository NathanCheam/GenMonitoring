<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('temps', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->time('heure');
            $table->decimal('valeur')->nullable();
            $table->foreignId('dept_id')->constrained('depts')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('temps');
    }
};
