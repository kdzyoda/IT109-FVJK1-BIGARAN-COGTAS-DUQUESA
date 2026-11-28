<?php

use App\Http\Controllers\Api\DeliveryJobController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\MenuCategoryController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\CanteenController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserAddressController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// ==========================================
// PUBLIC AUTHENTICATION ROUTES
// ==========================================

Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:10,1');

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');


// ==========================================
// PROTECTED AUTHENTICATION ROUTES
// ==========================================

Route::middleware('auth:sanctum')->group(function () {

    // Retrieve authenticated user
    Route::get('/user', function (Request $request) {

        return response()->json([
            'success' => true,
            'user' => $request->user()->only([
                'id',
                'name',
                'username',
                'email',
                'role',
            ]),
        ]);

    });

    // Logout and revoke current token
    Route::post('/logout', [AuthController::class, 'logout']);


    // ==========================================
    // TEMPORARY RBAC TEST ROUTES
    // ==========================================

    Route::prefix('test')->group(function () {

        // Customer access
        Route::get('/customer', function () {
            return response()->json([
                'success' => true,
                'message' => 'Customer access granted!',
            ]);
        })->middleware('role:customer');


        // Vendor access
        Route::get('/vendor', function () {
            return response()->json([
                'success' => true,
                'message' => 'Vendor access granted!',
            ]);
        })->middleware('role:vendor');


        // Deliveryperson access
        Route::get('/deliveryperson', function () {
            return response()->json([
                'success' => true,
                'message' => 'Delivery person access granted!',
            ]);
        })->middleware('role:deliveryperson');


        // Administrator access
        Route::get('/admin', function () {
            return response()->json([
                'success' => true,
                'message' => 'Admin access granted!',
            ]);
        })->middleware('role:admin');

    });

    // ==========================================
    // CANTEEN MANAGEMENT ROUTES
    // ==========================================

    // All authenticated users can browse active canteens.
    Route::get('/canteens/active', [
        CanteenController::class, 'active'
    ]);

    // Vendors can view only their assigned canteens.
    Route::get('/vendor/canteens', [
        CanteenController::class, 'myCanteens'
    ])->middleware('role:vendor');

    // Admin-only canteen management.
    Route::middleware('role:admin')
        ->prefix('admin/canteens')
        ->group(function () {

            Route::get('/', [
                CanteenController::class, 'index'
            ]);

            Route::post('/', [
                CanteenController::class, 'store'
            ])->middleware('throttle:20,1');

            Route::get('/{canteen}', [
                CanteenController::class, 'show'
            ]);

            Route::patch('/{canteen}/approve', [
                CanteenController::class, 'approve'
            ]);

            Route::delete('/{canteen}', [
                CanteenController::class, 'destroy'
            ]);
        });

    // Admin and assigned vendor can update canteen details.
    Route::patch('/canteens/{canteen}', [
        CanteenController::class, 'update'
    ])->middleware('role:admin,vendor');



// Menu browsing for authenticated users
Route::get(
    '/canteens/{canteen}/menu',
    [MenuItemController::class, 'available']
);

// Menu management for administrators and vendors
Route::middleware('role:admin,vendor')->group(function () {

    // Menu Categories
    Route::get(
        '/canteens/{canteen}/categories',
        [MenuCategoryController::class, 'index']
    );

    Route::post(
        '/canteens/{canteen}/categories',
        [MenuCategoryController::class, 'store']
    );

    Route::patch(
        '/menu-categories/{category}',
        [MenuCategoryController::class, 'update']
    );

    Route::delete(
        '/menu-categories/{category}',
        [MenuCategoryController::class, 'destroy']
    );

    // Menu Items
    Route::get(
        '/canteens/{canteen}/menu-items',
        [MenuItemController::class, 'index']
    );

    Route::post(
        '/canteens/{canteen}/menu-items',
        [MenuItemController::class, 'store']
    );

    Route::patch(
        '/menu-items/{item}',
        [MenuItemController::class, 'update']
    );

    Route::delete(
        '/menu-items/{item}',
        [MenuItemController::class, 'destroy']
    );
});


// Shopping Cart Management
Route::middleware('role:customer')->group(function () {

    Route::get('/cart', [
        CartController::class,
        'show'
    ]);

    Route::post('/cart/items', [
        CartController::class,
        'store'
    ]);

    Route::patch('/cart/items/{cartItem}', [
        CartController::class,
        'update'
    ])->whereNumber('cartItem');

    Route::delete('/cart/items/{cartItem}', [
        CartController::class,
        'destroy'
    ])->whereNumber('cartItem');

    Route::delete('/cart', [
        CartController::class,
        'clear'
    ]);
});


// Customer Addresses and Checkout
Route::middleware('role:customer')->group(function () {

    Route::get('/addresses', [
        UserAddressController::class, 'index'
    ]);

    Route::post('/addresses', [
        UserAddressController::class, 'store'
    ]);

    Route::patch('/addresses/{address}', [
        UserAddressController::class, 'update'
    ])->whereNumber('address');

    Route::delete('/addresses/{address}', [
        UserAddressController::class, 'destroy'
    ])->whereNumber('address');

    Route::post('/orders/checkout', [
        OrderController::class, 'checkout'
    ]);

    Route::patch('/orders/{order}/cancel', [
        OrderController::class, 'cancel'
    ])->whereNumber('order');
});

// Customer, Vendor and Admin Order Access
Route::middleware('role:customer,vendor,admin')
    ->group(function () {

        Route::get('/orders', [
            OrderController::class, 'index'
        ]);

        Route::get('/orders/{order}', [
            OrderController::class, 'show'
        ])->whereNumber('order');
    });


// Vendor Order Processing
Route::middleware('role:vendor')->group(function () {

    Route::patch('/orders/{order}/status', [
        OrderController::class, 'updateStatus'
    ])->whereNumber('order');
});


// ==========================================
// DELIVERY MANAGEMENT ROUTES
// ==========================================

Route::middleware('role:deliveryperson')
    ->prefix('delivery/jobs')
    ->group(function () {

        Route::get('/available', [
            DeliveryJobController::class, 'available'
        ]);

        Route::get('/mine', [
            DeliveryJobController::class, 'myJobs'
        ]);

        Route::patch('/{deliveryJob}/claim', [
            DeliveryJobController::class, 'claim'
        ])->whereNumber('deliveryJob');

        Route::patch('/{deliveryJob}/pickup', [
            DeliveryJobController::class, 'pickup'
        ])->whereNumber('deliveryJob');

        Route::patch('/{deliveryJob}/deliver', [
            DeliveryJobController::class, 'deliver'
        ])->whereNumber('deliveryJob');
    });

// Administrator delivery monitoring
Route::middleware('role:admin')
    ->prefix('admin/delivery/jobs')
    ->group(function () {

        Route::get('/', [
            DeliveryJobController::class, 'index'
        ]);

        Route::get('/{deliveryJob}', [
            DeliveryJobController::class, 'show'
        ])->whereNumber('deliveryJob');
    });


});
