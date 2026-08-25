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
        condition: "Used",
        shipping: "Ships within 24hrs",
        weight: 3.2
    },
    {
        id: 2,
        name: "Brake Module",
        category: "brakes",
        make: "Chevrolet",
        model: "Silverado",
        year: "2016-2021",
        price: 245.00,
        condition: "Refurbished",
        shipping: "Ships within 24hrs",
        weight: 5.8
    },
    {
        id: 3,
        name: "ECU Engine Control Unit",
        category: "electrical",
        make: "Toyota",
        model: "Camry",
        year: "2018-2022",
        price: 320.00,
        condition: "Used",
        shipping: "Freight Only",
        weight: 2.1
    },
    {
        id: 4,
        name: "Side View Mirror",
        category: "body",
        make: "Honda",
        model: "Civic",
        year: "2019-2023",
        price: 65.00,
        condition: "Used",
        shipping: "Ships within 24hrs",
        weight: 1.5
    },
    {
        id: 5,
        name: "Sun Visor",
        category: "interior",
        make: "Nissan",
        model: "Altima",
        year: "2016-2020",
        price: 45.00,
        condition: "Used",
        shipping: "Ships within 24hrs",
        weight: 0.8
    },
    {
        id: 6,
        name: "Transmission Module",
        category: "transmission",
        make: "Jeep",
        model: "Grand Cherokee",
        year: "2017-2022",
        price: 185.00,
        condition: "Refurbished",
        shipping: "Ships within 24hrs",
        weight: 4.2
    }
];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedParts();
    initSearchTabs();
});

// Load featured parts
function loadFeaturedParts() {
    const grid = document.getElementById('featuredParts');
    if (!grid) return;
    
    grid.innerHTML = sampleParts.map(part => `
        <div class="part-card">
            <div class="part-card-header">
                <div>
                    <div class="part-card-title">${part.name}</div>
                    <div class="part-card-vehicle">${part.year} ${part.make} ${part.model}</div>
                </div>
                <span class="part-card-condition">${part.condition}</span>
            </div>
            <div class="part-card-price">$${part.price.toFixed(2)}</div>
            <div class="part-card-meta">
                <span class="part-card-shipping">${part.shipping === 'Freight Only' ? '🚚' : '📦'} ${part.shipping}</span>
                <span>${part.weight} lbs</span>
            </div>
        </div>
    `).join('');
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
