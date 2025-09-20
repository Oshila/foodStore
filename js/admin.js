// Admin Dashboard JavaScript

let currentSection = 'dashboard';
let filteredOrders = [];

// Initialize admin dashboard
function initAdmin() {
    // Check if already logged in
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn) {
        showDashboard();
    } else {
        showLoginForm();
    }
    
    setupAdminEventListeners();
}

// Setup event listeners
function setupAdminEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleAdminLogin);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            showSection(section);
        });
    });
    
    // Load configuration display
    displayCurrentConfig();
}

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();
    
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (password === CONFIG.ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
    } else {
        errorDiv.classList.remove('hidden');
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 3000);
    }
}

// Show login form
function showLoginForm() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById('menu-management').classList.add('hidden');
    document.getElementById('settings-section').classList.add('hidden');
    document.getElementById('bottom-nav').classList.add('hidden');
}

// Show dashboard after login
function showDashboard() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('bottom-nav').classList.remove('hidden');
    
    updateDashboardStats();
    loadOrdersList();
    showSection('dashboard');
}

// Show different sections
function showSection(section) {
    currentSection = section;
    
    // Hide all sections
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById('menu-management').classList.add('hidden');
    document.getElementById('settings-section').classList.add('hidden');
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-red-600');
        btn.classList.add('text-gray-600');
    });
    
    // Show selected section
    switch(section) {
        case 'dashboard':
            document.getElementById('dashboard-section').classList.remove('hidden');
            updateDashboardStats();
            loadOrdersList();
            break;
        case 'menu':
            document.getElementById('menu-management').classList.remove('hidden');
            break;
        case 'settings':
            document.getElementById('settings-section').classList.remove('hidden');
            break;
    }
    
    // Update active navigation
    const activeBtn = document.querySelector(`[data-section="${section}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-600');
        activeBtn.classList.add('text-red-600');
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const orders = JSON.parse(localStorage.getItem('restaurantOrders') || '[]');
    const today = new Date().toDateString();
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(order => order.status !== 'completed' && order.status !== 'cancelled').length;
    const todaysOrders = orders.filter(order => 
        new Date(order.timestamp).toDateString() === today
    ).length;

    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-revenue').textContent = `₦${totalRevenue.toLocaleString()}`;
    document.getElementById('pending-orders').textContent = pendingOrders;
    document.getElementById('todays-orders').textContent = todaysOrders;
}

// Load and display orders list
function loadOrdersList() {
    const orders = JSON.parse(localStorage.getItem('restaurantOrders') || '[]');
    filteredOrders = orders;
    renderOrdersList();
}

// Render orders list with current filters
function renderOrdersList() {
    const ordersList = document.getElementById('orders-list');

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '<p class="text-gray-500 text-center py-8">No orders found.</p>';
        return;
    }

    ordersList.innerHTML = filteredOrders.map(order => {
        const statusColor = getStatusColor(order.status);
        return `
            <div class="border border-gray-200 rounded-lg p-4 ${order.status === 'completed' ? 'bg-green-50' : 'bg-white'}">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h5 class="font-bold text-lg">#${order.orderId}</h5>
                        <p class="text-gray-600">${order.customerName} - ${order.phone}</p>
                        <p class="text-sm text-gray-500">${formatDateTime(order.timestamp)}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-bold text-green-600">₦${order.total.toLocaleString()}</div>
                        <div class="text-sm text-gray-600">${order.type.toUpperCase()}</div>
                        <select onchange="updateOrderStatus('${order.orderId}', this.value)" 
                                class="mt-1 text-xs border rounded px-2 py-1 bg-${statusColor}-100">
                            ${orderStatuses.map(status => `
                                <option value="${status.value}" ${order.status === status.value ? 'selected' : ''}>
                                    ${status.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="border-t pt-3">
                    <h6 class="font-semibold mb-2">Order Items:</h6>
                    <ul class="text-sm space-y-1">
                        ${order.items.map(item => `
                            <li class="flex justify-between">
                                <span>${item.name} x${item.quantity}</span>
                                <span>₦${(item.price * item.quantity).toLocaleString()}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                ${order.address ? `<div class="mt-3 p-2 bg-blue-50 rounded text-sm">
                    <strong>Delivery Address:</strong> ${order.address}
                </div>` : ''}
                
                ${order.instructions ? `<div class="mt-2 p-2 bg-yellow-50 rounded text-sm">
                    <strong>Instructions:</strong> ${order.instructions}
                </div>` : ''}
                
                <div class="mt-3 flex space-x-2">
                    <button onclick="resendWhatsApp('${order.orderId}')" 
                            class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                        📱 Send WhatsApp
                    </button>
                    <button onclick="duplicateOrder('${order.orderId}')" 
                            class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                        📋 Duplicate
                    </button>
                    <button onclick="deleteOrder('${order.orderId}')" 
                            class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Filter orders based on current filter settings
function filterOrders() {
    const statusFilter = document.getElementById('status-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    
    const allOrders = JSON.parse(localStorage.getItem('restaurantOrders') || '[]');
    
    filteredOrders = allOrders.filter(order => {
        // Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) return false;
        
        // Type filter
        if (typeFilter !== 'all' && order.type !== typeFilter) return false;
        
        // Date filter
        if (dateFilter && !order.timestamp.startsWith(dateFilter)) return false;
        
        return true;
    });
    
    renderOrdersList();
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('restaurantOrders') || '[]');
    const orderIndex = orders.findIndex(order => order.orderId === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('restaurantOrders', JSON.stringify(orders));
        
        updateDashboardStats();
        loadOrdersList();
        
        // Send status update notification (optional)
        const order = orders[orderIndex];
        sendStatusUpdateNotification(order, newStatus);
    }
}

// Send status update notification to customer
function sendStatusUpdateNotification(order, status) {
    const statusMessages = {
        'confirmed': '✅ Your order has been confirmed and will be prepared shortly!',
        'preparing': '👨‍🍳 We are preparing your delicious meal!',
        'ready': '🎉 Your order is ready for ' + (order.type === 'pickup' ? 'pickup!' : 'delivery!'),
        'completed': '🌟 Order completed! Thank you for choosing ' + CONFIG.RESTAURANT_NAME + '!'
    };

    const message = `Hello ${order.customerName}! 👋

Order #${order.orderId} Update:

${statusMessages[status] || 'Your order status has been updated.'}

${CONFIG.RESTAURANT_NAME} 🍽️`;

    console.log('Status update notification:', message);
    
    // You could implement automatic SMS/email notifications here
}

// Delete order
function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        const orders = JSON.parse(localStorage.getItem('restaurantOrders') || '[]');
        const updatedOrders = orders.filter(order => order.orderId !== orderId);
        localStorage.setItem('restaurantOrders', JSON.stringify(updatedOrders));
        
        updateDashboardStats();
        loadOrdersList();
        
        showNotification('Order deleted successfully', 'success');
    }
}

// Duplicate order (useful for repeat customers)
function duplicateOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('restaurantOrders') || '[]');
    const orderToDuplicate = orders.find(order => order.orderId === orderId);
    
    if (orderToDuplicate) {
        const newOrder = {
            ...orderToDuplicate,
            orderId: 'RA' + Date.now().toString().slice(-6),
            timestamp: new Date().toISOString(),
            status: 'confirmed'
        };
        
        orders.unshift(newOrder);
        localStorage.setItem('restaurantOrders', JSON.stringify(orders));
        
        updateDashboardStats();
        loadOrdersList();
        
        showNotification('Order duplicated successfully', 'success');
    }
}

// Resend WhatsApp notification
function resendWhatsApp(orderId) {
    const orders = JSON.parse(localStorage.getItem('restaurantOrders') || '[]');
    const order = orders.find(o => o.orderId === orderId);
    
    if (order) {
        const message = `🍽️ *ORDER REMINDER - ${order.orderId}*

👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.phone}
🚚 *Type:* ${order.type.toUpperCase()}
${order.address ? `📍 *Address:* ${order.address}` : ''}

📝 *ORDER ITEMS:*
${order.items.map(item => 
    `• ${item.name} x${item.quantity} = ₦${(item.price * item.quantity).toLocaleString()}`
).join('\n')}

💰 *Total:* ₦${order.total.toLocaleString()}
📋 *Status:* ${order.status.toUpperCase()}`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        
        showNotification('WhatsApp notification sent', 'success');
    }
}

// Clear all orders
function clearAllOrders() {
    if (confirm('Are you sure you want to clear all orders? This action cannot be undone.')) {
        localStorage.removeItem('restaurantOrders');
        updateDashboardStats();
        loadOrdersList();
        showNotification('All orders cleared', 'success');
    }
}

// Refresh dashboard
function refreshDashboard() {
    updateDashboardStats();
    loadOrdersList();
    showNotification('Dashboard refreshed', 'success');
}

// Export orders to CSV
function exportOrders() {
    const orders = JSON.parse(localStorage.getItem('restaurantOrders') || '[]');
    
    if (orders.length === 0) {
        alert('No orders to export');
        return;
    }
    
    const csvContent = generateCSV(orders);
    downloadCSV(csvContent, `orders_${new Date().toISOString().split('T')[0]}.csv`);
}

// Generate CSV content
function generateCSV(orders) {
    const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'Email', 'Type', 'Status', 'Items', 'Total'];
    const csvRows = [headers.join(',')];
    
    orders.forEach(order => {
        const items = order.items.map(item => `${item.name} x${item.quantity}`).join('; ');
        const row = [
            order.orderId,
            formatDateTime(order.timestamp),
            order.customerName,
            order.phone,
            order.email,
            order.type,
            order.status,
            `"${items}"`,
            order.total
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// Download CSV file
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Display current configuration
function displayCurrentConfig() {
    document.getElementById('paystack-key').textContent = CONFIG.PAYSTACK_PUBLIC_KEY;
    document.getElementById('whatsapp-number').textContent = CONFIG.WHATSAPP_NUMBER;
    document.getElementById('admin-email').textContent = CONFIG.ADMIN_EMAIL;
    document.getElementById('delivery-fee').textContent = CONFIG.DELIVERY_FEE;
}

// Test WhatsApp functionality
function testWhatsApp() {
    const message = `🧪 *TEST MESSAGE FROM ${CONFIG.RESTAURANT_NAME}*

This is a test message to verify WhatsApp integration is working correctly.

If you received this message, your WhatsApp setup is working! 🎉

Time: ${new Date().toLocaleString('en-NG')}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    showNotification('Test WhatsApp message sent', 'info');
}

// Change admin password
function changePassword() {
    const newPassword = prompt('Enter new admin password:');
    if (newPassword && newPassword.length >= 6) {
        // Note: In a real application, you'd want to update this in a secure backend
        alert('Password change functionality would be implemented on the backend for security.');
        showNotification('Password change requested', 'info');
    } else if (newPassword) {
        alert('Password must be at least 6 characters long');
    }
}

// Logout admin
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    showLoginForm();
    showNotification('Logged out successfully', 'info');
}

// Utility functions
function formatDateTime(timestamp) {
    return new Date(timestamp).toLocaleString('en-NG');
}

function getStatusColor(status) {
    const statusColors = {
        'confirmed': 'blue',
        'preparing': 'yellow',
        'ready': 'green',
        'completed': 'gray',
        'cancelled': 'red'
    };
    return statusColors[status] || 'gray';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize admin dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', initAdmin);