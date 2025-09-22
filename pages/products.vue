<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(true)
const error = ref<string | null>(null)

// Product categories
const pizzas = ref<any[]>([])
const paninis = ref<any[]>([])
const texMexItems = ref<any[]>([])
const extraItems = ref<any[]>([])
const tortillas = ref<any[]>([])

// Tabs
const tabs = [
  { id: 'pizzas', name: 'Pizzas' },
  { id: 'paninis', name: 'Paninis' },
  { id: 'texmex', name: 'Tex Mex' },
  { id: 'extras', name: 'Extras' },
  { id: 'tortillas', name: 'Tortillas' }
]

const activeTab = ref('pizzas')

// Generic API client returning { data, error }
const useApiClient = () => {
  return {
    fetchCategory: async (apiPath: string) => {
      try {
        const response = await fetch(apiPath)
        const result = await response.json()
        return { data: result.data || [], error: null }
      } catch (err: any) {
        console.error(`Error fetching ${apiPath}:`, err)
        return { data: [], error: err }
      }
    }
  }
}

const apiClient = useApiClient()

// Fetch all categories
onMounted(async () => {
  loading.value = true
  try {
    const [
      pizzasRes,
      paninisRes,
      texMexRes,
      extraRes,
      tortillasRes
    ] = await Promise.all([
      apiClient.fetchCategory('/api/pizzas'),
      apiClient.fetchCategory('/api/paninis'),
      apiClient.fetchCategory('/api/tex-mex-items'),
      apiClient.fetchCategory('/api/extra-items'),
      apiClient.fetchCategory('/api/tortillas')
    ])

    pizzas.value = pizzasRes.data
    paninis.value = paninisRes.data
    texMexItems.value = texMexRes.data
    extraItems.value = extraRes.data
    tortillas.value = tortillasRes.data

    // Log any errors per category
    const responses = [pizzasRes, paninisRes, texMexRes, extraRes, tortillasRes];
    responses.forEach((res, idx) => {
      if (res.error && tabs[idx]?.name) console.warn(`Error loading ${tabs[idx].name}:`, res.error)
    })

    console.log('✅ Products loaded:', {
      pizzas: pizzas.value.length,
      paninis: paninis.value.length,
      texMexItems: texMexItems.value.length,
      extraItems: extraItems.value.length,
      tortillas: tortillas.value.length
    })
  } catch (err: any) {
    error.value = err.message || 'Failed to load products'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Food Products</h1>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="flex space-x-2 border-b">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 font-medium',
            activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
          ]"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-destructive/10 p-4 rounded-md text-destructive">
      <p>Error loading products: {{ error }}</p>
    </div>

    <!-- Products grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <template v-if="activeTab === 'pizzas'">
        <div v-for="item in pizzas" :key="item.id" class="border rounded-lg p-4 shadow-sm">
          <h3 class="text-lg font-semibold">{{ item.name }}</h3>
          <p class="text-muted-foreground text-sm mt-1">{{ item.description }}</p>
          <div class="mt-4 flex justify-between items-center">
            <span class="font-bold">{{ item.price }}€</span>
            <button class="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm">Add to cart</button>
          </div>
        </div>
      </template>

      <template v-if="activeTab === 'paninis'">
        <div v-for="item in paninis" :key="item.id" class="border rounded-lg p-4 shadow-sm">
          <h3 class="text-lg font-semibold">{{ item.name }}</h3>
          <p class="text-muted-foreground text-sm mt-1">{{ item.description }}</p>
          <div class="mt-4 flex justify-between items-center">
            <span class="font-bold">{{ item.price }}€</span>
            <button class="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm">Add to cart</button>
          </div>
        </div>
      </template>

      <template v-if="activeTab === 'texmex'">
        <div v-for="item in texMexItems" :key="item.id" class="border rounded-lg p-4 shadow-sm">
          <h3 class="text-lg font-semibold">{{ item.name }}</h3>
          <p class="text-muted-foreground text-sm mt-1">{{ item.description }}</p>
          <div class="mt-4 flex justify-between items-center">
            <span class="font-bold">{{ item.price }}€</span>
            <button class="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm">Add to cart</button>
          </div>
        </div>
      </template>

      <template v-if="activeTab === 'extras'">
        <div v-for="item in extraItems" :key="item.id" class="border rounded-lg p-4 shadow-sm">
          <h3 class="text-lg font-semibold">{{ item.name }}</h3>
          <p class="text-muted-foreground text-sm mt-1">{{ item.description }}</p>
          <div class="mt-4 flex justify-between items-center">
            <span class="font-bold">{{ item.price }}€</span>
            <button class="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm">Add to cart</button>
          </div>
        </div>
      </template>

      <template v-if="activeTab === 'tortillas'">
        <div v-for="item in tortillas" :key="item.id" class="border rounded-lg p-4 shadow-sm">
          <h3 class="text-lg font-semibold">{{ item.name }}</h3>
          <p class="text-muted-foreground text-sm mt-1">{{ item.description }}</p>
          <div class="mt-4 flex justify-between items-center">
            <span class="font-bold">{{ item.price }}€</span>
            <button class="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm">Add to cart</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
