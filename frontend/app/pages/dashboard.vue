<script setup lang="ts">
const { user, logout } = useAuth()
if (!user.value) await navigateTo('/login')

async function doLogout() {
  await logout()
  await navigateTo('/login')
}
</script>

<template>
  <div v-if="user" class="min-h-screen">
    <header class="bg-maroon text-white flex items-center justify-between px-6 py-4">
      <span class="brand text-2xl text-amber">PaddlerGo</span>
      <nav class="flex items-center gap-6 nav">
        <span>{{ user.username }} ({{ user.role }})</span>
        <button @click="doLogout" class="text-amber underline">Logout</button>
      </nav>
    </header>

    <main class="p-6 space-y-4">
      <h1 class="hero text-3xl text-maroon">Welcome, {{ user.username }}</h1>

      <section v-if="user.role === 'admin'" class="rounded-xl bg-white p-5">
        <h2 class="section text-xl">Admin panel</h2>
        <p>Manage users and system settings.</p>
      </section>
      <section v-else-if="user.role === 'staff'" class="rounded-xl bg-white p-5">
        <h2 class="section text-xl">Staff panel</h2>
        <p>View and manage orders.</p>
      </section>
      <section v-else class="rounded-xl bg-white p-5">
        <h2 class="section text-xl">Student panel</h2>
        <p>Browse and book your rides.</p>
      </section>
    </main>
  </div>
</template>