// Outcast Auto Parts - Main Application Logic

// Sample data for demonstration
const sampleParts = [
    {
        id: 1,
        name: "Window Motor",
        category: "electrical",
        make: "Ford",
        model: "F-150",
        year: "2015-2020",
        price: 89.99,
        retailPrice: 349.99,
        condition: "Used",
        shipping: "Ships within 24hrs",
        weight: 3.2,
        shippingType: "easy",
        localDelivery: true
    },
    {
        id: 2,
        name: "Brake Module",
        category: "brakes",
        make: "Chevrolet",
        model: "Silverado",
        year: "2016-2021",
        price: 245.00,
        retailPrice: 899.99,
        condition: "Refurbished",
        shipping: "Freight Only",
        weight: 5.8,
        shippingType: "freight",
        localDelivery: false
    },
    {
        id: 3,
        name: "ECU Engine Control Unit",
        category: "electrical",
        make: "Toyota",
        model: "Camry",
        year: "2018-2022",
        price: 320.00,
        retailPrice: 1299.99,
        condition: "Used",
        shipping: "Freight Only",
        weight: 2.1,
        shippingType: "freight",
        localDelivery: false
    },
    {
        id: 4,
        name: "Side View Mirror",
        category: "body",
        make: "Honda",
        model: "Civic",
        year: "2019-2023",
        price: 65.00,
        retailPrice: 279.99,
        condition: "Used",
        shipping: "Ships within 24hrs",
        weight: 1.5,
        shippingType: "easy",
        localDelivery: true
    },
    {
        id: 5,
        name: "Sun Visor",
        category: "interior",
        make: "Nissan",
        model: "Altima",
        year: "2016-2020",
        price: 45.00,
        retailPrice: 189.99,
        condition: "Used",
        shipping: "Ships within 24hrs",
        weight: 0.8,
        shippingType: "easy",
        localDelivery: true
    },
    {
        id: 6,
        name: "Transmission Module",
        category: "transmission",
        make: "Jeep",
        model: "Grand Cherokee",
        year: "2017-2022",
        price: 185.00,
        retailPrice: 749.99,
        condition: "Refurbished",
        shipping: "Ships within 24hrs",
        weight: 4.2,
        shippingType: "easy",
        localDelivery: true
    }
];

// Cart functions exposed globally
function addToCart(partId) {
    const part = sampleParts.find(p => p.id === partId);
    if (!part) return;
    
    const item = {
        id: part.id.toString(),
        name: part.name,
        vehicle: `${part.year} ${part.make} ${part.model}`,
        price: part.price,
        retailPrice: part.retailPrice,
        quantity: 1,
        shippingType: part.shippingType,
        localDelivery: part.localDelivery
    };
    
    Cart.add(item);
}

// Cart functions exposed globally

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedParts();
    initSearchTabs();
    Cart.updateBadge();
});

// Update cart badge when storage changes
window.addEventListener('storage', () => Cart.updateBadge());

// Load featured parts
function loadFeaturedParts() {
    const grid = document.getElementById('featuredParts');
    if (!grid) return;
    
    grid.innerHTML = sampleParts.map(part => {
        const savings = part.retailPrice - part.price;
        const savingsPercent = Math.round((savings / part.retailPrice) * 100);
        
        return `
        <div class="part-card">
            <div class="part-card-header">
                <div>
                    <div class="part-card-title">${part.name}</div>
                    <div class="part-card-vehicle">${part.year} ${part.make} ${part.model}</div>
                </div>
                <span class="part-card-condition">${part.condition}</span>
            </div>
            <div class="part-card-price">$${part.price.toFixed(2)}</div>
            <div class="part-card-retail">Retail: $${part.retailPrice.toFixed(2)}</div>
            <div class="part-card-savings">Save ${savingsPercent}%</div>
            <div class="part-card-meta">
                <span class="part-card-shipping">${part.shipping === 'Freight Only' ? '🚚' : '📦'} ${part.shipping}</span>
                <span>${part.weight} lbs</span>
            </div>
            ${part.localDelivery ? '<span class="part-card-local-badge">🚚 Local Delivery Available</span>' : ''}
            <button class="btn btn-primary order-direct-btn" onclick="addToCart(${part.id})">
                Order Direct - $${part.price.toFixed(2)}
            </button>
        </div>
    `;
    }).join('');
}

// Search functionality
function initSearchTabs() {
    const tabs = document.querySelectorAll('.search-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabName = tab.textContent.toLowerCase();
            const vehicleFields = document.getElementById('vehicleSearchFields');
            const partFields = document.getElementById('searchPartGroup');
            
            if (tabName.includes('vehicle')) {
                vehicleFields.style.display = 'flex';
                partFields.style.display = 'none';
            } else if (tabName.includes('part')) {
                vehicleFields.style.display = 'none';
                partFields.style.display = 'flex';
            } else {
                vehicleFields.style.display = 'none';
                partFields.style.display = 'none';
            }
        });
    });
}

function switchTab(tabName, element) {
    // Handled by event listener
}

function handleSearch(event) {
    event.preventDefault();
    const searchTerm = document.getElementById('searchPart')?.value || 
                       document.getElementById('searchMake')?.value || '';
    
    if (searchTerm) {
        alert(`Searching for: ${searchTerm}\n\nThis would search the inventory database.`);
    }
}

// Category filtering
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', (e) => {
        e.preventDefault();
        const category = card.dataset.category;
        alert(`Browsing ${category} parts.\n\nThis would filter the marketplace by category.`);
    });
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
