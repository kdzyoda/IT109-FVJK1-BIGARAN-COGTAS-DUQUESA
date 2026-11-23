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
  <main class="min-h-screen grid place-items-center bg-maroon p-4">
    <form @submit.prevent="submit" class="w-full max-w-md rounded-2xl bg-crimson p-8 text-white shadow-xl space-y-4">
      <h1 class="brand text-3xl text-amber">PaddlerGo</h1>
      <h2 class="hero text-2xl">Welcome back</h2>
      <p class="promo text-amber/90">Order, paddle, enjoy.</p>

      <div>
        <label class="nav text-sm">Username</label>
        <input v-model="username" class="input text-black" autocomplete="username" />
        <p v-if="errors.username" class="error">{{ errors.username }}</p>
      </div>
      <div>
        <label class="nav text-sm">Password</label>
        <input v-model="password" type="password" class="input text-black" autocomplete="current-password" />
        <p v-if="errors.password" class="error">{{ errors.password }}</p>
      </div>
      <p v-if="errors.form" class="error">{{ errors.form }}</p>

      <button class="btn" :disabled="loading">{{ loading ? 'Logging in...' : 'Log in' }}</button>
      <p class="text-sm text-center">
        No account? <NuxtLink to="/register" class="nav text-amber underline">Register</NuxtLink>
      </p>
    </form>
  </main>
</template>