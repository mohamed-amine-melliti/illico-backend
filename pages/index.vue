<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import ProductList from '~/components/food/ProductList.vue'

definePageMeta({
  middleware: ['auth']
})

// Configuration de la connexion PostgreSQL
const pgConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/illico_pizza_db'
}

// Créer un composable pour la connexion PostgreSQL
const usePgClient = () => {
  return {
    query: async (text, params) => {
      try {
        // Dans une implémentation réelle, vous utiliseriez un endpoint API côté serveur
        // Les connexions directes à la base de données ne doivent pas être faites côté client
        // Ceci est un exemple simplifié - en production, créez un endpoint API serveur Nuxt
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
        console.error('Erreur de requête base de données:', error)
        return { data: null, error }
      }
    }
  }
}

const pgClient = usePgClient()
console.log('Client PostgreSQL initialisé')
const orders = ref([])
const selectedOrder = ref(null)
const authStore = useAuthStore()

const statusOptions = [
  {
    value: 'received',
    description: 'Commande reçue',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '📋'
  },
  {
    value: 'preparing',
    description: 'Commande en préparation',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: '👨‍🍳'
  },
  {
    value: 'delivering',
    description: 'Commande en livraison',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: '🚗'
  },
  {
    value: 'delivered',
    description: 'Commande livrée',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '✅'
  }
]

// Obtenir le style du statut
const getStatusStyle = (status) => {
  return statusOptions.find(s => s.value === status) || statusOptions[0]
}

// Propriété calculée pour trier les commandes (les livrées en bas)
const sortedOrders = computed(() => {
  return [...orders.value].sort((a, b) => {
    // Les commandes livrées vont en bas
    if (a.status === 'delivered' && b.status !== 'delivered') return 1
    if (b.status === 'delivered' && a.status !== 'delivered') return -1
    
    // Trier par date de création (plus récentes en premier) pour les commandes non livrées
    return new Date(b.created_at) - new Date(a.created_at)
  })
})

// Récupérer les commandes depuis PostgreSQL
async function fetchOrders() {
  console.log('Récupération des commandes...')
  try {
    console.log('Tentative de récupération depuis PostgreSQL...')
    
    // Requête de la table orders
    const { data, error } = await pgClient.query('SELECT * FROM orders')

    if (error) {
      console.error('Erreur PostgreSQL:', error)
      orders.value = []
      return
    }
    
    if (!data || data.length === 0) {
      console.log('Aucune commande trouvée dans la base de données')
      orders.value = []
      return
    }
    
    console.log('Commandes récupérées avec succès:', data.length, 'commandes')
    console.log('Données de la première commande:', data[0])
    orders.value = data
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error)
    orders.value = []
  }
}

// Mettre à jour le statut de la commande
async function updateStatus(orderId: string, newStatus: string) {
  try {
    const { error } = await pgClient.query(
      'UPDATE orders SET status = $1 WHERE id = $2',
      [newStatus, orderId]
    )

    if (error) throw error
    await fetchOrders()
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de la commande:', error)
  }
}

// Obtenir le nombre total d'articles dans une commande
const getTotalItems = (orderItems) => {
  if (!orderItems) return 0
  let total = 0
  Object.values(orderItems).forEach(items => {
    if (Array.isArray(items)) total += items.length
  })
  return total
}

// Initialiser les données
onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- En-tête -->
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
              <h1 class="text-3xl font-bold text-black">Tableau de bord</h1>
              <p class="text-black">Gérer et suivre toutes les commandes</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm text-black">Connecté en tant que</p>
              <p class="font-semibold text-black">{{ authStore.user?.username }}</p>
            </div>
            <button 
              @click="authStore.logout(); navigateTo('/admin/login')"
              class="flex items-center px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Aperçu des statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div v-for="status in statusOptions" :key="status.value" 
             :class="`bg-white rounded-xl shadow-sm border-l-4 ${status.color.replace('bg-', 'border-')} p-6`">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="text-2xl">{{ status.icon }}</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-black capitalize">{{ status.description }}</p>
              <p class="text-2xl font-bold text-black">
                {{ orders.filter(o => o.status === status.value).length }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="flex gap-8">
        <!-- Liste des commandes -->
        <div class="flex-1">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-black mb-2">Commandes</h2>
            <p class="text-black">{{ orders.length }} commandes au total</p>
          </div>
          
          <!-- Message aucune commande -->
          <div v-if="orders.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="text-lg font-medium text-black mb-2">Aucune commande trouvée</h3>
            <p class="text-black">Veuillez vérifier votre connexion à la base de données ou attendre que de nouvelles commandes arrivent.</p>
          </div>
          
          <!-- Grille des commandes -->
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
                <!-- En-tête de la commande -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="bg-gray-100 text-black rounded-lg px-3 py-1 text-sm font-mono">
                      #{{ order.id.slice(0, 8) }}
                    </div>
                    <div class="text-sm text-black">
                      {{ new Date(order.created_at).toLocaleString('fr-FR') }}
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-3">
                    <div :class="`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(order.status).bgColor} ${getStatusStyle(order.status).textColor}`">
                      <span class="mr-2">{{ getStatusStyle(order.status).icon }}</span>
                      {{ getStatusStyle(order.status).description }}
                    </div>
                  </div>
                </div>

                <!-- Informations client -->
                <div class="mb-4">
                  <p class="font-medium text-black">
                    {{ order.customer_info?.name || 'Client inconnu' }}
                  </p>
                  <p class="text-sm text-black">
                    {{ getTotalItems(order.order_items) }} articles • {{ Number(order.total_price || 0).toFixed(2) }}€
                  </p>
                </div>

                <!-- Aperçu des articles de la commande -->
                <div class="space-y-2">
                  <div v-if="order.order_items">
                    <!-- Articles pizza -->
                    <div v-if="order.order_items.pizza && order.order_items.pizza.length > 0">
                      <div v-for="(item, index) in order.order_items.pizza.slice(0, 2)" :key="'pizza-'+index" 
                           class="flex justify-between items-center py-1">
                        <span class="text-sm text-black">
                          <span class="inline-block w-6 h-6 bg-red-100 text-red-600 rounded text-xs font-medium text-center leading-6 mr-2">🍕</span>
                          {{ item.name }} ({{ item.size }})
                        </span>
                        <span class="text-sm font-medium text-black">{{ item.price }}€</span>
                      </div>
                      <div v-if="order.order_items.pizza.length > 2" class="text-xs text-black ml-8">
                        +{{ order.order_items.pizza.length - 2 }} autres pizzas
                      </div>
                    </div>
                    
                    <!-- Aperçu autres articles -->
                    <div v-if="order.order_items.combo && order.order_items.combo.length > 0">
                      <div class="flex justify-between items-center py-1">
                        <span class="text-sm text-black">
                          <span class="inline-block w-6 h-6 bg-yellow-100 text-yellow-600 rounded text-xs font-medium text-center leading-6 mr-2">🍽️</span>
                          {{ order.order_items.combo[0].name }}
                          <span v-if="order.order_items.combo.length > 1" class="text-xs text-black">
                            +{{ order.order_items.combo.length - 1 }} de plus
                          </span>
                        </span>
                        <span class="text-sm font-medium text-black">{{ order.order_items.combo[0].price }}€</span>
                      </div>
                    </div>

                    <!-- Afficher autres catégories si pas de pizza/combo -->
                    <div v-if="!order.order_items.pizza?.length && !order.order_items.combo?.length">
                      <div v-if="order.order_items.panini && order.order_items.panini.length > 0" class="flex justify-between items-center py-1">
                        <span class="text-sm text-black">
                          <span class="inline-block w-6 h-6 bg-green-100 text-green-600 rounded text-xs font-medium text-center leading-6 mr-2">🥖</span>
                          {{ order.order_items.panini[0].name }}
                        </span>
                        <span class="text-sm font-medium text-black">{{ order.order_items.panini[0].price }}€</span>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="text-sm text-black italic">Aucun article dans la commande</div>
                </div>

                <!-- Total -->
                <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <span class="font-semibold text-black">Total</span>
                  <span class="font-bold text-lg text-black">{{ Number(order.total_price || 0).toFixed(2) }}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Barre latérale des détails de la commande -->
        <div class="w-80" v-if="selectedOrder">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-8">
            <!-- En-tête -->
            <div class="px-6 py-4 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-black">Détails de la Commande</h3>
                <div class="bg-gray-100 text-black rounded-lg px-3 py-1 text-sm font-mono">
                  #{{ selectedOrder.id.slice(0, 8) }}
                </div>
              </div>
            </div>

            <div class="p-6 space-y-6">
              <!-- Mise à jour du statut -->
              <div>
                <label class="block text-sm font-medium text-black mb-3">Statut de la Commande</label>
                <select 
                  v-model="selectedOrder.status" 
                  @change="updateStatus(selectedOrder.id, selectedOrder.status)"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option 
                    v-for="status in statusOptions" 
                    :key="status.value" 
                    :value="status.value"
                  >
                    {{ status.icon }} {{ status.description }}
                  </option>
                </select>
              </div>

              <!-- Informations client -->
              <div>
                <h4 class="text-sm font-medium text-black mb-3">Informations Client</h4>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="font-medium text-black">{{ selectedOrder.customer_info?.name || 'Client inconnu' }}</p>
                  <p class="text-sm text-black mt-1">{{ new Date(selectedOrder.created_at).toLocaleString('fr-FR') }}</p>
                </div>
              </div>

              <!-- Articles de la commande -->
              <div>
                <h4 class="text-sm font-medium text-black mb-3">Articles de la Commande</h4>
                <div class="space-y-3">
                  <div v-if="selectedOrder.order_items">
                    <!-- Articles pizza -->
                    <div v-if="selectedOrder.order_items.pizza && selectedOrder.order_items.pizza.length > 0">
                      <div class="text-xs font-medium text-black uppercase tracking-wider mb-2">Pizza</div>
                      <div v-for="(item, index) in selectedOrder.order_items.pizza" :key="'pizza-detail-'+index" 
                           class="flex justify-between items-center py-2 px-3 bg-red-50 rounded-lg">
                        <span class="text-sm text-black">{{ item.name }} ({{ item.size }})</span>
                        <span class="text-sm font-medium text-black">{{ item.price }}€</span>
                      </div>
                    </div>
                    
                    <!-- Articles combo -->
                    <div v-if="selectedOrder.order_items.combo && selectedOrder.order_items.combo.length > 0">
                      <div class="text-xs font-medium text-black uppercase tracking-wider mb-2">Combo</div>
                      <div v-for="(item, index) in selectedOrder.order_items.combo" :key="'combo-detail-'+index" 
                           class="flex justify-between items-center py-2 px-3 bg-yellow-50 rounded-lg">
                        <span class="text-sm text-black">{{ item.name }}</span>
                        <span class="text-sm font-medium text-black">{{ item.price }}€</span>
                      </div>
                    </div>
                    
                    <!-- Articles panini -->
                    <div v-if="selectedOrder.order_items.panini && selectedOrder.order_items.panini.length > 0">
                      <div class="text-xs font-medium text-black uppercase tracking-wider mb-2">Panini</div>
                      <div v-for="(item, index) in selectedOrder.order_items.panini" :key="'panini-detail-'+index" 
                           class="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg">
                        <span class="text-sm text-black">{{ item.name }}</span>
                        <span class="text-sm font-medium text-black">{{ item.price }}€</span>
                      </div>
                    </div>
                    
                    <!-- Articles texmex -->
                    <div v-if="selectedOrder.order_items.texmex && selectedOrder.order_items.texmex.length > 0">
                      <div class="text-xs font-medium text-black uppercase tracking-wider mb-2">Tex-Mex</div>
                      <div v-for="(item, index) in selectedOrder.order_items.texmex" :key="'texmex-detail-'+index" 
                           class="flex justify-between items-center py-2 px-3 bg-orange-50 rounded-lg">
                        <span class="text-sm text-black">{{ item.name }}</span>
                        <span class="text-sm font-medium text-black">{{ item.price }}€</span>
                      </div>
                    </div>
                    
                    <!-- Articles tortilla -->
                    <div v-if="selectedOrder.order_items.tortilla && selectedOrder.order_items.tortilla.length > 0">
                      <div class="text-xs font-medium text-black uppercase tracking-wider mb-2">Tortilla</div>
                      <div v-for="(item, index) in selectedOrder.order_items.tortilla" :key="'tortilla-detail-'+index" 
                           class="flex justify-between items-center py-2 px-3 bg-purple-50 rounded-lg">
                        <span class="text-sm text-black">{{ item.name }}</span>
                        <span class="text-sm font-medium text-black">{{ item.price }}€</span>
                      </div>
                    </div>
                    
                    <!-- Articles extras -->
                    <div v-if="selectedOrder.order_items.extras && selectedOrder.order_items.extras.length > 0">
                      <div class="text-xs font-medium text-black uppercase tracking-wider mb-2">Extras</div>
                      <div v-for="(item, index) in selectedOrder.order_items.extras" :key="'extras-detail-'+index" 
                           class="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg">
                        <span class="text-sm text-black">{{ item.name }}</span>
                        <span class="text-sm font-medium text-black">{{ item.price }}€</span>
                      </div>
                    </div>
                    
                    <!-- Message aucun article -->
                    <div v-if="!selectedOrder.order_items.pizza?.length && !selectedOrder.order_items.combo?.length && !selectedOrder.order_items.panini?.length && !selectedOrder.order_items.texmex?.length && !selectedOrder.order_items.tortilla?.length && !selectedOrder.order_items.extras?.length" 
                         class="text-center py-8 text-black">
                      Aucun article dans cette commande
                    </div>
                  </div>
                  <div v-else class="text-center py-8 text-black">
                    Aucun article dans cette commande
                  </div>
                </div>
              </div>

              <!-- Résumé de la commande -->
              <div class="border-t border-gray-100 pt-4">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-semibold text-black">Total</span>
                  <span class="text-2xl font-bold text-black">{{ Number(selectedOrder.total_price || 0).toFixed(2) }}€</span>
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
/* Transitions fluides pour tous les éléments interactifs */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Barre de défilement personnalisée pour la barre latérale */
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