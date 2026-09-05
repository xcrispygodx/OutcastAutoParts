# Outcast Auto Parts - Used Car Parts Marketplace

A full-featured used car parts marketplace with seller dashboard, eBay integration, local junkyard inventory tracking, and Stripe checkout.

## Features

### Marketplace (Public)
- **Vehicle Search** - Search parts by make, model, and year
- **Part Categories** - Browse by engine, transmission, electrical, body, interior, etc.
- **Featured Listings** - Highlighted quality parts ready to ship
- **Order Direct** - Stripe checkout with savings vs retail pricing
- **Local Delivery** - Same-day local delivery and yard pickup options
- **Responsive Design** - Works on desktop, tablet, and mobile

### Checkout (Stripe)
- **Direct Order Savings** - Save up to 80% off dealer prices
- **Secure Payment** - Powered by Stripe
- **Shipping Options** - Standard, Express, or Local Delivery/Pickup
- **Cart Management** - Add/remove items, quantity controls
- **Order Summary** - Real-time savings calculation

### Seller Dashboard (Login Required)
- **Dashboard as Main Landing** - Seller dashboard is the primary interface after login
- **New Arrivals Tracker** - Live auto-refreshing updates from local junkyards with email alerts
- **eBay Pricing Intelligence** - Search eBay sold listings to determine profitable parts
- **Listing Management** - Create, edit, and manage your listings with eBay sync
- **eBay Auto-Sync** - One-click sync listings to eBay (API integration)
- **Local Delivery Support** - Mark listings for local delivery only
- **Email Notifications** - Subscribe to new arrival alerts via EmailJS

### Tools & Integrations
- **EmailJS** - Client-side email notifications for new yard arrivals (free tier available)
- **eBay API** - Placeholder-ready integration for listing sync and pricing data
- **Stripe** - Payment processing with local delivery support
- **LocalStorage** - Persistent listing and subscriber data in browser

## Tech Stack

- HTML5
- CSS3 (Custom properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- Stripe Elements for payments
- EmailJS for notifications
- eBay API integration (placeholder ready)

## Getting Started

### Frontend
1. Clone the repository
2. Open `index.html` in a browser for the landing page
3. Open `marketplace.html` for the public marketplace
4. Open `checkout.html` to test the checkout flow
5. Open `login.html` in a browser for the seller dashboard

### Stripe Backend Setup
The checkout page requires a backend to create Stripe PaymentIntents. A reference implementation is included in `server.js`.

1. Create a Stripe account at https://stripe.com
2. Get your publishable key and secret key from the Stripe Dashboard
3. Update `STRIPE_PUBLISHABLE_KEY` in `js/checkout.js`
4. Deploy the backend:
    ```bash
    npm init -y
    npm install express cors stripe dotenv
    cp .env.example .env
    # Edit .env with your Stripe secret key
    node server.js
    ```
5. Update `CREATE_PAYMENT_INTENT_URL` in `js/checkout.js` to point to your deployed backend

### Email Notifications Setup (EmailJS)

To enable new arrival email alerts:

1. Create a free account at https://www.emailjs.com/
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template with variables: `to_email`, `yard_name`, `vehicle`, `parts`, `date`
4. Get your Service ID, Template ID, and Public Key
5. Update `js/dashboard.js`:
    ```javascript
    const EMAILJS_CONFIG = {
        serviceId: 'YOUR_SERVICE_ID',
        templateId: 'YOUR_TEMPLATE_ID',
        publicKey: 'YOUR_PUBLIC_KEY'
    };
    ```
6. Users can subscribe to notifications from the dashboard

### eBay API Setup

To enable real eBay integration:

1. Create an eBay Developer account at https://developer.ebay.com/
2. Get your App ID, Dev ID, Cert ID, and Access Token
3. Update the config in `js/ebay-api.js` and `js/dashboard.js`:
    ```javascript
    config: {
        appId: 'YOUR_APP_ID',
        devId: 'YOUR_DEV_ID',
        certId: 'YOUR_CERT_ID',
        accessToken: 'YOUR_ACCESS_TOKEN',
        sandbox: true // Set to false for production
    }
    ```

### User Authentication & Accounts (Cloudflare Workers)

Customer and seller accounts are secured with a Cloudflare Worker + KV backend:

1. Install Wrangler: `npm install -g wrangler`
2. Create KV namespace: `wrangler kv namespace create AUTH`
3. Copy the KV namespace ID into `wrangler.toml`
4. Update the worker URL in `js/auth.js` and `js/dashboard.js`:
    ```javascript
    baseUrl: 'https://outcast-auto-parts-auth.outcast-auto-parts.workers.dev'
    ```
5. Deploy the worker: `wrangler deploy`
6. The site now supports secure registration, login, logout, and session verification

**Security features:**
- Passwords hashed with PBKDF2 + SHA-256 (100k iterations)
- Per-user salts
- 7-day session tokens
- CORS-enabled API
- Cloudflare rate limiting and DDoS protection

### Yard Image Preview

The dashboard fetches live preview images from linked junkyard sites through a Cloudflare Worker proxy:

- Worker route: `/yard-images?url=<target-url>`
- Extracts up to 20 images from the target page
- 1-hour browser cache to avoid repeated fetches
- Fallback to branded placeholders if no images are found

Worker URL: `https://outcast-auto-parts-auth.outcast-auto-parts.workers.dev`

To enable:
1. Deploy the auth worker with `wrangler deploy`
2. Update `YARD_IMAGE_API` in `js/dashboard.js` with your worker URL
3. Yard preview images will auto-load on dashboard login

## Future Enhancements

- [x] Stripe checkout integration
- [x] Cart management
- [x] Order savings display
- [x] Dashboard as main landing page
- [x] eBay sync from listings
- [x] Live arrivals with email notifications
- [x] Local delivery checkout option
- [x] User authentication & accounts
- [x] Yard image preview via Cloudflare Worker
- [ ] Real eBay API integration
- [ ] Shipping label generation
- [ ] Freight shipping module
- [ ] Mobile app
- [ ] Inventory management system
- [ ] Automated pricing suggestions
- [ ] Yard management portal

## License

MIT
