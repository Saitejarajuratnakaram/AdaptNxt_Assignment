// --- State ---
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user'));
let currentPage = 1;
let currentName = '';
let currentCategory = '';
let editingProductId = null;
let adminCurrentPage = 1;
let adminTotalPages = 1;

// --- DOM Elements ---
const navProducts = document.getElementById('nav-products');
const navCart = document.getElementById('nav-cart');
const navOrders = document.getElementById('nav-orders');
const navAdmin = document.getElementById('nav-admin');
const navLogin = document.getElementById('nav-login');
const navLogout = document.getElementById('nav-logout');
const productsSection = document.getElementById('products-section');
const cartSection = document.getElementById('cart-section');
const ordersSection = document.getElementById('orders-section');
const authSection = document.getElementById('auth-section');
const adminSection = document.getElementById('admin-section');

// --- Navigation ---
function showSection(section) {
  productsSection.style.display = 'none';
  cartSection.style.display = 'none';
  ordersSection.style.display = 'none';
  authSection.style.display = 'none';
  adminSection.style.display = 'none';
  section.style.display = '';
}
navProducts.onclick = () => { showSection(productsSection); loadProducts(); };
navCart.onclick = () => { showSection(cartSection); loadCart(); };
navOrders.onclick = () => { showSection(ordersSection); loadOrders(); };
navAdmin.onclick = () => { showSection(adminSection); loadAdminProducts(); loadAdminUsersOrders(); };
navLogin.onclick = () => { showSection(authSection); };
navLogout.onclick = logout;

function updateNav() {
  navLogin.style.display = token ? 'none' : '';
  navLogout.style.display = token ? '' : 'none';
  navCart.style.display = (token && user && user.role === 'customer') ? '' : 'none';
  navOrders.style.display = token ? '' : 'none';
  navAdmin.style.display = (token && user && user.role === 'admin') ? '' : 'none';
}

function logout() {
  token = null;
  user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateNav();
  showSection(productsSection);
}

// --- Auth ---
document.getElementById('login-form').onsubmit = async e => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const res = await fetch('/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok) {
    token = data.token;
    user = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    updateNav();
    showSection(productsSection);
  } else {
    document.getElementById('auth-message').textContent = data.message || 'Login failed';
  }
};
document.getElementById('register-form').onsubmit = async e => {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const res = await fetch('/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (res.ok) {
    token = data.token;
    user = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    updateNav();
    showSection(productsSection);
  } else {
    document.getElementById('auth-message').textContent = data.message || 'Registration failed';
  }
};

// --- Products ---
async function loadProducts(page = 1) {
  currentPage = page;
  const name = document.getElementById('search-name').value;
  const category = document.getElementById('search-category').value;
  currentName = name;
  currentCategory = category;
  let url = `/products?page=${page}&limit=6`;
  if (name) url += `&name=${encodeURIComponent(name)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  const res = await fetch(url);
  const data = await res.json();
  renderProducts(data.products, data.page, data.pages);
}
function renderProducts(products, page, pages) {
  const list = document.getElementById('products-list');
  list.innerHTML = '';
  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    if (prod.image) {
      const img = document.createElement('img');
      img.src = prod.image;
      card.appendChild(img);
    }
    card.innerHTML += `<h3>${prod.name}</h3><p>${prod.description || ''}</p><p><b>₹${prod.price}</b></p><p>${prod.category}</p><p>Stock: ${prod.stock}</p>`;
    if (token && user && user.role === 'customer') {
      const btn = document.createElement('button');
      btn.textContent = 'Add to Cart';
      btn.onclick = () => addToCart(prod._id);
      card.appendChild(btn);
    }
    list.appendChild(card);
  });
  document.getElementById('page-info').textContent = `Page ${page} of ${pages}`;
  document.getElementById('prev-page').disabled = page <= 1;
  document.getElementById('next-page').disabled = page >= pages;
}
document.getElementById('search-btn').onclick = () => loadProducts(1);
document.getElementById('prev-page').onclick = () => loadProducts(currentPage - 1);
document.getElementById('next-page').onclick = () => loadProducts(currentPage + 1);

// --- Cart ---
// Toast notification
function showToast(message, type = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  if (type === 'error') toast.style.background = '#e74c3c';
  else toast.style.background = '#222';
  setTimeout(() => toast.classList.remove('show'), 2200);
}
// Loading spinner
function showSpinner(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '<div class="loading-spinner"></div>';
}
// --- Cart Management in Modal ---
async function loadCart() {
  if (!token) return;
  showSpinner('cart-list');
  const res = await fetch('/cart', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const list = document.getElementById('cart-list');
  list.innerHTML = '';
  let total = 0;
  if (!data.items || data.items.length === 0) {
    list.innerHTML = '<p>Your cart is empty.</p>';
    document.querySelector('.cart-total')?.remove();
    return;
  }
  data.items.forEach(item => {
    total += item.product.price * item.quantity;
    const div = document.createElement('div');
    div.className = 'cart-item';
    if (item.product.image) {
      const img = document.createElement('img');
      img.src = item.product.image;
      img.alt = item.product.name;
      img.className = 'cart-item-img';
      div.appendChild(img);
    }
    const info = document.createElement('span');
    info.innerHTML = `<b>${item.product.name}</b> (x${item.quantity})<br>₹${item.product.price} each`;
    div.appendChild(info);
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.value = item.quantity;
    qtyInput.min = 1;
    qtyInput.onchange = () => updateCartItem(item._id, Number(qtyInput.value));
    div.appendChild(qtyInput);
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Remove';
    delBtn.onclick = () => removeCartItem(item._id);
    div.appendChild(delBtn);
    list.appendChild(div);
  });
  let totalDiv = document.querySelector('.cart-total');
  if (!totalDiv) {
    totalDiv = document.createElement('div');
    totalDiv.className = 'cart-total';
    list.parentNode.appendChild(totalDiv);
  }
  totalDiv.textContent = `Total: ₹${total}`;
}
async function addToCart(productId) {
  if (!token) {
    showToast('Please login to add to cart.', 'error');
    return;
  }
  showToast('Adding to cart...');
  const res = await fetch('/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ productId, quantity: 1 })
  });
  if (res.ok) {
    loadCart();
    showToast('Added to cart!');
  } else {
    showToast('Failed to add to cart', 'error');
  }
}
async function updateCartItem(itemId, quantity) {
  showToast('Updating cart...');
  await fetch(`/cart/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ quantity })
  });
  loadCart();
  showToast('Cart updated!');
}
async function removeCartItem(itemId) {
  showToast('Removing from cart...');
  await fetch(`/cart/${itemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  loadCart();
  showToast('Removed from cart!');
}
document.getElementById('place-order-btn').onclick = async () => {
  showToast('Placing order...');
  const res = await fetch('/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.ok) {
    showToast('Order placed!');
    loadCart();
    cartModal.classList.remove('show');
  } else {
    showToast('Failed to place order', 'error');
  }
};

// --- Orders ---
async function loadOrders() {
  const res = await fetch('/orders', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const list = document.getElementById('orders-list');
  list.innerHTML = '';
  data.forEach(order => {
    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML = `<span>Order #${order._id} - ₹${order.total} - ${new Date(order.createdAt).toLocaleString()}</span>`;
    const items = document.createElement('ul');
    order.items.forEach(i => {
      const li = document.createElement('li');
      li.textContent = `${i.product.name} (x${i.quantity})`;
      items.appendChild(li);
    });
    div.appendChild(items);
    list.appendChild(div);
  });
}

// --- Admin Product Management ---
async function loadAdminProducts(page = 1) {
  adminCurrentPage = page;
  const res = await fetch(`/products?page=${page}&limit=6`);
  const data = await res.json();
  renderAdminProducts(data.products, data.page, data.pages);
}
function renderAdminProducts(products, page = 1, pages = 1) {
  const list = document.getElementById('admin-products-list');
  list.innerHTML = '';
  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'admin-product-card';
    card.innerHTML = `<h3>${prod.name}</h3><p>${prod.description || ''}</p><p><b>₹${prod.price}</b></p><p>${prod.category}</p><p>Stock: ${prod.stock}</p>`;
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => startEditProduct(prod);
    card.appendChild(editBtn);
    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => { if(confirm('Delete this product?')) deleteProduct(prod._id); };
    card.appendChild(delBtn);
    list.appendChild(card);
  });
  // Pagination controls
  adminTotalPages = pages;
  document.getElementById('admin-page-info').textContent = `Page ${page} of ${pages}`;
  document.getElementById('admin-prev-page').disabled = page <= 1;
  document.getElementById('admin-next-page').disabled = page >= pages;
  // Cancel edit button
  let cancelBtn = document.getElementById('admin-cancel-edit-btn');
  if (!cancelBtn) {
    cancelBtn = document.createElement('button');
    cancelBtn.id = 'admin-cancel-edit-btn';
    cancelBtn.textContent = 'Cancel Edit';
    cancelBtn.style.marginLeft = '1rem';
    cancelBtn.onclick = resetAdminForm;
    document.getElementById('admin-product-form').appendChild(cancelBtn);
  }
  cancelBtn.style.display = editingProductId ? '' : 'none';
}
document.getElementById('admin-prev-page').onclick = () => loadAdminProducts(adminCurrentPage - 1);
document.getElementById('admin-next-page').onclick = () => loadAdminProducts(adminCurrentPage + 1);
async function deleteProduct(id) {
  await fetch(`/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  loadAdminProducts(adminCurrentPage);
  loadProducts();
}
function startEditProduct(prod) {
  editingProductId = prod._id;
  document.getElementById('admin-product-name').value = prod.name;
  document.getElementById('admin-product-desc').value = prod.description;
  document.getElementById('admin-product-price').value = prod.price;
  document.getElementById('admin-product-category').value = prod.category;
  document.getElementById('admin-product-image').value = prod.image;
  document.getElementById('admin-product-stock').value = prod.stock;
  document.getElementById('admin-product-form-btn').textContent = 'Update Product';
}
function resetAdminForm() {
  editingProductId = null;
  document.getElementById('admin-product-form').reset();
  document.getElementById('admin-product-form-btn').textContent = 'Add Product';
}
document.getElementById('admin-product-form').onsubmit = async e => {
  e.preventDefault();
  const name = document.getElementById('admin-product-name').value;
  const description = document.getElementById('admin-product-desc').value;
  const price = document.getElementById('admin-product-price').value;
  const category = document.getElementById('admin-product-category').value;
  const image = document.getElementById('admin-product-image').value;
  const stock = document.getElementById('admin-product-stock').value;
  if (editingProductId) {
    // Update product
    await fetch(`/products/${editingProductId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, description, price, category, image, stock })
    });
  } else {
    // Add product
    await fetch('/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, description, price, category, image, stock })
    });
  }
  loadAdminProducts(adminCurrentPage);
  loadProducts();
  resetAdminForm();
};

// --- Admin: Users & Orders ---
async function loadAdminUsersOrders() {
  const res = await fetch('/auth/admin/users-orders', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  renderAdminUsersOrders(data);
}
function renderAdminUsersOrders(users) {
  const container = document.getElementById('admin-users-orders');
  if (!users.length) {
    container.innerHTML = '<p>No users found.</p>';
    return;
  }
  let html = '<table class="admin-users-table"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Orders</th></tr></thead><tbody>';
  users.forEach(user => {
    html += `<tr><td>${user.name}</td><td>${user.email}</td><td>${user.role}</td><td>`;
    if (user.orders && user.orders.length) {
      html += '<ul>';
      user.orders.forEach(order => {
        html += `<li>Order #${order._id} - ₹${order.total} - ${new Date(order.createdAt).toLocaleString()}<ul>`;
        order.items.forEach(i => {
          html += `<li>${i.product.name} (x${i.quantity})</li>`;
        });
        html += '</ul></li>';
      });
      html += '</ul>';
    } else {
      html += 'No orders';
    }
    html += '</td></tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

// --- On Load ---
updateNav();
showSection(productsSection);
if (token) {
  if (user.role === 'admin') loadAdminProducts();
}
loadProducts(); 