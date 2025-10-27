// ---------------- ADMIN DASHBOARD ---------------- //
let currentSection = 'dashboard';
let editMenuId = null; // Track item being edited

function initAdmin() {
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  if (isLoggedIn) showDashboard();
  else showLoginForm();

  setupAdminEventListeners();
}

function setupAdminEventListeners() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleAdminLogin);

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showSection(btn.dataset.section);
    });
  });

  const addMenuBtn = document.getElementById('add-menu-btn');
  if (addMenuBtn) addMenuBtn.addEventListener('click', addOrUpdateMenuItem);

  displayCurrentConfig();
}

// ---------------- AUTH ---------------- //
function handleAdminLogin(e) {
  e.preventDefault();
  const password = document.getElementById('admin-password').value.trim();
  const errorDiv = document.getElementById('login-error');

  if (password === CONFIG.ADMIN_PASSWORD) {
    sessionStorage.setItem('adminLoggedIn', 'true');
    showDashboard();
  } else {
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 3000);
  }
}

function showLoginForm() {
  document.getElementById('login-section').classList.remove('hidden');
  document.getElementById('dashboard-section').classList.add('hidden');
  document.getElementById('menu-management').classList.add('hidden');
  document.getElementById('settings-section').classList.add('hidden');
  document.getElementById('bottom-nav').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('dashboard-section').classList.remove('hidden');
  document.getElementById('bottom-nav').classList.remove('hidden');
  showSection('dashboard');
}

// ---------------- NAVIGATION ---------------- //
function showSection(section) {
  currentSection = section;
  document.getElementById('dashboard-section').classList.add('hidden');
  document.getElementById('menu-management').classList.add('hidden');
  document.getElementById('settings-section').classList.add('hidden');

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('text-red-600');
    btn.classList.add('text-gray-600');
  });

  switch (section) {
    case 'dashboard':
      document.getElementById('dashboard-section').classList.remove('hidden');
      break;
    case 'menu':
      document.getElementById('menu-management').classList.remove('hidden');
      renderMenuList();
      break;
    case 'settings':
      document.getElementById('settings-section').classList.remove('hidden');
      break;
  }

  const activeBtn = document.querySelector(`[data-section="${section}"]`);
  if (activeBtn) {
    activeBtn.classList.remove('text-gray-600');
    activeBtn.classList.add('text-red-600');
  }
}

// ---------------- MENU MANAGEMENT ---------------- //
function renderMenuList() {
  const menu = MenuStorage.getAll();
  const list = document.getElementById('menu-list');
  list.innerHTML = '';

  if (menu.length === 0) {
    list.innerHTML = '<p class="text-gray-500 text-center py-6">No menu items yet.</p>';
    return;
  }

  menu.forEach((item) => {
    list.innerHTML += `
      <div class="p-4 bg-white border rounded shadow">
        <img src="${item.image || 'https://via.placeholder.com/150'}" class="w-full h-32 object-cover rounded mb-2" alt="">
        <h3 class="font-semibold">${item.name}</h3>
        <p class="text-gray-600">₦${item.price}</p>
        <p class="text-sm text-gray-500 mb-2">${item.desc || ''}</p>
        <p class="text-xs ${item.available ? 'text-green-600' : 'text-red-600'} mb-2">
          ${item.available ? '✅ Available' : '❌ Not Available'}
        </p>
        <div class="flex flex-wrap gap-2">
          <button onclick="toggleMenuAvailability(${item.id})" class="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">
            Toggle
          </button>
          <button onclick="editMenuItem(${item.id})" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Edit</button>
          <button onclick="deleteMenuItem(${item.id})" class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Delete</button>
        </div>
      </div>
    `;
  });
}

function addOrUpdateMenuItem() {
  const name = document.getElementById('menu-name').value.trim();
  const price = document.getElementById('menu-price').value.trim();
  const desc = document.getElementById('menu-desc').value.trim();
  const imageFile = document.getElementById('menu-image-file').files[0];

  if (!name || !price) {
    showNotification('Name and price are required!', 'error');
    return;
  }

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = () => saveMenuItem(name, price, desc, reader.result);
    reader.readAsDataURL(imageFile);
  } else {
    saveMenuItem(name, price, desc, null);
  }
}

function saveMenuItem(name, price, desc, image) {
  let menu = MenuStorage.getAll();

  if (editMenuId) {
    const index = menu.findIndex(i => i.id === editMenuId);
    if (index !== -1) {
      menu[index].name = name;
      menu[index].price = Number(price);
      menu[index].desc = desc;
      if (image) menu[index].image = image;
    }
    editMenuId = null;
    showNotification('Menu item updated successfully!', 'success');
  } else {
    const newItem = {
      id: Date.now(),
      name,
      price: Number(price),
      desc,
      image: image || 'https://via.placeholder.com/150',
      available: true,
    };
    menu.push(newItem);
    showNotification('Menu item added successfully!', 'success');
  }

  MenuStorage.saveAll(menu);
  clearMenuForm();
  renderMenuList();
}

function editMenuItem(id) {
  const item = MenuHelpers.getItemById(id);
  if (!item) return;

  document.getElementById('menu-name').value = item.name;
  document.getElementById('menu-price').value = item.price;
  document.getElementById('menu-desc').value = item.desc;
  document.getElementById('menu-image-file').value = '';

  editMenuId = id;
  showNotification('Editing mode: update details and click Save', 'info');
}

function deleteMenuItem(id) {
  if (confirm('Delete this item?')) {
    MenuStorage.delete(id);
    renderMenuList();
    showNotification('Menu item deleted', 'success');
  }
}

function toggleMenuAvailability(id) {
  MenuStorage.toggleAvailability(id);
  renderMenuList();
  showNotification('Availability updated!', 'info');
}

function clearMenuForm() {
  document.getElementById('menu-name').value = '';
  document.getElementById('menu-price').value = '';
  document.getElementById('menu-desc').value = '';
  document.getElementById('menu-image-file').value = '';
}

// ---------------- NOTIFICATION ---------------- //
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 p-4 rounded-lg z-50 ${
    type === 'success'
      ? 'bg-green-500'
      : type === 'error'
      ? 'bg-red-500'
      : 'bg-blue-500'
  } text-white shadow-lg`;
  notification.textContent = message;

  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// ---------------- AUTO REFRESH ---------------- //
setInterval(renderMenuList, 3000);
window.addEventListener("menu-updated", renderMenuList);

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Admin dashboard initializing...");
  initAdmin();
});
