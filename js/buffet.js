// Buffet Reservation JavaScript

let selectedPackage = null;
let currentReservationId = null;

// Buffet packages data
const buffetPackages = {
    'standard': {
        name: 'Standard Buffet',
        price: 8000,
        description: 'All main dishes, salads, desserts, and soft drinks',
        features: ['All main course dishes', 'Salads & appetizers', 'Desserts & fruits', 'Soft drinks included', '3 hours dining']
    },
    'premium': {
        name: 'Premium Buffet',
        price: 12000,
        description: 'Standard + seafood, premium meats, juices & private area',
        features: ['All standard items', 'Grilled seafood & fish', 'Premium meat selection', 'Fresh juices & mocktails', 'Private dining area']
    },
    'vip': {
        name: 'VIP Experience',
        price: 18000,
        description: 'Premium + live cooking, unlimited drinks & dedicated service',
        features: ['All premium items', 'Live cooking stations', 'Unlimited alcoholic drinks', 'Dedicated waiter service', 'Complimentary cake (birthdays)']
    }
};

// Initialize buffet page
function initBuffet() {
    setupBuffetEventListeners();
    setMinDate();
    updateGuestCount();
}

// Setup event listeners
function setupBuffetEventListeners() {
    // Reservation form
    document.getElementById('reservation-form').addEventListener('submit', handleReservationSubmission);
    
    // Guest count change
    document.getElementById('res-guests').addEventListener('input', updateTotalAmount);
    
    // Date validation
    document.getElementById('res-date').addEventListener('change', validateDate);
}

// Select package
function selectPackage(packageType, price) {
    selectedPackage = {
        type: packageType,
        ...buffetPackages[packageType]
    };
    
    showReservationModal();
}

// Show reservation modal
function showReservationModal() {
    document.getElementById('reservation-modal').classList.remove('hidden');
    
    // Update package info
    document.getElementById('selected-package').textContent = selectedPackage.name;
    document.getElementById('package-details').textContent = selectedPackage.description;
    document.getElementById('package-price').textContent = `₦${selectedPackage.price.toLocaleString()}`;
    
    updateTotalAmount();
}

// Close reservation modal
function closeReservationModal() {
    document.getElementById('reservation-modal').classList.add('hidden');
    resetReservationForm();
}

// Update total amount calculation
function updateTotalAmount() {
    if (!selectedPackage) return;
    
    const guests = parseInt(document.getElementById('res-guests').value) || 1;
    const subtotal = selectedPackage.price * guests;
    const serviceCharge = Math.round(subtotal * 0.05); // 5% service charge
    const total = subtotal + serviceCharge;
    const deposit = Math.round(total * 0.5); // 50% deposit
    
    document.getElementById('guest-count').textContent = guests;
    document.getElementById('service-charge').textContent = `₦${serviceCharge.toLocaleString()}`;
    document.getElementById('reservation-total').textContent = `₦${deposit.toLocaleString()}`;
    
    // Store values for payment
    window.reservationTotals = {
        subtotal,
        serviceCharge,
        total,
        deposit,
        guests
    };
}

// Set minimum date (today)
function setMinDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const minDate = tomorrow.toISOString().split('T')[0];
    document.getElementById('res-date').min = minDate;
    document.getElementById('res-date').value = minDate;
}

// Validate selected date
function validateDate() {
    const selectedDate = new Date(document.getElementById('res-date').value);
    const today = new Date();
    
    if (selectedDate <= today) {
        alert('Please select a date at least 1 day in advance');
        setMinDate();
        return false;
    }
    
    return true;
}

// Update guest count display
function updateGuestCount() {
    const guestInput = document.getElementById('res-guests');
    if (guestInput) {
        guestInput.addEventListener('input', () => {
            const count = parseInt(guestInput.value) || 1;
            if (count < 1) {
                guestInput.value = 1;
            } else if (count > 50) {
                guestInput.value = 50;
                alert('Maximum 50 guests per reservation. For larger groups, please contact us directly.');
            }
            updateTotalAmount();
        });
    }
}

// Handle reservation form submission
function handleReservationSubmission(e) {
    e.preventDefault();
    
    if (!validateReservationForm()) {
        return;
    }
    
    const reservationData = collectReservationData();
    processPayment(reservationData);
}

// Validate reservation form
function validateReservationForm() {
    const date = document.getElementById('res-date').value;
    const time = document.getElementById('res-time').value;
    const guests = parseInt(document.getElementById('res-guests').value);
    
    if (!date || !time) {
        alert('Please select both date and time for your reservation');
        return false;
    }
    
    if (!validateDate()) {
        return false;
    }
    
    if (guests < 1 || guests > 50) {
        alert('Number of guests must be between 1 and 50');
        return false;
    }
    
    return true;
}

// Collect reservation data
function collectReservationData() {
    const totals = window.reservationTotals;
    currentReservationId = 'BF' + Date.now().toString().slice(-6);
    
    return {
        reservationId: currentReservationId,
        package: selectedPackage,
        customerName: `${document.getElementById('res-firstName').value} ${document.getElementById('res-lastName').value}`,
        firstName: document.getElementById('res-firstName').value,
        lastName: document.getElementById('res-lastName').value,
        phone: document.getElementById('res-phone').value,
        email: document.getElementById('res-email').value,
        date: document.getElementById('res-date').value,
        time: document.getElementById('res-time').value,
        guests: parseInt(document.getElementById('res-guests').value),
        occasion: document.getElementById('res-occasion').value,
        requests: document.getElementById('res-requests').value,
        totals: totals,
        timestamp: new Date().toISOString(),
        status: 'confirmed',
        paymentStatus: 'deposit_paid'
    };
}

// Process payment
function processPayment(reservationData) {
    const handler = PaystackPop.setup({
        key: CONFIG.PAYSTACK_PUBLIC_KEY,
        email: reservationData.email,
        amount: reservationData.totals.deposit * 100, // Amount in kobo
        currency: 'NGN',
        ref: reservationData.reservationId,
        metadata: {
            custom_fields: [
                {
                    display_name: "Reservation Type",
                    variable_name: "reservation_type",
                    value: "buffet"
                },
                {
                    display_name: "Package",
                    variable_name: "package",
                    value: reservationData.package.name
                },
                {
                    display_name: "Date",
                    variable_name: "date",
                    value: reservationData.date
                },
                {
                    display_name: "Guests",
                    variable_name: "guests",
                    value: reservationData.guests.toString()
                }
            ]
        },
        callback: function(response) {
            // Payment successful
            console.log('Payment successful:', response);
            
            // Store reservation
            storeReservation(reservationData, response.reference);
            
            // Send confirmation messages
            sendReservationConfirmation(reservationData);
            
            // Show success modal
            showConfirmationModal();
            
            // Close reservation modal
            closeReservationModal();
        },
        onClose: function() {
            alert('Payment was not completed. Please try again.');
        }
    });

    handler.openIframe();
}

// Store reservation in localStorage
function storeReservation(reservationData, paymentReference) {
    const reservations = JSON.parse(localStorage.getItem('buffetReservations') || '[]');
    
    reservations.unshift({
        ...reservationData,
        paymentReference: paymentReference
    });
    
    localStorage.setItem('buffetReservations', JSON.stringify(reservations));
}

// Send reservation confirmation
function sendReservationConfirmation(reservation) {
    const message = `🎉 *BUFFET RESERVATION CONFIRMED*

📋 *Reservation ID:* ${reservation.reservationId}
👤 *Name:* ${reservation.customerName}
📞 *Phone:* ${reservation.phone}

🍽️ *Package:* ${reservation.package.name}
📅 *Date:* ${formatDate(reservation.date)}
⏰ *Time:* ${formatTime(reservation.time)}
👥 *Guests:* ${reservation.guests} people
${reservation.occasion ? `🎊 *Occasion:* ${reservation.occasion}` : ''}

💰 *Total Amount:* ₦${reservation.totals.total.toLocaleString()}
💳 *Deposit Paid:* ₦${reservation.totals.deposit.toLocaleString()}
💵 *Balance:* ₦${(reservation.totals.total - reservation.totals.deposit).toLocaleString()} (pay at restaurant)

${reservation.requests ? `📝 *Special Requests:* ${reservation.requests}` : ''}

📍 *Location:* ${CONFIG.RESTAURANT_ADDRESS}

⚠️ *Important:*
- Arrive 15 minutes before your time
- Balance payment due upon arrival
- Free cancellation up to 24 hours before

Thank you for choosing ${CONFIG.RESTAURANT_NAME}! 🍽️✨`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Open WhatsApp to send message
    window.open(whatsappUrl, '_blank');
}

// Show confirmation modal
function showConfirmationModal() {
    document.getElementById('reservation-id').textContent = currentReservationId;
    document.getElementById('confirmation-modal').classList.remove('hidden');
}

// Close confirmation modal
function closeConfirmationModal() {
    document.getElementById('confirmation-modal').classList.add('hidden');
    window.location.href = 'index.html';
}

// Reset reservation form
function resetReservationForm() {
    document.getElementById('reservation-form').reset();
    setMinDate();
    selectedPackage = null;
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initBuffet);