// ✅ Dynamic Menu Data Manager (no hardcoding)
const MenuStorage = {
    key: "restaurantMenu",

    getAll: function() {
        const stored = localStorage.getItem(this.key);
        return stored ? JSON.parse(stored) : [];
    },

    saveAll: function(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
        // Trigger auto-refresh across open pages
        window.dispatchEvent(new Event("menu-updated"));
    },

    add: function(item) {
        const all = this.getAll();
        all.push(item);
        this.saveAll(all);
    },

    update: function(updatedItem) {
        const all = this.getAll().map(item =>
            item.id === updatedItem.id ? updatedItem : item
        );
        this.saveAll(all);
    },

    delete: function(id) {
        const all = this.getAll().filter(item => item.id !== id);
        this.saveAll(all);
    },

    toggleAvailability: function(id) {
        const all = this.getAll().map(item => {
            if (item.id === id) item.available = !item.available;
            return item;
        });
        this.saveAll(all);
    }
};

// ✅ Helper functions for menu filtering and display
const MenuHelpers = {
    getItemById: (id) => MenuStorage.getAll().find(item => item.id === parseInt(id)),

    getItemsByCategory: (category) => {
        const items = MenuStorage.getAll();
        if (category === "all") return items;
        return items.filter(item => item.category === category);
    },

    getAvailableItems: () => MenuStorage.getAll().filter(item => item.available),

    formatPrice: (price) => `₦${Number(price).toLocaleString()}`,

    searchItems: (query) => {
        const term = query.toLowerCase();
        return MenuStorage.getAll().filter(
            item =>
                item.name.toLowerCase().includes(term) ||
                item.description.toLowerCase().includes(term)
        );
    },
};

// ✅ Default categories
const categories = [
    { id: "all", name: "All Items", icon: "🍽️" },
    { id: "appetizers", name: "Appetizers", icon: "🥗" },
    { id: "mains", name: "Main Courses", icon: "🍛" },
    { id: "desserts", name: "Desserts", icon: "🍰" },
    { id: "beverages", name: "Beverages", icon: "🥤" },
];

// Make globally accessible
window.MenuHelpers = MenuHelpers;
window.MenuStorage = MenuStorage;
window.categories = categories;
