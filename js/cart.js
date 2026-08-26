// Outcast Auto Parts - Cart Management

const Cart = {
    get() {
        try {
            return JSON.parse(localStorage.getItem('outcast_cart') || '[]');
        } catch (e) {
            return [];
        }
    },

    save(items) {
        localStorage.setItem('outcast_cart', JSON.stringify(items));
    },

    add(item) {
        const cart = this.get();
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        this.save(cart);
        this.updateBadge();
    },

    remove(itemId) {
        const cart = this.get().filter(i => i.id !== itemId);
        this.save(cart);
        this.updateBadge();
    },

    updateQuantity(itemId, delta) {
        const cart = this.get();
        const item = cart.find(i => i.id === itemId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.remove(itemId);
                return;
            }
        }
        this.save(cart);
        this.updateBadge();
    },

    clear() {
        this.save([]);
        this.updateBadge();
    },

    getCount() {
        return this.get().reduce((sum, item) => sum + item.quantity, 0);
    },

    updateBadge() {
        const count = this.getCount();
        const badge = document.getElementById('cartCount');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }
};
