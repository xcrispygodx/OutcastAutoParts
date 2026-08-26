# Outcast Auto Parts - Used Car Parts Marketplace

A full-featured used car parts marketplace with seller dashboard, eBay integration, local junkyard inventory tracking, and Stripe checkout.

## Features

### Marketplace (Public)
- **Vehicle Search** - Search parts by make, model, and year
- **Part Categories** - Browse by engine, transmission, electrical, body, interior, etc.
- **Featured Listings** - Highlighted quality parts ready to ship
- **Order Direct** - Stripe checkout with savings vs retail pricing
- **Responsive Design** - Works on desktop, tablet, and mobile

### Checkout (Stripe)
- **Direct Order Savings** - Save up to 80% off dealer prices
- **Secure Payment** - Powered by Stripe
- **Cart Management** - Add/remove items, quantity controls
- **Order Summary** - Real-time savings calculation
- **Shipping Info** - Collect delivery details

### Seller Dashboard (Login Required)
- **New Arrivals Tracker** - Real-time updates from local junkyards
- **eBay Pricing Intelligence** - Search eBay sold listings to determine profitable parts
- **Listing Management** - Create, edit, and manage your listings
- **eBay Auto-Sync** - Automatically sync listings to eBay (API integration)
- **Easy Ship Prioritization** - Focus on lightweight, easy-to-ship parts
- **Freight Shipping Placeholder** - Coming soon module for heavy items

### Key Selling Points
- Prioritizes easy-to-ship parts: window motors, side mirrors, switches, modules, ECUs
- Auto-calculates profit margins based on eBay sold prices
- One-click listing creation from eBay search results
- Local yard integration for fresh inventory

## Tech Stack

- HTML5
- CSS3 (Custom properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- Stripe Elements for payments
- eBay API integration (placeholder ready)

## Project Structure

```
OutcastAutoParts/
├── index.html          # Main marketplace
├── login.html          # Seller dashboard (login required)
├── checkout.html       # Stripe checkout page
├── server.js           # Backend for Stripe PaymentIntents
├── .env.example        # Environment variables template
├── css/
│   └── style.css       # Industrial automotive theme
├── js/
│   ├── app.js          # Marketplace functionality
│   ├── cart.js         # Shared cart management
│   ├── checkout.js     # Stripe checkout logic
│   ├── dashboard.js    # Dashboard & seller tools
│   └── ebay-api.js     # eBay API integration
└── README.md
```

## Getting Started

### Frontend
1. Clone the repository
2. Open `index.html` in a browser for the marketplace
3. Open `checkout.html` to test the checkout flow
4. Open `login.html` in a browser for the seller dashboard

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

### Deploying the Backend
Deploy `server.js` to any Node.js host:
- **Render** - Free tier available
- **Fly.io** - Free tier available
- **Vercel** - Free tier available
- **Railway** - Free tier available
- **Heroku** - Free tier available

### eBay API Setup

To enable real eBay integration:

1. Create an eBay Developer account at https://developer.ebay.com/
2. Get your App ID, Dev ID, Cert ID, and Access Token
3. Update the config in `js/ebay-api.js`:
   ```javascript
   config: {
       appId: 'YOUR_APP_ID',
       devId: 'YOUR_DEV_ID',
       certId: 'YOUR_CERT_ID',
       accessToken: 'YOUR_ACCESS_TOKEN',
       sandbox: true // Set to false for production
   }
   ```

## Future Enhancements

- [x] Stripe checkout integration
- [x] Cart management
- [x] Order savings display
- [ ] User authentication & accounts
- [ ] Real eBay API integration
- [ ] Shipping label generation
- [ ] Freight shipping module
- [ ] Mobile app
- [ ] Inventory management system
- [ ] Automated pricing suggestions
- [ ] Yard management portal

## License

MIT
