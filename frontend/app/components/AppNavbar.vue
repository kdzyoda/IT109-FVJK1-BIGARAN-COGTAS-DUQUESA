<script setup lang="ts">
const { user, logout } = useAuth()

async function doLogout() {
  await logout()
  await navigateTo('/login')
}
</script>

<template>
  <header class="bg-maroon text-white flex items-center justify-between px-6 py-4">
    <NuxtLink to="/" class="brand text-2xl text-amber">PaddlerGo</NuxtLink>
    <nav class="flex items-center gap-6 nav">
      <template v-if="user">
        <NuxtLink to="/dashboard">Dashboard</NuxtLink>
        <span class="text-white/70">{{ user.username }} ({{ user.role }})</span>
        <button class="text-amber underline" @click="doLogout">Logout</button>
      </template>
      <template v-else>
        <NuxtLink to="/login">Log in</NuxtLink>
        <NuxtLink to="/register" class="rounded-lg bg-amber px-4 py-2 text-maroon">Register</NuxtLink>
      </template>
    </nav>
  </header>
</template>