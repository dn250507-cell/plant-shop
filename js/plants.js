// ========================================
// PLANTS MANAGEMENT MODULE
// ========================================

const PLANTS = {
    STORAGE_KEY: 'plant_shop_plants',

    // Default sample plants
    defaultPlants: [
        {
            id: 'plant_1',
            name: 'Cây Mai Vàng',
            description: 'Cây mai vàng giống tốt, hoa nở đẹp dịp Tết. Cây khỏe mạnh, dễ chăm sóc.',
            price: 500000,
            stock: 25,
            image: '',
            category: 'Cây cảnh',
            createdAt: new Date().toISOString()
        },
        {
            id: 'plant_2',
            name: 'Cây Đào Đỏ',
            description: 'Cây đào đỏ miền Bắc, hoa đẹp rực rỡ. Phù hợp trang trí Tết.',
            price: 450000,
            stock: 30,
            image: '',
            category: 'Cây cảnh',
            createdAt: new Date().toISOString()
        },
        {
            id: 'plant_3',
            name: 'Cây Bưởi Diễn',
            description: 'Giống bưởi Diễn chính gốc, quả ngọt, mọng nước. Cây 2 năm tuổi.',
            price: 350000,
            stock: 40,
            image: '',
            category: 'Cây ăn quả',
            createdAt: new Date().toISOString()
        },
        {
            id: 'plant_4',
            name: 'Cây Cam Sành',
            description: 'Cây cam sành giống tốt, sai quả, vị ngọt đậm đà.',
            price: 280000,
            stock: 35,
            image: '',
            category: 'Cây ăn quả',
            createdAt: new Date().toISOString()
        },
        {
            id: 'plant_5',
            name: 'Cây Hoa Lan Hồ Điệp',
            description: 'Lan hồ điệp cao cấp, hoa to đẹp, màu sắc rực rỡ.',
            price: 650000,
            stock: 15,
            image: '',
            category: 'Hoa',
            createdAt: new Date().toISOString()
        },
        {
            id: 'plant_6',
            name: 'Cây Kim Tiền',
            description: 'Cây kim tiền phong thủy, mang lại may mắn tài lộc.',
            price: 200000,
            stock: 50,
            image: '',
            category: 'Cây phong thủy',
            createdAt: new Date().toISOString()
        },
        {
            id: 'plant_7',
            name: 'Cây Phát Tài',
            description: 'Cây phát tài xanh mướt, ý nghĩa thịnh vượng, phù hợp văn phòng.',
            price: 180000,
            stock: 45,
            image: '',
            category: 'Cây phong thủy',
            createdAt: new Date().toISOString()
        },
        {
            id: 'plant_8',
            name: 'Cây Xoài Cát Hòa Lộc',
            description: 'Giống xoài cát Hòa Lộc nổi tiếng, quả to, thơm ngon.',
            price: 320000,
            stock: 28,
            image: '',
            category: 'Cây ăn quả',
            createdAt: new Date().toISOString()
        }
    ],

    // Initialize plants data
    init() {
        const plants = this.getPlants();
        if (plants.length === 0) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.defaultPlants));
        }
    },

    // Get all plants
    getPlants() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Get single plant by ID
    getPlant(id) {
        const plants = this.getPlants();
        return plants.find(p => p.id === id);
    },

    // Add new plant
    addPlant(plant) {
        const plants = this.getPlants();
        const newPlant = {
            id: 'plant_' + Date.now(),
            name: plant.name,
            description: plant.description || '',
            price: parseInt(plant.price) || 0,
            stock: parseInt(plant.stock) || 0,
            image: plant.image || '',
            category: plant.category || 'Khác',
            createdAt: new Date().toISOString()
        };

        plants.push(newPlant);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plants));

        return newPlant;
    },

    // Update plant
    updatePlant(id, data) {
        const plants = this.getPlants();
        const index = plants.findIndex(p => p.id === id);

        if (index === -1) return null;

        plants[index] = {
            ...plants[index],
            ...data,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plants));
        return plants[index];
    },

    // Delete plant
    deletePlant(id) {
        let plants = this.getPlants();
        plants = plants.filter(p => p.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plants));
        return true;
    },

    // Update stock
    updateStock(id, quantity) {
        const plant = this.getPlant(id);
        if (!plant) return false;

        const newStock = plant.stock - quantity;
        if (newStock < 0) return false;

        return this.updatePlant(id, { stock: newStock });
    },

    // Format price in VND
    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    },

    // Render plants grid
    renderPlants(containerId, filter = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let plants = this.getPlants();

        // Apply filter if provided
        if (filter) {
            if (filter.category) {
                plants = plants.filter(p => p.category === filter.category);
            }
            if (filter.search) {
                const search = filter.search.toLowerCase();
                plants = plants.filter(p =>
                    p.name.toLowerCase().includes(search) ||
                    p.description.toLowerCase().includes(search)
                );
            }
        }

        if (plants.length === 0) {
            container.innerHTML = `
        <div class="text-center text-muted" style="grid-column: 1/-1; padding: 4rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🌱</div>
          <p>Chưa có cây giống nào</p>
        </div>
      `;
            return;
        }

        container.innerHTML = plants.map(plant => this.renderPlantCard(plant)).join('');
    },

    // Render single plant card
    renderPlantCard(plant) {
        const stockClass = plant.stock > 10 ? 'available' : plant.stock > 0 ? 'low' : '';
        const stockText = plant.stock > 0 ? `Còn ${plant.stock} cây` : 'Hết hàng';
        const imageContent = plant.image
            ? `<img src="${plant.image}" alt="${plant.name}">`
            : '🌿';

        return `
      <div class="product-card" data-id="${plant.id}">
        ${plant.stock < 10 && plant.stock > 0 ? '<span class="product-badge">Sắp hết</span>' : ''}
        <div class="product-image">${imageContent}</div>
        <div class="product-info">
          <h3 class="product-name">${plant.name}</h3>
          <p class="product-description">${plant.description}</p>
          <div class="product-footer">
            <div>
              <div class="product-price">${this.formatPrice(plant.price)}</div>
              <div class="product-stock ${stockClass}">${stockText}</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="buyNow('${plant.id}')" ${plant.stock === 0 ? 'disabled' : ''}>
              ${plant.stock > 0 ? 'Mua ngay' : 'Hết hàng'}
            </button>
          </div>
        </div>
      </div>
    `;
    },

    // Get categories
    getCategories() {
        const plants = this.getPlants();
        const categories = [...new Set(plants.map(p => p.category))];
        return categories;
    }
};

// Buy now function - redirect to checkout
function buyNow(plantId) {
    // Store selected plant in session
    sessionStorage.setItem('checkout_plant', plantId);
    window.location.href = 'checkout.html';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    PLANTS.init();
});
