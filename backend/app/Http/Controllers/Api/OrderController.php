<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Canteen;
use App\Models\CampusLocation;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{

    private function toCentavos(string $price): int
    {
        if (!preg_match('/^\d+(?:\.\d{1,2})?$/D', $price)) {
            return 0;
        }

        $parts = explode('.', $price, 2);
        return ((int) $parts[0] * 100)
            + (int) str_pad($parts[1] ?? '', 2, '0');
    }

    private function formatMoney(int $centavos): string
    {
        return intdiv($centavos, 100)
            . '.'
            . str_pad(
                (string) ($centavos % 100),
                2,
                '0',
                STR_PAD_LEFT
            );
    }

    private function orderDetails(Order $order): Order
    {
        return $order->load([
            'items',
            'canteen:id,name,status',
            'customer:id,name,username',
            'campusLocation',
            'statusHistory',
        ]);
    }

    private function accessibleOrders(Request $request)
    {
        $user = $request->user();
        return match ($user->role) {
            'admin' => Order::query(),
            'customer' => Order::where(
                'customer_id',
                $user->id
            ),
            'vendor' => Order::whereHas(
                'canteen',
                fn ($query) => $query->where(
                    'vendor_id',
                    $user->id
                )
            ),
            default => abort(403, 'Unauthorized access.'),
        };
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => [
                'sometimes',
                Rule::in([
                    'pending',
                    'accepted',
                    'preparing',
                    'ready_for_pickup',
                    'out_for_delivery',
                    'delivered',
                    'cancelled',
                    'rejected',
                ]),
            ],
        ]);
        $orders = $this->accessibleOrders($request)
            ->with([
                'canteen:id,name',
                'customer:id,name,username',
            ])
            ->withCount('items')
            ->when(
                isset($validated['status']),
                fn ($query) => $query->where(
                    'status',
                    $validated['status']
                )
            )
            ->latest('id')
            ->paginate(15);
        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function show(Request $request, int $order)
    {
        $record = $this->accessibleOrders($request)
            ->findOrFail($order);
        return response()->json([
            'success' => true,
            'data' => $this->orderDetails($record),
        ]);
    }

    public function checkout(Request $request)
    {
        abort_unless(
            $request->user()->role === 'customer',
            403,
            'Only customers can place orders.'
        );

        $validated = $request->validate([
            'user_address_id' => [
                'required',
                'integer',
                'min:1',
            ],
            'customer_notes' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);
        $order = DB::transaction(function () use (
            $request,
            $validated
        ) {
            $customer = User::whereKey($request->user()->id)
                ->lockForUpdate()
                ->firstOrFail();
            $address = $customer->addresses()
                ->findOrFail($validated['user_address_id']);
            $location = CampusLocation::whereKey(
                $address->campus_location_id
            )->lockForUpdate()->firstOrFail();
            if (!$location->is_active) {
                throw ValidationException::withMessages([
                    'user_address_id' => [
                        'The selected campus location is inactive.',
                    ],
                ]);
            }
            $cart = Cart::where('customer_id', $customer->id)
                ->lockForUpdate()
                ->first();
            if (!$cart || !$cart->canteen_id) {
                throw ValidationException::withMessages([
                    'cart' => ['Your shopping cart is empty.'],
                ]);
            }
            $cartItems = $cart->items()
                ->orderBy('menu_item_id')
                ->lockForUpdate()
                ->get();
            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => ['Your shopping cart is empty.'],
                ]);
            }
            $canteen = Canteen::whereKey($cart->canteen_id)
                ->lockForUpdate()
                ->firstOrFail();
            if ($canteen->status !== 'active') {
                throw ValidationException::withMessages([
                    'cart' => ['This canteen is unavailable.'],
                ]);
            }
            $subtotal = 0;
            $orderItems = [];
            foreach ($cartItems as $cartItem) {
                $menuItem = MenuItem::whereKey(
                    $cartItem->menu_item_id
                )->lockForUpdate()->firstOrFail();
                if (
                    (int) $menuItem->canteen_id !==
                        (int) $canteen->id ||
                    $menuItem->availability_status !== 'available'
                ) {
                    throw ValidationException::withMessages([
                        'cart' => [
                            $menuItem->name . ' is unavailable.',
                        ],
                    ]);
                }
                if ($menuItem->category_id !== null) {
                    $category = MenuCategory::whereKey(
                        $menuItem->category_id
                    )->lockForUpdate()->first();
                    if (
                        !$category ||
                        !$category->is_active ||
                        (int) $category->canteen_id !==
                            (int) $canteen->id
                    ) {
                        throw ValidationException::withMessages([
                            'cart' => [
                                $menuItem->name . ' is unavailable.',
                            ],
                        ]);
                    }
                }
                if (
                    $cartItem->quantity < 1 ||
                    $cartItem->quantity > 99
                ) {
                    throw ValidationException::withMessages([
                        'cart' => ['Invalid item quantity.'],
                    ]);
                }
                $unitPrice = $this->toCentavos((string) $menuItem->price);

                if ($unitPrice <= 0) {
                    throw ValidationException::withMessages([
                        'cart' => [$menuItem->name . ' has an invalid price.'],
                    ]);
                }

                $lineTotal = $unitPrice * $cartItem->quantity;

                $subtotal += $lineTotal;
                $orderItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'item_name' => $menuItem->name,
                    'unit_price' => $this->formatMoney($unitPrice),
                    'quantity' => $cartItem->quantity,
                    'subtotal' => $this->formatMoney($lineTotal),
                ];
            }
            // No delivery fee policy for Activity 1.
            $deliveryFee = 0;
            $total = $subtotal + $deliveryFee;
            if ($total > 999999999999) {
                throw ValidationException::withMessages([
                    'cart' => ['Order total exceeds the allowed limit.'],
                ]);
            }
            $order = Order::create([
                'order_number' => 'PG-' . Str::ulid(),
                'customer_id' => $customer->id,
                'canteen_id' => $canteen->id,
                'user_address_id' => $address->id,
                'campus_location_id' => $location->id,
                'recipient_name' => $address->recipient_name,
                'contact_number' => $address->contact_number,
                'delivery_address' => $location->name
                    . ' - ' . $address->address_details,
                'delivery_instructions' =>
                    $address->delivery_instructions,
                'subtotal' => $this->formatMoney($subtotal),
                'delivery_fee' => $this->formatMoney($deliveryFee),
                'total_amount' => $this->formatMoney($total),
                'status' => 'pending',
                'customer_notes' =>
                    $validated['customer_notes'] ?? null,
                'placed_at' => now(),
            ]);
            $order->items()->createMany($orderItems);
            $order->statusHistory()->create([
                'changed_by' => $customer->id,
                'previous_status' => null,
                'new_status' => 'pending',
                'remarks' => 'Order placed by customer.',
            ]);
            $cart->items()->delete();
            $cart->update([
                'canteen_id' => null,
            ]);
            return $this->orderDetails($order);
        }, 3);
        return response()->json([
            'success' => true,
            'message' => 'Order placed successfully.',
            'data' => $order,
        ], 201);
    }

    public function cancel(Request $request, int $order)
    {
        abort_unless(
            $request->user()->role === 'customer',
            403,
            'Only customers can cancel orders.'
        );

        $validated = $request->validate([
            'reason' => [
                'required',
                'string',
                'max:2000',
            ],
        ]);
        $record = DB::transaction(function () use (
            $request,
            $order,
            $validated
        ) {
            $record = Order::where(
                'customer_id',
                $request->user()->id
            )->whereKey($order)
                ->lockForUpdate()
                ->firstOrFail();
            if ($record->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => [
                        'Only pending orders can be cancelled.',
                    ],
                ]);
            }
            $record->update([
                'status' => 'cancelled',
                'cancellation_reason' => $validated['reason'],
                'cancelled_at' => now(),
            ]);
            $record->statusHistory()->create([
                'changed_by' => $request->user()->id,
                'previous_status' => 'pending',
                'new_status' => 'cancelled',
                'remarks' => $validated['reason'],
            ]);
            return $this->orderDetails($record);
        }, 3);
        return response()->json([
            'success' => true,
            'message' => 'Order cancelled successfully.',
            'data' => $record,
        ]);
    }

    public function updateStatus(Request $request, int $order)
    {
        abort_unless(
            $request->user()->role === 'vendor',
            403,
            'Only vendors can update order preparation status.'
        );

        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'accepted',
                    'preparing',
                    'ready_for_pickup',
                    'rejected',
                ]),
            ],
            'remarks' => [
                'required_if:status,rejected',
                'nullable',
                'string',
                'max:2000',
            ],
        ]);
        $record = DB::transaction(function () use (
            $request,
            $order,
            $validated
        ) {
            $record = $this->accessibleOrders($request)
                ->whereKey($order)
                ->lockForUpdate()
                ->firstOrFail();
            $previousStatus = $record->status;
            $newStatus = $validated['status'];
            $allowedTransitions = [
                'pending' => ['accepted', 'rejected'],
                'accepted' => ['preparing'],
                'preparing' => ['ready_for_pickup'],
            ];
            if (!in_array(
                $newStatus,
                $allowedTransitions[$previousStatus] ?? [],
                true
            )) {
                throw ValidationException::withMessages([
                    'status' => [
                        'Invalid order status transition.',
                    ],
                ]);
            }
            $updates = ['status' => $newStatus];
            if ($newStatus === 'accepted') {
                $updates['accepted_at'] = now();
            }
            if ($newStatus === 'rejected') {
                $updates['cancellation_reason'] =
                    $validated['remarks'];
            }
            $record->update($updates);

            if ($newStatus === 'ready_for_pickup') {
                $record->deliveryJob()->firstOrCreate([], [
                    'status' => 'available',
                ]);
            }

            $record->statusHistory()->create([
                'changed_by' => $request->user()->id,
                'previous_status' => $previousStatus,
                'new_status' => $newStatus,
                'remarks' => $validated['remarks'] ?? null,
            ]);
            return $this->orderDetails($record);
        }, 3);
        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully.',
            'data' => $record,
        ]);
    }
}

