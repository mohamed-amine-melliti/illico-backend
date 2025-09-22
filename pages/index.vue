<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['auth']
})

// Replace Supabase client with PostgreSQL connection
const pgConfig = {
  connectionString: 'postgresql://postgres:postgres@5.135.246.80:5432/illico_pizza_db'
}

// Create a composable for PostgreSQL connection
const usePgClient = () => {
  return {
    query: async (text, params) => {
      try {
        // In a real implementation, you would use a server-side API endpoint
        // Direct database connections should not be made from the client-side
        // This is a simplified example - in production, create a Nuxt server API endpoint
        const response = await fetch('/api/db', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: text, params }),
        })
        
        const result = await response.json()
        return { data: result.data, error: result.error }
      } catch (error) {
        console.error('Database query error:', error)
        return { data: null, error }
      }
    }
  }
}

const pgClient = usePgClient()
console.log('PostgreSQL client initialized')
const orders = ref([])
const selectedOrder = ref(null)
const authStore = useAuthStore()

const statusOptions = [
  {
    value: 'received',
    description: 'Order has been received',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '📋'
  },
  {
    value: 'preparing',
    description: 'Order is being prepared',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: '👨‍🍳'
  },
  {
    value: 'delivering',
    description: 'Order is out for delivery',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: '🚗'
  },
  {
    value: 'delivered',
    description: 'Order has been delivered',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '✅'
  }
]

// Get status styling
const getStatusStyle = (status) => {
  return statusOptions.find(s => s.value === status) || statusOptions[0]
}

// Computed property to sort orders (delivered ones at bottom)
const sortedOrders = computed(() => {
  return [...orders.value].sort((a, b) => {
    // Delivered orders go to bottom
    if (a.status === 'delivered' && b.status !== 'delivered') return 1
    if (b.status === 'delivered' && a.status !== 'delivered') return -1
    
    // Sort by creation date (newest first) for non-delivered orders
    return new Date(b.created_at) - new Date(a.created_at)
  })
})

// Fetch orders from PostgreSQL
async function fetchOrders() {
  console.log('Fetching orders...')
  try {
    console.log('Attempting to fetch from PostgreSQL...')
    
    // Query orders table
    const { data, error } = await pgClient.query('SELECT * FROM orders')

    if (error) {
      console.error('PostgreSQL error:', error)
      orders.value = []
      return
    }
    
    if (!data || data.length === 0) {
      console.log('No orders found in database')
      orders.value = []
      return
    }
    
    console.log('Orders fetched successfully:', data.length, 'orders')
    console.log('First order data:', data[0])
    orders.value = data
  } catch (error) {
    console.error('Error fetching orders:', error)
    orders.value = []
  }
}

// Update order status
async function updateStatus(orderId: string, newStatus: string) {
  try {
    const { error } = await pgClient.query(
      'UPDATE orders SET status = $1 WHERE id = $2',
      [newStatus, orderId]
    )

    if (error) throw error
    await fetchOrders()
  } catch (error) {
    console.error('Error updating order status:', error)
  }
}

// Get total items count in an order
const getTotalItems = (orderItems) => {
  if (!orderItems) return 0
  let total = 0
  Object.values(orderItems).forEach(items => {
    if (Array.isArray(items)) total += items.length
  })
  return total
}

// Initialize data
onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center space-x-4">
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-3">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Order Management</h1>
              <p class="text-gray-600">Manage and track all orders</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm text-gray-600">Logged in as</p>
              <p class="font-semibold text-gray-900">{{ authStore.user?.username }}</p>
            </div>
            <button 
              @click="authStore.logout(); navigateTo('/admin/login')"
              class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div v-for="status in statusOptions" :key="status.value" 
             :class="`bg-white rounded-xl shadow-sm border-l-4 ${status.color.replace('bg-', 'border-')} p-6`">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="text-2xl">{{ status.icon }}</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 capitalize">{{ status.value }}</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ orders.filter(o => o.status === status.value).length }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex gap-8">
        <!-- Orders List -->
        <div class="flex-1">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Orders</h2>
            <p class="text-gray-600">{{ orders.length }} total orders</p>
          </div>
          
          <!-- No orders message -->
          <div v-if="orders.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p class="text-gray-600">Please check your database connection or wait for new orders to arrive.</p>
          </div>
          
          <!-- Orders Grid -->
          <div class="space-y-4">
            <div 
              v-for="order in sortedOrders" 
              :key="order.id" 
              class="bg-white rounded-xl shadow-sm border transition-all duration-200 cursor-pointer hover:shadow-md"
              :class="[
                selectedOrder?.id === order.id ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-200 hover:border-gray-300',
                order.status === 'delivered' ? 'opacity-75' : ''
              ]"
              @click="selectedOrder = order"
            >
              <div class="p-6">
                <!-- Order Header -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="bg-gray-100 text-gray-600 rounded-lg px-3 py-1 text-sm font-mono">
                      #{{ order.id.slice(0, 8) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ new Date(order.created_at).toLocaleString() }}
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-3">
                    <div :class="`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(order.status).bgColor} ${getStatusStyle(order.status).textColor}`">
                      <span class="mr-2">{{ getStatusStyle(order.status).icon }}</span>
                      {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                    </div>
                  </div>
                </div>

                <!-- Customer Info -->
                <div class="mb-4">
                  <p class="font-medium text-gray-900">
                    {{ order.customer_info?.name || 'Unknown Customer' }}
                  </p>
                  <p class="text-sm text-gray-600">
                    {{ getTotalItems(order.order_items) }} items • {{ Number(order.total_price || 0).toFixed(2) }}€
                  </p>
                </div>

                <!-- Order Items Preview -->
                <div class="space-y-2">
                  <div v-if="order.order_items">
                    <!-- Pizza items -->
                    <div v-if="order.order_items.pizza && order.order_items.pizza.length > 0">
                      <div v-for="(item, index) in order.order_items.pizza.slice(0, 2)" :key="'pizza-'+index" 
                           class="flex justify-between items-center py-1">
                        <span class="text-sm text-gray-700">
                          <span class="inline-block w-6 h-6 bg-red-100 text-red-600 rounded text-xs font-medium text-center leading-6 mr-2">🍕</span>
                          {{ item.name }} ({{ item.size }})
                        </span>
                        <span class="text-sm font-medium text-gray-900">{{ item.price }}€</span>
                      </div>
                      <div v-if="order.order_items.pizza.length > 2" class="text-xs text-gray-500 ml-8">
                        +{{ order.order_items.pizza.length - 2 }} more pizza items
                      </div>
                    </div>
                    
                    <!-- Other items preview -->
                    <div v-if="order.order_items.combo && order.order_items.combo.length > 0">
                      <div class="flex justify-between items-center py-1">
                        <span class="text-sm text-gray-700">
                          <span class="inline-block w-6 h-6 bg-yellow-100 text-yellow-600 rounded text-xs font-medium text-center leading-6 mr-2">🍽️</span>
                          {{ order.order_items.combo[0].name }}
                          <span v-if="order.order_items.combo.length > 1" class="text-xs text-gray-500">
                            +{{ order.order_items.combo.length - 1 }} more
                          </span>
                        </span>
                        <span class="text-sm font-medium text-gray-900">{{ order.order_items.combo[0].price }}€</span>
                      </div>
                    </div>

                    <!-- Show other categories if no pizza/combo -->
                    <div v-if="!order.order_items.pizza?.length && !order.order_items.combo?.length">
                      <div v-if="order.order_items.panini && order.order_items.panini.length > 0" class="flex justify-between items-center py-1">
                        <span class="text-sm text-gray-700">
                          <span class="inline-block w-6 h-6 bg-green-100 text-green-600 rounded text-xs font-medium text-center leading-6 mr-2">🥖</span>
                          {{ order.order_items.panini[0].name }}
                        </span>
                        <span class="text-sm font-medium text-gray-900">{{ order.order_items.panini[0].price }}€</span>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="text-sm text-gray-500 italic">No items in order</div>
                </div>

                <!-- Total -->
                <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <span class="font-semibold text-gray-900">Total</span>
                  <span class="font-bold text-lg text-gray-900">{{ Number(order.total_price || 0).toFixed(2) }}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Details Sidebar -->
        <div class="w-80" v-if="selectedOrder">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-8">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Order Details</h3>
                <div class="bg-gray-100 text-gray-600 rounded-lg px-3 py-1 text-sm font-mono">
                  #{{ selectedOrder.id.slice(0, 8) }}
                </div>
              </div>
            </div>

            <div class="p-6 space-y-6">
              <!-- Status Update -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Order Status</label>
                <select 
                  v-model="selectedOrder.status" 
                  @change="updateStatus(selectedOrder.id, selectedOrder.status)"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option 
                    v-for="status in statusOptions" 
                    :key="status.value" 
                    :value="status.value"
                  >
                    {{ status.icon }} {{ status.value.charAt(0).toUpperCase() + status.value.slice(1) }} - {{ status.description }}
                  </option>
                </select>
              </div>

              <!-- Customer Info -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">Customer Information</h4>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="font-medium text-gray-900">{{ selectedOrder.customer_info?.name || 'Unknown Customer' }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ new Date(selectedOrder.created_at).toLocaleString() }}</p>
                </div>
              </div>

              <!-- Order Items -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">Order Items</h4>
                <div class="space-y-3">
                  <div v-if="selectedOrder.order_items">
                    <!-- Pizza items -->
                    <div v-if="selectedOrder.order_items.pizza && selectedOrder.order_items.pizza.length > 0">
                      <div class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Pizza</div>
                      <div v-for="(item, index) in selectedOrder.order_items.pizza" :key="'pizza-detail-'+index" 
                           class="flex justify-between items-center py-2 px-3 bg-red-50 rounded-lg">
                        <span class="text-sm">{{ item.name }} ({{ item.size }})</span>
                        <span class="text-sm font-medium">{{ item.price }}€</span>
                      </div>
                    </div>
                    
                    <!-- Combo items -->
                    <div v-if="selectedOrder.order_items.combo && selectedOrder.order_items.combo.length > 0">
                      <div class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Combo</div>
                      <div v-for="(item, index) in selectedOrder.order_items.combo" :key="'combo-detail-'+index" 
                           class="flex justify-between items-center py-2 px-3 bg-yellow-50 rounded-lg">
                        <span class="text-sm">{{ item.name }}</span>
                        <span class="text-sm font-medium">{{ item.price }}€</span>
                      </div>
                    </div>
                    
                    <!-- Panini items -->
                    <div v-if="selectedOrder.order_items.panini && selectedOrder.order_items.panini.length > 0">
                      <div class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Panini</div>
                      <div v-for="(item, index) in selectedOrder.order_items.panini" :key="'panini-detail-'+index" 
                           class="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg">
                        <span class="text-sm">{{ item.name }}</span>
                        <span class="text-sm font-medium">{{ item.price }}€</span>
                      </div>
                    </div>
                    
                    <!-- Texmex items -->
                    <div v-if="selectedOrder.order_items.texmex && selectedOrder.order_items.texmex.length > 0">
                      <div class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Tex-Mex</div>
                      <div v-for="(item, index) in selectedOrder.order_items.texmex" :key="'texmex-detail-'+index" 
                           class="flex justify-between items-center py-2 px-3 bg-orange-50 rounded-lg">
                        <span class="text-sm">{{ item.name }}</span>
                        <span class="text-sm font-medium">{{ item.price }}€</span>
                      </div>
                    </div>
                    
                    <!-- Tortilla items -->
                    <div v-if="selectedOrder.order_items.tortilla && selectedOrder.order_items.tortilla.length > 0">
                      <div class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Tortilla</div>
                      <div v-for="(item, index) in selectedOrder.order_items.tortilla" :key="'tortilla-detail-'+index" 
                           class="flex justify-between items-center py-2 px-3 bg-purple-50 rounded-lg">
                        <span class="text-sm">{{ item.name }}</span>
                        <span class="text-sm font-medium">{{ item.price }}€</span>
                      </div>
                    </div>
                    
                    <!-- Extras items -->
                    <div v-if="selectedOrder.order_items.extras && selectedOrder.order_items.extras.length > 0">
                      <div class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Extras</div>
                      <div v-for="(item, index) in selectedOrder.order_items.extras" :key="'extras-detail-'+index" 
                           class="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg">
                        <span class="text-sm">{{ item.name }}</span>
                        <span class="text-sm font-medium">{{ item.price }}€</span>
                      </div>
                    </div>
                    
                    <!-- No items message -->
                    <div v-if="!selectedOrder.order_items.pizza?.length && !selectedOrder.order_items.combo?.length && !selectedOrder.order_items.panini?.length && !selectedOrder.order_items.texmex?.length && !selectedOrder.order_items.tortilla?.length && !selectedOrder.order_items.extras?.length" 
                         class="text-center py-8 text-gray-500">
                      No items in this order
                    </div>
                  </div>
                  <div v-else class="text-center py-8 text-gray-500">
                    No items in this order
                  </div>
                </div>
              </div>

              <!-- Order Summary -->
              <div class="border-t border-gray-100 pt-4">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-semibold text-gray-900">Total</span>
                  <span class="text-2xl font-bold text-gray-900">{{ Number(selectedOrder.total_price || 0).toFixed(2) }}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth transitions for all interactive elements */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Custom scrollbar for the sidebar */
.sticky {
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
}

.sticky::-webkit-scrollbar {
  width: 6px;
}

.sticky::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.sticky::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.sticky::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>