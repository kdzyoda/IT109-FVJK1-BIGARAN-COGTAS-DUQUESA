<script setup lang="ts">
const { login } = useAuth()
const username = ref('')
const password = ref('')
const errors = reactive({ username: '', password: '', form: '' })
const loading = ref(false)

async function submit() {
  errors.username = username.value ? '' : 'Username is required.'
  errors.password = password.value ? '' : 'Password is required.'
  errors.form = ''
  if (errors.username || errors.password) return
  loading.value = true
  try {
    await login(username.value, password.value)
    await navigateTo('/dashboard')
  } catch (e: any) {
    errors.form = e?.data?.message || 'Login failed. Check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-maroon p-3 sm:p-4">
    <div class="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-cream shadow-2xl md:grid-cols-2">
      <!-- Brand side -->
      <div class="relative flex flex-col justify-between overflow-hidden bg-crimson p-6 text-white sm:p-10">
        <div class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber/30 blur-2xl"></div>
        <NuxtLink to="/" class="brand relative text-3xl text-amber">PaddlerGo</NuxtLink>
        <div class="relative mt-6 space-y-3 md:mt-16">
          <h1 class="hero text-2xl leading-tight sm:text-4xl">Hungry? Log in and order.</h1>
          <p class="promo text-base text-amber sm:text-lg">Freshly made, just for you</p>
        </div>
        <p class="relative mt-6 hidden text-sm text-white/70 md:mt-16 md:block">Food ordering for the campus</p>
      </div>

      <!-- Form side -->
      <form class="space-y-5 p-6 sm:p-10" @submit.prevent="submit">
        <div>
          <h2 class="section text-2xl text-maroon sm:text-3xl">Welcome back</h2>
          <p class="mt-1 text-sm text-gray-600">Log in to place and track your orders.</p>
        </div>

        <div>
          <label class="nav text-sm text-maroon">Username</label>
          <input v-model="username" class="input mt-1" autocomplete="username" />
          <p v-if="errors.username" class="mt-1 text-sm text-red-700">{{ errors.username }}</p>
        </div>

        <div>
          <label class="nav text-sm text-maroon">Password</label>
          <PasswordInput v-model="password" autocomplete="current-password" />
          <p v-if="errors.password" class="mt-1 text-sm text-red-700">{{ errors.password }}</p>
        </div>

        <p v-if="errors.form" class="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{{ errors.form }}</p>

        <button class="btn" :disabled="loading">{{ loading ? 'Logging in...' : 'Log in' }}</button>

        <p class="text-center text-sm text-gray-700">
          No account?
          <NuxtLink to="/register" class="nav text-crimson underline">Register</NuxtLink>
        </p>
      </form>
    </div>
  </main>
</template>