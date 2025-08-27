export default defineNuxtRouteMiddleware((to) => {
  // Only apply auth check in client-side to avoid SSR issues
  if (process.client) {
    const authStore = useAuthStore()
    
    // Skip middleware if going to login page
    if (to.path === '/admin/login') {
      return
    }
    
    // If user is not authenticated and trying to access protected route, redirect to login
    if (!authStore.isAuthenticated && to.path === '/') {
      return navigateTo('/admin/login')
    }
  }
})