const products = [
  {
    id: 1,
    name: "Air Zoom Pulse",
    brand: "Nike",
    price: 149,
    category: "Running",
    badge: "Nouveau",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=88",
  },
  {
    id: 2,
    name: "Club C 85 Vintage",
    brand: "Reebok",
    price: 110,
    category: "Lifestyle",
    badge: "",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=88",
  },
  {
    id: 3,
    name: "Gel-Kayano 14",
    brand: "ASICS",
    price: 175,
    category: "Running",
    badge: "Populaire",
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=88",
  },
  {
    id: 4,
    name: "Samba OG",
    brand: "adidas",
    price: 120,
    category: "Lifestyle",
    badge: "",
    image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=900&q=88",
  },
  {
    id: 5,
    name: "Old Skool",
    brand: "Vans",
    price: 85,
    category: "Skate",
    badge: "Essentiel",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=88",
  },
  {
    id: 6,
    name: "Chunky Runner",
    brand: "New Balance",
    price: 160,
    category: "Lifestyle",
    badge: "",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=88",
  },
];

const sizes = [38, 39, 40, 41, 42, 43, 44, 45];
let activeCategory = "Tous";
let cart = [];
let favorites = new Set();
let selectedSize = null;
let activeProduct = null;

const productGrid = document.querySelector("#productGrid");
const resultCount = document.querySelector("#resultCount");
const emptyState = document.querySelector("#emptyState");
const searchPanel = document.querySelector("#searchPanel");
const searchInput = document.querySelector("#searchInput");
const cartDrawer = document.querySelector("#cartDrawer");
const overlay = document.querySelector("#overlay");
const productDialog = document.querySelector("#productDialog");
const dialogContent = document.querySelector("#dialogContent");

function formatPrice(price) {
  return `${price} €`;
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const categoryMatch = activeCategory === "Tous" || product.category === activeCategory;
    const searchMatch = !query || `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query);
    return categoryMatch && searchMatch;
  });

  productGrid.innerHTML = filtered.map((product) => `
    <article class="product-card">
      <div class="product-image">
        <button class="product-open-button" type="button" data-open-product="${product.id}" aria-label="Voir ${product.name}">
          <img src="${product.image}" alt="${product.name} ${product.brand}" loading="lazy" />
        </button>
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <button class="favorite-button" type="button" data-favorite="${product.id}" aria-label="${favorites.has(product.id) ? "Retirer des favoris" : "Ajouter aux favoris"}">${favorites.has(product.id) ? "♥" : "♡"}</button>
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-brand">${product.brand}</p>
        <p class="product-price">${formatPrice(product.price)}</p>
      </div>
    </article>
  `).join("");

  resultCount.textContent = `${filtered.length} paire${filtered.length > 1 ? "s" : ""}`;
  emptyState.hidden = filtered.length !== 0;
}

function openProduct(productId) {
  activeProduct = products.find((product) => product.id === productId);
  selectedSize = null;
  dialogContent.innerHTML = `
    <div class="dialog-layout">
      <img class="dialog-image" src="${activeProduct.image}" alt="${activeProduct.name} ${activeProduct.brand}" />
      <div class="dialog-details">
        <p class="dialog-brand">${activeProduct.brand} · ${activeProduct.category}</p>
        <h2 id="dialogTitle">${activeProduct.name}</h2>
        <p class="dialog-price">${formatPrice(activeProduct.price)}</p>
        <p class="size-label">Choisir une pointure</p>
        <div class="sizes" aria-label="Pointures disponibles">
          ${sizes.map((size) => `<button class="size-button" type="button" data-size="${size}" aria-pressed="false">${size}</button>`).join("")}
        </div>
        <button class="add-button" type="button" id="addToCart" disabled>Choisir une pointure</button>
      </div>
    </div>
  `;
  productDialog.showModal();
}

document.querySelector("#searchToggle").addEventListener("click", () => {
  const isHidden = searchPanel.hidden;
  searchPanel.hidden = !isHidden;
  document.querySelector("#searchToggle").setAttribute("aria-expanded", String(isHidden));
  if (isHidden) searchInput.focus();
});

searchInput.addEventListener("input", renderProducts);

document.querySelector(".filters").addEventListener("click", (event) => {
  const chip = event.target.closest(".filter-chip");
  if (!chip) return;
  activeCategory = chip.dataset.category;
  document.querySelectorAll(".filter-chip").forEach((item) => {
    item.classList.toggle("active", item === chip);
    item.setAttribute("aria-pressed", String(item === chip));
  });
  renderProducts();
});

document.querySelectorAll("[data-nav-category]").forEach((link) => {
  link.addEventListener("click", () => {
    activeCategory = link.dataset.navCategory;
    document.querySelectorAll("[data-nav-category]").forEach((navLink) => {
      navLink.classList.toggle("active", navLink === link);
    });
    document.querySelectorAll(".filter-chip").forEach((chip) => {
      const active = chip.dataset.category === activeCategory;
      chip.classList.toggle("active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
    renderProducts();
  });
});

productGrid.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    event.stopPropagation();
    const id = Number(favoriteButton.dataset.favorite);
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    renderProducts();
    showToast(favorites.has(id) ? "Ajouté aux favoris" : "Retiré des favoris");
    return;
  }
  const productElement = event.target.closest("[data-open-product]");
  if (productElement) openProduct(Number(productElement.dataset.openProduct));
});

dialogContent.addEventListener("click", (event) => {
  const sizeButton = event.target.closest("[data-size]");
  if (sizeButton) {
    selectedSize = Number(sizeButton.dataset.size);
    dialogContent.querySelectorAll("[data-size]").forEach((button) => {
      const selected = button === sizeButton;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    const addButton = document.querySelector("#addToCart");
    addButton.disabled = false;
    addButton.textContent = "Ajouter au panier";
  }
  if (event.target.closest("#addToCart") && selectedSize) {
    cart.push({ ...activeProduct, size: selectedSize, key: `${activeProduct.id}-${selectedSize}-${Date.now()}` });
    productDialog.close();
    renderCart();
    showToast(`${activeProduct.name} ajouté au panier`);
  }
});

document.querySelector("#dialogClose").addEventListener("click", () => productDialog.close());

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartDrawer.removeAttribute("inert");
  overlay.hidden = false;
  document.querySelector("#cartClose").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartDrawer.setAttribute("inert", "");
  overlay.hidden = true;
  document.querySelector("#cartToggle").focus();
}

function renderCart() {
  const cartItems = document.querySelector("#cartItems");
  const cartFooter = document.querySelector("#cartFooter");
  document.querySelector("#cartCount").textContent = cart.length;

  if (!cart.length) {
    cartItems.innerHTML = `<p class="cart-empty">Votre panier est vide.</p>`;
    cartFooter.hidden = true;
  } else {
    cartItems.innerHTML = cart.map((item) => `
      <article class="cart-item">
        <img src="${item.image}" alt="" />
        <div>
          <h3 class="cart-item-name">${item.name}</h3>
          <p class="cart-item-meta">${item.brand} · Pointure ${item.size}</p>
          <p class="cart-item-meta">${formatPrice(item.price)}</p>
        </div>
        <button class="remove-item" type="button" data-remove="${item.key}" aria-label="Retirer ${item.name}">×</button>
      </article>
    `).join("");
    cartFooter.hidden = false;
    document.querySelector("#cartTotal").textContent = formatPrice(cart.reduce((total, item) => total + item.price, 0));
  }
}

document.querySelector("#cartToggle").addEventListener("click", openCart);
document.querySelector("#cartClose").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) {
    closeCart();
  }
  if (event.key === "Tab" && cartDrawer.classList.contains("open")) {
    const focusable = [...cartDrawer.querySelectorAll("button:not([disabled])")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

document.querySelector("#cartItems").addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove]");
  if (!removeButton) return;
  cart = cart.filter((item) => item.key !== removeButton.dataset.remove);
  renderCart();
});

document.querySelector("#checkoutButton").addEventListener("click", () => {
  showToast("Démo uniquement — aucun paiement réalisé");
});

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

renderProducts();
renderCart();
