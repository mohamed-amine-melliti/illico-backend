<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'blank',
})

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')
const authStore = useAuthStore()
const router = useRouter()

// If already authenticated, redirect to home
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})

function onSubmit(event: Event) {
  event.preventDefault()
  if (!username.value || !password.value) {
    error.value = 'Please enter both username and password'
    return
  }

  error.value = ''
  isLoading.value = true

  // Attempt login with a slight delay to simulate API call
  setTimeout(() => {
    const success = authStore.login(username.value, password.value)
    
    if (success) {
      router.push('/')
    } else {
      error.value = 'Invalid username or password'
    }
    
    isLoading.value = false
  }, 1000)
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-6 bg-muted p-6 min-h-svh md:p-10">
    <div class="max-w-sm w-full flex flex-col gap-6">
      <NuxtLink to="/" class="flex items-center self-center gap-2 font-medium">
        <div class="h-6 w-6 flex items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Icon name="i-lucide-gallery-vertical-end" class="size-4" />
        </div>
        Order Management System
      </NuxtLink>
      <Card>
        <CardHeader class="text-center">
          <CardTitle class="text-xl">
            Admin Login
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the order management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form class="grid gap-4" @submit="onSubmit">
            <div class="grid gap-2">
              <Label for="username">
                Username
              </Label>
              <Input
                id="username"
                v-model="username"
                type="text"
                placeholder="admin"
                :disabled="isLoading"
                auto-capitalize="none"
                auto-complete="username"
                auto-correct="off"
              />
            </div>
            <div class="grid gap-2">
              <Label for="password">
                Password
              </Label>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                :disabled="isLoading"
              />
            </div>
            <div v-if="error" class="text-destructive text-sm">
              {{ error }}
            </div>
            <Button type="submit" class="w-full" :disabled="isLoading">
              <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
      <div class="text-center text-sm text-muted-foreground">
        This is a secure area. Only authorized administrators can access the order management system.
      </div>
    </div>
  </div>
</template>