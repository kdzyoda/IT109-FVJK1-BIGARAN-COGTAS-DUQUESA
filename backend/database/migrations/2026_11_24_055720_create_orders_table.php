<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->string('order_number', 50)->unique();

            $table->foreignId('customer_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('canteen_id')
                ->constrained('canteens')
                ->restrictOnDelete();

            $table->foreignId('user_address_id')
                ->nullable()
                ->constrained('user_addresses')
                ->nullOnDelete();

            $table->foreignId('campus_location_id')
                ->constrained('campus_locations')
                ->restrictOnDelete();

            $table->string('recipient_name', 150);
            $table->string('contact_number', 30);
            $table->text('delivery_address');
            $table->text('delivery_instructions')->nullable();

            $table->decimal('subtotal', 12, 2);
            $table->decimal('delivery_fee', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);

            $table->enum('status', [
                'pending',
                'accepted',
                'preparing',
                'ready_for_pickup',
                'out_for_delivery',
                'delivered',
                'cancelled',
                'rejected',
            ])->default('pending');

            $table->text('customer_notes')->nullable();
            $table->text('cancellation_reason')->nullable();

            $table->timestamp('placed_at');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['canteen_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
