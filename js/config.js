// ⚠️ IMPORTANT: UPDATE THESE VALUES BEFORE GOING LIVE ⚠️

const CONFIG = {
    // 🔑 PAYSTACK CONFIGURATION
    // Get your keys from: https://dashboard.paystack.com/#/settings/developers
    // For testing: use pk_test_... key
    // For production: use pk_live_... key
    PAYSTACK_PUBLIC_KEY: 'pk_test_a97a1599c5b5d5cde9cd3bbf645d4a7ea7f44c2a',
    
    // 📱 WHATSAPP CONFIGURATION
    // Restaurant WhatsApp number where orders will be sent
    // Format: Country code + number (without + or spaces)
    // Example: Nigeria +234 903 456 7890 becomes '2349034567890'
    WHATSAPP_NUMBER: '2349166693315',
    
    // 📧 RESTAURANT EMAIL
    // Email for order confirmations and admin notifications
    ADMIN_EMAIL: 'orders@rubelsandangels.com',
    
    // 🚚 DELIVERY SETTINGS
    DELIVERY_FEE: 500, // Delivery fee in Naira
    
    // 🔐 ADMIN SECURITY
    // Change this default password to something secure!
    ADMIN_PASSWORD: 'rubels2024',
    
    // 🏪 RESTAURANT INFO
    RESTAURANT_NAME: 'Rubels & Angels',
    RESTAURANT_PHONE: '+234 903 456 7890',
    RESTAURANT_ADDRESS: '123 Food Street, Lagos, Nigeria',
    
    // ⏰ OPERATING HOURS
    OPERATING_HOURS: {
        open: '8:00',
        close: '22:00',
        timezone: 'Africa/Lagos'
    },
    
    // 🎨 CUSTOMIZATION
    BRAND_COLORS: {
        primary: '#dc2626', // red-600
        secondary: '#ea580c' // orange-600
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}