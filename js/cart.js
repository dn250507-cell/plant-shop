// ========================================
// CART & ORDERS MODULE
// ========================================

const ORDERS = {
    STORAGE_KEY: 'plant_shop_orders',

    getOrders() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    getOrdersByUser(userId) {
        return this.getOrders().filter(o => o.userId === userId);
    },

    createOrder(orderData) {
        const orders = this.getOrders();
        const plant = PLANTS.getPlant(orderData.plantId);

        if (!plant) return { success: false, message: 'Không tìm thấy sản phẩm' };
        if (plant.stock < orderData.quantity) return { success: false, message: 'Số lượng trong kho không đủ' };
        if (!orderData.address || !orderData.phone) return { success: false, message: 'Vui lòng điền đầy đủ thông tin' };
        if (orderData.phone.length < 10) return { success: false, message: 'Số điện thoại không hợp lệ' };

        const user = AUTH.getCurrentUser();
        const newOrder = {
            id: 'order_' + Date.now(),
            userId: user ? user.id : 'guest',
            userName: user ? user.username : 'Khách',
            plantId: plant.id,
            plantName: plant.name,
            plantImage: plant.image,
            price: plant.price,
            quantity: orderData.quantity,
            total: plant.price * orderData.quantity,
            address: orderData.address,
            phone: orderData.phone,
            note: orderData.note || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        PLANTS.updateStock(plant.id, orderData.quantity);
        orders.push(newOrder);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));

        return { success: true, message: 'Đặt hàng thành công!', order: newOrder };
    },

    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index === -1) return null;

        orders[index].status = status;
        orders[index].updatedAt = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
        return orders[index];
    },

    deleteOrder(orderId) {
        let orders = this.getOrders();
        orders = orders.filter(o => o.id !== orderId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
        return true;
    },

    getStats() {
        const orders = this.getOrders();
        const plants = PLANTS.getPlants();
        const users = AUTH.getUsers();

        return {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            completedOrders: orders.filter(o => o.status === 'completed').length,
            totalProducts: plants.length,
            totalCustomers: users.filter(u => u.role !== 'admin').length
        };
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    },

    getStatusLabel(status) {
        const labels = { pending: 'Chờ xử lý', processing: 'Đang xử lý', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
        return labels[status] || status;
    }
};

function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = { success: '✓', error: '✕', warning: '⚠' };
    const toast = document.createElement('div');
    toast.className = `toast alert-${type}`;
    toast.innerHTML = `<span>${icons[type] || '●'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
