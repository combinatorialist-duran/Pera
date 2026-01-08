// Menu loading and filtering functionality
class MenuManager {
    constructor() {
        this.products = [];
        this.currentCategory = 'all';
        this.currentLang = 'tr';
        this.menuContainer = null;
        this.filterButtons = null;
    }

    async init() {
        this.menuContainer = document.getElementById('menu-items');
        this.filterButtons = document.querySelectorAll('.menu-filter-btn');
        
        await this.loadProducts();
        this.setupFilters();
        this.renderMenu();
    }

    async loadProducts() {
        try {
            const response = await fetch('db_json/product.json');
            const data = await response.json();
            this.products = data.products;
        } catch (error) {
            console.error('Error loading products:', error);
            this.products = [];
        }
    }

    setupFilters() {
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                this.filterButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                // Update current category and render
                this.currentCategory = e.target.dataset.category;
                this.renderMenu();
            });
        });
    }

    setLanguage(lang) {
        this.currentLang = lang;
        this.renderMenu();
    }

    getCategoryKey(category) {
        const categoryMap = {
            'Kahvaltı': 'breakfast',
            'Breakfast': 'breakfast',
            'Tatlılar': 'desserts',
            'Desserts': 'desserts',
            'Sıcak İçecekler': 'hot',
            'Hot Drinks': 'hot',
            'Soğuk İçecekler': 'cold',
            'Cold Drinks': 'cold',
            'Aperatifler': 'appetizers',
            'Appetizers': 'appetizers'
        };
        return categoryMap[category] || 'all';
    }

    getCategoryOrder(category) {
        const categoryOrderMap = {
            'Kahvaltı': 1,
            'Breakfast': 1,
            'Aperatifler': 2,
            'Appetizers': 2,
            'Tatlılar': 3,
            'Desserts': 3,
            'Sıcak İçecekler': 4,
            'Hot Drinks': 4,
            'Soğuk İçecekler': 5,
            'Cold Drinks': 5
        };
        return categoryOrderMap[category] || 999;
    }

    createProductCard(product) {
        const name = this.currentLang === 'tr' ? product.name : product.name_en;
        const description = this.currentLang === 'tr' ? product.description : product.description_en;
        
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `
            <div class="menu-card-image">
                <img src="${product.image_path}" alt="${name}" loading="lazy">
            </div>
            <div class="menu-card-content">
                <h3 class="menu-card-title">${name}</h3>
                <p class="menu-card-description">${description}</p>
                <div class="menu-card-price">
                    <span class="price">${product.price} ₺</span>
                </div>
            </div>
        `;
        
        return card;
    }

    filterProducts() { 
        if (this.currentCategory === 'all') {
            // Tüm ürünleri kategori sırasına göre sırala
            return [...this.products].sort((a, b) => {
                const categoryA = this.currentLang === 'tr' ? a.category : a.category_en;
                const categoryB = this.currentLang === 'tr' ? b.category : b.category_en;
                const orderA = this.getCategoryOrder(categoryA);
                const orderB = this.getCategoryOrder(categoryB);
                return orderA - orderB;
            });
        }
        
        return this.products.filter(product => {
            const productCategory = this.currentLang === 'tr' ? product.category : product.category_en;
            const categoryKey = this.getCategoryKey(productCategory);
            return categoryKey === this.currentCategory;
        });
    }

    renderMenu() {
        if (!this.menuContainer) return;
        
        const filteredProducts = this.filterProducts();
        this.menuContainer.innerHTML = '';
        
        filteredProducts.forEach((product, index) => {
            const card = this.createProductCard(product);
            card.style.animationDelay = `${index * 0.1}s`;
            this.menuContainer.appendChild(card);
        });
    }
}

// Initialize menu manager
const menuManager = new MenuManager();

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuManager;
}

