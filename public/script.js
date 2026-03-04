let cart = [];

// Lista de productos disponibles
const products = [
  { name: "Huevo n°12 blanco", price: 15000 },
  { name: "Huevo n°12 negro", price: 15000 },
  {name:"Huevo n°12 mixto", price: 20000 },
  {name:"Huevo n°14 blanco", price: 20000 },
  { name: "Huevo n°14 negro", price: 20000 },
  {name:"Huevo n°14 mixto", price: 25000 },
  { name: "Huevo n°16 blanco", price: 25000 },
  { name: "Huevo n°16 negro", price: 25000 },
  { name: "Huevo n°16 mixto", price: 25000 },
 
];

// Renderizar botones de productos
function renderProducts() {
  const productsDiv = document.getElementById("products");
  productsDiv.innerHTML = "";
  products.forEach(p => {
    const btn = document.createElement("button");
    btn.innerText = `Agregar ${p.name} ($${p.price})`;
    btn.onclick = () => addToCart(p.name, p.price);
    productsDiv.appendChild(btn);
    productsDiv.appendChild(document.createElement("br"));
  });
}

// Agregar producto al carrito
function addToCart(product, price) {
  const existingItem = cart.find(item => item.product === product);
  if (existingItem) {
    existingItem.qty++;
  } else {
    cart.push({ product, price, qty: 1 });
  }
  renderCart();
}

// Renderizar carrito
function renderCart() {
  const cartTable = document.getElementById("cartTable");
  cartTable.innerHTML = "";
  cart.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.product}</td>
      <td>$${item.price}</td>
      <td>${item.qty}</td>
      <td><button onclick="removeFromCart(${index})">Eliminar</button></td>
    `;
    cartTable.appendChild(row);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("total").innerText = `Total: $${total}`;
}

// Eliminar producto del carrito
function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

// Guardar pedido
function saveOrder() {
  const vendedor = document.getElementById("sellerName").value.trim();
  const nombreCliente = document.getElementById("clientName").value.trim();
  const localidad = document.getElementById("clientLocalidad").value.trim();
  const fechaRetiro = document.getElementById("clientRetiro").value.trim();

  if (!vendedor || !nombreCliente || !localidad || !fechaRetiro || cart.length === 0) {
    alert("Por favor completa todos los campos y agrega productos al carrito.");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const order = {
    cliente: {
      vendedor,
      nombreCliente,
      localidad,
      fechaRetiro
    },
    carrito: cart.map(item => ({
      producto: item.product,
      precio: item.price,
      cantidad: item.qty
    })),
    total
  };

  fetch("http://localhost:3000/pedidos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  })
    .then(res => res.json())
    .then(data => {
      alert("Pedido guardado correctamente");
      cart = [];
      renderCart();
      document.getElementById("sellerName").value = "";
      document.getElementById("clientName").value = "";
      document.getElementById("clientLocalidad").value = "";
      document.getElementById("clientRetiro").value = "";
    })
    .catch(err => console.error("Error guardando pedido:", err));
}

// Inicializar productos al cargar la página
window.onload = renderProducts;