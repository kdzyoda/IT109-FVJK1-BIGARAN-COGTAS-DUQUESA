export interface CartItem {
  id: number
  name: string
  price: number
  qty: number
}

export const useCart = () => {
  const items = useState<CartItem[]>('cart', () => [])

  const count = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))
  const total = computed(() => items.value.reduce((sum, i) => sum + i.qty * i.price, 0))

  function add(dish: { id: number; name: string; price: number }) {
    const found = items.value.find(i => i.id === dish.id)
    if (found) found.qty++
    else items.value.push({ id: dish.id, name: dish.name, price: dish.price, qty: 1 })
  }

  function increase(id: number) {
    const found = items.value.find(i => i.id === id)
    if (found) found.qty++
  }

  function decrease(id: number) {
    const found = items.value.find(i => i.id === id)
    if (!found) return
    found.qty--
    if (found.qty <= 0) items.value = items.value.filter(i => i.id !== id)
  }

  function clear() {
    items.value = []
  }

  return { items, count, total, add, increase, decrease, clear }
}