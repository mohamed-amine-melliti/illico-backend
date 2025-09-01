<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

// Redirect to dashboard if already authenticated
const authStore = useAuthStore()
if (process.client && authStore.isAuthenticated) {
  navigateTo('/')
}
</script>

<template>
  <LayoutAuth reverse>
    <div class="grid mx-auto max-w-sm gap-6">
      <div class="grid gap-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">
          Admin Login
        </h1>
        <p class="text-balance text-sm text-muted-foreground">
          Enter your credentials to access the dashboard
        </p>
      </div>
      <AuthAdminSignIn />
    </div>
  </LayoutAuth>
</template>