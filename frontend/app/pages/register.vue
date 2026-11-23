<script setup lang="ts">
const { register } = useAuth()
const form = reactive({ username: '', email: '', password: '', password_confirmation: '' })
const errors = reactive<Record<string, string>>({})
const loading = ref(false)
const success = ref(false)

const usernameRe = /^[a-zA-Z0-9_]{4,20}$/
const passwordRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const fields = [
  { key: 'username', label: 'Username', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'password', label: 'Password', type: 'password' },
  { key: 'password_confirmation', label: 'Confirm password', type: 'password' }
]

function validate() {
  errors.username = usernameRe.test(form.username) ? '' : 'Username: 4-20 letters, numbers, or underscores.'
  errors.email = emailRe.test(form.email) ? '' : 'Enter a valid email.'
  errors.password = passwordRe.test(form.password) ? '' : 'Password: 8+ chars with upper, lower, number, and symbol.'
  errors.password_confirmation = form.password === form.password_confirmation ? '' : 'Passwords do not match.'
  return !Object.values(errors).some(Boolean)
}

async function submit() {
  errors.form = ''
  success.value = false
  if (!validate()) return
  loading.value = true
  try {
    await register({ ...form })
    success.value = true
    setTimeout(() => navigateTo('/login'), 1200)
  } catch (e: any) {
    errors.form = e?.data?.message || 'Registration failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen grid place-items-center bg-maroon p-4">
    <form @submit.prevent="submit" class="w-full max-w-md rounded-2xl bg-crimson p-8 text-white shadow-xl space-y-4">
      <h1 class="brand text-3xl text-amber">PaddlerGo</h1>
      <h2 class="hero text-2xl">Create your account</h2>

      <div v-for="f in fields" :key="f.key">
        <label class="nav text-sm">{{ f.label }}</label>
        <input v-model="(form as any)[f.key]" :type="f.type" class="input text-black" />
        <p v-if="errors[f.key]" class="error">{{ errors[f.key] }}</p>
      </div>

      <p v-if="errors.form" class="error">{{ errors.form }}</p>
      <p v-if="success" class="text-amber nav">Account created! Redirecting to login...</p>

      <button class="btn" :disabled="loading">{{ loading ? 'Creating...' : 'Register' }}</button>
      <p class="text-sm text-center">
        Already registered? <NuxtLink to="/login" class="nav text-amber underline">Log in</NuxtLink>
      </p>
    </form>
  </main>
</template>