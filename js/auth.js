// ========================================
// AUTHENTICATION MODULE - FIREBASE VERSION
// ========================================

const AUTH = {
    CURRENT_USER_KEY: 'plant_shop_current_user',

    // Initialize with default admin
    async init() {
        try {
            const adminDoc = await usersRef.doc('admin').get();
            if (!adminDoc.exists) {
                await usersRef.doc('admin').set({
                    id: 'admin',
                    username: 'admin',
                    password: 'admin123',
                    phone: '0000000000',
                    role: 'admin',
                    createdAt: new Date().toISOString()
                });
                console.log('Admin account created');
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
        }
        this.updateHeaderUI();
    },

    // Get all users
    async getUsers() {
        try {
            const snapshot = await usersRef.get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    },

    // Register new user
    async register(phone, username, password) {
        if (!phone || !username || !password) {
            return { success: false, message: 'Vui lòng điền đầy đủ thông tin' };
        }
        if (phone.length < 10) {
            return { success: false, message: 'Số điện thoại không hợp lệ' };
        }
        if (username.length < 3) {
            return { success: false, message: 'Tên tài khoản phải có ít nhất 3 ký tự' };
        }
        if (password.length < 6) {
            return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
        }

        try {
            // Check if username exists
            const usernameCheck = await usersRef.where('username', '==', username).get();
            if (!usernameCheck.empty) {
                return { success: false, message: 'Tên tài khoản đã tồn tại' };
            }

            // Check if phone exists
            const phoneCheck = await usersRef.where('phone', '==', phone).get();
            if (!phoneCheck.empty) {
                return { success: false, message: 'Số điện thoại đã được sử dụng' };
            }

            const userId = 'user_' + Date.now();
            const newUser = {
                id: userId,
                username,
                password,
                phone,
                role: 'customer',
                createdAt: new Date().toISOString()
            };

            await usersRef.doc(userId).set(newUser);
            return { success: true, message: 'Đăng ký thành công!', user: newUser };
        } catch (error) {
            console.error('Error registering:', error);
            return { success: false, message: 'Lỗi hệ thống, vui lòng thử lại' };
        }
    },

    // Login user
    async login(username, password) {
        try {
            const snapshot = await usersRef.where('username', '==', username).get();

            if (snapshot.empty) {
                return { success: false, message: 'Tên tài khoản hoặc mật khẩu không đúng' };
            }

            const user = snapshot.docs[0].data();
            if (user.password !== password) {
                return { success: false, message: 'Tên tài khoản hoặc mật khẩu không đúng' };
            }

            const session = {
                id: user.id,
                username: user.username,
                phone: user.phone,
                role: user.role
            };
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(session));

            return { success: true, message: 'Đăng nhập thành công!', user: session };
        } catch (error) {
            console.error('Error logging in:', error);
            return { success: false, message: 'Lỗi hệ thống, vui lòng thử lại' };
        }
    },

    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        window.location.href = 'index.html';
    },

    getCurrentUser() {
        const data = localStorage.getItem(this.CURRENT_USER_KEY);
        return data ? JSON.parse(data) : null;
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    requireAdmin() {
        if (!this.isAdmin()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    updateHeaderUI() {
        const user = this.getCurrentUser();
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');

        if (!authButtons || !userInfo) return;

        if (user) {
            authButtons.classList.add('hidden');
            userInfo.classList.remove('hidden');

            const userNameEl = document.getElementById('userName');
            const userInitialEl = document.getElementById('userInitial');

            if (userNameEl) userNameEl.textContent = user.username;
            if (userInitialEl) userInitialEl.textContent = user.username[0].toUpperCase();

            const adminLink = document.getElementById('adminLink');
            if (adminLink) {
                adminLink.classList.toggle('hidden', user.role !== 'admin');
            }
        } else {
            authButtons.classList.remove('hidden');
            userInfo.classList.add('hidden');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AUTH.init();
});
