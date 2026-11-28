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
        Schema::create('campus_locations', function (Blueprint $table) {

            // Primary key
            $table->id();

            // Parent location for hierarchical structure
            $table->foreignId('parent_location_id')
                ->nullable()
                ->constrained('campus_locations')
                ->restrictOnDelete();

            // Campus location details
            $table->string('name', 120);

            $table->string('location_type', 30);

            $table->text('description')->nullable();

            // Availability
            $table->boolean('is_active')->default(true);

            // Creation and modification timestamps
            $table->timestamps();

            // Indexes
            $table->index('location_type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campus_locations');
    }
};
