const catalog = document.getElementById("catalog");
const searchInput = document.getElementById("searchInput");
const brandFilter = document.getElementById("brandFilter");

const cartSidebar = document.getElementById("cartSidebar");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const whatsappButton = document.getElementById("whatsappButton");

const cartToggleBtn = document.getElementById("cartToggleBtn");
const mobileCartPanel = document.getElementById("mobileCartPanel");
const mobileCartItems = document.getElementById("mobileCartItems");
const mobileCartTotal = document.getElementById("mobileCartTotal");
const mobileWhatsappButton = document.getElementById("mobileWhatsappButton");

let cart = {};

function formatPrice(price) {
	return "$" + Number(price).toLocaleString("es-AR");
}

function renderProducts() {
	catalog.innerHTML = "";
	const search = searchInput.value.toLowerCase();
	const selectedBrand = brandFilter.value.toLowerCase();

	products.forEach(([brand, name, price]) => {
		const fullText = `${brand} ${name}`.toLowerCase();
		const brandMatch = selectedBrand === "" || brand.toLowerCase() === selectedBrand;

		if (fullText.includes(search) && brandMatch) {
			const key = `${brand}|${name}`;
			const qty = cart[key] ? cart[key].qty : 0;

			const div = document.createElement("div");
			div.className = "bg-white p-4 rounded-xl shadow-lg border-l-4 border-orange-400 transition hover:scale-[1.02] hover:shadow-2xl product-card";
			div.innerHTML = `
        <img src="img/mumi.png" alt="${name}" class="rounded mb-2 w-full h-40 object-cover"/>
        <h2 class="text-xl font-bold text-orange-600 h-14 product-name">${name}</h2>
        <p class="text-sm text-gray-500 font-medium">${brand}</p>
        <p class="text-lg text-green-600 font-semibold mb-2">${formatPrice(price)}</p>
        <div class="flex items-center justify-center space-x-2">
          <button data-key="${key}" data-action="decrease" class="qty-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">−</button>
          <span class="font-semibold text-lg">${qty}</span>
          <button data-key="${key}" data-action="increase" class="qty-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">+</button>
        </div>
      `;
			catalog.appendChild(div);
		}
	});
}

function renderCart() {
	const entries = Object.entries(cart);
	cartItems.innerHTML = "";
	mobileCartItems.innerHTML = "";
	let total = 0;

	entries.forEach(([key, item]) => {
		const itemTotal = item.qty * item.price;
		total += itemTotal;

		const cartRow = document.createElement("div");
		cartRow.className = "flex justify-between items-center border-b pb-1";

		cartRow.innerHTML = `
      <span>${item.brand} ${item.name} x${item.qty} - ${formatPrice(itemTotal)}</span>
      <div class="flex space-x-1">
        <button data-key="${key}" data-action="decrease" class="qty-btn bg-red-500 hover:bg-red-600 text-white px-2 rounded">−</button>
        <button data-key="${key}" data-action="increase" class="qty-btn bg-green-500 hover:bg-green-600 text-white px-2 rounded">+</button>
      </div>
    `;

		cartItems.appendChild(cartRow);

		const mobileRow = cartRow.cloneNode(true);
		mobileCartItems.appendChild(mobileRow);
	});

	cartTotal.textContent = formatPrice(total);
	mobileCartTotal.textContent = formatPrice(total);

	if (entries.length > 0) {
		const message = entries
			.map(([_, item]) => `- ${item.brand} ${item.name} x${item.qty} (${formatPrice(item.qty * item.price)})`)
			.join("%0A");
		const yourPhoneNumber = "nan"; // replace with your WhatsApp business number

		// when building the link:
		whatsappButton.href = `https://wa.me/${yourPhoneNumber}?text=${encodeURIComponent("Hola! Quiero pedir:\n" + message)}`;
		mobileWhatsappButton.href = whatsappButton.href;
	} else {
		whatsappButton.href = "#";
		mobileWhatsappButton.href = "#";
	}
}

// Unified event listener for all qty buttons (both cart and product cards)
document.addEventListener("click", e => {
	if (e.target.classList.contains("qty-btn")) {
		const key = e.target.dataset.key;
		const action = e.target.dataset.action;

		if (!cart[key]) {
			// If increasing, add item with qty 1
			if (action === "increase") {
				const [brand, name] = key.split("|");
				const product = products.find(p => p[0] === brand && p[1] === name);
				if (product) {
					cart[key] = { brand, name, price: Number(product[2]), qty: 1 };
				}
			}
		} else {
			if (action === "increase") {
				cart[key].qty++;
			} else if (action === "decrease") {
				cart[key].qty--;
				if (cart[key].qty <= 0) {
					delete cart[key];
				}
			}
		}

		renderCart();
		renderProducts(); // Update quantities on product cards
	}
});

// Populate brand filter dropdown
function populateBrandFilter() {
	const brands = [...new Set(products.map(p => p[0]))].sort((a, b) => a.localeCompare(b));
	brands.forEach(brand => {
		const option = document.createElement("option");
		option.value = brand;
		option.textContent = brand;
		brandFilter.appendChild(option);
	});
}

// Search and filter event listeners
searchInput.addEventListener("input", renderProducts);
brandFilter.addEventListener("change", renderProducts);

// Cart toggle button on mobile
cartToggleBtn.addEventListener("click", () => {
	if (mobileCartPanel.classList.contains("translate-y-full")) {
		mobileCartPanel.classList.remove("translate-y-full");
	} else {
		mobileCartPanel.classList.add("translate-y-full");
	}
});

// Mobile cart close button
document.getElementById("mobileCartCloseBtn").addEventListener("click", () => {
	mobileCartPanel.classList.add("translate-y-full");
});

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
	populateBrandFilter();
	renderProducts();
	renderCart();
});
