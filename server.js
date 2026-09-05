// Outcast Auto Parts - Stripe Checkout Backend
// This server creates PaymentIntents for the checkout flow
//
// Setup:
// 1. npm init -y
// 2. npm install express cors stripe dotenv
// 3. Set STRIPE_SECRET_KEY in .env
// 4. node server.js
// 5. Deploy to Render, Fly.io, Vercel, or any Node host
// 6. Update CREATE_PAYMENT_INTENT_URL in js/checkout.js to point to this server

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Create PaymentIntent
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { items, shipping, shippingCost } = req.body;

        if (!items || !items.length) {
            return res.status(400).json({ error: 'No items in cart' });
        }

        // Calculate total in cents
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = Math.round((subtotal + shippingCost) * 100);

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true
            },
            metadata: {
                items: JSON.stringify(items),
                shipping_name: shipping.name,
                shipping_email: shipping.email,
                shipping_address: JSON.stringify(shipping.address),
                shipping_method: shipping.method || 'standard',
                shipping_notes: shipping.notes || '',
                has_local_delivery: items.some(i => i.localDelivery) ? 'true' : 'false'
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

// Webhook for payment confirmation (optional but recommended)
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle payment success
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // TODO: Send confirmation email
        // TODO: Update order status in database
        // TODO: Notify fulfillment team
    }

    res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
