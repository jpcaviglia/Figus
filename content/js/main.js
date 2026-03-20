let products = [];
let cart = {};

const $ = id => document.getElementById(id);
const format = n => "$" + n.toLocaleString("es-AR");

let toastTimer;

function toast(msg) {
   const t = $("toast");

   clearTimeout(toastTimer);

   t.textContent = msg;
   t.classList.remove("opacity-0", "translate-y-3");
   t.classList.add("opacity-100", "translate-y-0");

   toastTimer = setTimeout(() => {
      t.classList.remove("opacity-100", "translate-y-0");
      t.classList.add("opacity-0", "translate-y-3");
   }, 1600);
}

let currentSlide = 0;

function renderCarousel() {
   const featured = products.slice(0, 5);

   $("carousel").innerHTML = featured.map(p => `
      <div class="min-w-full h-56 relative">
         <img src="${p.img}" class="w-full h-full object-cover"/>

         <!-- overlay -->
         <div class="absolute bottom-0 left-0 right-0 bg-black/40 text-white p-4">
            <div class="font-medium">${p.name}</div>
         </div>
      </div>
   `).join("");
}
function updateCarousel() {
   $("carousel").style.transform = `translateX(-${currentSlide * 100}%)`;
}

function nextSlide() {
   const max = $("carousel").children.length;
   currentSlide = (currentSlide + 1) % max;
   updateCarousel();
}

function prevSlide() {
   const max = $("carousel").children.length;
   currentSlide = (currentSlide - 1 + max) % max;
   updateCarousel();
}

async function loadProducts() {
   const res = await fetch('content/products.json');
   products = await res.json();

   renderCarousel(); // ADD THIS
   renderProducts();
}

function scrollToContact() {
   document.getElementById("contacto").scrollIntoView({
      behavior: "smooth"
   });
}
function renderProducts() {
   const search = $("search").value.toLowerCase();
  

   const sorted = [...products].sort((a, b) =>
      a.name.localeCompare(b.name, "es")
   );

   const filtered = sorted
      .filter(p => p.name.toLowerCase().includes(search));

   if (filtered.length === 0) {
      $("products").innerHTML = `
      <div class="col-span-full text-center py-16 text-gray-500">
         <div class="text-lg font-medium">No se encontraron resultados</div>
         <div class="text-sm mt-1">Intentá con otra búsqueda</div>
      </div>
   `;
      return;
   }

   $("products").innerHTML = filtered.map(p => `
<div class="group bg-white/80 backdrop-blur rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 min-h-[320px]">

    <!-- IMAGE -->
    <div class="relative overflow-hidden rounded-2xl cursor-pointer"
         onclick="openViewer('${p.img}')">

      <img src="${p.img}"
           class="w-full h-56 object-cover transition duration-500 group-hover:scale-110"/>

      <!-- subtle overlay -->
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
    </div>

    <!-- INFO -->
    <div class="pt-3 px-1">
      <h3 class="font-medium text-[15px] leading-tight">${p.name}</h3>
      <div class="text-2xl font-semibold mt-1 tracking-tight">${format(p.price)}</div>
    </div>

    <!-- ACTIONS -->
    <div class="flex items-center justify-between mt-3">

      <!-- qty pill -->
      <div class="flex items-center gap-2 bg-gray-100/80 backdrop-blur rounded-full px-2 py-1">
        <button onclick="setQty(${p.id}, getQty(${p.id})-1)"
                class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white transition">−</button>

        <input data-id="${p.id}"
               value="${getQty(p.id)}"
               onchange="setQty(${p.id}, this.value)"
               class="w-8 text-center bg-transparent text-sm outline-none" />

        <button onclick="setQty(${p.id}, getQty(${p.id})+1)"
                class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white transition">+</button>
      </div>

      <!-- add button -->
      <button onclick="quickAdd(${p.id})"
              class="bg-black text-white text-sm px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition">
        Agregar al pedido
      </button>

    </div>
  </div>
`).join("");
}
function openViewer(src) {
   const v = $("viewer");
   const img = $("viewerImg");

   img.src = src;

   v.classList.remove("opacity-0", "pointer-events-none");
   img.classList.remove("scale-95");
   img.classList.add("scale-100");
}

$("viewer").onclick = () => {
   const v = $("viewer");
   const img = $("viewerImg");

   v.classList.add("opacity-0", "pointer-events-none");
   img.classList.add("scale-95");
};
function getQty(id) { return cart[id]?.qty || 0 }

function setQty(id, val) {
   const qty = Math.max(0, parseInt(val) || 0);
   const product = products.find(p => p.id === id);

   if (qty === 0) delete cart[id];
   else cart[id] = { qty, product };

   updateUI();
}

function quickAdd(id) {
   setQty(id, getQty(id) + 1);
   toast("Producto agregado");
}

function removeItem(id) {
   delete cart[id];
   toast("Producto eliminado");
   updateUI();
}
function updateProductQtyUI() {
   products.forEach(p => {
      const input = document.querySelector(`input[data-id="${p.id}"]`);
      if (input) input.value = getQty(p.id);
   });
}


function updateUI() {
   updateProductQtyUI(); 
   renderCart();
}

function renderCart() {
   const items = Object.values(cart);
   let total = 0;

   $("cartItems").innerHTML = items.map(i => {
      total += i.qty * i.product.price;
      return `
       <div class="flex gap-3 items-center border-b pb-3">
         <img src="${i.product.img}" class="w-14 h-14 object-cover rounded-lg"/>
         <div class="flex-1">
           <div class="font-medium">${i.product.name}</div>
           <div class="text-sm text-gray-500">${format(i.qty * i.product.price)}</div>
         </div>

         <input value="${i.qty}" onchange="setQty(${i.product.id}, this.value)" class="w-12 border rounded text-center" />

         <button onclick="removeItem(${i.product.id})" class="text-red-500 hover:text-red-700">
           <i data-lucide="x"></i>
         </button>
       </div>
      `;
   }).join("");

   $("cartTotal").textContent = "Total: " + format(total);

   const count = items.reduce((a, b) => a + b.qty, 0);
   $("floatingCart").classList.toggle("hidden", count === 0);
   $("cartCount").textContent = count;

   lucide.createIcons();
}

$("floatingCart").onclick = () => $("cartPanel").classList.remove("translate-x-full");
$("closeCart").onclick = () => $("cartPanel").classList.add("translate-x-full");

$("search").oninput = renderProducts;

$("checkoutBtn").onclick = () => {
   let msg = "Pedido:%0A";
   let total = 0;
   Object.values(cart).forEach(i => {
      msg += `${i.product.name} x${i.qty}%0A`;
      total += i.qty * i.product.price;
   });
   msg += `Total: ${format(total)}`;
   window.open(`https://wa.me/1165532173?text=${msg}`);
}

loadProducts();
setInterval(nextSlide, 4000);
lucide.createIcons();