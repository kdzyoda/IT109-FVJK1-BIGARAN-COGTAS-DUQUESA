<script setup lang="ts">
const dishes = [
  { name: 'Chicken Adobo Rice', desc: 'Tender chicken simmered in soy and vinegar, served with garlic rice.', price: 85 },
  { name: 'Pork Sisig', desc: 'Sizzling chopped pork with onions and chili, topped with egg.', price: 120 },
  { name: 'Halo-Halo', desc: 'Shaved ice, sweet beans, fruits and leche flan.', price: 65 }
]
</script>

<template>
  <div class="min-h-screen">
    <AppNavbar />

    <section class="bg-maroon text-white px-6 py-20">
      <div class="mx-auto max-w-4xl space-y-5">
        <p class="promo text-amber text-lg">Hungry? Order in minutes.</p>
        <h1 class="hero text-5xl md:text-6xl">PaddlerGo</h1>
        <p class="max-w-xl text-white/80">
          Browse the menu, place your order, and have your food ready without the long wait.
        </p>
        <div class="flex gap-3 pt-2">
          <NuxtLink to="/register" class="rounded-lg bg-amber px-6 py-3 font-bold text-maroon">
            Order now
          </NuxtLink>
          <NuxtLink to="/login" class="rounded-lg border border-amber px-6 py-3 font-bold text-amber">
            Log in
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-4xl px-6 py-14">
      <h2 class="section text-3xl text-maroon">Popular dishes</h2>
      <p class="promo text-crimson mt-1">Customer favorites</p>

      <div class="mt-6 grid gap-5 md:grid-cols-3">
        <article v-for="d in dishes" :key="d.name" class="rounded-2xl bg-white p-5 shadow">
          <div class="h-32 rounded-xl bg-crimson/10 grid place-items-center text-sm text-crimson">
            Food photo here
          </div>
          <h3 class="section mt-4 text-lg">{{ d.name }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ d.desc }}</p>
          <div class="mt-4 flex items-center justify-between">
            <span class="price text-xl text-maroon">₱{{ d.price }}</span>
            <NuxtLink to="/login" class="rounded-lg bg-amber px-4 py-2 text-sm font-bold text-maroon">
              Add to order
            </NuxtLink>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>