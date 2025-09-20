// Menu Items Data
const menuItems = [
    {
        id: 1,
        name: "Angel Wings",
        category: "appetizers",
        price: 2500,
        description: "Crispy buffalo wings with our heavenly sauce (6 pieces)",
        image: "images/angel-wings.jpeg",
        available: true,
        allergens: ["gluten"],
        spicy: true
    },
    {
        id: 2,
        name: "Sacred Salad",
        category: "appetizers",
        price: 1800,
        description: "Fresh mixed greens with grilled chicken and balsamic vinaigrette",
        image: "images/salad.jpeg",
        available: true,
        allergens: [],
        spicy: false
    },
    {
        id: 3,
        name: "Divine Samosas",
        category: "appetizers",
        price: 1200,
        description: "Crispy pastries filled with spiced vegetables (4 pieces)",
        image: "images/samosa.jpeg",
        available: true,
        allergens: ["gluten"],
        spicy: true
    },
    {
        id: 4,
        name: "Heavenly Pasta",
        category: "mains",
        price: 3500,
        description: "Creamy pasta with herbs, chicken, and parmesan cheese",
        image: "images/pasta.jpeg",
        available: true,
        allergens: ["gluten", "dairy"],
        spicy: false
    },
    {
        id: 5,
        name: "Divine Pizza",
        category: "mains",
        price: 4200,
        description: "Wood-fired pizza with fresh mozzarella and pepperoni",
        image: "images/pizza.jpeg",
        available: true,
        allergens: ["gluten", "dairy"],
        spicy: false
    },
    {
        id: 6,
        name: "Blessed Burger",
        category: "mains",
        price: 2800,
        description: "Juicy beef patty with cheese, lettuce, and special sauce",
        image: "images/burger.jpeg",
        available: true,
        allergens: ["gluten", "dairy"],
        spicy: false
    },
    {
        id: 7,
        name: "Angelic Rice",
        category: "mains",
        price: 3200,
        description: "Jollof rice with grilled chicken and plantain",
        image: "images/angelic-rice.jpeg",
        available: true,
        allergens: [],
        spicy: true
    },
    {
        id: 8,
        name: "Holy Grilled Fish",
        category: "mains",
        price: 4500,
        description: "Fresh grilled fish with pepper sauce and yam",
        image: "images/holy-fish.jpg",
        available: true,
        allergens: ["fish"],
        spicy: true
    },
    {
        id: 9,
        name: "Cloud Cake",
        category: "desserts",
        price: 1500,
        description: "Light vanilla sponge cake with fresh berries and cream",
        image: "images/cake.jpeg",
        available: true,
        allergens: ["gluten", "dairy", "eggs"],
        spicy: false
    },
    {
        id: 10,
        name: "Angelic Ice Cream",
        category: "desserts",
        price: 1200,
        description: "Premium vanilla ice cream with chocolate drizzle",
        image: "images/ice-cream.jpeg",
        available: true,
        allergens: ["dairy"],
        spicy: false
    },
    {
        id: 11,
        name: "Heavenly Tiramisu",
        category: "desserts",
        price: 1800,
        description: "Classic Italian dessert with coffee and mascarpone",
        image: "images/Tiramisu.jpeg",
        available: true,
        allergens: ["dairy", "eggs", "gluten"],
        spicy: false
    },
    {
        id: 12,
        name: "Holy Water",
        category: "beverages",
        price: 800,
        description: "Refreshing sparkling water with mint and lime",
        image: "images/water.jpeg",
        available: true,
        allergens: [],
        spicy: false
    },
    {
        id: 13,
        name: "Divine Smoothie",
        category: "beverages",
        price: 1500,
        description: "Mixed fruit smoothie with yogurt and honey",
        image: "images/Smoothie.jpeg",
        available: true,
        allergens: ["dairy"],
        spicy: false
    },
    {
        id: 14,
        name: "Blessed Coffee",
        category: "beverages",
        price: 1000,
        description: "Premium Ethiopian coffee, hot or iced",
        image: "images/tea.jpeg",
        available: true,
        allergens: [],
        spicy: false
    },
    {
        id: 15,
        name: "Sacred Tea",
        category: "beverages",
        price: 700,
        description: "Herbal tea blend with honey and lemon",
        image: "images/tea.jpeg",
        available: true,
        allergens: [],
        spicy: false
    },
    {
        id: 16,
        name: "Angelic Juice",
        category: "beverages",
        price: 1200,
        description: "Fresh orange juice or mixed fruit juice",
        image: "images/orange.jpeg",
        available: true,
        allergens: [],
        spicy: false
    }
];

// Categories for filtering
const categories = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'appetizers', name: 'Appetizers', icon: '🥗' },
    { id: 'mains', name: 'Main Courses', icon: '🍛' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' }
];

// Order status options
const orderStatuses = [
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'preparing', label: 'Preparing', color: 'yellow' },
    { value: 'ready', label: 'Ready', color: 'green' },
    { value: 'completed', label: 'Completed', color: 'gray' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
];

// Helper functions for menu management
const MenuHelpers = {
    // Get item by ID
    getItemById: (id) => menuItems.find(item => item.id === parseInt(id)),
    
    // Get items by category
    getItemsByCategory: (category) => {
        if (category === 'all') return menuItems;
        return menuItems.filter(item => item.category === category);
    },
    
    // Get available items only
    getAvailableItems: () => menuItems.filter(item => item.available),
    
    // Format price for display
    formatPrice: (price) => `₦${price.toLocaleString()}`,
    
    // Get category info
    getCategoryInfo: (categoryId) => categories.find(cat => cat.id === categoryId),
    
    // Search items
    searchItems: (query) => {
        const searchTerm = query.toLowerCase();
        return menuItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
    },
    
    // Toggle item availability
    toggleAvailability: (itemId) => {
        const item = MenuHelpers.getItemById(itemId);
        if (item) {
            item.available = !item.available;
            return item.available;
        }
        return false;
    }
};

// Ensure menuItems is available globally
if (typeof window !== 'undefined') {
    window.menuItems = menuItems;
    window.MenuHelpers = MenuHelpers;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { menuItems, categories, orderStatuses, MenuHelpers };
}