<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('canteen_id')
                ->constrained('canteens')
                ->restrictOnDelete();

            $table->foreignId('category_id')
                ->nullable()
                ->constrained('menu_categories')
                ->nullOnDelete();

            $table->string('name', 150);
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('image_url', 2048)->nullable();

            $table->enum('availability_status', [
                'available',
                'unavailable',
                'sold_out'
            ])->default('available');

            $table->timestamps();

            $table->index(['canteen_id', 'availability_status']);
            $table->index(['category_id', 'availability_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
