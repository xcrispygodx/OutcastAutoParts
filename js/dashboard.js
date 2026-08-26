// Outcast Auto Parts - Seller Dashboard Logic

// ============================================
// Authentication
// ============================================

const VALID_USERS = [
    { username: 'OutcastAutoParts210', passwordHash: '40e995c523b6dd2561c2a579' },
    { username: 'JesusAngel', passwordHash: '0a18abb138fcca6f7590d095' }
];

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const h1 = Math.abs(hash).toString(16).padStart(8, '0');
    const h2 = Math.abs((hash * 31) & 0xFFFFFFFF).toString(16).padStart(8, '0');
    const h3 = Math.abs((hash * 37) & 0xFFFFFFFF).toString(16).padStart(8, '0');
    return h1 + h2 + h3;
}

function verifyPassword(inputPassword, storedHash) {
    return simpleHash(inputPassword) === storedHash;
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    console.log('Login attempt:', username);
    console.log('Password hash:', simpleHash(password));
    
    const isValid = VALID_USERS.some(user => 
        user.username === username && verifyPassword(password, user.passwordHash)
    );
    
    console.log('Login valid:', isValid);
    
    if (isValid) {
        sessionStorage.setItem('outcast_auth', 'true');
        sessionStorage.setItem('outcast_user', username);
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
        const username = sessionStorage.getItem('outcast_user') || 'Seller';
        const displayEl = document.getElementById('displayUsername');
        if (displayEl) displayEl.textContent = username;
        
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
    initAnalytics();
    loadHighCompatibility();
}

// ============================================
// Data Stores
// ============================================

let newArrivals = [];
let myListings = [];
let ebaySearchResults = [];

// Sample yard data
const yards = [
    { id: 'wrench', name: 'Wrench-A-Part', location: 'Austin, TX', url: 'https://wrenchapart.com', selfServe: true },
    { id: 'roosevelt', name: 'Roosevelt U-Pull-It', location: 'San Antonio, TX', url: 'https://rooseveltupullit.com', selfServe: true },
    { id: 'auto-salvage', name: 'Auto Salvage Co.', location: 'North Side', url: 'https://xcrispygodx.github.io/BIGDONGPARTS/', selfServe: true },
    { id: 'metro', name: 'Metro Dismantling', location: 'Downtown', url: 'https://xcrispygodx.github.io/BIGDONGPARTS/', selfServe: true }
];

// Sample arrivals - focused on high-dollar easy-ship parts
const sampleArrivals = [
    {
        id: 1,
        yardId: 'wrench',
        yardName: 'Wrench-A-Part',
        yardUrl: 'https://wrenchapart.com',
        yardImage: 'https://via.placeholder.com/400x250/1a0b2e/ffd700?text=Wrench-A-Part',
        vehicle: '2019 Ford F-150 XLT',
        vin: '1FTEW1EP5KFA12345',
        date: '2025-08-25',
        yardFee: '$12.00',
        parts: [
            { name: 'Window Motor (Front Left)', partNumber: 'DS7Z-14529-B', easyShip: true, ebayPrice: 89.99, compatibleModels: ['2015-2023 F-150', '2017-2023 Super Duty'] },
            { name: 'Side View Mirror (Power)', partNumber: 'DS7Z-17683-AA', easyShip: true, ebayPrice: 65.00, compatibleModels: ['2015-2023 F-150', '2018-2023 Expedition'] },
            { name: 'Brake Control Module', partNumber: 'DS7Z-2C220-B', easyShip: true, ebayPrice: 245.00, compatibleModels: ['2015-2023 F-150', '2017-2023 Super Duty'] },
            { name: 'Dash Insert (Climate Control)', partNumber: 'DS7Z-15650-A', easyShip: true, ebayPrice: 120.00, compatibleModels: ['2018-2023 F-150'] }
        ]
    },
    {
        id: 2,
        yardId: 'roosevelt',
        yardName: 'Roosevelt U-Pull-It',
        yardUrl: 'https://rooseveltupullit.com',
        yardImage: 'https://via.placeholder.com/400x250/1a0b2e/ffd700?text=Roosevelt+U-Pull-It',
        vehicle: '2020 Chevrolet Silverado 1500',
        vin: '3GCPWCEF5LG123456',
        date: '2025-08-24',
        yardFee: '$15.00',
        parts: [
            { name: 'Transmission Control Module', partNumber: '24265798', easyShip: true, ebayPrice: 195.00, compatibleModels: ['2019-2023 Silverado', '2019-2023 Sierra 1500'] },
            { name: 'ECU Engine Control Unit', partNumber: '12638177', easyShip: true, ebayPrice: 320.00, compatibleModels: ['2019-2023 Silverado 5.3L', '2019-2023 Sierra 5.3L'] },
            { name: 'Headlight Switch', partNumber: '84176615', easyShip: true, ebayPrice: 45.00, compatibleModels: ['2019-2023 Silverado', '2019-2023 Sierra', '2021-2023 Tahoe'] },
            { name: 'Window Switch (Master)', partNumber: '84001-06150', easyShip: true, ebayPrice: 55.00, compatibleModels: ['2019-2023 Silverado', '2019-2023 Sierra'] }
        ]
    },
    {
        id: 3,
        yardId: 'auto-salvage',
        yardName: 'Auto Salvage Co.',
        yardUrl: 'https://xcrispygodx.github.io/BIGDONGPARTS/',
        yardImage: 'https://via.placeholder.com/400x250/1a0b2e/ffd700?text=AutoAlchemy+Yard',
        vehicle: '2018 Toyota Camry SE',
        vin: '4T1B11HK5JU123789',
        date: '2025-08-23',
        yardFee: '$10.00',
        parts: [
            { name: 'Window Switch (Master)', partNumber: '84001-06150', easyShip: true, ebayPrice: 55.00, compatibleModels: ['2018-2022 Camry', '2019-2022 Avalon'] },
            { name: 'Power Steering Control Module', partNumber: '89650-06120', easyShip: true, ebayPrice: 145.00, compatibleModels: ['2018-2022 Camry', '2019-2022 RAV4'] },
            { name: 'Radio / Head Unit', partNumber: '86160-06120', easyShip: true, ebayPrice: 85.00, compatibleModels: ['2018-2022 Camry SE/XSE'] },
            { name: 'Dash Indicator Cluster', partNumber: '83101-06120', easyShip: true, ebayPrice: 65.00, compatibleModels: ['2018-2022 Camry'] }
        ]
    },
    {
        id: 4,
        yardId: 'metro',
        yardName: 'Metro Dismantling',
        yardUrl: 'https://xcrispygodx.github.io/BIGDONGPARTS/',
        yardImage: 'https://via.placeholder.com/400x250/1a0b2e/ffd700?text=Metro+Dismantling',
        vehicle: '2021 Honda CR-V EX',
        vin: '2HKRW2H54MH123012',
        date: '2025-08-22',
        yardFee: '$12.00',
        parts: [
            { name: 'Side Mirror (Passenger)', partNumber: '76200-TR3-A01', easyShip: true, ebayPrice: 65.00, compatibleModels: ['2017-2021 CR-V', '2022-2024 CR-V'] },
            { name: 'Window Regulator (Rear Left)', partNumber: '72210-TR3-A01', easyShip: true, ebayPrice: 42.00, compatibleModels: ['2017-2021 CR-V', '2017-2021 Accord'] },
            { name: 'Sun Visor (Passenger)', partNumber: '83280-TR3-A01', easyShip: true, ebayPrice: 28.00, compatibleModels: ['2017-2021 CR-V'] },
            { name: 'ABS Control Module', partNumber: '57810-TR3-A01', easyShip: true, ebayPrice: 165.00, compatibleModels: ['2017-2021 CR-V', '2018-2021 Civic'] }
        ]
    }
];

// High compatibility parts data
const highCompatibilityParts = [
    {
        id: 1,
        name: 'Window Motor (Front Left)',
        partNumber: 'DS7Z-14529-B',
        compatibleModels: ['2015-2023 F-150', '2017-2023 Super Duty', '2018-2023 Expedition'],
        fitCount: 3,
        avgEbayPrice: 85,
        avgYardPrice: 35,
        profitMargin: 142,
        easyShip: true,
        category: 'electrical'
    },
    {
        id: 2,
        name: 'Side View Mirror (Power)',
        partNumber: 'DS7Z-17683-AA',
        compatibleModels: ['2015-2023 F-150', '2018-2023 Expedition', '2021-2023 Bronco'],
        fitCount: 3,
        avgEbayPrice: 65,
        avgYardPrice: 28,
        profitMargin: 132,
        easyShip: true,
        category: 'body'
    },
    {
        id: 3,
        name: 'Headlight Switch',
        partNumber: '84176615',
        compatibleModels: ['2019-2023 Silverado', '2019-2023 Sierra', '2021-2023 Tahoe', '2021-2023 Suburban'],
        fitCount: 4,
        avgEbayPrice: 45,
        avgYardPrice: 18,
        profitMargin: 150,
        easyShip: true,
        category: 'electrical'
    },
    {
        id: 4,
        name: 'Window Switch (Master)',
        partNumber: '84001-06150',
        compatibleModels: ['2018-2022 Camry', '2019-2022 Avalon', '2020-2022 Highlander'],
        fitCount: 3,
        avgEbayPrice: 55,
        avgYardPrice: 22,
        profitMargin: 150,
        easyShip: true,
        category: 'electrical'
    },
    {
        id: 5,
        name: 'ABS Control Module',
        partNumber: '57810-TR3-A01',
        compatibleModels: ['2017-2021 CR-V', '2018-2021 Civic', '2020-2021 Pilot'],
        fitCount: 3,
        avgEbayPrice: 165,
        avgYardPrice: 65,
        profitMargin: 154,
        easyShip: true,
        category: 'electrical'
    },
    {
        id: 6,
        name: 'Brake Control Module',
        partNumber: 'DS7Z-2C220-B',
        compatibleModels: ['2015-2023 F-150', '2017-2023 Super Duty'],
        fitCount: 2,
        avgEbayPrice: 165,
        avgYardPrice: 55,
        profitMargin: 200,
        easyShip: true,
        category: 'brakes'
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
    
    grid.innerHTML = arrivals.map(arrival => {
        const totalEbay = arrival.parts.reduce((sum, p) => sum + (p.ebayPrice || 0), 0);
        const yardFee = parseFloat(arrival.yardFee) || 12;
        const potentialProfit = totalEbay - yardFee;
        
        return `
        <div class="arrival-card arrival-card-large">
            <span class="arrival-badge">NEW</span>
            <div class="arrival-yard-header">
                <a href="${arrival.yardUrl}" target="_blank" class="arrival-yard-link">
                    <img src="${arrival.yardImage}" alt="${arrival.yardName}" class="arrival-yard-img" onerror="this.src='https://via.placeholder.com/400x200/1a0b2e/ffd700?text=${encodeURIComponent(arrival.yardName)}'">
                </a>
                <div class="arrival-yard-info">
                    <div class="arrival-yard">${arrival.yardName}</div>
                    <div class="arrival-vehicle">${arrival.vehicle}</div>
                    <div class="arrival-date">Arrived: ${formatDate(arrival.date)}</div>
                    <div class="arrival-yard-fee">Yard Fee: ${arrival.yardFee}</div>
                </div>
            </div>
            <ul class="arrival-parts">
                ${arrival.parts.map(part => `
                    <li>
                        <span class="arrival-part-name">${part.name}</span>
                        <span class="arrival-part-badge ${part.easyShip ? '' : 'freight'}">
                            ${part.easyShip ? '📦 Easy Ship' : '🚚 Freight'}
                        </span>
                        <span class="arrival-part-price">$${(part.ebayPrice || 0).toFixed(2)}</span>
                    </li>
                `).join('')}
            </ul>
            <div class="arrival-profit-bar">
                <div class="arrival-profit-label">Potential Profit</div>
                <div class="arrival-profit-value">$${potentialProfit.toFixed(2)}</div>
            </div>
            <div class="arrival-actions">
                <button class="btn btn-primary" onclick="viewArrivalDetails(${arrival.id})">View Details</button>
                <a href="${arrival.yardUrl}" target="_blank" class="btn btn-secondary">🏭 View on Yard</a>
                <button class="btn btn-secondary" onclick="createListingFromArrival(${arrival.id})">Create Listing</button>
            </div>
        </div>
        `;
    }).join('');
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
// Analytics & Charts
// ============================================

function initAnalytics() {
    initPricingTrendChart();
    initYardArrivalsChart();
    initProfitMarginsChart();
    initShippingTypeChart();
}

function initPricingTrendChart() {
    const ctx = document.getElementById('pricingTrendChart');
    if (!ctx) return;
    
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const windowMotorData = [75, 78, 82, 85];
    const brakeModuleData = [140, 155, 160, 165];
    const ecuData = [260, 270, 275, 280];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Window Motor',
                    data: windowMotorData,
                    borderColor: '#ff6b00',
                    backgroundColor: 'rgba(255, 107, 0, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Brake Module',
                    data: brakeModuleData,
                    borderColor: '#ffb700',
                    backgroundColor: 'rgba(255, 183, 0, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'ECU',
                    data: ecuData,
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#f0e6d2', font: { family: 'Inter' } }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#8a8a8a' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                x: {
                    ticks: { color: '#8a8a8a' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                }
            }
        }
    });
}

function initYardArrivalsChart() {
    const ctx = document.getElementById('yardArrivalsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Parts Arrived',
                data: [12, 19, 8, 15, 22, 18, 10],
                backgroundColor: 'rgba(255, 107, 0, 0.7)',
                borderColor: '#ff6b00',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#f0e6d2', font: { family: 'Inter' } }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#8a8a8a' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                x: {
                    ticks: { color: '#8a8a8a' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                }
            }
        }
    });
}

function initProfitMarginsChart() {
    const ctx = document.getElementById('profitMarginsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Electrical', 'Body', 'Brakes', 'Interior', 'Engine'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: [
                    'rgba(255, 107, 0, 0.8)',
                    'rgba(255, 183, 0, 0.8)',
                    'rgba(22, 163, 74, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: '#1a1a1a',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#f0e6d2', font: { family: 'Inter', size: 11 } }
                }
            }
        }
    });
}

function initShippingTypeChart() {
    const ctx = document.getElementById('shippingTypeChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Easy Ship', 'Freight'],
            datasets: [{
                data: [78, 22],
                backgroundColor: [
                    'rgba(22, 163, 74, 0.8)',
                    'rgba(255, 107, 0, 0.8)'
                ],
                borderColor: '#1a1a1a',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#f0e6d2', font: { family: 'Inter', size: 11 } }
                }
            }
        }
    });
}

// ============================================
// High Compatibility Section
// ============================================

function loadHighCompatibility(makeFilter = 'all') {
    const grid = document.getElementById('compatGrid');
    if (!grid) return;
    
    let parts = highCompatibilityParts;
    if (makeFilter !== 'all') {
        parts = parts.filter(p => p.compatibleModels.some(m => m.toLowerCase().includes(makeFilter)));
    }
    
    parts.sort((a, b) => b.fitCount - a.fitCount);
    
    grid.innerHTML = parts.map(part => `
        <div class="compat-card">
            <div class="compat-header">
                <div>
                    <div class="compat-part-name">${part.name}</div>
                    <div class="compat-models">${part.compatibleModels.slice(0, 3).join(' · ')}</div>
                </div>
                <span class="compat-fit-count">${part.fitCount} Models</span>
            </div>
            <div class="compat-pricing">
                <div class="compat-price-block">
                    <div class="compat-price-label">Avg eBay Price</div>
                    <div class="compat-price-value">$${part.avgEbayPrice}</div>
                </div>
                <div class="compat-price-block">
                    <div class="compat-price-label">Avg Yard Price</div>
                    <div class="compat-price-value">$${part.avgYardPrice}</div>
                </div>
                <div class="compat-price-block">
                    <div class="compat-price-label">Potential Profit</div>
                    <div class="compat-price-value profit">+${part.profitMargin}%</div>
                </div>
                <div class="compat-price-block">
                    <div class="compat-price-label">Shipping</div>
                    <div class="compat-price-value" style="font-size: 0.9rem;">
                        ${part.easyShip ? '📦 Easy' : '🚚 Freight'}
                    </div>
                </div>
            </div>
            <div class="compat-actions">
                <button class="btn btn-primary" onclick="showAddListingModal()">Create Listing</button>
                <button class="btn btn-secondary" onclick="searchEbayForPart('${part.name}')">Check eBay</button>
            </div>
        </div>
    `).join('');
}

function filterCompatibility() {
    const makeFilter = document.getElementById('compatMakeFilter').value;
    loadHighCompatibility(makeFilter);
}

function searchEbayForPart(partName) {
    document.getElementById('ebayPartSearch').value = partName;
    document.getElementById('ebay-search').scrollIntoView({ behavior: 'smooth' });
    searchEbayParts();
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

