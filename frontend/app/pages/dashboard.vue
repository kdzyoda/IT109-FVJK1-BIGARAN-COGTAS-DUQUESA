<script setup lang="ts">
const { user } = useAuth()
if (!user.value) await navigateTo('/login')
</script>

<template>
  <div v-if="user" class="min-h-screen">
    <AppNavbar />

    <main class="p-6 space-y-4">
      <h1 class="hero text-3xl text-maroon">Welcome, {{ user.username }}</h1>

      <section v-if="user.role === 'admin'" class="rounded-xl bg-white p-5">
        <h2 class="section text-xl">Admin panel</h2>
        <p>Manage the menu, prices, staff accounts and all orders.</p>
      </section>
      <section v-else-if="user.role === 'staff'" class="rounded-xl bg-white p-5">
        <h2 class="section text-xl">Staff panel</h2>
        <p>View incoming orders and update their status.</p>
      </section>
      <section v-else class="rounded-xl bg-white p-5">
        <h2 class="section text-xl">Customer panel</h2>
        <p>Browse the menu, place an order and track your orders.</p>
      </section>
    </main>
  </div>
</template>