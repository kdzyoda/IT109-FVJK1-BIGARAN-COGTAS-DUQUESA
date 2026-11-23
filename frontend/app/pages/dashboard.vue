<script setup lang="ts">
const { user, logout } = useAuth()
const { count, total } = useCart()

if (!user.value) await navigateTo('/login')

async function doLogout() {
  await logout()
  await navigateTo('/login')
}

// TEMP SAMPLE DATA: replace with real API data when Laravel is ready
const adminStats = [
  { label: 'Total users', value: '128' },
  { label: 'Orders today', value: '46' },
  { label: 'Menu items', value: '35' }
]
const adminActions = ['Manage users', 'Manage roles', 'System settings']

const staffOrders = [
  { id: '#1042', item: 'Chicken Adobo Rice x2', status: 'Preparing' },
  { id: '#1043', item: 'Halo-Halo x1', status: 'New' },
  { id: '#1044', item: 'Pork Sisig Rice x1', status: 'Ready' }
]

const roleLabel = computed(() => {
  const r = user.value?.role
  if (r === 'admin') return 'Admin'
  if (r === 'staff') return 'Staff'
  return 'Customer'
})
</script>

<template>
  <div v-if="user" class="min-h-screen">
    <!-- Header -->
    <header class="bg-maroon text-white">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <NuxtLink to="/" class="brand text-2xl text-amber">PaddlerGo</NuxtLink>
        <nav class="nav flex items-center gap-3 text-sm sm:gap-5">
          <NuxtLink to="/" class="hover:text-amber">Home</NuxtLink>
          <NuxtLink to="/menu" class="hover:text-amber">Menu</NuxtLink>
          <button class="rounded-lg border border-amber/60 px-3 py-1.5 text-amber hover:bg-amber hover:text-maroon" @click="doLogout">
            Logout
          </button>
        </nav>
      </div>
    </header>

    <!-- Welcome banner -->
    <section class="bg-crimson text-white">
      <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <span class="nav inline-block rounded-full bg-amber px-3 py-1 text-xs text-maroon">{{ roleLabel }}</span>
        <h1 class="hero mt-3 break-words text-3xl sm:text-4xl">Welcome, {{ user.username }}</h1>
        <p class="promo mt-1 text-lg text-amber">
          {{ user.role === 'admin' ? 'Keep everything running smoothly' : user.role === 'staff' ? 'Orders are waiting' : 'What are you craving today?' }}
        </p>
      </div>
    </section>

    <main class="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <!-- ADMIN -->
      <template v-if="user.role === 'admin'">
        <div class="grid gap-4 md:grid-cols-3">
          <article v-for="s in adminStats" :key="s.label" class="rounded-2xl bg-white p-6 shadow">
            <p class="nav text-sm text-gray-600">{{ s.label }}</p>
            <p class="hero mt-1 text-4xl text-maroon">{{ s.value }}</p>
          </article>
        </div>
        <section class="rounded-2xl bg-white p-6 shadow">
          <h2 class="section text-xl text-maroon">Admin panel</h2>
          <p class="mt-1 text-sm text-gray-600">Manage users and system settings.</p>
          <div class="mt-4 flex flex-wrap gap-3">
            <button v-for="a in adminActions" :key="a" class="nav rounded-lg bg-amber px-4 py-2 text-sm text-maroon hover:brightness-105">
              {{ a }}
            </button>
          </div>
        </section>
      </template>

      <!-- STAFF -->
      <template v-else-if="user.role === 'staff'">
        <section class="rounded-2xl bg-white p-6 shadow">
          <h2 class="section text-xl text-maroon">Staff panel</h2>
          <p class="mt-1 text-sm text-gray-600">View and manage orders.</p>
          <ul class="mt-4 divide-y divide-amber/40">
            <li v-for="o in staffOrders" :key="o.id" class="flex items-center justify-between gap-3 py-3">
              <div>
                <p class="section text-maroon">{{ o.id }}</p>
                <p class="text-sm text-gray-600">{{ o.item }}</p>
              </div>
              <span
                class="nav shrink-0 rounded-full px-3 py-1 text-xs"
                :class="o.status === 'Ready' ? 'bg-green-100 text-green-800' : o.status === 'New' ? 'bg-amber/40 text-maroon' : 'bg-red-100 text-red-700'"
              >
                {{ o.status }}
              </span>
            </li>
          </ul>
          <p class="mt-3 text-xs text-gray-500">Sample orders. Real orders need a Laravel endpoint.</p>
        </section>
      </template>

      <!-- CUSTOMER (any other role, including student) -->
      <template v-else>
        <div class="grid gap-4 md:grid-cols-2">
          <article class="rounded-2xl bg-white p-6 shadow">
            <h2 class="section text-xl text-maroon">Browse the menu</h2>
            <p class="mt-1 text-sm text-gray-600">Rice meals, noodles, snacks, drinks and desserts.</p>
            <NuxtLink to="/menu" class="btn mt-4 inline-block max-w-xs text-center">Go to menu</NuxtLink>
          </article>
          <article class="rounded-2xl bg-white p-6 shadow">
            <h2 class="section text-xl text-maroon">Your order</h2>
            <p class="mt-1 text-sm text-gray-600">{{ count }} item(s) in your cart</p>
            <p class="price mt-2 text-3xl text-crimson">₱{{ total }}</p>
            <NuxtLink to="/menu" class="nav mt-3 inline-block text-sm text-crimson underline">View cart on menu page</NuxtLink>
          </article>
        </div>
      </template>
    </main>

    <footer class="bg-maroon px-6 py-6 text-center text-sm text-white/70">
      <span class="brand text-amber">PaddlerGo</span> · Food ordering for the campus
    </footer>
  </div>
</template>