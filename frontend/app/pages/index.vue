<template>
  <div class="min-h-screen">
    <AppNavbar />

    <section class="bg-maroon text-white px-6 py-20">
      <div class="mx-auto max-w-4xl space-y-5">
        <p class="promo text-amber text-lg">Welcome to</p>
        <h1 class="hero text-5xl md:text-6xl">PaddlerGo</h1>
        <p class="max-w-xl text-white/80">
          A convenient campus food ordering platform that connects CSU students with multiple canteens and student delivery services, making food ordering faster, easier, and more accessible within the university.
        </p>
        <div class="flex gap-3 pt-2">
          <NuxtLink to="/register" class="rounded-lg bg-amber px-6 py-3 font-bold text-maroon">
            Get started
          </NuxtLink>
          <NuxtLink to="/login" class="rounded-lg border border-amber px-6 py-3 font-bold text-amber">
            Log in
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>