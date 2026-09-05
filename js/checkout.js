// Outcast Auto Parts - Checkout Logic

// ============================================
// Configuration
// ============================================

const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY';
const CREATE_PAYMENT_INTENT_URL = '/api/create-payment-intent';

const SHIPPING_RATES = {
    standard: 9.99,
    express: 19.99,
    local: 0,
    freight: 0
};

const FREIGHT_ORIGIN_ZIP = '78223';
const FREIGHT_BASE_MILES = 20;
const FREIGHT_BASE_COST = 40;
const FREIGHT_EXTRA_COST_PER_MILE = 2;

// ============================================
// State
// ============================================

let stripe = null;
let elements = null;
let cardElement = null;
let selectedShipping = 'standard';

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initStripe();
    renderCart();
    updateOrderSummary();
    setupEventListeners();
});

// ============================================
// Stripe Setup
// ============================================

function initStripe() {
    if (typeof Stripe === 'undefined') {
        console.error('Stripe.js not loaded');
        document.getElementById('submit-payment').disabled = true;
        return;
    }

    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    elements = stripe.elements({
        fonts: [
            {
                cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
            }
        ]
    });

    const style = {
        base: {
            color: '#f0e6d2',
            fontFamily: '"Inter", sans-serif',
            fontSize: '16px',
            '::placeholder': {
                color: '#8a8a8a'
            }
        },
        invalid: {
            color: '#dc2626',
            iconColor: '#dc2626'
        }
    };

    cardElement = elements.create('card', { style });
    cardElement.mount('#card-element');

    cardElement.on('change', (event) => {
        const displayError = document.getElementById('payment-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
}

// ============================================
// Shipping Method
// ============================================

function updateShippingMethod() {
    const selected = document.querySelector('input[name="shippingMethod"]:checked');
    if (!selected) return;
    
    selectedShipping = selected.value;
    const standardFields = document.getElementById('standardShippingFields');
    const localFields = document.getElementById('localDeliveryFields');
    const freightFields = document.getElementById('freightCalculator');
    
    if (selectedShipping === 'local') {
        standardFields.style.display = 'none';
        localFields.classList.add('active');
        freightFields.classList.remove('active');
    } else if (selectedShipping === 'freight') {
        standardFields.style.display = 'none';
        localFields.classList.remove('active');
        freightFields.classList.add('active');
        calculateFreight();
    } else {
        standardFields.style.display = 'block';
        localFields.classList.remove('active');
        freightFields.classList.remove('active');
    }
    
    updateOrderSummary();
}

function calculateFreight() {
    const destZip = document.getElementById('freightDestZip').value.trim();
    const distanceEl = document.getElementById('freightDistance');
    const rateEl = document.getElementById('freightRate');
    const priceEl = document.getElementById('freightShippingPrice');
    
    if (!destZip || destZip.length < 5) {
        distanceEl.value = '';
        rateEl.value = '';
        priceEl.textContent = 'Calculate';
        return;
    }
    
    const distance = estimateZipDistance(FREIGHT_ORIGIN_ZIP, destZip);
    const cost = FREIGHT_BASE_COST + Math.max(0, distance - FREIGHT_BASE_MILES) * FREIGHT_EXTRA_COST_PER_MILE;
    
    distanceEl.value = distance + ' miles';
    rateEl.value = '$' + cost.toFixed(2);
    priceEl.textContent = '$' + cost.toFixed(2);
    
    SHIPPING_RATES.freight = cost;
}

function estimateZipDistance(zip1, zip2) {
    const z1 = parseInt(zip1.substring(0, 3), 10);
    const z2 = parseInt(zip2.substring(0, 3), 10);
    
    const zipLat = {};
    const zipLng = {};
    
    for (let i = 0; i <= 999; i++) {
        const prefix = String(i).padStart(3, '0');
        zipLat[prefix] = 25 + (i / 999) * 20;
        zipLng[prefix] = -100 + (i % 50) * 0.8;
    }
    
    const p1 = String(z1).padStart(3, '0');
    const p2 = String(z2).padStart(3, '0');
    
    const lat1 = zipLat[p1] || 29;
    const lng1 = zipLng[p1] || -98;
    const lat2 = zipLat[p2] || 29;
    const lng2 = zipLng[p2] || -98;
    
    const dLat = (lat2 - lat1) * 60;
    const dLng = (lng2 - lng1) * 60;
    const distance = Math.sqrt(dLat * dLat + dLng * dLng);
    
    return Math.max(1, Math.round(distance));
}

// ============================================
// Cart Rendering
// ============================================

function renderCart() {
    const container = document.getElementById('cartItems');
    if (!container) return;

    const cart = Cart.get();

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Your cart is empty. <a href="marketplace.html">Browse parts</a></p>';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-vehicle">${item.vehicle || ''}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                ${item.shippingType === 'local' ? '<span class="part-card-local-badge" style="margin-top: 0.5rem;">Local Delivery</span>' : ''}
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="Cart.updateQuantity('${item.id}', -1); renderCart(); updateOrderSummary();">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="Cart.updateQuantity('${item.id}', 1); renderCart(); updateOrderSummary();">+</button>
                </div>
                <button class="remove-btn" onclick="Cart.remove('${item.id}'); renderCart(); updateOrderSummary();">Remove</button>
            </div>
            <div class="cart-item-total">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        </div>
    `).join('');
}

function updateOrderSummary() {
    const cart = Cart.get();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const retailTotal = cart.reduce((sum, item) => sum + ((item.retailPrice || item.price * 2) * item.quantity), 0);
    const savings = retailTotal - subtotal;
    const savingsPercent = retailTotal > 0 ? Math.round((savings / retailTotal) * 100) : 0;
    
    let shipping = 0;
    if (selectedShipping === 'freight') {
        shipping = SHIPPING_RATES.freight || 0;
    } else if (selectedShipping === 'local') {
        shipping = 0;
    } else {
        shipping = SHIPPING_RATES[selectedShipping] || (subtotal > 100 ? 0 : 9.99);
    }
    
    const total = subtotal + shipping;

    document.getElementById('summarySubtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('summaryShipping').textContent = shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2);
    document.getElementById('summarySavings').textContent = '-$' + savings.toFixed(2);
    document.getElementById('summaryTotal').textContent = '$' + total.toFixed(2);
    document.getElementById('savingsPercent').textContent = savingsPercent;

    const submitBtn = document.getElementById('submit-payment');
    submitBtn.disabled = cart.length === 0;
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    document.getElementById('submit-payment').addEventListener('click', handlePayment);
}

// ============================================
// Payment Processing
// ============================================

async function handlePayment() {
    const submitBtn = document.getElementById('submit-payment');
    const buttonText = document.getElementById('button-text');
    const buttonSpinner = document.getElementById('button-spinner');

    const cart = Cart.get();
    if (cart.length === 0) return;

    // Validate shipping form
    const shippingForm = document.getElementById('shippingForm');
    
    // For local delivery, only validate required fields
    if (selectedShipping === 'local') {
        const name = document.getElementById('shippingName').value.trim();
        const email = document.getElementById('shippingEmail').value.trim();
        if (!name || !email) {
            alert('Please fill in your name and email for local delivery.');
            return;
        }
    } else {
        if (!shippingForm.checkValidity()) {
            shippingForm.reportValidity();
            return;
        }
    }

    // Collect shipping info
    const shippingInfo = {
        name: document.getElementById('shippingName').value,
        email: document.getElementById('shippingEmail').value,
        address: selectedShipping === 'local' ? {
            line1: document.getElementById('localDeliveryAddress').value || 'Local Pickup',
            city: '',
            state: '',
            postal_code: ''
        } : selectedShipping === 'freight' ? {
            line1: 'Freight Shipping',
            city: '',
            state: '',
            postal_code: document.getElementById('freightDestZip').value
        } : {
            line1: document.getElementById('shippingAddress').value,
            city: document.getElementById('shippingCity').value,
            state: document.getElementById('shippingState').value,
            postal_code: document.getElementById('shippingZip').value
        },
        phone: document.getElementById('shippingPhone').value,
        method: selectedShipping,
        notes: document.getElementById('localDeliveryNotes').value || '',
        freightDistance: selectedShipping === 'freight' ? document.getElementById('freightDistance').value : ''
    };

    // Show loading state
    submitBtn.disabled = true;
    buttonText.textContent = 'Processing...';
    buttonSpinner.style.display = 'inline-block';

    try {
        const shippingCost = SHIPPING_RATES[selectedShipping] || (subtotal > 100 ? 0 : 9.99);
        
        const response = await fetch(CREATE_PAYMENT_INTENT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart,
                shipping: shippingInfo,
                shippingCost: shippingCost
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create payment intent');
        }

        const { clientSecret } = await response.json();

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                billing_details: {
                    name: shippingInfo.name,
                    email: shippingInfo.email,
                    phone: shippingInfo.phone,
                    address: shippingInfo.address
                }
            }
        });

        if (result.error) {
            document.getElementById('payment-errors').textContent = result.error.message;
            submitBtn.disabled = false;
            buttonText.textContent = 'Place Order';
            buttonSpinner.style.display = 'none';
        } else {
            Cart.clear();
            renderCart();
            updateOrderSummary();
            showSuccess(result.paymentIntent.id);
        }
    } catch (error) {
        console.error('Payment error:', error);
        document.getElementById('payment-errors').textContent = 'Payment failed. Please try again.';
        submitBtn.disabled = false;
        buttonText.textContent = 'Place Order';
        buttonSpinner.style.display = 'none';
    }
}

function showSuccess(paymentId) {
    const container = document.querySelector('.checkout-main');
    container.innerHTML = `
        <div class="success-message">
            <div class="success-icon">✅</div>
            <h2>Order Confirmed!</h2>
            <p>Thank you for your purchase. Your order ID is: <strong>${paymentId}</strong></p>
            <p>A confirmation email will be sent shortly.</p>
            <a href="marketplace.html" class="btn btn-primary">Continue Shopping</a>
        </div>
    `;
}
