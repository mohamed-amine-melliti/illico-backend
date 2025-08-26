<script setup lang="ts">
import { ref, onMounted } from 'vue'

const client = useSupabaseClient()
const orders = ref([])
const selectedOrder = ref(null)

const statusOptions = [
  {
    value: 'received',
    description: 'Order has been received'
  },
  {
    value: 'preparing',
    description: 'Order is being prepared'
  },
  {
    value: 'delivering',
    description: 'Order is out for delivery'
  },
  {
    value: 'delivered',
    description: 'Order has been delivered'
  }
]

// Fetch orders from Supabase
async function fetchOrders() {
  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    orders.value = data
  } catch (error) {
    console.error('Error fetching orders:', error)
  }
}

// Update order status
async function updateStatus(orderId: string, newStatus: string) {
  try {
    const { error } = await client
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) throw error
    await fetchOrders()
  } catch (error) {
    console.error('Error updating order status:', error)
  }
}

// Initialize data
onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="w-full min-h-screen bg-background p-4">
    <!-- Orders View -->
    <div class="w-full flex gap-4">
      <!-- Orders List -->
      <div class="w-2/3 grid gap-4">
        <h2 class="text-2xl font-bold tracking-tight">Orders</h2>
        
        <div 
          v-for="order in orders" 
          :key="order.id" 
          class="bg-card text-card-foreground rounded-lg border shadow-sm cursor-pointer transition-colors hover:bg-accent"
          :class="{ 'border-primary': selectedOrder?.id === order.id }"
          @click="selectedOrder = order"
        >
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Order #{{ order.id.slice(0, 8) }}</h3>
              <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                {{ order.status }}
              </span>
            </div>
          </div>
          <div class="p-6 pt-0">
            <div class="grid gap-2">
              <div v-if="order.order_items">
                <!-- Pizza items -->
                <div v-if="order.order_items.pizza && order.order_items.pizza.length > 0">
                  <div v-for="(item, index) in order.order_items.pizza" :key="'pizza-'+index" class="flex justify-between">
                    <span>1x {{ item.name }} ({{ item.size }})</span>
                    <span class="text-muted-foreground">{{ item.price }}€</span>
                  </div>
                </div>
                
                <!-- Combo items -->
                <div v-if="order.order_items.combo && order.order_items.combo.length > 0">
                  <div v-for="(item, index) in order.order_items.combo" :key="'combo-'+index" class="flex justify-between">
                    <span>1x {{ item.name }}</span>
                    <span class="text-muted-foreground">{{ item.price }}€</span>
                  </div>
                </div>
                
                <!-- Panini items -->
                <div v-if="order.order_items.panini && order.order_items.panini.length > 0">
                  <div v-for="(item, index) in order.order_items.panini" :key="'panini-'+index" class="flex justify-between">
                    <span>1x {{ item.name }}</span>
                    <span class="text-muted-foreground">{{ item.price }}€</span>
                  </div>
                </div>
                
                <!-- Texmex items -->
                <div v-if="order.order_items.texmex && order.order_items.texmex.length > 0">
                  <div v-for="(item, index) in order.order_items.texmex" :key="'texmex-'+index" class="flex justify-between">
                    <span>1x {{ item.name }}</span>
                    <span class="text-muted-foreground">{{ item.price }}€</span>
                  </div>
                </div>
                
                <!-- Tortilla items -->
                <div v-if="order.order_items.tortilla && order.order_items.tortilla.length > 0">
                  <div v-for="(item, index) in order.order_items.tortilla" :key="'tortilla-'+index" class="flex justify-between">
                    <span>1x {{ item.name }}</span>
                    <span class="text-muted-foreground">{{ item.price }}€</span>
                  </div>
                </div>
                
                <!-- Extras items -->
                <div v-if="order.order_items.extras && order.order_items.extras.length > 0">
                  <div v-for="(item, index) in order.order_items.extras" :key="'extras-'+index" class="flex justify-between">
                    <span>1x {{ item.name }}</span>
                    <span class="text-muted-foreground">{{ item.price }}€</span>
                  </div>
                </div>
                
                <!-- No items message -->
                <div v-if="!order.order_items.pizza?.length && !order.order_items.combo?.length && !order.order_items.panini?.length && !order.order_items.texmex?.length && !order.order_items.tortilla?.length && !order.order_items.extras?.length" class="text-muted-foreground">
                  No items in order
                </div>
              </div>
              <div v-else class="text-muted-foreground">
                No items in order
              </div>
              <div class="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total</span>
                <span>{{ Number(order.total_price || 0).toFixed(2) }}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Details -->
      <div class="w-1/3" v-if="selectedOrder">
        <div class="bg-card text-card-foreground rounded-lg border shadow-sm">
          <div class="p-6">
            <h3 class="text-lg font-semibold">Order Details #{{ selectedOrder.id.slice(0, 8) }}</h3>
          </div>
          <div class="p-6 pt-0 grid gap-4">
            <div class="grid gap-2">
              <h4 class="font-semibold">Customer</h4>
              <p v-if="selectedOrder.customer_info">{{ selectedOrder.customer_info.name }}</p>
              <p v-else class="text-muted-foreground">No customer information</p>
              <p class="text-muted-foreground">{{ new Date(selectedOrder.created_at).toLocaleString() }}</p>
            </div>

            <div class="grid gap-2">
              <h4 class="font-semibold">Items</h4>
              <div v-if="selectedOrder.order_items">
                <!-- Pizza items -->
                <div v-if="selectedOrder.order_items.pizza && selectedOrder.order_items.pizza.length > 0">
                  <div v-for="(item, index) in selectedOrder.order_items.pizza" :key="'pizza-detail-'+index">
                    1x {{ item.name }} ({{ item.size }}) - {{ item.price }}€
                  </div>
                </div>
                
                <!-- Combo items -->
                <div v-if="selectedOrder.order_items.combo && selectedOrder.order_items.combo.length > 0">
                  <div v-for="(item, index) in selectedOrder.order_items.combo" :key="'combo-detail-'+index">
                    1x {{ item.name }} - {{ item.price }}€
                  </div>
                </div>
                
                <!-- Panini items -->
                <div v-if="selectedOrder.order_items.panini && selectedOrder.order_items.panini.length > 0">
                  <div v-for="(item, index) in selectedOrder.order_items.panini" :key="'panini-detail-'+index">
                    1x {{ item.name }} - {{ item.price }}€
                  </div>
                </div>
                
                <!-- Texmex items -->
                <div v-if="selectedOrder.order_items.texmex && selectedOrder.order_items.texmex.length > 0">
                  <div v-for="(item, index) in selectedOrder.order_items.texmex" :key="'texmex-detail-'+index">
                    1x {{ item.name }} - {{ item.price }}€
                  </div>
                </div>
                
                <!-- Tortilla items -->
                <div v-if="selectedOrder.order_items.tortilla && selectedOrder.order_items.tortilla.length > 0">
                  <div v-for="(item, index) in selectedOrder.order_items.tortilla" :key="'tortilla-detail-'+index">
                    1x {{ item.name }} - {{ item.price }}€
                  </div>
                </div>
                
                <!-- Extras items -->
                <div v-if="selectedOrder.order_items.extras && selectedOrder.order_items.extras.length > 0">
                  <div v-for="(item, index) in selectedOrder.order_items.extras" :key="'extras-detail-'+index">
                    1x {{ item.name }} - {{ item.price }}€
                  </div>
                </div>
                
                <!-- No items message -->
                <div v-if="!selectedOrder.order_items.pizza?.length && !selectedOrder.order_items.combo?.length && !selectedOrder.order_items.panini?.length && !selectedOrder.order_items.texmex?.length && !selectedOrder.order_items.tortilla?.length && !selectedOrder.order_items.extras?.length" class="text-muted-foreground">
                  No items in order
                </div>
              </div>
              <div v-else class="text-muted-foreground">
                No items in order
              </div>
            </div>

            <div class="grid gap-2">
              <h4 class="font-semibold">Status</h4>
              <select 
                v-model="selectedOrder.status" 
                @change="updateStatus(selectedOrder.id, selectedOrder.status)"
                class="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option 
                  v-for="status in statusOptions" 
                  :key="status.value" 
                  :value="status.value"
                >
                  {{ status.value }} - {{ status.description }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional custom styles here */
</style>