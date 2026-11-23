<script setup lang="ts">
const model = defineModel<string>({ default: '' })
defineProps<{ autocomplete?: string }>()
const show = ref(false)
</script>

<template>
  <div class="relative mt-1">
    <input
      v-model="model"
      :type="show ? 'text' : 'password'"
      :autocomplete="autocomplete"
      class="input"
      style="padding-right: 3rem"
    />
    <button
      type="button"
      class="absolute inset-y-0 right-0 grid w-12 place-items-center text-maroon"
      :aria-label="show ? 'Hide password' : 'Show password'"
      @click="show = !show"
    >
      <!-- eye (shown while password is hidden) -->
      <svg v-if="!show" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <!-- eye with slash (shown while password is visible) -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 5.1A9.7 9.7 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4M6.1 6.1A17 17 0 002 12s3.5 7 10 7a9.8 9.8 0 004-.9" />
      </svg>
    </button>
  </div>
</template>