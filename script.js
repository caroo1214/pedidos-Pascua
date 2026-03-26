let cart = [];

function addToCart(product, price) {
  const existingItem = cart.find(item => item.product === product);
  if (existingItem) {
    existingItem.qty++;
  } else {
    cart.push({ product, price, qty: 1 });
  }
  renderCart();
}

function addSelectedProducts() {
  const huevo11 = document.getElementById("huevo11").value;
  const huevo14 = document.getElementById("huevo14").value;
  const huevo16 = document.getElementById("huevo16").value;
  const huevo25 = document.getElementById("huevo25").value;
  const huevo30 = document.getElementById("huevo30").value;
  
  // 🔹 Rosca de Pascua
  const roscaSelect = document.getElementById("roscaPascua");
  const roscaOption = roscaSelect.options[roscaSelect.selectedIndex];
  const roscaValue = roscaOption.value;
  const roscaPrice = roscaOption.getAttribute("data-price");

  if (huevo11) addToCart(`Huevo n°11 (${huevo11})`, 8000);
  if (huevo14) addToCart(`Huevo n°14 (${huevo14})`, 13000);
  if (huevo16) addToCart(`Huevo n°16 (${huevo16})`, 19000);
  if (huevo25) addToCart(`Huevo n°25 (${huevo25})`, 45000);
  if (huevo30) addToCart(`Huevo n°30 (${huevo30})`, 75000);
  if (roscaValue) addToCart(`Rosca de Pascua (${roscaValue})`, parseInt(roscaPrice));


  // 🔹 Limpiar selects después de agregar
  document.getElementById("huevo11").value = "";
  document.getElementById("huevo14").value = "";
  document.getElementById("huevo16").value = "";
  document.getElementById("huevo25").value = "";
  document.getElementById("huevo30").value = "";
    document.getElementById("roscaPascua").value = "";

}

function renderCart() {
  const cartTable = document.getElementById("cartTable");
  cartTable.innerHTML = "";
  cart.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.product}</td>
      <td>$${item.price}</td>
      <td>
        <input type="number" min="1" value="${item.qty}" 
               onchange="updateQty(${index}, this.value)">
      </td>
      <td><button onclick="removeFromCart(${index})">Eliminar</button></td>
    `;
    cartTable.appendChild(row);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("total").innerText = `Total: $${total}`;
}

function updateQty(index, newQty) {
  cart[index].qty = parseInt(newQty);
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

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
    cliente: { vendedor, nombreCliente, localidad, fechaRetiro },
    carrito: cart.map(item => ({
      producto: item.product,
      precio: item.price,
      cantidad: item.qty
    })),
    total
  };

  fetch("/pedidos", {
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