// Outcast Auto Parts - Seller Dashboard Logic

// ============================================
// Authentication
// ============================================

const VALID_USERNAME = 'OutcastAutoParts210';
const VALID_PASSWORD = 'Aga6650284015Aga$';

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        sessionStorage.setItem('outcast_auth', 'true');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
        errorEl.style.display = 'none';
        initDashboard();
    } else {
        errorEl.style.display = 'block';
        errorEl.textContent = 'Invalid username or password';
    }
}

function logout() {
    sessionStorage.removeItem('outcast_auth');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').style.display = 'none';
}

function checkAuth() {
    if (sessionStorage.getItem('outcast_auth') === 'true') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
        initDashboard();
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('dashboardContent').style.display = 'none';
    }
}

function initDashboard() {
    loadNewArrivals();
    loadMyListings();
    updateDashboardStats();
}

// ============================================
// Data Stores
// ============================================

let newArrivals = [];
let myListings = [];
let ebaySearchResults = [];

// Sample yard data
const yards = [
    { id: 'yard1', name: 'Auto Salvage Co.', location: 'North Side' },
    { id: 'yard2', name: 'Metro Dismantling', location: 'Downtown' },
    { id: 'yard3', name: 'Quality Auto Parts', location: 'East Side' },
    { id: 'yard4', name: 'Highway Auto Wreckers', location: 'West Side' }
];

// Sample arrivals
const sampleArrivals = [
    {
        id: 1,
        yardId: 'yard1',
        yardName: 'Auto Salvage Co.',
        vehicle: '2019 Ford F-150 XLT',
        vin: '1FTEW1EP5KFA12345',
        date: '2025-08-25',
        parts: [
            { name: 'Window Motor (Front Left)', partNumber: 'DS7Z-14529-B', easyShip: true },
            { name: 'Side View Mirror (Power)', partNumber: 'DS7Z-17683-AA', easyShip: true },
            { name: 'Brake Control Module', partNumber: 'DS7Z-2C220-B', easyShip: true },
            { name: 'Center Console', partNumber: 'DS7Z-78045A92A', easyShip: false }
        ]
    },
    {
        id: 2,
        yardId: 'yard2',
        yardName: 'Metro Dismantling',
        vehicle: '2020 Chevrolet Silverado 1500',
        vin: '3GCPWCEF5LG123456',
        date: '2025-08-24',
        parts: [
            { name: 'Transmission Control Module', partNumber: '24265798', easyShip: true },
            { name: 'ECU Engine Control Unit', partNumber: '12638177', easyShip: true },
            { name: 'Sun Visor (Driver Side)', partNumber: '84176615', easyShip: true },
            { name: 'Headlight Switch', partNumber: '84176615', easyShip: true }
        ]
    },
    {
        id: 3,
        yardId: 'yard3',
        yardName: 'Quality Auto Parts',
        vehicle: '2018 Toyota Camry SE',
        vin: '4T1B11HK5JU123789',
        date: '2025-08-23',
        parts: [
            { name: 'Window Switch (Master)', partNumber: '84001-06150', easyShip: true },
            { name: 'Power Steering Control Module', partNumber: '89650-06120', easyShip: true },
            { name: 'Radio / Head Unit', partNumber: '86160-06120', easyShip: true }
        ]
    },
    {
        id: 4,
        yardId: 'yard4',
        yardName: 'Highway Auto Wreckers',
        vehicle: '2021 Honda CR-V EX',
        vin: '2HKRW2H54MH123012',
        date: '2025-08-22',
        parts: [
            { name: 'Side Mirror (Passenger)', partNumber: '76200-TR3-A01', easyShip: true },
            { name: 'Window Regulator (Rear Left)', partNumber: '72210-TR3-A01', easyShip: true },
            { name: 'Sun Visor (Passenger)', partNumber: '83280-TR3-A01', easyShip: true },
            { name: 'ABS Control Module', partNumber: '57810-TR3-A01', easyShip: true }
        ]
    }
];

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadNewArrivals();
    loadMyListings();
    updateDashboardStats();
});

// ============================================
// Dashboard Stats
// ============================================

function updateDashboardStats() {
    const activeCount = myListings.filter(l => l.status === 'active').length;
    const totalRevenue = myListings
        .filter(l => l.status === 'sold')
        .reduce((sum, l) => sum + (l.yourPrice || 0), 0);
    const pendingShipments = myListings.filter(l => l.status === 'pending').length;
    
    document.getElementById('activeListings').textContent = activeCount || 24;
    document.getElementById('totalRevenue').textContent = '$' + (totalRevenue || 3450).toLocaleString();
    document.getElementById('monthlyViews').textContent = '1,234';
    document.getElementById('pendingShipments').textContent = pendingShipments || 3;
}

// ============================================
// New Arrivals
// ============================================

function loadNewArrivals(yardFilter = 'all') {
    const grid = document.getElementById('arrivalsGrid');
    if (!grid) return;
    
    let arrivals = sampleArrivals;
    if (yardFilter !== 'all') {
        arrivals = arrivals.filter(a => a.yardId === yardFilter);
    }
    
    grid.innerHTML = arrivals.map(arrival => `
        <div class="arrival-card">
            <span class="arrival-badge">NEW</span>
            <div class="arrival-yard">${arrival.yardName}</div>
            <div class="arrival-vehicle">${arrival.vehicle}</div>
            <div class="arrival-date">Arrived: ${formatDate(arrival.date)}</div>
            <ul class="arrival-parts">
                ${arrival.parts.map(part => `
                    <li>
                        <span>${part.name}</span>
                        <span style="color: var(--primary); font-size: 0.8rem;">
                            ${part.easyShip ? '📦 Easy Ship' : '🚚 Freight'}
                        </span>
                    </li>
                `).join('')}
            </ul>
            <div class="arrival-actions">
                <button class="btn btn-primary" onclick="viewArrivalDetails(${arrival.id})">View Details</button>
                <button class="btn btn-secondary" onclick="createListingFromArrival(${arrival.id})">Create Listing</button>
            </div>
        </div>
    `).join('');
}

function refreshArrivals() {
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = '🔄 Refreshing...';
    
    setTimeout(() => {
        loadNewArrivals(document.getElementById('yardFilter').value);
        btn.disabled = false;
        btn.textContent = '🔄 Refresh';
    }, 1500);
}

function filterYards() {
    const yardFilter = document.getElementById('yardFilter').value;
    loadNewArrivals(yardFilter);
}

function viewArrivalDetails(arrivalId) {
    const arrival = sampleArrivals.find(a => a.id === arrivalId);
    if (!arrival) return;
    
    alert(`Vehicle: ${arrival.vehicle}\nVIN: ${arrival.vin}\nYard: ${arrival.yardName}\nDate: ${formatDate(arrival.date)}\n\nParts Available:\n${arrival.parts.map(p => `- ${p.name}`).join('\n')}`);
}

function createListingFromArrival(arrivalId) {
    const arrival = sampleArrivals.find(a => a.id === arrivalId);
    if (!arrival) return;
    
    // Pre-fill the add listing modal
    document.getElementById('listingVehicle').value = arrival.vehicle;
    document.getElementById('addListingModal').classList.add('active');
}

// ============================================
// eBay Search & Pricing
// ============================================

function searchEbayParts() {
    const searchTerm = document.getElementById('ebayPartSearch').value.toLowerCase();
    const makeFilter = document.getElementById('ebayMakeFilter').value;
    
    if (!searchTerm) {
        alert('Please enter a part to search');
        return;
    }
    
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = '🔍 Searching...';
    
    // Simulate eBay API search
    setTimeout(() => {
        const results = generateEbayResults(searchTerm, makeFilter);
        displayEbayResults(results);
        btn.disabled = false;
        btn.textContent = '🔍 Search eBay';
    }, 1500);
}

function generateEbayResults(searchTerm, makeFilter) {
    // This would integrate with eBay API in production
    // For now, generate realistic sample data
    const basePrices = {
        'window motor': { low: 45, high: 120, avg: 85 },
        'side view mirror': { low: 35, high: 95, avg: 65 },
        'sun visor': { low: 25, high: 60, avg: 42 },
        'switch': { low: 20, high: 55, avg: 38 },
        'brake module': { low: 80, high: 280, avg: 165 },
        'transmission module': { low: 100, high: 350, avg: 195 },
        'ecu': { low: 120, high: 450, avg: 280 },
        'headlight': { low: 40, high: 150, avg: 95 },
        'taillight': { low: 30, high: 120, avg: 75 },
        'bumper': { low: 60, high: 250, avg: 145 }
    };
    
    const makes = makeFilter ? [makeFilter] : ['ford', 'chevrolet', 'toyota', 'honda', 'nissan'];
    const results = [];
    
    for (let i = 0; i < 6; i++) {
        const make = makes[Math.floor(Math.random() * makes.length)];
        const partType = Object.keys(basePrices)[Math.floor(Math.random() * Object.keys(basePrices).length)];
        const priceRange = basePrices[partType];
        const soldPrice = Math.round((priceRange.low + Math.random() * (priceRange.high - priceRange.low)) * 100) / 100;
        
        results.push({
            id: i + 1,
            partName: `${partType.charAt(0).toUpperCase() + partType.slice(1)} - ${make.charAt(0).toUpperCase() + make.slice(1)}`,
            vehicle: `${2015 + Math.floor(Math.random() * 10)} ${make.charAt(0).toUpperCase() + make.slice(1)} ${['F-150', 'Camry', 'Civic', 'Silverado', 'Altima'][Math.floor(Math.random() * 5)]}`,
            soldPrice: soldPrice,
            shipping: soldPrice > 100 ? 'Free' : '$8.99',
            condition: Math.random() > 0.3 ? 'Used' : 'Refurbished',
            dateSold: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString()
        });
    }
    
    return results.sort((a, b) => b.soldPrice - a.soldPrice);
}

function displayEbayResults(results) {
    const summary = document.getElementById('ebaySummary');
    const grid = document.getElementById('ebayGrid');
    
    if (!summary || !grid) return;
    
    const avgPrice = results.reduce((sum, r) => sum + r.soldPrice, 0) / results.length;
    const minPrice = Math.min(...results.map(r => r.soldPrice));
    const maxPrice = Math.max(...results.map(r => r.soldPrice));
    
    summary.innerHTML = `
        <p><strong>Found ${results.length} sold listings</strong></p>
        <p style="margin-top: 0.5rem; font-size: 0.9rem;">
            Price Range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)} | 
            Average: $${avgPrice.toFixed(2)}
        </p>
    `;
    
    grid.innerHTML = results.map(result => `
        <div class="ebay-card">
            <div class="ebay-card-header">
                <div>
                    <div class="ebay-card-title">${result.partName}</div>
                    <div class="ebay-card-vehicle">${result.vehicle}</div>
                </div>
                <div class="ebay-card-price">$${result.soldPrice.toFixed(2)}</div>
            </div>
            <div class="ebay-card-meta">
                <span>Condition: ${result.condition}</span>
                <span>Shipping: ${result.shipping}</span>
            </div>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                <button class="btn btn-primary" style="width: 100%; padding: 0.5rem;" onclick="createListingFromEbay(${result.id})">
                    Create Listing at $${(result.soldPrice * 0.85).toFixed(2)}
                </button>
            </div>
        </div>
    `).join('');
}

function createListingFromEbay(ebayId) {
    // In production, this would pre-fill with eBay data
    document.getElementById('addListingModal').classList.add('active');
}

// ============================================
// Listings Management
// ============================================

function loadMyListings() {
    const tbody = document.getElementById('listingsTableBody');
    if (!tbody) return;
    
    // Sample listings
    myListings = [
        {
            id: 1,
            partName: 'Window Motor',
            vehicle: '2015 Ford F-150',
            ebayPrice: 89.99,
            yourPrice: 75.00,
            status: 'active'
        },
        {
            id: 2,
            partName: 'Brake Control Module',
            vehicle: '2016 Chevy Silverado',
            ebayPrice: 245.00,
            yourPrice: 199.00,
            status: 'sold'
        },
        {
            id: 3,
            partName: 'ECU Engine Control',
            vehicle: '2018 Toyota Camry',
            ebayPrice: 320.00,
            yourPrice: 275.00,
            status: 'active'
        },
        {
            id: 4,
            partName: 'Side View Mirror',
            vehicle: '2019 Honda Civic',
            ebayPrice: 65.00,
            yourPrice: 55.00,
            status: 'pending'
        }
    ];
    
    tbody.innerHTML = myListings.map(listing => {
        const profit = listing.ebayPrice - listing.yourPrice;
        const profitClass = profit > 50 ? 'ebay-profit' : 'ebay-profit low';
        
        return `
            <tr>
                <td><strong>${listing.partName}</strong></td>
                <td>${listing.vehicle}</td>
                <td>$${listing.ebayPrice.toFixed(2)}</td>
                <td>$${listing.yourPrice.toFixed(2)}</td>
                <td class="${profitClass}">$${profit.toFixed(2)}</td>
                <td><span class="status-badge status-${listing.status}">${listing.status}</span></td>
                <td>
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;" onclick="editListing(${listing.id})">Edit</button>
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;" onclick="syncToEbay(${listing.id})">Sync eBay</button>
                </td>
            </tr>
        `;
    }).join('');
}

function addListing(event) {
    event.preventDefault();
    
    const partName = document.getElementById('listingPartName').value;
    const vehicle = document.getElementById('listingVehicle').value;
    const ebayPrice = parseFloat(document.getElementById('listingEbayPrice').value);
    const yourPrice = parseFloat(document.getElementById('listingYourPrice').value);
    
    const newListing = {
        id: Date.now(),
        partName,
        vehicle,
        ebayPrice,
        yourPrice,
        status: 'active'
    };
    
    myListings.push(newListing);
    loadMyListings();
    updateDashboardStats();
    closeModal();
    
    // Reset form
    document.getElementById('addListingForm').reset();
}

function editListing(listingId) {
    alert(`Edit listing ${listingId}\n\nThis would open an edit form for the listing.`);
}

function syncToEbay(listingId) {
    const listing = myListings.find(l => l.id === listingId);
    if (!listing) return;
    
    // Simulate eBay API sync
    alert(`Syncing "${listing.partName}" to eBay...\n\nIn production, this would call the eBay API to create/update the listing.`);
}

// ============================================
// Modal Functions
// ============================================

function showAddListingModal() {
    document.getElementById('addListingModal').classList.add('active');
}

function closeModal() {
    document.getElementById('addListingModal').classList.remove('active');
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('addListingModal');
    if (e.target === modal) {
        closeModal();
    }
});

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// ============================================
// Utility Functions
// ============================================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

