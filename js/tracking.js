// Order Tracking JavaScript

let autoRefreshInterval = null;

// Initialize tracking page
function initTracking() {
    setupTrackingEventListeners();
    
    // Check if order ID is in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order');
    const phone = urlParams.get('phone');
    
    if (orderId && phone) {
        document.getElementById('order-id-input').value = orderId;
        document.getElementById('phone-input').value = phone;
        trackOrder();
    }
}

// Setup event listeners
function setupTrackingEventListeners() {
    document.getElementById('track-form').addEventListener('submit', handleTrackSubmission);
}

// Handle track form submission
function handleTrackSubmission(e) {
    e.preventDefault();
    trackOrder();
}

// Track order function
function trackOrder() {
    const orderId = document.getElementById('order-id-input').value.trim();
    const phone = document.getElementById('phone-input').value.trim();
    const errorDiv = document.getElementById('search-error');
    
    // Find order in localStorage
    const orders = JSON.parse(localStorage.getItem('restaurantOrders') || '[]');
    const order = orders.find(o => 
        o.orderId.toLowerCase() === orderId.toLowerCase() && 
        o.phone.replace(/\D/g, '').includes(phone.replace(/\D/g, '').slice(-10))
    );
    
    if (order) {
        displayOrderDetails(order);
        errorDiv.classList.add('hidden');
        startAutoRefresh(orderId, phone);
    } else {
        errorDiv.classList.remove('hidden');
        document.getElementById('order-details').classList.add('hidden');
    }
}

// Display order details
function displayOrderDetails(order) {
    document.getElementById('search-section').classList.add('hidden');
    document.getElementById('order-details').classList.remove('hidden');
    
    // Basic order info
    document.getElementById('order-title').textContent = `Order #${order.orderId}`;
    document.getElementById('order-date').textContent = formatDateTime(order.timestamp);
    document.getElementById('order-total').textContent = `₦${order.total.toLocaleString()}`;
    document.getElementById('order-type').textContent = order.type.toUpperCase();
    
    // Current status
    updateCurrentStatus(order.status);
    
    // Status timeline
    renderStatusTimeline(order);
    
    // Order items
    renderOrderItems(order.items);
    
    // Delivery/pickup info
    renderDeliveryInfo(order);
    
    // Update estimated time
    updateEstimatedTime(order);
}

// Update current status indicator
function updateCurrentStatus(status) {
    const statusInfo = getStatusInfo(status);
    const currentStatusDiv = document.getElementById('current-status');
    
    currentStatusDiv.innerHTML = `
        <span class="w-3 h-3 rounded-full bg-${statusInfo.color}-500 animate-pulse"></span>
        <span class="font-medium text-${statusInfo.color}-600">${statusInfo.label}</span>
    `;
}

// Render status timeline
function renderStatusTimeline(order) {
    const timeline = document.getElementById('status-timeline');
    const statuses = [
        { value: 'confirmed', label: 'Order Confirmed', icon: '✅' },
        { value: 'preparing', label: 'Preparing Food', icon: '👨‍🍳' },
        { value: 'ready', label: order.type === 'pickup' ? 'Ready for Pickup' : 'Out for Delivery', icon: order.type === 'pickup' ? '🎉' : '🚚' },
        { value: 'completed', label: 'Order Completed', icon: '🌟' }
    ];
    
    const currentStatusIndex = statuses.findIndex(s => s.value === order.status);
    
    timeline.innerHTML = statuses.map((status, index) => {
        const isCompleted = index <= currentStatusIndex;
        const isCurrent = index === currentStatusIndex;
        
        return `
            <div class="flex items-center space-x-3 relative">
                <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                } ${isCurrent ? 'animate-pulse ring-2 ring-green-300' : ''}">
                    ${isCompleted ? status.icon : '⏳'}
                </div>
                <div class="flex-1">
                    <div class="font-medium ${isCompleted ? 'text-green-600' : 'text-gray-500'}">
                        ${status.label}
                    </div>
                    <div class="text-sm text-gray-500">
                        ${isCompleted && index < currentStatusIndex ? formatDateTime(order.timestamp) : 
                          isCurrent ? 'In progress...' : 'Pending'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render order items
function renderOrderItems(items) {
    const itemsContainer = document.getElementById('order-items');
    
    itemsContainer.innerHTML = items.map(item => `
        <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <div class="flex items-center space-x-3">
                <span class="text-2xl">${getItemEmoji(item.name)}</span>
                <div>
                    <div class="font-medium">${item.name}</div>
                    <div class="text-sm text-gray-600">Qty: ${item.quantity}</div>
                </div>
            </div>
            <div class="text-right">
                <div class="font-medium">₦${(item.price * item.quantity).toLocaleString()}</div>
                <div class="text-sm text-gray-600">₦${item.price.toLocaleString()} each</div>
            </div>
        </div>
    `).join('');
}

// Render delivery/pickup info
function renderDeliveryInfo(order) {
    const deliveryInfo = document.getElementById('delivery-info');
    
    if (order.type === 'delivery') {
        deliveryInfo.innerHTML = `
            <h3 class="text-lg font-semibold mb-3">Delivery Information</h3>
            <div class="bg-blue-50 p-4 rounded-lg">
                <div class="flex items-start space-x-3">
                    <span class="text-2xl">🏠</span>
                    <div>
                        <div class="font-medium">Delivery Address</div>
                        <div class="text-gray-600">${order.address}</div>
                        <div class="text-sm text-gray-500 mt-2">
                            📞 ${order.phone} | 👤 ${order.customerName}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        deliveryInfo.innerHTML = `
            <h3 class="text-lg font-semibold mb-3">Pickup Information</h3>
            <div class="bg-green-50 p-4 rounded-lg">
                <div class="flex items-start space-x-3">
                    <span class="text-2xl">🏪</span>
                    <div>
                        <div class="font-medium">Pickup Location</div>
                        <div class="text-gray-600">${CONFIG.RESTAURANT_ADDRESS}</div>
                        <div class="text-sm text-gray-500 mt-2">
                            📞 ${CONFIG.RESTAURANT_PHONE} | 👤 ${order.customerName}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (order.instructions) {
        deliveryInfo.innerHTML += `
            <div class="bg-yellow-50 p-4 rounded-lg mt-4">
                <div class="flex items-start space-x-3">
                    <span class="text-2xl">📝</span>
                    <div>
                        <div class="font-medium">Special Instructions</div>
                        <div class="text-gray-600">${order.instructions}</div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Update estimated time
function updateEstimatedTime(order) {
    const estimatedTimeDiv = document.getElementById('estimated-time');
    const orderTime = new Date(order.timestamp);
    const now = new Date();
    const minutesPassed = Math.floor((now - orderTime) / (1000 * 60));
    
    let estimatedMinutes = 30; // Default preparation time
    if (order.type === 'delivery') {
        estimatedMinutes += 15; // Add delivery time
    }
    
    let message = '';
    if (order.status === 'completed') {
        message = 'Order completed ✅';
    } else if (order.status === 'ready') {
        message = order.type === 'pickup' ? 'Ready for pickup! 🎉' : 'Out for delivery 🚚';
    } else if (minutesPassed >= estimatedMinutes) {
        message = 'Should be ready any moment now ⏰';
    } else {
        const remainingMinutes = estimatedMinutes - minutesPassed;
        message = `Estimated ${remainingMinutes} minutes remaining ⏱️`;
    }
    
    estimatedTimeDiv.textContent = message;
}

// Auto-refresh order status
function startAutoRefresh(orderId, phone) {
    // Clear any existing interval
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // Refresh every 30 seconds
    autoRefreshInterval = setInterval(() => {
        const orders = JSON.parse(localStorage.getItem('restaurantOrders') || '[]');
        const order = orders.find(o => 
            o.orderId.toLowerCase() === orderId.toLowerCase() && 
            o.phone.replace(/\D/g, '').includes(phone.replace(/\D/g, '').slice(-10))
        );
        
        if (order) {
            // Only update if status changed
            const currentStatus = document.getElementById('current-status').textContent;
            const newStatus = getStatusInfo(order.status).label;
            
            if (!currentStatus.includes(newStatus)) {
                displayOrderDetails(order);
                showStatusUpdateNotification(order.status);
            }
        }
    }, 30000);
}

// Show status update notification
function showStatusUpdateNotification(status) {
    const statusInfo = getStatusInfo(status);
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 bg-${statusInfo.color}-500 text-white p-4 rounded-lg shadow-lg z-50 animate-bounce`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <span class="text-xl">${statusInfo.icon}</span>
            <span>Status updated: ${statusInfo.label}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Contact restaurant via WhatsApp
function contactRestaurant() {
    const orderId = document.getElementById('order-title').textContent.replace('Order ', '');
    const message = `Hi! I'm inquiring about my order ${orderId}. Can you please provide an update?`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

// Call restaurant
function callRestaurant() {
    window.open(`tel:${CONFIG.RESTAURANT_PHONE}`, '_self');
}

// Utility functions
function getStatusInfo(status) {
    const statusMap = {
        'confirmed': { label: 'Order Confirmed', color: 'blue', icon: '✅' },
        'preparing': { label: 'Preparing Food', color: 'yellow', icon: '👨‍🍳' },
        'ready': { label: 'Ready', color: 'green', icon: '🎉' },
        'completed': { label: 'Completed', color: 'gray', icon: '🌟' },
        'cancelled': { label: 'Cancelled', color: 'red', icon: '❌' }
    };
    
    return statusMap[status] || statusMap['confirmed'];
}

function getItemEmoji(itemName) {
    const emojiMap = {
        'Angel Wings': '🍗',
        'Sacred Salad': '🥗',
        'Divine Pizza': '🍕',
        'Blessed Burger': '🍔',
        'Heavenly Pasta': '🍝',
        'Cloud Cake': '🍰',
        'Holy Water': '💧',
        'Divine Smoothie': '🥤',
        'Blessed Coffee': '☕'
    };
    
    // Try to find exact match first
    if (emojiMap[itemName]) {
        return emojiMap[itemName];
    }
    
    // Try partial matches
    for (const [key, emoji] of Object.entries(emojiMap)) {
        if (itemName.includes(key) || key.includes(itemName)) {
            return emoji;
        }
    }
    
    return '🍽️'; // Default emoji
}

function formatDateTime(timestamp) {
    return new Date(timestamp).toLocaleString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Clean up interval when leaving page
window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initTracking);