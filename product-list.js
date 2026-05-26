const WHATSAPP_NUMBER = "573114454660";
const SHIPPING_COST = 5000;
const FREE_SHIPPING_THRESHOLD = 30000;

const PRODUCTS = [
  ["1001", "Manzana Roja", 1690, "src/manzana.jpeg"],
  ["1002", "Kiwi", 1690 ,"src/kiwi.jpeg"],
  ["1003", "Limón", 1390,"src/limon.jpeg"],
  ["1004", "Pera", 1690, "src/pera.jpeg"],
  ["1005", "Mandarinas", 1990, "src/mandarina.jpeg"],
  ["1006", "Tomates Bandeja", 1490],
  ["1007", "Zapallo Italiano", 1490],
  ["1008", "Pepinos", 1290],
  ["1009", "Zanahoria", 1190],
  ["1010", "Cebollas", 990],
  ["1011", "Brócoli", 1590],
  ["1012", "Coliflor", 1990],
  ["1013", "Zapallo Camote", 990],
  ["1014", "Mongoliana", 1690],
  ["1015", "Champiñón Laminado", 1690],
  ["1016", "Mangos", 1490],
  ["1017", "Tomates Cherry", 1990],
  ["1018", "Choclos", 1490],
  ["1019", "Ajo", 990],
  ["1020", "Ají Chileno", 990],
  ["1021", "Poroto Verde", 1290],
  ["1022", "Albaca", 990],
  ["1023", "Espinaca", 790],
  ["1024", "Acelga Bolsa", 790],
  ["1025", "Perejil", 790],
  ["1026", "Pimentón Verde", 490],
  ["1027", "Pimentón Rojo", 990],
  ["1028", "Cilantro", 790],
  ["1029", "Escarolas", 990],
  ["1030", "Plátanos por Kilo", 1490],
  ["1031", "Costinas", 1290],
  ["1032", "Acelga Paquete", 2490],
  ["1033", "Cebollín", 990],
  ["1034", "Beterragas", 1490],
  ["1035", "Papa Tierra", 1990],
  ["1036", "Genjibre", 590],
  ["1037", "Manzana Pablo", 1490],
  ["1038", "Ciboulette", 490],
  ["1039", "Frutillas", 1990],
  ["1040", "Cebolla Morada", 990],
  ["1041", "Cazuelas", 2490],
  ["1042", "Ensaladas", 1290],
  ["1043", "Mentas", 490],
  ["1044", "Uvas", 1590],
  ["1045", "Plátano Maduro", 2190],
  ["1046", "Shapsui", 1690],
  ["1048", "Naranja", 1690],
  ["1049", "Ciruela", 1690],
  ["1050", "Membrillos", 1690],
  ["1051", "Champiñón Entero", 2290],
  ["1052", "Piña", 2990],
  ["1053", "Lechuga Marina", 990],
  ["1054", "Lechuga Escarola", 1290],
  ["1055", "Poroto Verde Picado", 790],
  ["1056", "Mix Verdura Picada", 1490],
  ["1057", "Papa Lavada", 1990],
  ["1058", "Papa Camote", 2490],
  ["1059", "Tomate Granel", 1690],
  ["1061", "Manzana Verde", 1690],
  ["1062", "Pepino Fruta", 1690],
  ["1063", "Mancaqui", 1990],
];

const PRODUCTS_WITH_META = PRODUCTS.map(([code, name, price, imageUrl]) => {
  const { emoji, color } = styleFor(name);

  return {
    code,
    name,
    price,
    emoji,
    bgColor: color,
    image: imageUrl || "", // Ahora se queda vacío por defecto
  };
});

const cart = {};
let loadingLocation = false;
let query = "";

const productsGrid = document.getElementById("productsGrid");
const productCount = document.getElementById("productCount");
const cartCounter = document.getElementById("cartCounter");
const cartContent = document.getElementById("cartContent");
const clearButton = document.getElementById("clearButton");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");
const searchInput = document.getElementById("searchInput");
const cartButton = document.getElementById("cartButton");

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
  return PRODUCTS_WITH_META.filter((product) => {
    const term = query.trim().toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.code.includes(term)
    );
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
  checkoutButton.addEventListener("click", handleCheckout);
}

searchInput.addEventListener("input", (event) => {
  query = event.target.value;
  renderProducts();
});

clearButton.addEventListener("click", clearCart);
cartButton.addEventListener("click", () => {
  document.getElementById("carrito").scrollIntoView({ behavior: "smooth" });
});

renderProducts();
renderCart();
