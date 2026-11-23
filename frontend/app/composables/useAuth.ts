const USE_MOCK = true // TEMP MOCK: set to false when the Laravel API is ready

export const useAuth = () => {
  const config = useRuntimeConfig()
  const user = useState<any>('user', () => null)
  const token = useState<string | null>('token', () => null)

  async function login(username: string, password: string) {
    if (USE_MOCK) {
      const role = username.startsWith('admin') ? 'admin' : username.startsWith('staff') ? 'staff' : 'customer'
      user.value = { id: 1, username, role }
      token.value = 'mock-token'
      return
    }
    const res = await $fetch<any>('/api/login', {
      baseURL: config.public.apiBase, method: 'POST', body: { username, password }
    })
    user.value = res.user
    token.value = res.token
  }

  async function register(payload: { username: string; email: string; password: string; password_confirmation: string }) {
    if (USE_MOCK) return
    await $fetch('/api/register', { baseURL: config.public.apiBase, method: 'POST', body: payload })
  }

  async function logout() {
    if (!USE_MOCK && token.value) {
      await $fetch('/api/logout', {
        baseURL: config.public.apiBase, method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` }
      }).catch(() => {})
    }
    user.value = null
    token.value = null
  }

  return { user, token, login, register, logout }
}