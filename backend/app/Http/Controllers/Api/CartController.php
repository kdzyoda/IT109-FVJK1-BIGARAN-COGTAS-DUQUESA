<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    private function getCart(Request $request): Cart
    {
        return Cart::firstOrCreate([
            'customer_id' => $request->user()->id,
        ]);
    }

    private function lockCart(Request $request): Cart
    {
        // Serialize cart modifications for this customer.
        User::whereKey($request->user()->id)
            ->lockForUpdate()
            ->firstOrFail();

        $cart = $this->getCart($request);

        return Cart::whereKey($cart->id)
            ->lockForUpdate()
            ->firstOrFail();
    }

    private function isAvailable(MenuItem $item): bool
    {
        return $item->availability_status === 'available'
            && $item->canteen?->status === 'active'
            && (
                $item->category_id === null ||
                (
                    $item->category?->is_active === true &&
                    (int) $item->category->canteen_id
                        === (int) $item->canteen_id
                )
            );
    }

    private function validateAvailability(MenuItem $item): void
    {
        if (!$this->isAvailable($item)) {
            throw ValidationException::withMessages([
                'menu_item_id' => [
                    'This menu item is currently unavailable.',
                ],
            ]);
        }
    }

    private function toCentavos(string $price): int
    {
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

    private function cartData(Cart $cart): array
    {
        $cart->load([
            'canteen:id,name,status',
            'items.menuItem.canteen',
            'items.menuItem.category',
        ]);

        $totalCentavos = 0;
        $canCheckout = $cart->items->isNotEmpty();

        $items = $cart->items->map(function ($item) use (
            &$totalCentavos,
            &$canCheckout
        ) {
            $menuItem = $item->menuItem;

            $unitPrice = $this->toCentavos(
                (string) $menuItem->price
            );

            $subtotal = $unitPrice * $item->quantity;
            $totalCentavos += $subtotal;

            $available = $this->isAvailable($menuItem);

            if (!$available) {
                $canCheckout = false;
            }

            return [
                'id' => $item->id,
                'menu_item_id' => $menuItem->id,
                'name' => $menuItem->name,
                'image_url' => $menuItem->image_url,
                'unit_price' => $this->formatMoney($unitPrice),
                'quantity' => $item->quantity,
                'subtotal' => $this->formatMoney($subtotal),
                'availability_status' =>
                    $menuItem->availability_status,
                'is_available' => $available,
            ];
        });

        return [
            'id' => $cart->id,
            'customer_id' => $cart->customer_id,
            'canteen_id' => $cart->canteen_id,
            'canteen' => $cart->canteen,
            'items' => $items,
            'total_items' => $cart->items->sum('quantity'),
            'subtotal' => $this->formatMoney($totalCentavos),
            'can_checkout' => $canCheckout,
        ];
    }

    public function show(Request $request)
    {
        $cart = $this->getCart($request);

        return response()->json([
            'success' => true,
            'data' => $this->cartData($cart),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'menu_item_id' => [
                'required',
                'integer',
                'exists:menu_items,id',
            ],
            'quantity' => [
                'required',
                'integer',
                'min:1',
                'max:99',
            ],
        ]);

        $data = DB::transaction(function () use (
            $request,
            $validated
        ) {
            $cart = $this->lockCart($request);

            $menuItem = MenuItem::with([
                'canteen',
                'category',
            ])->findOrFail($validated['menu_item_id']);

            $this->validateAvailability($menuItem);

            if (
                $cart->canteen_id !== null &&
                (int) $cart->canteen_id !==
                    (int) $menuItem->canteen_id
            ) {
                throw ValidationException::withMessages([
                    'menu_item_id' => [
                        'Your cart contains items from another canteen. Clear your cart before ordering from a different canteen.',
                    ],
                ]);
            }

            if ($cart->canteen_id === null) {
                $cart->update([
                    'canteen_id' => $menuItem->canteen_id,
                ]);
            }

            $cartItem = $cart->items()
                ->where('menu_item_id', $menuItem->id)
                ->first();

            if ($cartItem) {
                $newQuantity = $cartItem->quantity
                    + $validated['quantity'];

                if ($newQuantity > 99) {
                    throw ValidationException::withMessages([
                        'quantity' => [
                            'Maximum quantity per menu item is 99.',
                        ],
                    ]);
                }

                $cartItem->update([
                    'quantity' => $newQuantity,
                ]);
            } else {
                $cart->items()->create([
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $validated['quantity'],
                ]);
            }

            return $this->cartData($cart);
        });

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart successfully.',
            'data' => $data,
        ]);
    }

    public function update(Request $request, int $cartItem)
    {
        $validated = $request->validate([
            'quantity' => [
                'required',
                'integer',
                'min:1',
                'max:99',
            ],
        ]);

        $data = DB::transaction(function () use (
            $request,
            $cartItem,
            $validated
        ) {
            $cart = $this->lockCart($request);

            $item = $cart->items()
                ->with([
                    'menuItem.canteen',
                    'menuItem.category',
                ])
                ->findOrFail($cartItem);

            if ($validated['quantity'] > $item->quantity) {
                $this->validateAvailability($item->menuItem);
            }

            $item->update([
                'quantity' => $validated['quantity'],
            ]);

            return $this->cartData($cart);
        });

        return response()->json([
            'success' => true,
            'message' => 'Cart item updated successfully.',
            'data' => $data,
        ]);
    }

    public function destroy(Request $request, int $cartItem)
    {
        $data = DB::transaction(function () use (
            $request,
            $cartItem
        ) {
            $cart = $this->lockCart($request);

            $item = $cart->items()->findOrFail($cartItem);

            $item->delete();

            if (!$cart->items()->exists()) {
                $cart->update([
                    'canteen_id' => null,
                ]);
            }

            return $this->cartData($cart);
        });

        return response()->json([
            'success' => true,
            'message' => 'Cart item removed successfully.',
            'data' => $data,
        ]);
    }

    public function clear(Request $request)
    {
        $data = DB::transaction(function () use ($request) {
            $cart = $this->lockCart($request);

            $cart->items()->delete();

            $cart->update([
                'canteen_id' => null,
            ]);

            return $this->cartData($cart);
        });

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared successfully.',
            'data' => $data,
        ]);
    }
}
