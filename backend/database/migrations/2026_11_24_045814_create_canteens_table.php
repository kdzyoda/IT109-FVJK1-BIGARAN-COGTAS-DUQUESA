<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('canteens', function (Blueprint $table) {

            // Primary key
            $table->id();

            // Vendor assigned to the canteen
            $table->foreignId('vendor_id')
                ->constrained('users')
                ->restrictOnDelete();

            // Physical campus location
            $table->foreignId('campus_location_id')
                ->constrained('campus_locations')
                ->restrictOnDelete();

            // Canteen information
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->string('contact_number', 20)->nullable();

            // Address and logo references
            $table->string('physical_address', 255)->nullable();
            $table->string('logo_url', 255)->nullable();

            // Approval and operating status
            $table->string('status', 20)->default('pending');

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->restrictOnDelete();

            $table->timestamp('approved_at')->nullable();

            // Audit timestamps
            $table->timestamps();

            // Performance indexes
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('canteens');
    }
};
