export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()
  const publicPages = ['/login', '/register']
  const isPublic = publicPages.includes(to.path)

  // Not logged in: only login and register are allowed
  if (!user.value && !isPublic) return navigateTo('/login')

  // Already logged in: no need to see login or register again
  if (user.value && isPublic) return navigateTo('/dashboard')
})