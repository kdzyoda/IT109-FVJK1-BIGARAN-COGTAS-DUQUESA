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
  { key: 'username', label: 'Username', type: 'text', hint: '4-20 letters, numbers or underscores' },
  { key: 'email', label: 'Email', type: 'email', hint: '' },
  { key: 'password', label: 'Password', type: 'password', hint: '8+ characters with upper, lower, number and symbol' },
  { key: 'password_confirmation', label: 'Confirm password', type: 'password', hint: '' }
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
    <div class="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-cream shadow-2xl md:grid-cols-2">
      <!-- Brand side -->
      <div class="relative flex flex-col justify-between bg-crimson p-10 text-white">
        <div class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber/30 blur-2xl"></div>
        <NuxtLink to="/" class="brand relative text-3xl text-amber">PaddlerGo</NuxtLink>
        <div class="relative mt-16 space-y-3">
          <h1 class="hero text-4xl leading-tight">Create your account and start ordering.</h1>
          <p class="promo text-lg text-amber">Order in minutes</p>
        </div>
        <p class="relative mt-16 text-sm text-white/70">Food ordering for the campus</p>
      </div>

      <!-- Form side -->
      <form class="space-y-4 p-10" @submit.prevent="submit">
        <div>
          <h2 class="section text-3xl text-maroon">Create account</h2>
          <p class="mt-1 text-sm text-gray-600">It only takes a minute.</p>
        </div>

        <div v-for="f in fields" :key="f.key">
          <label class="nav text-sm text-maroon">{{ f.label }}</label>
          <input v-model="(form as any)[f.key]" :type="f.type" class="input mt-1" />
          <p v-if="errors[f.key]" class="mt-1 text-sm text-red-700">{{ errors[f.key] }}</p>
          <p v-else-if="f.hint" class="mt-1 text-xs text-gray-500">{{ f.hint }}</p>
        </div>

        <p v-if="errors.form" class="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{{ errors.form }}</p>
        <p v-if="success" class="nav rounded-lg bg-green-100 px-3 py-2 text-sm text-green-800">
          Account created! Redirecting to login...
        </p>

        <button class="btn" :disabled="loading">{{ loading ? 'Creating...' : 'Register' }}</button>

        <p class="text-center text-sm text-gray-700">
          Already registered?
          <NuxtLink to="/login" class="nav text-crimson underline">Log in</NuxtLink>
        </p>
      </form>
    </div>
  </main>
</template>