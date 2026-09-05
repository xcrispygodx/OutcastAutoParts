// Outcast Auto Parts - Checkout Logic

// ============================================
// Configuration
// ============================================

const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY';
const CREATE_PAYMENT_INTENT_URL = '/api/create-payment-intent';

const SHIPPING_RATES = {
    standard: 9.99,
    express: 19.99,
    local: 0
};

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
    
    if (selectedShipping === 'local') {
        standardFields.style.display = 'none';
        localFields.classList.add('active');
    } else {
        standardFields.style.display = 'block';
        localFields.classList.remove('active');
    }
    
    updateOrderSummary();
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
    const shipping = SHIPPING_RATES[selectedShipping] || (subtotal > 100 ? 0 : 9.99);
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
        } : {
            line1: document.getElementById('shippingAddress').value,
            city: document.getElementById('shippingCity').value,
            state: document.getElementById('shippingState').value,
            postal_code: document.getElementById('shippingZip').value
        },
        phone: document.getElementById('shippingPhone').value,
        method: selectedShipping,
        notes: document.getElementById('localDeliveryNotes').value || ''
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
