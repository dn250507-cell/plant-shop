// ========================================
// PLANTS MANAGEMENT - FIREBASE VERSION
// ========================================

const PLANTS = {
    defaultPlants: [
        { id: 'plant_1', name: 'Cây Mai Vàng', description: 'Cây mai vàng giống tốt, hoa nở đẹp dịp Tết.', price: 500000, stock: 25, image: '', category: 'Cây cảnh' },
        { id: 'plant_2', name: 'Cây Đào Đỏ', description: 'Cây đào đỏ miền Bắc, hoa đẹp rực rỡ.', price: 450000, stock: 30, image: '', category: 'Cây cảnh' },
        { id: 'plant_3', name: 'Cây Bưởi Diễn', description: 'Giống bưởi Diễn chính gốc, quả ngọt.', price: 350000, stock: 40, image: '', category: 'Cây ăn quả' },
        { id: 'plant_4', name: 'Cây Cam Sành', description: 'Cây cam sành giống tốt, sai quả.', price: 280000, stock: 35, image: '', category: 'Cây ăn quả' },
        { id: 'plant_5', name: 'Cây Hoa Lan Hồ Điệp', description: 'Lan hồ điệp cao cấp, hoa to đẹp.', price: 650000, stock: 15, image: '', category: 'Hoa' },
        { id: 'plant_6', name: 'Cây Kim Tiền', description: 'Cây kim tiền phong thủy, mang lại may mắn.', price: 200000, stock: 50, image: '', category: 'Cây phong thủy' },
        { id: 'plant_7', name: 'Cây Phát Tài', description: 'Cây phát tài xanh mướt, ý nghĩa thịnh vượng.', price: 180000, stock: 45, image: '', category: 'Cây phong thủy' },
        { id: 'plant_8', name: 'Cây Xoài Cát Hòa Lộc', description: 'Giống xoài cát Hòa Lộc nổi tiếng.', price: 320000, stock: 28, image: '', category: 'Cây ăn quả' }
    ],

    async init() {
        try {
            const snapshot = await plantsRef.get();
            if (snapshot.empty) {
                for (const plant of this.defaultPlants) {
                    await plantsRef.doc(plant.id).set({ ...plant, createdAt: new Date().toISOString() });
                }
                console.log('Default plants created');
            }
        } catch (error) {
            console.error('Error initializing plants:', error);
        }
    },

    async getPlants() {
        try {
            const snapshot = await plantsRef.get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting plants:', error);
            return [];
        }
    },

    async getPlant(id) {
        try {
            const doc = await plantsRef.doc(id).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting plant:', error);
            return null;
        }
    },

    async addPlant(plant) {
        try {
            const id = 'plant_' + Date.now();
            const newPlant = {
                id, name: plant.name, description: plant.description || '',
                price: parseInt(plant.price) || 0, stock: parseInt(plant.stock) || 0,
                image: plant.image || '', category: plant.category || 'Khác',
                createdAt: new Date().toISOString()
            };
            await plantsRef.doc(id).set(newPlant);
            return newPlant;
        } catch (error) {
            console.error('Error adding plant:', error);
            return null;
        }
    },

    async updatePlant(id, data) {
        try {
            await plantsRef.doc(id).update({ ...data, updatedAt: new Date().toISOString() });
            return await this.getPlant(id);
        } catch (error) {
            console.error('Error updating plant:', error);
            return null;
        }
    },

    async deletePlant(id) {
        try {
            await plantsRef.doc(id).delete();
            return true;
        } catch (error) {
            console.error('Error deleting plant:', error);
            return false;
        }
    },

    async updateStock(id, quantity) {
        const plant = await this.getPlant(id);
        if (!plant || plant.stock < quantity) return false;
        return await this.updatePlant(id, { stock: plant.stock - quantity });
    },

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },

    async renderPlants(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<div class="text-center"><div class="spinner"></div><p>Đang tải...</p></div>';

        const plants = await this.getPlants();

        if (plants.length === 0) {
            container.innerHTML = '<div class="text-center text-muted" style="grid-column:1/-1;padding:4rem;"><div style="font-size:4rem;margin-bottom:1rem;">🌱</div><p>Chưa có cây giống</p></div>';
            return;
        }

        container.innerHTML = plants.map(plant => {
            const stockClass = plant.stock > 10 ? 'available' : plant.stock > 0 ? 'low' : '';
            const stockText = plant.stock > 0 ? `Còn ${plant.stock} cây` : 'Hết hàng';
            const imageContent = plant.image ? `<img src="${plant.image}" alt="${plant.name}">` : '🌿';

            return `
        <div class="product-card" data-id="${plant.id}" onclick="window.location.href='product-detail.html?id=${plant.id}'" style="cursor: pointer;">
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
              <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); buyNow('${plant.id}')" ${plant.stock === 0 ? 'disabled' : ''}>
                ${plant.stock > 0 ? 'Mua ngay' : 'Hết hàng'}
              </button>
            </div>
          </div>
        </div>

      `;
        }).join('');
    }
};

function buyNow(plantId) {
    sessionStorage.setItem('checkout_plant', plantId);
    window.location.href = 'checkout.html';
}

document.addEventListener('DOMContentLoaded', () => { PLANTS.init(); });
