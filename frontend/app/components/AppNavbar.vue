<script setup lang="ts">
const { user, logout } = useAuth()
const { count } = useCart()

async function doLogout() {
  await logout()
  await navigateTo('/login')
}
</script>

<template>
  <header class="bg-maroon text-white">
    <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <NuxtLink to="/" class="brand text-2xl text-amber sm:text-3xl">PaddlerGo</NuxtLink>

      <nav class="nav flex flex-wrap items-center gap-3 text-sm sm:gap-5 sm:text-base">
        <NuxtLink to="/" class="hover:text-amber" active-class="text-amber" exact-active-class="text-amber">Home</NuxtLink>

        <NuxtLink to="/menu" class="flex items-center gap-1.5 hover:text-amber" active-class="text-amber">
          Menu
          <span v-if="count" class="grid h-5 min-w-5 place-items-center rounded-full bg-amber px-1 text-xs text-maroon">
            {{ count }}
          </span>
        </NuxtLink>

        <template v-if="user">
          <NuxtLink to="/dashboard" class="hover:text-amber" active-class="text-amber">Dashboard</NuxtLink>
          <button
            class="rounded-lg border border-amber/60 px-3 py-1.5 text-amber hover:bg-amber hover:text-maroon"
            @click="doLogout"
          >
            Logout
          </button>
        </template>

        <template v-else>
          <NuxtLink to="/login" class="hover:text-amber">Log in</NuxtLink>
          <NuxtLink to="/register" class="rounded-lg bg-amber px-3 py-1.5 text-maroon hover:brightness-105">Register</NuxtLink>
        </template>
      </nav>
    </div>
  </header>
</template>