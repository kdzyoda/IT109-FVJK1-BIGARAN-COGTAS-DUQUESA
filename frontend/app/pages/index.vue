<script setup lang="ts">
const { add } = useCart()

// Same ids, names and prices as menu.vue
const featured = [
  {
    id: 1, category: 'Rice Meals', name: 'Chicken Adobo Rice', price: 75, image: '/images/dish-1.jpg',
    desc: 'Filipino-style chicken adobo served with steamed rice.'
  },
  {
    id: 5, category: 'Rice Meals', name: 'Pork Sisig Rice', price: 90, image: '/images/dish-2.jpg',
    desc: 'Seasoned chopped pork with onions and rice.'
  },
  {
    id: 30, category: 'Drinks & Desserts', name: 'Halo-Halo', price: 50, image: '/images/dish-3.jpg',
    desc: 'Shaved ice with sweet beans, fruits and leche flan.'
  }
]

const addOns = [
  { id: 28, name: 'Iced Tea', price: 15, note: 'Chilled sweet iced tea' },
  { id: 17, name: 'Lumpiang Shanghai', price: 35, note: 'Five crispy spring rolls' },
  { id: 32, name: 'Leche Flan', price: 30, note: 'Caramel custard dessert' }
]

// TEMP SAMPLE TEXT: replace with real reviews later
const reviews = [
  { name: 'Maria S.', text: 'Fast and hot. Ordering ahead saved me so much time between classes.' },
  { name: 'Jun R.', text: 'The sisig is the best on campus. Easy to order, no long lines.' },
  { name: 'Angel T.', text: 'Love the clean menu and the halo-halo is so good.' }
]

const current = ref(0)
const qty = ref(1)
const picked = ref<number[]>([])
const imageFailed = ref<Record<number, boolean>>({})
const message = ref('')

const dish = computed(() => featured[current.value] ?? featured[0]!)
const unitPrice = computed(() =>
  dish.value.price + picked.value.reduce((sum, i) => sum + (addOns[i]?.price ?? 0), 0)
)
const total = computed(() => unitPrice.value * qty.value)

function selectDish(i: number) {
  current.value = i
  qty.value = 1
  picked.value = []
  message.value = ''
}
function next() { selectDish((current.value + 1) % featured.length) }
function prev() { selectDish((current.value - 1 + featured.length) % featured.length) }

function toggleAddOn(i: number) {
  picked.value = picked.value.includes(i)
    ? picked.value.filter(x => x !== i)
    : [...picked.value, i]
}

function orderNow() {
  const d = dish.value
  for (let n = 0; n < qty.value; n++) {
    add({ id: d.id, name: d.name, price: d.price })
    for (const i of picked.value) {
      const a = addOns[i]
      if (a) add({ id: a.id, name: a.name, price: a.price })
    }
  }
  message.value = `${qty.value} x ${d.name} added to your order.`
  qty.value = 1
  picked.value = []
}
</script>

<template>
  <div class="min-h-screen">
    <AppNavbar />

    <!-- Hero -->
    <section class="relative overflow-hidden bg-maroon text-white">
      <div class="pointer-events-none absolute inset-y-0 left-0 hidden w-[42%] bg-black/15 lg:block"
           style="clip-path: polygon(0 0, 100% 0, 80% 100%, 0 100%)"></div>

      <div class="relative mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1fr_1.1fr_1fr] lg:items-center lg:gap-10">
        <!-- Left: dish details -->
        <div class="space-y-4">
          <p class="nav text-xs text-white/60">Home / Menu / {{ dish.category }}</p>
          <h1 class="hero text-3xl leading-tight sm:text-4xl md:text-5xl">{{ dish.name }}</h1>
          <p class="max-w-sm text-sm text-white/80">{{ dish.desc }}</p>

          <p class="price text-2xl text-amber">₱{{ unitPrice }}</p>

          <div class="flex items-center gap-3">
            <span class="nav text-sm">Quantity</span>
            <div class="flex items-center rounded-lg bg-white text-maroon">
              <button class="h-9 w-9 text-lg" @click="qty = Math.max(1, qty - 1)">−</button>
              <span class="w-10 text-center font-bold">{{ String(qty).padStart(2, '0') }}</span>
              <button class="h-9 w-9 text-lg" @click="qty++">+</button>
            </div>
          </div>

          <button class="btn flex max-w-xs items-center justify-between" @click="orderNow">
            <span>ORDER NOW · ₱{{ total }}</span>
            <span class="grid h-7 w-7 place-items-center rounded bg-maroon text-amber">+</span>
          </button>
          <p v-if="message" class="nav text-sm text-amber">
            {{ message }} <NuxtLink to="/menu" class="underline">View menu</NuxtLink>
          </p>
        </div>

        <!-- Center: round dish -->
        <div class="order-first flex flex-col items-center gap-5 lg:order-0">
          <div class="relative">
            <div class="absolute -inset-3 rounded-full bg-amber/40 blur-xl"></div>
            <div class="relative h-56 w-56 overflow-hidden rounded-full border-8 border-amber/80 bg-crimson shadow-2xl sm:h-64 sm:w-64 md:h-80 md:w-80">
              <img
                v-if="!imageFailed[current]"
                :src="dish.image" :alt="dish.name"
                class="h-full w-full object-cover"
                @error="imageFailed[current] = true"
              />
              <div v-else class="grid h-full w-full place-items-center px-6 text-center text-sm text-white/70">
                Add a photo at<br />frontend/public{{ dish.image }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <button class="grid h-9 w-9 place-items-center rounded-full bg-white/15" aria-label="Previous dish" @click="prev">←</button>
            <div class="flex gap-2">
              <button
                v-for="(f, i) in featured" :key="f.id"
                class="h-2.5 w-2.5 rounded-full"
                :class="current === i ? 'bg-amber' : 'bg-white/40'"
                :aria-label="f.name"
                @click="selectDish(i)"
              ></button>
            </div>
            <button class="grid h-9 w-9 place-items-center rounded-full bg-white/15" aria-label="Next dish" @click="next">→</button>
          </div>
        </div>

        <!-- Right: add-ons -->
        <div class="space-y-3">
          <h2 class="section text-lg text-amber">Choose add-ons</h2>
          <button
            v-for="(a, i) in addOns" :key="a.id"
            class="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
            :class="picked.includes(i) ? 'bg-amber/25 ring-2 ring-amber' : 'bg-black/25'"
            @click="toggleAddOn(i)"
          >
            <div>
              <p class="nav text-sm">{{ a.name }}</p>
              <p class="text-xs text-white/60">₱{{ a.price }} · {{ a.note }}</p>
            </div>
            <span class="text-amber">{{ picked.includes(i) ? '✓' : '+' }}</span>
          </button>
          <p class="text-xs text-white/60">Add-ons are added to your order with the dish.</p>
        </div>
      </div>
    </section>

    <!-- Reviews strip -->
    <section class="bg-amber px-4 py-10 sm:px-6 sm:py-12">
      <div class="mx-auto max-w-6xl">
        <h2 class="brand text-center text-3xl tracking-widest text-maroon">REVIEWS</h2>
        <div class="mt-8 grid gap-5 md:grid-cols-3">
          <article v-for="r in reviews" :key="r.name" class="rounded-2xl bg-cream p-5 shadow">
            <p class="promo text-maroon">“{{ r.text }}”</p>
            <p class="nav mt-3 text-sm text-crimson">{{ r.name }}</p>
          </article>
        </div>
      </div>
    </section>

    <footer class="bg-maroon px-6 py-6 text-center text-sm text-white/70">
      <span class="brand text-amber">PaddlerGo</span> · Food ordering for the campus
    </footer>
  </div>
</template>