<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_jobs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')
                ->unique()
                ->constrained('orders')
                ->restrictOnDelete();

            $table->foreignId('deliveryperson_id')
                ->nullable()
                ->constrained('users')
                ->restrictOnDelete();

            $table->enum('status', [
                'available',
                'claimed',
                'picked_up',
                'delivered',
                'cancelled',
            ])->default('available');

            $table->timestamp('claimed_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index(['deliveryperson_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_jobs');
    }
};
