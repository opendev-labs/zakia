const menuData = [
    { id: 1, name: "Chicken Triple Schezwan Rice", price: 380, category: "chinese-rice-noodles", specialty: true, desc: "Basmati rice, chicken chunks, and secret Schezwan spice." },
    { id: 2, name: "Chicken Khapsa Rice", price: 290, category: "chinese-rice-noodles", specialty: true, desc: "Traditional Arabian rice with succulent grilled chicken." },
    { id: 3, name: "Prawn Chinese Rice", price: 340, category: "chinese-rice-noodles", desc: "Fresh prawns tossed with premium long-grain rice." },
    { id: 4, name: "Mix Triple Rice", price: 390, category: "chinese-rice-noodles", desc: "A blend of chicken, prawns, and egg in triple rice style." },
    { id: 5, name: "Veg Triple Rice", price: 330, category: "chinese-rice-noodles", desc: "Assorted vegetables in a spicy triple fried rice." },
    { id: 6, name: "Chicken Dhaba Handi", price: 500, category: "dhaba-specials", specialty: true, desc: "Slow-cooked in a clay pot for that authentic rustic taste." },
    { id: 7, name: "Chicken Lollypop Masala", price: 350, category: "starters", specialty: true, desc: "6 pieces of crispy chicken wings in spicy masala." },
    { id: 8, name: "Paneer Tikka", price: 270, category: "starters", desc: "Charcoal-grilled paneer cubes marinated in yogurt." },
    { id: 9, name: "Chicken Cheese Momos", price: 150, category: "others", desc: "Steamed dumplings filled with chicken and melted cheese." }
];

let cart = JSON.parse(localStorage.getItem('zaikaCart')) || [];
let appPayMode = 'COD';
const SERVICEABLE_PINS = ['400079', '400086'];

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderHomeSignatures();
    renderFullMenu();
    updateCartBadge();
}

// --- Navigation Logic ---
function switchView(viewName, el) {
    // Update active nav item
    if (el) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
    }

    // Toggle views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');
    
    // Scroll content to top
    document.querySelector('.app-content').scrollTop = 0;
}

// --- Rendering Logic ---
function renderHomeSignatures() {
    const container = document.getElementById('signaturesHome');
    const signatures = menuData.filter(m => m.specialty);
    
    container.innerHTML = signatures.map(item => `
        <div class="menu-card-app" style="width: 280px; flex-shrink: 0;" onclick="addToCart(${item.id})">
            <div class="img-placeholder" style="background-image: url('assets/hero.png'); background-size: cover;"></div>
            <div>
                <h4 style="color: var(--gold);">${item.name}</h4>
                <p style="font-size: 0.9rem; margin-top: 5px;">₹${item.price}</p>
                <span style="font-size: 0.6rem; background: var(--primary); padding: 2px 8px; border-radius: 10px;">SIGNATURE</span>
            </div>
        </div>
    `).join('');
}

function renderFullMenu(category = 'all') {
    const list = document.getElementById('fullMenuList');
    const filtered = category === 'all' ? menuData : menuData.filter(m => m.category === category);
    
    list.innerHTML = filtered.map(item => `
        <div class="menu-card-app">
            <div class="img-placeholder" style="background-image: url('assets/hero.png'); background-size: cover;"></div>
            <div style="flex-grow: 1;">
                <div style="display: flex; justify-content: space-between;">
                    <h4 style="color: var(--gold);">${item.name}</h4>
                    <span style="font-weight: 700; color: var(--primary);">₹${item.price}</span>
                </div>
                <p style="font-size: 0.8rem; color: #888; margin: 5px 0;">${item.desc}</p>
                <button class="btn-premium btn-primary-premium" style="padding: 5px 15px; font-size: 0.7rem;" onclick="addToCart(${item.id})">Add +</button>
            </div>
        </div>
    `).join('');
}

function filterByCategory(category, el) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    renderFullMenu(category);
}

function appSearch() {
    const q = document.getElementById('appSearch').value.toLowerCase();
    const results = document.getElementById('searchResults');
    
    if (q.length < 2) {
        results.innerHTML = '<p style="text-align: center; color: #888; margin-top: 50px;">Search for your favorite flavors...</p>';
        return;
    }
    
    const filtered = menuData.filter(m => m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));
    
    if (filtered.length === 0) {
        results.innerHTML = '<p style="text-align: center; color: #888; margin-top: 50px;">No dishes found.</p>';
    } else {
        results.innerHTML = filtered.map(item => `
            <div class="menu-card-app">
                <div class="img-placeholder"></div>
                <div style="flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between;">
                        <h4 style="color: var(--gold);">${item.name}</h4>
                        <span>₹${item.price}</span>
                    </div>
                    <button class="btn-premium btn-primary-premium" style="padding: 5px 15px; font-size: 0.7rem; margin-top: 10px;" onclick="addToCart(${item.id})">Add +</button>
                </div>
            </div>
        `).join('');
    }
}

// --- Cart Logic ---
function addToCart(id) {
    const item = menuData.find(m => m.id === id);
    const existing = cart.find(c => c.id === id);
    if (existing) existing.qty++;
    else cart.push({...item, qty: 1});
    
    saveCart();
    updateCartBadge();
    showToast(`${item.name} added!`);
}

function updateCartBadge() {
    const count = cart.reduce((acc, curr) => acc + curr.qty, 0);
    document.getElementById('cartBadge').innerText = count;
}

function openCart() {
    document.getElementById('cartDrawer').classList.add('open');
    renderCart();
}

function closeCart() {
    document.getElementById('cartDrawer').classList.remove('open');
}

function renderCart() {
    const content = document.getElementById('appCartContent');
    const totalEl = document.getElementById('appCartTotal');
    
    if (cart.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: #888; margin-top: 50px;">Your basket is empty.</p>';
        totalEl.innerText = '₹0';
        return;
    }
    
    content.innerHTML = cart.map(item => `
        <div class="menu-card-app" style="margin-bottom: 10px;">
            <div style="flex-grow: 1;">
                <div style="display: flex; justify-content: space-between;">
                    <h4 style="color: var(--gold);">${item.name}</h4>
                    <span>₹${item.price * item.qty}</span>
                </div>
                <div style="display: flex; gap: 15px; align-items: center; margin-top: 10px;">
                    <button class="chip" onclick="changeQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="chip" onclick="changeQty(${item.id}, 1)">+</button>
                </div>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    totalEl.innerText = `₹${total}`;
}

function changeQty(id, delta) {
    const item = cart.find(c => c.id === id);
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
    saveCart();
    updateCartBadge();
    renderCart();
}

function saveCart() { localStorage.setItem('zaikaCart', JSON.stringify(cart)); }

// --- Checkout Flow ---
function startAppCheckout() {
    if (cart.length === 0) return;
    closeCart();
    document.getElementById('checkoutModal').style.display = 'flex';
}

function closeCheckout() { document.getElementById('checkoutModal').style.display = 'none'; }

function toAppPayment() {
    if (!document.getElementById('aName').value || !document.getElementById('aPhone').value) return alert("Fill details");
    document.getElementById('check-step-1').style.display = 'none';
    document.getElementById('check-step-2').style.display = 'block';
}

function backToDelivery() {
    document.getElementById('check-step-2').style.display = 'none';
    document.getElementById('check-step-1').style.display = 'block';
}

function selectAppPay(mode, el) {
    appPayMode = mode;
    document.querySelectorAll('.pay-option').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
}

function placeAppOrder() {
    document.getElementById('check-step-2').style.display = 'none';
    document.getElementById('check-step-3').style.display = 'block';
    document.getElementById('appOrderID').innerText = 'APP-' + Math.floor(Math.random() * 90000);
    
    cart = [];
    saveCart();
    updateCartBadge();
    
    // Simulate tracking
    setTimeout(() => document.getElementById('appProgressBar').style.width = '66%', 5000);
    setTimeout(() => document.getElementById('appProgressBar').style.width = '100%', 15000);
}

// --- Utils ---
function verifyAppPincode() {
    const pin = document.getElementById('appPincode').value;
    if (SERVICEABLE_PINS.includes(pin)) {
        localStorage.setItem('userPin', pin);
        document.getElementById('locationOverlay').style.display = 'none';
    } else {
        document.getElementById('appLocError').style.display = 'block';
    }
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
        background: var(--gold); color: #000; padding: 10px 20px; border-radius: 50px;
        font-weight: 700; z-index: 10000; font-size: 0.8rem;
    `;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}
