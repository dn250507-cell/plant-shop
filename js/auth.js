// ========================================
// AUTHENTICATION MODULE
// ========================================

const AUTH = {
  USERS_KEY: 'plant_shop_users',
  CURRENT_USER_KEY: 'plant_shop_current_user',
  
  // Initialize with default admin
  init() {
    const users = this.getUsers();
    if (!users.find(u => u.username === 'admin')) {
      users.push({
        id: 'admin',
        username: 'admin',
        password: 'admin123',
        phone: '0000000000',
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  },
  
  // Get all users
  getUsers() {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  // Register new user
  register(phone, username, password) {
    const users = this.getUsers();
    
    // Validate
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
    
    // Check if username exists
    if (users.find(u => u.username === username)) {
      return { success: false, message: 'Tên tài khoản đã tồn tại' };
    }
    
    // Check if phone exists
    if (users.find(u => u.phone === phone)) {
      return { success: false, message: 'Số điện thoại đã được sử dụng' };
    }
    
    // Create user
    const newUser = {
      id: 'user_' + Date.now(),
      username,
      password,
      phone,
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    
    return { success: true, message: 'Đăng ký thành công!', user: newUser };
  },
  
  // Login user
  login(username, password) {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return { success: false, message: 'Tên tài khoản hoặc mật khẩu không đúng' };
    }
    
    // Save current user session
    const session = {
      id: user.id,
      username: user.username,
      phone: user.phone,
      role: user.role
    };
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(session));
    
    return { success: true, message: 'Đăng nhập thành công!', user: session };
  },
  
  // Logout
  logout() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    window.location.href = 'index.html';
  },
  
  // Get current logged in user
  getCurrentUser() {
    const data = localStorage.getItem(this.CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  
  // Check if user is admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },
  
  // Check if user is logged in
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },
  
  // Require login - redirect if not logged in
  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },
  
  // Require admin - redirect if not admin
  requireAdmin() {
    if (!this.isAdmin()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },
  
  // Update header UI based on login status
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
      
      // Show admin link if admin
      const adminLink = document.getElementById('adminLink');
      if (adminLink) {
        if (user.role === 'admin') {
          adminLink.classList.remove('hidden');
        } else {
          adminLink.classList.add('hidden');
        }
      }
    } else {
      authButtons.classList.remove('hidden');
      userInfo.classList.add('hidden');
    }
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  AUTH.init();
  AUTH.updateHeaderUI();
});
