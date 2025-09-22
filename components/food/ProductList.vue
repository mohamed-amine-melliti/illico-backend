<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Food Products</h1>
    
    <!-- Tabs for different product categories -->
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
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-destructive/10 p-4 rounded-md text-destructive">
      <p>Error loading products: {{ error }}</p>
    </div>
    
    <!-- Products grid -->
    <div v-else>
      <!-- Pizzas -->
      <div v-if="activeTab === 'pizzas'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="pizza in pizzas" :key="pizza.id" class="border rounded-lg overflow-hidden shadow-sm">
          <div class="p-4">
            <h3 class="text-lg font-semibold">{{ pizza.name }}</h3>
            <p class="text-muted-foreground text-sm mt-1">{{ pizza.description }}</p>
            <div class="mt-4 flex justify-between items-center">
              <span class="font-bold">{{ pizza.price }}€</span>
              <button class="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm">Add to cart</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Paninis -->
      <div v-if="activeTab === 'paninis'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="panini in paninis" :key="panini.id" class="border rounded-lg overflow-hidden shadow-sm">
          <div class="p-4">
            <h3 class="text-lg font-semibold">{{ panini.name }}</h3>
            <p class="text-muted-foreground text-sm mt-1">{{ panini.description }}</p>
            <div class="mt-4 flex justify-between items-center">
              <span class="font-bold">{{ panini.price }}€</span>
              <button class="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm">Add to cart</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tex Mex -->
      <div v-if="activeTab === 'texmex'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="item in texMexItems" :key="item.id" class="border rounded-lg overflow-hidden shadow-sm">
          <div class="p-4">
            <h3 class="text-lg font-semibold">{{ item.name }}</h3>
            <p class="text-muted-foreground text-sm mt-1">{{ item.description }}</p>
            <div class="mt-4 flex justify-between items-center">
              <span class="font-bold">{{ item.price }}€</span>
              <button class="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm">Add to cart</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Extras -->
      <div v-if="activeTab === 'extras'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="item in extraItems" :key="item.id" class="border rounded-lg overflow-hidden shadow-sm">
          <div class="p-4">
            <h3 class="text-lg font-semibold">{{ item.name }}</h3>
            <p class="text-muted-foreground text-sm mt-1">{{ item.description }}</p>
            <div class="mt-4 flex justify-between items-center">
              <span class="font-bold">{{ item.price }}€</span>
              <button class="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm">Add to cart</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const loading = ref(true)
const error = ref(null)

// Data for each category
const pizzas = ref([])
const paninis = ref([])
const texMexItems = ref([])
const texMexOptions = ref([])
const extraItems = ref([])
const tortillas = ref([])

// Tabs configuration
const tabs = [
  { id: 'pizzas', name: 'Pizzas' },
  { id: 'paninis', name: 'Paninis' },
  { id: 'texmex', name: 'Tex Mex' },
  { id: 'extras', name: 'Extras' }
]

const activeTab = ref('pizzas')

// Fetch data from API
onMounted(async () => {
  try {
    loading.value = true
    
    // Fetch all data in parallel
    const [pizzasRes, paninisRes, texMexItemsRes, texMexOptionsRes, extraItemsRes, tortillasRes] = await Promise.all([
      $fetch('/api/pizzas'),
      $fetch('/api/paninis'),
      $fetch('/api/tex-mex-items'),
      $fetch('/api/tex-mex-options'),
      $fetch('/api/extra-items'),
      $fetch('/api/tortillas')
    ])
    
    // Assign data to reactive refs
    pizzas.value = pizzasRes.data || []
    paninis.value = paninisRes.data || []
    texMexItems.value = texMexItemsRes.data || []
    texMexOptions.value = texMexOptionsRes.data || []
    extraItems.value = extraItemsRes.data || []
    tortillas.value = tortillasRes.data || []
    
    console.log("✅ ProductList.vue data loaded:", {
      pizzas: pizzas.value.length,
      paninis: paninis.value.length,
      texMexItems: texMexItems.value.length,
      extraItems: extraItems.value.length
    })
  } catch (err) {
    console.error("Error fetching product data:", err)
    error.value = err.message || "Failed to load products"
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Additional styling if needed */
</style>
