import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  
  // Predefined admin credentials
  const ADMIN_USERNAME = 'admin'
  const ADMIN_PASSWORD = 'admin123'
  
  // Check if user is already logged in on page load
  if (process.client) {
    const storedAuth = localStorage.getItem('auth')
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth)
        isAuthenticated.value = authData.isAuthenticated
        user.value = authData.user
      } catch (error) {
        console.error('Error parsing auth data:', error)
        localStorage.removeItem('auth')
      }
    }
  }
  
  // Login function
  function login(username: string, password: string) {
    // Check against predefined credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      isAuthenticated.value = true
      user.value = { username }
      
      // Store auth state in localStorage
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: { username }
      }))
      
      return true
    }
    
    return false
  }
  
  // Logout function
  function logout() {
    isAuthenticated.value = false
    user.value = null
    
    // Clear auth state from localStorage
    localStorage.removeItem('auth')
  }
  
  return {
    isAuthenticated,
    user,
    login,
    logout
  }
})