// Main Restaurant Website JavaScript

let cart = [];
let orderType = 'pickup';
let currentOrderId = null;
let elements = {};

function init() {
    initializeElements();
    renderMenuItems('all');
    setupEventListeners();
    updateCartDisplay();
}

function initializeElements() {
    elements = {
        cartBtn: document.getElementById('cart-btn'),
        cartBtnMobile: document.getElementById('cart-btn-mobile'),
        cartSidebar: document.getElementById('cart-sidebar'),
        closeCart: document.getElementById('close-cart'),
        cartItems: document.getElementById('cart-items'),
        cartTotal: document.getElementById('cart-total'),
        cartCount: document.getElementById('cart-count'),
        cartCountMobile: document.getElementById('cart-count-mobile'),
        checkoutBtn: document.getElementById('checkout-btn'),
        checkoutModal: document.getElementById('checkout-modal'),
        closeCheckout: document.getElementById('close-checkout'),
        successModal: document.getElementById('success-modal'),
        pickupBtn: document.getElementById('pickup-btn'),
        deliveryBtn: document.getElementById('delivery-btn'),
        deliveryAddress: document.getElementById('delivery-address'),
        deliveryFeeRow: document.getElementById('delivery-fee-row'),
        mobileMenuBtn: document.getElementById('mobile-menu-btn'),
        mobileMenu: document.getElementById('mobile-menu')
    };
}

function setupEventListeners() {
    elements.cartBtn.addEventListener('click', toggleCart);
    elements.cartBtnMobile.addEventListener('click', toggleCart);
    elements.closeCart.addEventListener('click', toggleCart);
    elements.closeCheckout.addEventListener('click', closeCheckoutModal);
    elements.checkoutBtn.addEventListener('click', openCheckout);
    elements.pickupBtn.addEventListener('click', () => setOrderType('pickup'));
    elements.deliveryBtn.addEventListener('click', () => setOrderType('delivery'));
    elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    elements.mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => elements.mobileMenu.classList.add('hidden'));
    });

    document.querySelectorAll('.menu-category').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.menu-category').forEach(b => {
                b.classList.remove('bg-red-600', 'text-white');
                b.classList.add('bg-gray-200', 'text-gray-700');
            });
            e.target.classList.remove('bg-gray-200', 'text-gray-700');
            e.target.classList.add('bg-red-600', 'text-white');
            renderMenuItems(e.target.dataset.category);
        });
    });

    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);

    document.addEventListener('click', (e) => {
        if (!elements.mobileMenuBtn.contains(e.target) && !elements.mobileMenu.contains(e.target)) {
            elements.mobileMenu.classList.add('hidden');
        }
    });
}

function toggleMobileMenu() {
    elements.mobileMenu.classList.toggle('hidden');
}

function setOrderType(type) {
    orderType = type;
    if (type === 'pickup') {
        elements.pickupBtn.classList.add('border-red-600', 'bg-red-600', 'text-white');
        elements.deliveryBtn.classList.remove('border-red-600', 'bg-red-600', 'text-white');
        elements.deliveryAddress.classList.add('hidden');
        elements.deliveryFeeRow.classList.add('hidden');
        document.getElementById('address').required = false;
    } else {
        elements.deliveryBtn.classList.add('border-red-600', 'bg-red-600', 'text-white');
        elements.pickupBtn.classList.remove('border-red-600', 'bg-red-600', 'text-white');
        elements.deliveryAddress.classList.remove('hidden');
        elements.deliveryFeeRow.classList.remove('hidden');
        document.getElementById('address').required = true;
    }
    updateCheckoutTotal();
}

// ✅ Render menu
function renderMenuItems(category) {
    const menuContainer = document.getElementById('menu-items');
    if (!menuContainer) return;

    const filteredItems = MenuHelpers.getItemsByCategory(category);
    menuContainer.innerHTML = filteredItems.map(item => `
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${!item.available ? 'opacity-75' : ''}">
            <div class="relative h-48 overflow-hidden">
                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                ${item.spicy ? '<span class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full"><i class="fas fa-fire"></i> Spicy</span>' : ''}
                ${!item.available ? '<span class="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Unavailable</span>' : ''}
            </div>
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2 text-yellow-400">${item.name}</h3>
                <p class="text-gray-600 mb-4 text-sm">${item.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-bold text-red-600">${MenuHelpers.formatPrice(item.price)}</span>
                    <button onclick="addToCart(${item.id})" 
                        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center space-x-2 ${!item.available ? 'opacity-50 cursor-not-allowed' : ''}" 
                        ${!item.available ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                        <span>${item.available ? 'Add to Cart' : 'Unavailable'}</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ✅ Add to Cart
function addToCart(itemId) {
    const item = MenuHelpers.getItemById(itemId);
    if (!item || !item.available) return;

    const existing = cart.find(ci => ci.id === itemId);
    if (existing) existing.quantity++;
    else cart.push({ ...item, quantity: 1 });

    updateCartDisplay();
}

// ✅ Update Cart Count Badge
function updateCartCount() {
    const count = cart.reduce((sum, ci) => sum + ci.quantity, 0);

    if (elements.cartCount && elements.cartCountMobile) {
        if (count > 0) {
            elements.cartCount.textContent = count;
            elements.cartCountMobile.textContent = count;
            elements.cartCount.classList.remove("hidden");
            elements.cartCountMobile.classList.remove("hidden");
        } else {
            elements.cartCount.classList.add("hidden");
            elements.cartCountMobile.classList.add("hidden");
        }
    }
}

// ✅ Update Cart
function updateCartDisplay() {
    if (!elements.cartItems) return;

    if (cart.length === 0) {
        elements.cartItems.innerHTML = `<p class="text-gray-500 text-center py-6">Your cart is empty</p>`;
        elements.checkoutBtn.disabled = true;
    } else {
        elements.cartItems.innerHTML = cart.map(ci => `
            <div class="flex justify-between items-center py-2 border-b">
                <div>
                    <h4 class="font-semibold">${ci.name}</h4>
                    <p class="text-sm text-gray-500">₦${ci.price.toLocaleString()} x ${ci.quantity}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button class="px-2 py-1 bg-gray-200 rounded" onclick="changeQuantity(${ci.id}, -1)">-</button>
                    <span>${ci.quantity}</span>
                    <button class="px-2 py-1 bg-gray-200 rounded" onclick="changeQuantity(${ci.id}, 1)">+</button>
                    <button class="px-2 py-1 bg-red-200 text-red-600 rounded" onclick="removeFromCart(${ci.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        elements.checkoutBtn.disabled = false;
    }

    const total = cart.reduce((sum, ci) => sum + (ci.price * ci.quantity), 0);
    elements.cartTotal.textContent = `₦${total.toLocaleString()}`;

    // update badge counts
    updateCartCount();
}

function changeQuantity(itemId, delta) {
    const item = cart.find(ci => ci.id === itemId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) removeFromCart(itemId);
    updateCartDisplay();
}

// ✅ Remove item completely
function removeFromCart(itemId) {
    cart = cart.filter(ci => ci.id !== itemId);
    updateCartDisplay();
}

function updateCheckoutTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = orderType === 'delivery' ? CONFIG.DELIVERY_FEE : 0;
    const total = subtotal + deliveryFee;

    document.getElementById('subtotal').textContent = `₦${subtotal.toLocaleString()}`;
    document.getElementById('checkout-total').textContent = `₦${total.toLocaleString()}`;
}

function toggleCart() {
    elements.cartSidebar.classList.toggle('translate-x-full');
}

function openCheckout() {
    if (cart.length > 0) {
        elements.checkoutModal.classList.remove('hidden');
        updateCheckoutTotal();
        toggleCart();
    }
}

function closeCheckoutModal() {
    elements.checkoutModal.classList.add('hidden');
}

function closeSuccessModal() {
    elements.successModal.classList.add('hidden');
    cart = [];
    updateCartDisplay();
}

function generateOrderId() {
    return 'RA' + Date.now().toString().slice(-6);
}

function sendWhatsAppOrder(orderDetails) {
    const message = `🍽️ *NEW ORDER - ${orderDetails.orderId}*\n\n` +
        `👤 ${orderDetails.customerName}\n📞 ${orderDetails.phone}\n📧 ${orderDetails.email}\n🚚 ${orderDetails.type}\n` +
        (orderDetails.address ? `📍 ${orderDetails.address}\n` : '') +
        `\n📝 ORDER:\n${orderDetails.items.map(i => `• ${i.name} x${i.quantity} = ₦${(i.price * i.quantity).toLocaleString()}`).join('\n')}` +
        `\n\n💰 Total: ₦${orderDetails.total.toLocaleString()}`;
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

function handleCheckout(e) {
    e.preventDefault();
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const instructions = document.getElementById('instructions').value.trim();

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = orderType === 'delivery' ? CONFIG.DELIVERY_FEE : 0;
    const total = subtotal + deliveryFee;
    currentOrderId = generateOrderId();

    const orderDetails = {
        orderId: currentOrderId,
        customerName: `${firstName} ${lastName}`,
        phone, email,
        type: orderType,
        address: orderType === 'delivery' ? address : null,
        instructions, items: cart,
        subtotal, deliveryFee, total
    };

    const handler = PaystackPop.setup({
        key: CONFIG.PAYSTACK_PUBLIC_KEY,
        email,
        amount: total * 100,
        currency: 'NGN',
        ref: currentOrderId,
        callback: function(response) {
            storeOrder(orderDetails, response.reference);
            sendWhatsAppOrder(orderDetails);
            document.getElementById('order-id').textContent = currentOrderId;
            document.getElementById('track-order-link').href = `track-order.html?order=${currentOrderId}&phone=${encodeURIComponent(phone)}`;
            closeCheckoutModal();
            elements.successModal.classList.remove('hidden');
        },
        onClose: () => alert('Payment was not completed.')
    });
    handler.openIframe();
}

function storeOrder(orderDetails, paymentReference) {
    const orders = JSON.parse(localStorage.getItem('restaurantOrders') || '[]');
    orders.unshift({ ...orderDetails, paymentReference, paymentStatus: 'paid' });
    localStorage.setItem('restaurantOrders', JSON.stringify(orders));
}

document.addEventListener('DOMContentLoaded', function () {
    init();
    if (!isRestaurantOpen()) {
        const notice = document.createElement('div');
        notice.className = 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-center fixed top-20 left-0 right-0 z-40';
        notice.innerHTML = `<i class="fas fa-clock mr-2"></i>We're currently closed. We open daily ${CONFIG.OPERATING_HOURS.open} – ${CONFIG.OPERATING_HOURS.close}`;
        document.body.insertBefore(notice, document.body.firstChild);
    }
});

// Fallback initialization if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
