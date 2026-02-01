// ========================================
// ORDERS MODULE - FIREBASE VERSION
// ========================================

const ORDERS = {
    async getOrders() {
        try {
            const snapshot = await ordersRef.orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting orders:', error);
            return [];
        }
    },

    async getOrdersByUser(userId) {
        try {
            const snapshot = await ordersRef.where('userId', '==', userId).get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting user orders:', error);
            return [];
        }
    },

    async createOrder(orderData) {
        const plant = await PLANTS.getPlant(orderData.plantId);

        if (!plant) return { success: false, message: 'Không tìm thấy sản phẩm' };
        if (plant.stock < orderData.quantity) return { success: false, message: 'Số lượng trong kho không đủ' };
        if (!orderData.address || !orderData.phone) return { success: false, message: 'Vui lòng điền đầy đủ thông tin' };
        if (orderData.phone.length < 10) return { success: false, message: 'Số điện thoại không hợp lệ' };

        try {
            const user = AUTH.getCurrentUser();
            const orderId = 'order_' + Date.now();

            const newOrder = {
                id: orderId,
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

            await PLANTS.updateStock(plant.id, orderData.quantity);
            await ordersRef.doc(orderId).set(newOrder);

            return { success: true, message: 'Đặt hàng thành công!', order: newOrder };
        } catch (error) {
            console.error('Error creating order:', error);
            return { success: false, message: 'Lỗi hệ thống, vui lòng thử lại' };
        }
    },

    async updateOrderStatus(orderId, status) {
        try {
            await ordersRef.doc(orderId).update({ status, updatedAt: new Date().toISOString() });
            return true;
        } catch (error) {
            console.error('Error updating order:', error);
            return false;
        }
    },

    async getStats() {
        const orders = await this.getOrders();
        const plants = await PLANTS.getPlants();
        const users = await AUTH.getUsers();

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
