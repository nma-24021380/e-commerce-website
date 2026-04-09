const initialProducts = [
  {
    id: 1,
    name: "Tai nghe không dây Zenith Pro",
    price: 1500000,
    desc: "Tai nghe chống ồn chủ động (ANC) cao cấp, pin dùng tới 30 giờ.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    category: "Tai nghe",
    stock: 20
  },
  {
    id: 2,
    name: "Đồng hồ thông minh FitVantage Tracker",
    price: 2100000,
    desc: "Theo dõi sức khỏe toàn diện, đo nhịp tim, nồng độ oxy trong máu (SpO2).",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    category: "Đồng hồ",
    stock: 5
  },
  {
    id: 3,
    name: "Bàn phím cơ Royal Kludge",
    price: 950000,
    desc: "Bàn phím cơ không dây, hỗ trợ hotswap, đèn nền RGB cá nhân hóa.",
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
    category: "Phụ kiện",
    stock: 0
  },
  {
    id: 4,
    name: "Balo Laptop Mark Ryden",
    price: 650000,
    desc: "Chống nước đỉnh cao, tích hợp cổng sạc USB, phù hợp cho dân văn phòng.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    category: "Balo",
    stock: 50
  }
];

const initialCustomers = [
  { id: 1, name: "Nguyễn Văn A", email: "nva@gmail.com", password: "123", phone: "0901234567", registerDate: "2026-01-15", totalSpent: 1500000, isLocked: false, isDeleted: false },
  { id: 2, name: "Trần Thị B", email: "ttb@gmail.com", password: "123", phone: "0987654321", registerDate: "2026-03-22", totalSpent: 2100000, isLocked: false, isDeleted: false },
  { id: 3, name: "Lê Văn C", email: "lvc@yahoo.com", password: "123", phone: "0912233445", registerDate: "2026-04-01", totalSpent: 0, isLocked: false, isDeleted: false }
];

const initialOrders = [
  { id: 10001, userId: 1, date: "2026-01-20T10:00:00.000Z", total: 1500000, status: "Đã giao" },
  { id: 10002, userId: 2, date: "2026-03-25T14:30:00.000Z", total: 2100000, status: "Đã giao" }
];

// Khởi tạo dữ liệu vào LocalStorage nếu chưa có
function initData() {
  if (!localStorage.getItem('ecommerce_products')) {
    localStorage.setItem('ecommerce_products', JSON.stringify(initialProducts));
  }
  if (!localStorage.getItem('ecommerce_cart')) {
    localStorage.setItem('ecommerce_cart', JSON.stringify([]));
  }
  if (!localStorage.getItem('ecommerce_customers')) {
    localStorage.setItem('ecommerce_customers', JSON.stringify(initialCustomers));
  }
  if (!localStorage.getItem('ecommerce_orders') || !localStorage.getItem('ecommerce_orders_migrated_v2')) {
    localStorage.setItem('ecommerce_orders', JSON.stringify(initialOrders));
    localStorage.setItem('ecommerce_orders_migrated_v2', 'true');
  }
}

function getCustomers() {
  return JSON.parse(localStorage.getItem('ecommerce_customers')) || [];
}

function saveCustomers(customers) {
  localStorage.setItem('ecommerce_customers', JSON.stringify(customers));
}

// Lấy danh sách sản phẩm
function getProducts() {
  let products = JSON.parse(localStorage.getItem('ecommerce_products')) || [];
  let needsSave = false;
  products = products.map(p => {
    if (p.category === undefined || p.stock === undefined) {
      needsSave = true;
      return { ...p, category: p.category || 'Khác', stock: p.stock !== undefined ? p.stock : 50 };
    }
    return p;
  });
  if (needsSave) {
    saveProducts(products);
  }
  return products;
}

// Lưu danh sách sản phẩm
function saveProducts(products) {
  localStorage.setItem('ecommerce_products', JSON.stringify(products));
}

// Lấy giỏ hàng
function getCart() {
  return JSON.parse(localStorage.getItem('ecommerce_cart')) || [];
}

// Lưu giỏ hàng
function saveCart(cart) {
  localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
}

// Format thành tiền xu Việt Nam
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Cập nhật số lượng trên header
function updateCartBadge() {
  const cart = getCart();
  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountEl.textContent = totalItems;
    cartCountEl.style.display = totalItems > 0 ? 'block' : 'none';
  }
}

// Thêm vào giỏ hàng
function addToCart(productId) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  if (user.role === 'admin') {
    alert('Admin không thể mua hàng!');
    return;
  }

  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  if (product.stock <= 0) {
    alert('Sản phẩm này đã hết hàng!');
    return;
  }

  const cart = getCart();
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    if (existingItem.quantity + 1 > product.stock) {
      alert(`Chỉ còn tối đa ${product.stock} sản phẩm trong kho!`);
      return;
    }
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartBadge();

  // Hiển thị toast hoặc animation feedback nhỏ (tuỳ chọn)
  alert(`Đã thêm "${product.name}" vào giỏ hàng.`);
}

// Chạy khởi tạo ngay
initData();

// --- AUTHENTICATION ---
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('ecommerce_currentUser')) || null;
}

function loginUser(email, password) {
  if (email === 'admin' && password === '123') {
    const adminUser = { id: 0, name: 'Admin', email: 'admin', role: 'admin' };
    localStorage.setItem('ecommerce_currentUser', JSON.stringify(adminUser));
    return true;
  }
  
  const customers = getCustomers();
  const customer = customers.find(c => c.email === email && c.password === password);
  if (customer) {
    if (customer.isDeleted) throw new Error("Tài khoản không tồn tại hoặc đã bị xóa mạng!");
    if (customer.isLocked) throw new Error("Tài khoản của bạn đã bị khóa do vi phạm chính sách!");

    localStorage.setItem('ecommerce_currentUser', JSON.stringify({ ...customer, role: 'customer' }));
    return true;
  }
  return false;
}

function logoutUser() {
  localStorage.removeItem('ecommerce_currentUser');
  window.location.href = 'index.html';
}

function updateHeaderNavigation() {
  const user = getCurrentUser();
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const adminLink = Array.from(navLinks.querySelectorAll('a')).find(a => a.href.includes('admin.html'));
  const cartLink = Array.from(navLinks.querySelectorAll('a')).find(a => a.href.includes('cart.html'));
  
  const existingLogin = navLinks.querySelector('.auth-login');
  const existingLogout = navLinks.querySelector('.auth-logout');
  const existingProfile = navLinks.querySelector('.auth-profile');
  if (existingLogin) existingLogin.remove();
  if (existingLogout) existingLogout.remove();
  if (existingProfile) existingProfile.remove();

  if (!user) {
    if (adminLink) adminLink.style.display = 'none';
    if (cartLink) cartLink.style.display = 'none';
    const loginLink = document.createElement('a');
    loginLink.href = 'login.html';
    loginLink.className = 'auth-login';
    loginLink.textContent = 'Đăng nhập';
    navLinks.appendChild(loginLink);
  } else if (user.role === 'admin') {
    if (adminLink) adminLink.style.display = 'flex';
    if (cartLink) cartLink.style.display = 'none';
  } else {
    // Customer
    if (adminLink) adminLink.style.display = 'none';
    if (cartLink) cartLink.style.display = 'flex';
    
    const profileLink = document.createElement('a');
    profileLink.href = 'profile.html';
    profileLink.className = 'auth-profile';
    profileLink.textContent = 'Trang cá nhân';
    navLinks.appendChild(profileLink);
  }

  if (user) {
    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.className = 'auth-logout';
    logoutLink.textContent = 'Đăng xuất (' + user.name + ')';
    logoutLink.onclick = (e) => {
      e.preventDefault();
      logoutUser();
    };
    navLinks.appendChild(logoutLink);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  updateHeaderNavigation();
});
