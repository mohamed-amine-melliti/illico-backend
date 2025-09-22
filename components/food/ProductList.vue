<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Product {
  id: number
  name: string
  price: number
  category: string
  description?: string
}

const products = ref<Product[]>([
  {
    id: 1,
    name: 'Pizza Margherita',
    price: 12.99,
    category: 'Pizza',
    description: 'Tomate, mozzarella, basilic'
  },
  {
    id: 2,
    name: 'Burger Classic',
    price: 9.99,
    category: 'Burger',
    description: 'Bœuf, salade, tomate, oignon'
  },
  // Ajoutez d'autres produits ici
])

const editingProduct = ref<Product | null>(null)

const startEditing = (product: Product) => {
  editingProduct.value = { ...product }
}

const saveEdit = () => {
  if (!editingProduct.value) return
  
  const index = products.value.findIndex(p => p.id === editingProduct.value?.id)
  if (index !== -1) {
    products.value[index] = { ...editingProduct.value }
  }
  
  editingProduct.value = null
}

const cancelEdit = () => {
  editingProduct.value = null
}

const addNewProduct = () => {
  const newProduct: Product = {
    id: Math.max(...products.value.map(p => p.id)) + 1,
    name: '',
    price: 0,
    category: '',
    description: ''
  }
  editingProduct.value = newProduct
  products.value.push(newProduct)
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Gestion des Produits</h2>
      <Button @click="addNewProduct">
        <Icon name="plus" class="mr-2 h-4 w-4" />
        Ajouter un Produit
      </Button>
    </div>

    <div class="grid gap-4">
      <Card v-for="product in products" :key="product.id" class="p-4">
        <div v-if="editingProduct?.id === product.id">
          <!-- Mode édition -->
          <div class="space-y-4">
            <div>
              <Label for="name">Nom</Label>
              <Input id="name" v-model="editingProduct.name" />
            </div>
            <div>
              <Label for="price">Prix</Label>
              <Input id="price" type="number" step="0.01" v-model="editingProduct.price" />
            </div>
            <div>
              <Label for="category">Catégorie</Label>
              <Input id="category" v-model="editingProduct.category" />
            </div>
            <div>
              <Label for="description">Description</Label>
              <Textarea id="description" v-model="editingProduct.description" />
            </div>
            <div class="flex space-x-2">
              <Button @click="saveEdit" variant="default">Sauvegarder</Button>
              <Button @click="cancelEdit" variant="outline">Annuler</Button>
            </div>
          </div>
        </div>
        <div v-else>
          <!-- Mode affichage -->
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold">{{ product.name }}</h3>
              <p class="text-sm text-gray-500">{{ product.category }}</p>
              <p class="text-sm mt-1">{{ product.description }}</p>
            </div>
            <div class="flex items-center space-x-4">
              <p class="text-lg font-bold">{{ product.price.toFixed(2) }}€</p>
              <Button variant="outline" size="sm" @click="startEditing(product)">
                <Icon name="edit" class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
</style>