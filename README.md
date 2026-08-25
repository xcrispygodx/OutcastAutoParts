# Outcast Auto Parts - Used Car Parts Marketplace

A full-featured used car parts marketplace with seller dashboard, eBay integration, and local junkyard inventory tracking.

## Features

### Marketplace (Public)
- **Vehicle Search** - Search parts by make, model, and year
- **Part Categories** - Browse by engine, transmission, electrical, body, interior, etc.
- **Featured Listings** - Highlighted quality parts ready to ship
- **Responsive Design** - Works on desktop, tablet, and mobile

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
- eBay API integration (placeholder ready)

## Project Structure

```
OutcastAutoParts/
├── index.html          # Main marketplace
├── login.html          # Seller dashboard (login required)
├── css/
│   └── style.css       # Industrial automotive theme
├── js/
│   ├── app.js          # Marketplace functionality
│   ├── dashboard.js    # Dashboard & seller tools
│   └── ebay-api.js     # eBay API integration
└── README.md
```

## Getting Started

1. Clone the repository
2. Open `index.html` in a browser for the marketplace
3. Open `login.html` in a browser for the seller dashboard

## eBay API Setup

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

- [ ] User authentication & accounts
- [ ] Real eBay API integration
- [ ] Payment processing
- [ ] Shipping label generation
- [ ] Freight shipping module
- [ ] Mobile app
- [ ] Inventory management system
- [ ] Automated pricing suggestions
- [ ] Yard management portal

## License

MIT
