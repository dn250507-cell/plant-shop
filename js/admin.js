// ========================================
// ADMIN PANEL - FIREBASE VERSION
// ========================================

const ADMIN = {
    currentTab: 'dashboard',
    editingPlant: null,

    init() {
        if (!AUTH.requireAdmin()) return;
        this.setupEventListeners();
        this.renderDashboard();

        // Init Flatpickr
        const input = document.getElementById('orderDateFilter');
        if (input) {
            this.datePicker = flatpickr(input, {
                locale: 'vn',
                dateFormat: 'Y-m-d',
                maxDate: 'today',
                disableMobile: 'true', // Force custom picker on mobile
                onChange: () => this.renderOrders()
            });
        }
    },

    setupEventListeners() {
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    },

    setDateFilter(type) {
        if (!this.datePicker) return;

        if (type === 'today') {
            this.datePicker.setDate(new Date(), true);
        } else if (type === 'all') {
            this.datePicker.clear();
            this.renderOrders();
        }
    },

    switchTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.add('admin-panel-hidden'));
        document.getElementById(`panel-${tabName}`).classList.remove('admin-panel-hidden');

        if (tabName === 'dashboard') this.renderDashboard();
        else if (tabName === 'products') this.renderProducts();
        else if (tabName === 'orders') this.renderOrders();
        else if (tabName === 'customers') this.renderCustomers();
    },

    async renderDashboard() {
        const stats = await ORDERS.getStats();
        document.getElementById('statOrders').textContent = stats.totalOrders;
        document.getElementById('statRevenue').textContent = PLANTS.formatPrice(stats.totalRevenue);
        document.getElementById('statProducts').textContent = stats.totalProducts;
        document.getElementById('statCustomers').textContent = stats.totalCustomers;
    },

    async renderProducts() {
        const plants = await PLANTS.getPlants();
        const tbody = document.getElementById('productsTableBody');

        tbody.innerHTML = plants.map(p => `
      <tr>
        <td>${p.image ? `<img src="${p.image}" class="data-table-image">` : '🌿'}</td>
        <td><strong>${p.name}</strong><br><small class="text-muted">${p.category}</small></td>
        <td>${PLANTS.formatPrice(p.price)}</td>
        <td><span class="${p.stock < 10 ? 'text-error' : 'text-success'}">${p.stock}</span></td>
        <td class="actions-cell">
          <button class="btn btn-secondary btn-sm" onclick="ADMIN.editPlant('${p.id}')">✏️ Sửa</button>
          <button class="btn btn-secondary btn-sm" onclick="ADMIN.deletePlant('${p.id}')">🗑️ Xóa</button>
        </td>
      </tr>
    `).join('');
    },

    async renderOrders() {
        let orders = await ORDERS.getOrders();
        const dateFilter = document.getElementById('orderDateFilter').value;

        if (dateFilter) {
            orders = orders.filter(o => o.createdAt.startsWith(dateFilter));
        }

        const tbody = document.getElementById('ordersTableBody');

        tbody.innerHTML = orders.length ? orders.map(o => `
      <tr>
        <td><small>${o.id}</small></td>
        <td><strong>${o.userName}</strong><br><small>${o.phone}</small><br><small class="text-muted">${o.address}</small></td>
        <td>${o.plantName}<br><small>x${o.quantity}</small></td>
        <td>${PLANTS.formatPrice(o.total)}</td>
        <td><span class="status-badge status-${o.status}">${ORDERS.getStatusLabel(o.status)}</span></td>
        <td><small>${ORDERS.formatDate(o.createdAt)}</small></td>
        <td class="actions-cell">
          <select onchange="ADMIN.updateOrderStatus('${o.id}', this.value)" class="form-input" style="padding:0.5rem; width: auto; display: inline-block;">
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
            <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Đang xử lý</option>
            <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
          </select>
          <button class="btn btn-secondary btn-sm" style="color:red; border-color:red; margin-left: 0.5rem;" onclick="ADMIN.deleteOrder('${o.id}')">✕</button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="7" class="text-center text-muted">Chưa có đơn hàng</td></tr>';
    },

    async deleteOrder(id) {
        if (confirm('CẢNH BÁO: Bạn có chắc muốn xóa vĩnh viễn đơn hàng này? Hành động này không thể hoàn tác!')) {
            const result = await ORDERS.deleteOrder(id);
            if (result.success) {
                showToast('Đã xóa đơn hàng');
                this.renderOrders();
                this.renderDashboard(); // Update stats
            } else {
                showToast(result.message, 'error');
            }
        }
    },

    async renderCustomers() {
        const users = (await AUTH.getUsers()).filter(u => u.role !== 'admin');
        const tbody = document.getElementById('customersTableBody');

        const rows = await Promise.all(users.map(async u => {
            const orders = await ORDERS.getOrdersByUser(u.id);
            return `
        <tr>
          <td><strong>${u.username}</strong></td>
          <td>${u.phone}</td>
          <td>${orders.length} đơn</td>
          <td><small>${ORDERS.formatDate(u.createdAt)}</small></td>
        </tr>
      `;
        }));

        tbody.innerHTML = rows.length ? rows.join('') : '<tr><td colspan="4" class="text-center text-muted">Chưa có khách hàng</td></tr>';
    },

    openAddModal() {
        this.editingPlant = null;
        document.getElementById('modalTitle').textContent = 'Thêm Cây Mới';
        document.getElementById('plantForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('plantModal').classList.add('active');
    },

    async editPlant(id) {
        const plant = await PLANTS.getPlant(id);
        if (!plant) return;

        this.editingPlant = id;
        document.getElementById('modalTitle').textContent = 'Sửa Thông Tin Cây';
        document.getElementById('plantName').value = plant.name;
        document.getElementById('plantDescription').value = plant.description;
        document.getElementById('plantPrice').value = plant.price;
        document.getElementById('plantStock').value = plant.stock;
        document.getElementById('plantCategory').value = plant.category;
        document.getElementById('imagePreview').innerHTML = plant.image ? `<img src="${plant.image}" class="image-preview">` : '';
        document.getElementById('plantModal').classList.add('active');
    },

    closeModal() {
        document.getElementById('plantModal').classList.remove('active');
        this.editingPlant = null;
    },

    async savePlant() {
        const data = {
            name: document.getElementById('plantName').value,
            description: document.getElementById('plantDescription').value,
            price: parseInt(document.getElementById('plantPrice').value) || 0,
            stock: parseInt(document.getElementById('plantStock').value) || 0,
            category: document.getElementById('plantCategory').value,
            image: document.getElementById('imagePreview').querySelector('img')?.src || ''
        };

        if (!data.name) { showToast('Vui lòng nhập tên cây', 'error'); return; }
        if (data.price <= 0) { showToast('Giá tiền phải lớn hơn 0', 'error'); return; }

        if (this.editingPlant) {
            await PLANTS.updatePlant(this.editingPlant, data);
            showToast('Cập nhật thành công!');
        } else {
            await PLANTS.addPlant(data);
            showToast('Thêm cây mới thành công!');
        }

        this.closeModal();
        this.renderProducts();
    },

    async deletePlant(id) {
        if (confirm('Bạn có chắc muốn xóa cây này?')) {
            await PLANTS.deletePlant(id);
            showToast('Đã xóa cây');
            this.renderProducts();
        }
    },

    async updateOrderStatus(orderId, status) {
        await ORDERS.updateOrderStatus(orderId, status);
        showToast('Cập nhật trạng thái thành công!');
    },

    handleImageUpload(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}" class="image-preview">`;
        };
        reader.readAsDataURL(file);
    }
};

document.addEventListener('DOMContentLoaded', () => ADMIN.init());
