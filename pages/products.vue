<script setup>
import { ref, nextTick } from "vue";

// Enhanced food items with categories and descriptions
const foods = ref([
  { 
    id: 1, 
    name: "Margherita Pizza", 
    price: 12.50, 
    category: "Pizza",
    description: "Fresh tomato, mozzarella, basil",
    editing: false,
    available: true
  },
  { 
    id: 2, 
    name: "Classic Burger", 
    price: 14.00, 
    category: "Burgers",
    description: "Beef patty, lettuce, tomato, cheese",
    editing: false,
    available: true
  },
  { 
    id: 3, 
    name: "Caesar Salad", 
    price: 8.90, 
    category: "Salads",
    description: "Romaine lettuce, parmesan, croutons",
    editing: false,
    available: true
  },
  { 
    id: 4, 
    name: "Pepperoni Pizza", 
    price: 15.00, 
    category: "Pizza",
    description: "Tomato sauce, mozzarella, pepperoni",
    editing: false,
    available: true
  },
  { 
    id: 5, 
    name: "Veggie Burger", 
    price: 12.00, 
    category: "Burgers",
    description: "Plant-based patty, avocado, sprouts",
    editing: false,
    available: false
  }
]);

const selectedCategory = ref("All");
const searchQuery = ref("");

// Get unique categories
const categories = ref(["All", ...new Set(foods.value.map(item => item.category))]);

// Filtered foods based on category and search
const filteredFoods = ref([]);

// Update filtered foods when category or search changes
function updateFilteredFoods() {
  let result = foods.value;
  
  if (selectedCategory.value !== "All") {
    result = result.filter(item => item.category === selectedCategory.value);
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }
  
  filteredFoods.value = result;
}

// Initialize filtered foods
updateFilteredFoods();

// Watch for changes
function onCategoryChange() {
  updateFilteredFoods();
}

function onSearchChange() {
  updateFilteredFoods();
}

// Toggle edit mode with better UX
async function toggleEdit(item) {
  if (item.editing) {
    item.editing = false;
  } else {
    // Close any other editing items
    foods.value.forEach(food => {
      if (food.id !== item.id) food.editing = false;
    });
    item.editing = true;
    
    // Focus the input after DOM update
    await nextTick();
    const input = document.querySelector(`#price-input-${item.id}`);
    if (input) {
      input.focus();
      input.select();
    }
  }
}

// Save price with validation
function savePrice(item, event) {
  const value = parseFloat(event.target.value);
  if (!isNaN(value) && value > 0) {
    item.price = Math.round(value * 100) / 100; // Round to 2 decimals
  }
  item.editing = false;
}

// Cancel editing
function cancelEdit(item) {
  item.editing = false;
}

// Toggle availability
function toggleAvailability(item) {
  item.available = !item.available;
}

// Get category emoji
function getCategoryEmoji(category) {
  const emojis = {
    Pizza: "🍕",
    Burgers: "🍔",
    Salads: "🥗"
  };
  return emojis[category] || "🍽️";
}
</script>

<template>
  <div class="menu-container">
    <header class="menu-header">
      <h1 class="menu-title">
        <span class="title-emoji">🍽️</span>
        Restaurant Menu
      </h1>
      <p class="menu-subtitle">Manage your delicious offerings</p>
    </header>

    <!-- Search and Filter Controls -->
    <div class="controls">
      <div class="search-container">
        <input
          v-model="searchQuery"
          @input="onSearchChange"
          type="text"
          placeholder="Search menu items..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>

      <div class="category-filter">
        <label class="filter-label">Category:</label>
        <select 
          v-model="selectedCategory" 
          @change="onCategoryChange"
          class="category-select"
        >
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
    </div>

    <!-- Menu Items -->
    <div class="menu-grid">
      <div 
        v-for="item in filteredFoods" 
        :key="item.id" 
        class="menu-card"
        :class="{ 'unavailable': !item.available, 'editing': item.editing }"
      >
        <div class="card-header">
          <div class="item-info">
            <div class="item-name-row">
              <span class="category-emoji">{{ getCategoryEmoji(item.category) }}</span>
              <h3 class="item-name">{{ item.name }}</h3>
              <span 
                class="availability-badge"
                :class="item.available ? 'available' : 'unavailable'"
                @click="toggleAvailability(item)"
                title="Click to toggle availability"
              >
                {{ item.available ? '✓' : '✗' }}
              </span>
            </div>
            <p class="item-description">{{ item.description }}</p>
            <div class="price-section">
              <template v-if="item.editing">
                <div class="price-input-container">
                  <input
                    :id="`price-input-${item.id}`"
                    type="number"
                    :value="item.price"
                    @keyup.enter="savePrice(item, $event)"
                    @keyup.escape="cancelEdit(item)"
                    @blur="savePrice(item, $event)"
                    class="price-input"
                    step="0.01"
                    min="0"
                  />
                  <span class="currency">€</span>
                </div>
              </template>
              <template v-else>
                <span class="price">{{ item.price.toFixed(2) }} €</span>
              </template>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <template v-if="item.editing">
            <button 
              @click="cancelEdit(item)" 
              class="btn btn-secondary"
              title="Cancel editing"
            >
              Cancel
            </button>
            <button 
              @click="savePrice(item, { target: { value: item.price } })" 
              class="btn btn-success"
              title="Save changes"
            >
              Save
            </button>
          </template>
          <template v-else>
            <button 
              @click="toggleEdit(item)" 
              class="btn btn-primary"
              title="Edit price"
            >
              <span class="btn-icon">✏️</span>
              Edit
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredFoods.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No items found</h3>
      <p>Try adjusting your search or filter criteria</p>
    </div>
  </div>
</template>

<style scoped>
.menu-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.menu-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.menu-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.title-emoji {
  font-size: 2rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.menu-subtitle {
  color: #64748b;
  font-size: 1.1rem;
  margin: 0;
}

.controls {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.category-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.category-select {
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.menu-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.menu-card.editing {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.menu-card.unavailable {
  opacity: 0.6;
  background: #f8f9fa;
}

.card-header {
  margin-bottom: 1rem;
}

.item-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.category-emoji {
  font-size: 1.25rem;
}

.item-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  flex: 1;
}

.availability-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.availability-badge.available {
  background: #10b981;
  color: white;
}

.availability-badge.unavailable {
  background: #ef4444;
  color: white;
}

.availability-badge:hover {
  transform: scale(1.1);
}

.item-description {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.price-section {
  margin-bottom: 0.5rem;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
}

.price-input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-input {
  padding: 0.5rem 0.75rem;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  font-size: 1.25rem;
  font-weight: 600;
  width: 100px;
  background: #eff6ff;
}

.price-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.currency {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  text-transform: capitalize;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
  color: white;
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-icon {
  font-size: 0.8rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .menu-container {
    padding: 1rem;
  }
  
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    min-width: auto;
  }
  
  .menu-grid {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    justify-content: center;
  }
}
</style>