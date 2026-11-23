<script setup lang="ts">
const { user } = useAuth()
const { items, count, total, add, increase, decrease, clear } = useCart()

const categories = ['All', 'Rice Meals', 'Noodles', 'Snacks', 'Drinks & Desserts']
const active = ref('All')
const message = ref('')

const dishes = [
  // RICE MEALS
  { id: 1, category: 'Rice Meals', name: 'Chicken Adobo Rice', desc: 'Filipino-style chicken adobo served with steamed rice.', price: 75 },
  { id: 2, category: 'Rice Meals', name: 'Pork Silog', desc: 'Pork with garlic rice and fried egg.', price: 85 },
  { id: 3, category: 'Rice Meals', name: 'Beef Tapa Rice', desc: 'Garlic beef tapa served with rice and egg.', price: 95 },
  { id: 4, category: 'Rice Meals', name: 'Chicken BBQ Rice', desc: 'Grilled Filipino-style chicken barbecue with rice.', price: 85 },
  { id: 5, category: 'Rice Meals', name: 'Pork Sisig Rice', desc: 'Seasoned chopped pork with onions and rice.', price: 90 },
  { id: 6, category: 'Rice Meals', name: 'Fried Chicken Rice', desc: 'Crispy fried chicken served with steamed rice.', price: 80 },
  { id: 7, category: 'Rice Meals', name: 'Hotdog Silog', desc: 'Fried hotdog with garlic rice and egg.', price: 55 },
  { id: 8, category: 'Rice Meals', name: 'Longganisa Rice', desc: 'Filipino pork longganisa with rice and egg.', price: 75 },
  { id: 9, category: 'Rice Meals', name: 'Tortang Talong Rice', desc: 'Filipino eggplant omelet served with rice.', price: 60 },
  { id: 10, category: 'Rice Meals', name: 'Ginisang Monggo Rice', desc: 'Filipino mung bean stew served with rice.', price: 50 },

  // NOODLES
  { id: 11, category: 'Noodles', name: 'Pancit Canton', desc: 'Stir-fried noodles with vegetables and chicken.', price: 45 },
  { id: 12, category: 'Noodles', name: 'Pancit Bihon', desc: 'Filipino rice noodles with vegetables.', price: 50 },
  { id: 13, category: 'Noodles', name: 'Beef Mami', desc: 'Warm noodle soup with beef and vegetables.', price: 65 },
  { id: 14, category: 'Noodles', name: 'Chicken Mami', desc: 'Chicken noodle soup with spring onions.', price: 55 },
  { id: 15, category: 'Noodles', name: 'Lomi', desc: 'Thick Filipino noodle soup with egg and vegetables.', price: 65 },
  { id: 16, category: 'Noodles', name: 'Sotanghon Guisado', desc: 'Stir-fried glass noodles with vegetables.', price: 55 },

  // SNACKS
  { id: 17, category: 'Snacks', name: 'Lumpiang Shanghai', desc: 'Five crispy pork spring rolls with dipping sauce.', price: 35 },
  { id: 18, category: 'Snacks', name: 'Banana Cue', desc: 'Caramelized fried banana on a stick.', price: 20 },
  { id: 19, category: 'Snacks', name: 'Turon', desc: 'Crispy banana spring roll with caramel coating.', price: 15 },
  { id: 20, category: 'Snacks', name: 'Cheese Stick', desc: 'Four crispy cheese-filled spring rolls.', price: 25 },
  { id: 21, category: 'Snacks', name: 'Siomai', desc: 'Four steamed pork dumplings.', price: 35 },
  { id: 22, category: 'Snacks', name: 'Fishball', desc: 'Fried fish balls with dipping sauce.', price: 15 },
  { id: 23, category: 'Snacks', name: 'Kwek-Kwek', desc: 'Quail eggs coated in orange batter.', price: 25 },
  { id: 24, category: 'Snacks', name: 'Palagsing', desc: 'Traditional Butuan delicacy made with sticky rice and coconut.', price: 20 },

  // DRINKS & DESSERTS
  { id: 25, category: 'Drinks & Desserts', name: 'Iced Calamansi Juice', desc: 'Refreshing Filipino calamansi juice.', price: 20 },
  { id: 26, category: 'Drinks & Desserts', name: "Sago't Gulaman", desc: 'Sweet refreshing drink with tapioca pearls and jelly.', price: 20 },
  { id: 27, category: 'Drinks & Desserts', name: 'Buko Juice', desc: 'Fresh young coconut juice.', price: 25 },
  { id: 28, category: 'Drinks & Desserts', name: 'Iced Tea', desc: 'Chilled sweet iced tea.', price: 15 },
  { id: 29, category: 'Drinks & Desserts', name: 'Bottled Water', desc: 'Cold bottled drinking water.', price: 15 },
  { id: 30, category: 'Drinks & Desserts', name: 'Halo-Halo', desc: 'Shaved ice with sweet beans, fruits and leche flan.', price: 50 },
  { id: 31, category: 'Drinks & Desserts', name: 'Mais con Yelo', desc: 'Sweet corn with shaved ice and milk.', price: 35 },
  { id: 32, category: 'Drinks & Desserts', name: 'Leche Flan', desc: 'Classic Filipino caramel custard dessert.', price: 30 }
]

const filtered = computed(() =>
  active.value === 'All' ? dishes : dishes.filter(d => d.category === active.value)
)

async function checkout() {
  message.value = ''
  if (!user.value) {
    await navigateTo('/login')
    return
  }
  // TEMP MOCK: no order API yet. Bigaran connects this to the Laravel orders endpoint later.
  message.value = 'Order placed! Staff will start preparing your food.'
  clear()
}
</script>

<template>
  <div class="min-h-screen">
    <AppNavbar />

    <main class="mx-auto max-w-6xl px-6 py-10">
      <h1 class="hero text-4xl text-maroon">Menu</h1>
      <p class="promo text-crimson mt-1">Freshly made, just for you</p>

      <div class="mt-6 flex flex-wrap gap-2">
        <button
          v-for="c in categories"
          :key="c"
          class="nav rounded-full px-4 py-2 text-sm"
          :class="active === c ? 'bg-maroon text-amber' : 'bg-white text-maroon border border-maroon/20'"
          @click="active = c"
        >
          {{ c }}
        </button>
      </div>

      <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <!-- Food cards -->
        <section class="grid gap-5 sm:grid-cols-2">
          <article v-for="d in filtered" :key="d.id" class="rounded-2xl bg-white p-5 shadow">
            <div class="h-32 rounded-xl bg-crimson/10 grid place-items-center text-sm text-crimson">
              Food photo here
            </div>
            <h3 class="section mt-4 text-lg">{{ d.name }}</h3>
            <p class="mt-1 text-sm text-gray-600">{{ d.desc }}</p>
            <div class="mt-4 flex items-center justify-between">
              <span class="price text-xl text-maroon">₱{{ d.price }}</span>
              <button
                class="rounded-lg bg-amber px-4 py-2 text-sm font-bold text-maroon"
                @click="add(d)"
              >
                Add to order
              </button>
            </div>
          </article>
        </section>

        <!-- Cart -->
        <aside class="h-fit rounded-2xl bg-maroon p-6 text-white lg:sticky lg:top-6">
          <h2 class="section text-xl text-amber">Your order ({{ count }})</h2>

          <p v-if="items.length === 0" class="mt-4 text-sm text-white/70">
            Your cart is empty. Add something tasty!
          </p>

          <ul v-else class="mt-4 space-y-3">
            <li v-for="i in items" :key="i.id" class="flex items-center justify-between gap-3">
              <div>
                <p class="nav text-sm">{{ i.name }}</p>
                <p class="text-xs text-white/70">₱{{ i.price }} each</p>
              </div>
              <div class="flex items-center gap-2">
                <button class="h-7 w-7 rounded bg-white/15" @click="decrease(i.id)">−</button>
                <span class="w-5 text-center">{{ i.qty }}</span>
                <button class="h-7 w-7 rounded bg-white/15" @click="increase(i.id)">+</button>
              </div>
            </li>
          </ul>

          <div class="mt-5 flex items-center justify-between border-t border-white/20 pt-4">
            <span class="nav">Total</span>
            <span class="price text-2xl text-amber">₱{{ total }}</span>
          </div>

          <button class="btn mt-4" :disabled="items.length === 0" @click="checkout">
            {{ user ? 'Place order' : 'Log in to order' }}
          </button>
          <p v-if="message" class="nav mt-3 text-sm text-amber">{{ message }}</p>
        </aside>
      </div>
    </main>
  </div>
</template>