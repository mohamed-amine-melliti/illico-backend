<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import PasswordInput from '~/components/PasswordInput.vue'

const username = ref('admin')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const authStore = useAuthStore()

function onSubmit(event: Event) {
  event.preventDefault()
  if (!username.value || !password.value) return

  isLoading.value = true
  errorMessage.value = ''

  // Use the auth store login function
  const success = authStore.login(username.value, password.value)
  
  if (success) {
    navigateTo('/')
  } else {
    errorMessage.value = 'Invalid username or password'
  }
  
  isLoading.value = false
}
</script>

<template>
  <form class="grid gap-6" @submit="onSubmit">
    <div v-if="errorMessage" class="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
      {{ errorMessage }}
    </div>
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
      <div class="flex items-center">
        <Label for="password">
          Password
        </Label>
      </div>
      <PasswordInput id="password" v-model="password" />
      <p class="text-xs text-muted-foreground mt-1">Default: admin / admin123</p>
    </div>
    <Button type="submit" class="w-full" :disabled="isLoading">
      <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
      Login
    </Button>
  </form>
</template>