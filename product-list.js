const WHATSAPP_NUMBER = "573114454660";
const SHIPPING_COST = 5000;
const FREE_SHIPPING_THRESHOLD = 30000;

const PRODUCTS = [
  // Formato: [Código, Nombre, Precio, Categoría, Imagen (opcional)]
  ["1001", "Manzana Roja", 1690, "Verdulería", "manzana.jpeg"],
  ["1002", "Kiwi", 1690, "Verdulería", "kiwi.jpeg"],
  ["1003", "Limón", 1390, "Verdulería", "limon.jpeg"],
  ["2001", "Pan Marraqueta (Granel)", 1200, "Panadería"],
  ["2002", "Pan Hallulla (Granel)", 1200, "Panadería"],
  ["2003", "Croissant", 1500, "Panadería"],
  ["3001", "Arroz Grado 1 (1kg)", 1800, "Abarrotes"],
  ["3002", "Aceite Maravilla (1L)", 2490, "Abarrotes"],
  ["3003", "Azúcar Blanca (1kg)", 1350, "Abarrotes"],
  ["3004", "Fideos Espagueti", 990, "Abarrotes"],
  ["4001", "Detergente Líquido", 4500, "Limpieza"],
  ["4002", "Jabón de Manos", 1200, "Limpieza"],
  ["4003", "Limpia Pisos Floral", 1890, "Limpieza"],
  ["5001", "Salsa de chocolate", 2690, "Salsas","SALSA.jpg"],
  ["5002", "Vinagre vino Tinto", 990, "Salsas","vinagre.jpg"],
  ["5003", "Salsa frambuesa", 2690, "Salsas","salsa frambuesa.jpg"],
  ["5004", "Mostaza", 1690, "Salsas","mostaza.jpg" ],
  ["1035", "Papa Tierra", 1990, "Verdulería"],
  ["1040", "Cebolla Morada", 990, "Verdulería"]
];

const PRODUCTS_WITH_META = PRODUCTS.map(([code, name, price, category, imageUrl]) => {
  const { emoji, color } = styleFor(name);

  return {
    code,
    name,
    price,
    category: category || "Verdulería",
    emoji,
    bgColor: color,
    image: imageUrl || "", // Ahora se queda vacío por defecto
  };
});

const cart = {};
let loadingLocation = false;
let query = "";
let currentCategory = "Todos";

const productsGrid = document.getElementById("productsGrid");
const productCount = document.getElementById("productCount");
const cartCounter = document.getElementById("cartCounter");
const cartContent = document.getElementById("cartContent");
const clearButton = document.getElementById("clearButton");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");
const searchInput = document.getElementById("searchInput");
const cartButton = document.getElementById("cartButton");
const categoryBar = document.getElementById("categoryBar");

function formatCLP(n) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

function styleFor(name) {
  const n = name.toLowerCase();
  const list = [
    [/manzana roja|manzana pablo/, "🍎", "#fef2f2"],
    [/manzana verde/, "🍏", "#ecfdf5"],
    [/kiwi/, "🥝", "#f0fdf4"],
    [/lim[oó]n/, "🍋", "#fef9c3"],
    [/pera/, "🍐", "#fefce8"],
    [/mandarina|naranja/, "🍊", "#ffedd5"],
    [/tomate/, "🍅", "#fee2e2"],
    [/zapallo|camote/, "🎃", "#fff7ed"],
    [/pepino/, "🥒", "#ecfdf5"],
    [/zanahoria/, "🥕", "#ffedd5"],
    [/cebolla morada/, "🧅", "#f5f3ff"],
    [/cebolla|cebollin|ciboulette/, "🧅", "#fffbeb"],
    [/brocoli|coliflor/, "🥦", "#ecfccb"],
    [/champi/, "🍄", "#f8fafc"],
    [/mango/, "🥭", "#fef08a"],
    [/choclo/, "🌽", "#fef3c7"],
    [/ajo/, "🧄", "#f8fafc"],
    [/aji|pimenton rojo/, "🌶️", "#fee2e2"],
    [/pimenton verde/, "🫑", "#dcfce7"],
    [/poroto/, "🫛", "#ecfdf5"],
    [/albaca|espinaca|acelga|perejil|cilantro|escarola|menta|lechuga|mix verdura|shapsui|mongoliana|ensalada/, "🥬", "#dcfce7"],
    [/platano/, "🍌", "#fef9c3"],
    [/costina|cazuela/, "🥘", "#ffedd5"],
    [/beterraga/, "🫜", "#ffe4e6"],
    [/papa/, "🥔", "#fef3c7"],
    [/genjibre/, "🫚", "#fef3c7"],
    [/frutilla/, "🍓", "#ffe4e6"],
    [/uva/, "🍇", "#ede9fe"],
    [/ciruela/, "🟣", "#ede9fe"],
    [/membrillo/, "🍐", "#fef9c3"],
    [/pi[nñ]a/, "🍍", "#fde68a"],
    [/pan|hallulla|marraqueta|croissant/, "🥖", "#fffbeb"],
    [/arroz|aceite|azucar|fideos/, "🥫", "#f8fafc"],
    [/detergente|jabon|limpia/, "🧼", "#f0fdf4"],
    [/ketchup|mayonesa|mostaza|salsa/, "🍅", "#fff1f2"],
    [/mancaqui/, "🥭", "#fde68a"],
  ];
  for (const [re, emoji, color] of list) {
    if (re.test(n)) return { emoji, color };
  }
  return { emoji: "🥗", color: "#ecfdf5" };
}

function notify(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  toast.classList.remove("hidden");
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 2400);
}

function buildMessage(locationLine) {
  const items = Object.entries(cart)
    .map(([code, qty]) => {
      const product = PRODUCTS_WITH_META.find((item) => item.code === code);
      return product ? `• [${product.code}] ${product.name} x${qty} — ${formatCLP(product.price * qty)}` : null;
    })
    .filter(Boolean)
    .join("\n");

  const subtotal = Object.entries(cart).reduce((sum, [code, qty]) => {
    const product = PRODUCTS_WITH_META.find((item) => item.code === code);
    return product ? sum + product.price * qty : sum;
  }, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  return [
    "🛒 *Nuevo pedido - Verdulería El Bandejón*",
    "",
    "*Productos:*",
    items,
    "",
    `*Subtotal:* ${formatCLP(subtotal)}`,
    `*Servientrega:* ${shipping === 0 ? "GRATIS 🎉" : formatCLP(shipping)}`,
    `*Total:* ${formatCLP(total)}`,
    "",
    locationLine,
  ]
    .filter(Boolean)
    .join("\n");
}

function sendWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function handleCheckout() {
  const orderedItems = Object.values(cart).reduce((a, b) => a + b, 0);
  if (orderedItems === 0) {
    notify("Tu carrito está vacío");
    return;
  }
  if (!navigator.geolocation) {
    sendWhatsApp(buildMessage("📍 *Ubicación:* No disponible"));
    return;
  }
  loadingLocation = true;
  renderCart();
  notify("Obteniendo tu ubicación GPS...");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const locationLine = `📍 *Ubicación del cliente (GPS):*\n${mapsUrl}\nLat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
      sendWhatsApp(buildMessage(locationLine));
      loadingLocation = false;
      renderCart();
    },
    () => {
      sendWhatsApp(buildMessage("📍 *Ubicación:* El cliente no permitió el acceso a GPS"));
      notify("No pudimos obtener tu ubicación. Enviamos el pedido sin GPS.");
      loadingLocation = false;
      renderCart();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function addProduct(code) {
  cart[code] = (cart[code] || 0) + 1;
  renderCart();
  renderProducts();
}

function removeProduct(code) {
  if (!cart[code]) return;
  cart[code] = Math.max(0, cart[code] - 1);
  if (cart[code] === 0) delete cart[code];
  renderCart();
  renderProducts();
}

function clearCart() {
  for (const key of Object.keys(cart)) delete cart[key];
  renderCart();
  renderProducts();
}

function filteredProducts() {
  const term = query.trim().toLowerCase();
  return PRODUCTS_WITH_META.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(term) ||
      product.code.includes(term);
    
    const matchesCategory = currentCategory === "Todos" || product.category === currentCategory;
    
    return matchesSearch && matchesCategory;
  });
}

function renderCategories() {
  if (!categoryBar) return;
  
  const categories = ["Todos", "Abarrotes", "Panadería", "Limpieza", "Salsas", "Verdulería"];
  categoryBar.innerHTML = "";
  
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = `category-btn ${currentCategory === cat ? "active" : ""}`;
    btn.textContent = cat;
    btn.onclick = () => {
      currentCategory = cat;
      renderCategories();
      renderProducts();
      
      // Scroll suave al inicio de la lista
      document.querySelector(".products-header").scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    };
    categoryBar.appendChild(btn);
  });
}

function renderProducts() {
  const filtered = filteredProducts();
  const count = filtered.length;
  productCount.textContent = `(${count})`;
  productsGrid.innerHTML = "";

  if (count === 0) {
    emptyState.textContent = `No encontramos productos para "${query}".`;
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filtered.forEach((product) => {
    const qty = cart[product.code] || 0;
    const card = document.createElement("article");
    card.className = "product-card";
    const hasImage = !!product.image;
    card.innerHTML = `
      <div class="product-image-container" style="background-color: ${product.bgColor}">
        ${hasImage ? `
          <img src="${product.image}" alt="${product.name}" class="product-image" 
               onerror="console.warn('No se pudo cargar la imagen:', '${product.image}'); this.style.display='none'; this.nextElementSibling.style.display='flex'" />
          <div class="product-emoji-fallback" style="display:none">${product.emoji}</div>
        ` : `
          <div class="product-emoji-fallback" style="display:flex">${product.emoji}</div>
        `}
      </div>
      <div class="product-info">
        <span class="product-code">#${product.code}</span>
        <h4 class="product-name">${product.name}</h4>
        <p class="product-price">${formatCLP(product.price)}</p>
        <div class="product-actions">
          ${qty === 0 ? `<button data-action="add" data-code="${product.code}">Agregar</button>` : `
            <div class="quantity-controls">
              <button data-action="remove" data-code="${product.code}">−</button>
              <span>${qty}</span>
              <button data-action="add" data-code="${product.code}">+</button>
            </div>
          `}
        </div>
      </div>
    `;

    card.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;
        const code = button.dataset.code;
        if (action === "add") addProduct(code);
        if (action === "remove") removeProduct(code);
      });
    });

    productsGrid.appendChild(card);
  });
}

function renderCart() {
  const entries = Object.entries(cart);
  const count = entries.reduce((sum, [, qty]) => sum + qty, 0);
  cartCounter.textContent = count;

  const subtotal = entries.reduce((sum, [code, qty]) => {
    const product = PRODUCTS_WITH_META.find((item) => item.code === code);
    return product ? sum + product.price * qty : sum;
  }, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  if (entries.length === 0) {
    cartContent.innerHTML = '<p class="empty-cart">Aún no has agregado productos. ¡Elige tus frutas y verduras favoritas! 🥬</p>';
    clearButton.classList.add("hidden");
    return;
  }

  clearButton.classList.remove("hidden");

  const lines = entries
    .map(([code, qty]) => {
      const product = PRODUCTS_WITH_META.find((item) => item.code === code);
      if (!product) return "";
      const hasImage = !!product.image;
      return `
        <div class="cart-item">
          <div class="cart-item-img-container" style="background-color: ${product.bgColor}">
            ${hasImage ? `
              <img src="${product.image}" alt="${product.name}"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
              <div class="cart-emoji-fallback" style="display:none">${product.emoji}</div>
            ` : `
              <div class="cart-emoji-fallback" style="display:flex">${product.emoji}</div>
            `}
          </div>
          <div class="cart-item-info">
            <p class="cart-item-name">${product.name}</p>
            <p class="cart-item-meta">#${product.code} · ${qty} × ${formatCLP(product.price)}</p>
            <div class="cart-item-controls">
              <button data-action="remove" data-code="${product.code}">−</button>
              <button data-action="add" data-code="${product.code}">+</button>
            </div>
          </div>
          <div class="cart-item-total">${formatCLP(product.price * qty)}</div>
        </div>
      `;
    })
    .join("");

  const summary = `
    <div class="order-summary">
      <div class="summary-row"><span>Subtotal</span><strong>${formatCLP(subtotal)}</strong></div>
      <div class="summary-row"><span>Servientrega</span><strong>${shipping === 0 ? "GRATIS 🎉" : formatCLP(shipping)}</strong></div>
      ${subtotal < FREE_SHIPPING_THRESHOLD ? `<div class="summary-row"><span>Faltan para envío gratis</span><strong>${formatCLP(FREE_SHIPPING_THRESHOLD - subtotal)}</strong></div>` : ""}
      <div class="summary-row"><span>Total</span><strong>${formatCLP(total)}</strong></div>
      <button class="checkout-button" id="checkoutButton" ${loadingLocation ? "disabled" : ""}>${loadingLocation ? "Obteniendo ubicación..." : "Finalizar compra por WhatsApp"}</button>
      <p class="checkout-note">Compartiremos tu ubicación GPS para coordinar el envío.</p>
    </div>
  `;

  cartContent.innerHTML = lines + summary;

  cartContent.querySelectorAll("button[data-action]").forEach((button) => {
    const action = button.dataset.action;
    const code = button.dataset.code;
    button.addEventListener("click", () => {
      if (action === "add") addProduct(code);
      if (action === "remove") removeProduct(code);
    });
  });

  const checkoutButton = document.getElementById("checkoutButton");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", handleCheckout);
  }
}

searchInput.addEventListener("input", (event) => {
  query = event.target.value;
  renderProducts();
});

clearButton.addEventListener("click", clearCart);
cartButton.addEventListener("click", () => {
  document.getElementById("carrito").scrollIntoView({ behavior: "smooth" });
});

renderCategories();
renderProducts();
renderCart();
