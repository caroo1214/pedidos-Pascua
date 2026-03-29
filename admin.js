let pedidos = []; // variable global

function loadOrders() {
  fetch("/pedidos")
    .then(res => res.json())
    .then(data => {
      pedidos = data;
      pedidos.sort((a, b) => new Date(a.cliente.fechaRetiro) - new Date(b.cliente.fechaRetiro));
      renderOrdersTable();
      renderProductQuantities(pedidos);
    })
    .catch(err => console.error("Error cargando pedidos:", err));
}

function renderOrdersTable() {
  const table = document.getElementById("ordersTable");
  table.innerHTML = "";

  pedidos.forEach(p => {
    if (!p.estado) p.estado = "Pendiente";
    if (p.impreso === undefined) p.impreso = false; // nuevo campo

    const row = document.createElement("tr");
    row.setAttribute("data-id", p._id);

    if (p.estado === "Entregado") {
      row.style.textDecoration = "line-through";
      row.style.color = "gray";
    }

    row.innerHTML = `
      <td>${new Date(p.fecha).toLocaleString()}</td>
      <td>${p.cliente.vendedor || "-"}</td>
      <td>${p.cliente.nombreCliente}</td>
      <td>${p.cliente.localidad}</td>
      <td>${p.cliente.fechaRetiro}</td>
      <td>${p.carrito.map(item => `${item.cantidad} x ${item.producto} ($${item.precio})`).join("<br>")}</td>
      <td>$${p.total}</td>
      <td>${p.estado}</td>
      <td>
        <input type="checkbox" ${p.impreso ? "checked" : ""} 
               onchange="toggleImpreso('${p._id}', this.checked)">
      </td>
      <td>
        <button onclick="toggleEstado('${p._id}')">
          ${p.estado === "Pendiente" ? "Marcar Entregado" : "Marcar Pendiente"}
        </button>
        <button onclick="deleteOrder('${p._id}')">Eliminar</button>
        <button onclick="downloadPDF('${p._id}')">PDF</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function renderProductQuantities(pedidos) {
  const quantities = {};
  pedidos.forEach(p => {
    if (p.estado === "Pendiente") {
      p.carrito.forEach(item => {
        if (!quantities[item.producto]) {
          quantities[item.producto] = 0;
        }
        quantities[item.producto] += item.cantidad;
      });
    }
  });

  const tableBody = document.getElementById("productQuantitiesTable");
  tableBody.innerHTML = "";

  Object.entries(quantities).forEach(([producto, cantidad]) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${producto}</td><td>${cantidad}</td>`;
    tableBody.appendChild(row);
  });
}

function filterBySeller() {
  const vendedor = document.getElementById("filterSeller").value.trim();
  if (!vendedor) {
    alert("Por favor ingresa un nombre de vendedor.");
    return;
  }

  fetch(`/pedidos/vendedor/${vendedor}`)
    .then(res => res.json())
    .then(data => {
      pedidos = data;
      pedidos.sort((a, b) => new Date(a.cliente.fechaRetiro) - new Date(b.cliente.fechaRetiro));
      renderOrdersTable();
      renderProductQuantities(pedidos);
    })
    .catch(err => console.error("Error filtrando pedidos:", err));
}

function deleteOrder(id) {
  if (confirm("¿Seguro que quieres eliminar este pedido?")) {
    fetch(`/pedidos/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(data => {
        alert(data.mensaje);
        loadOrders();
      })
      .catch(err => console.error("Error eliminando pedido:", err));
  }
}

function downloadPDF(id) {
  window.open(`/pedidos/${id}/pdf`, "_blank");
}

function toggleEstado(id) {
  const pedido = pedidos.find(p => p._id === id);
  if (!pedido) return;
  pedido.estado = pedido.estado === "Pendiente" ? "Entregado" : "Pendiente";
  renderOrdersTable();
  renderProductQuantities(pedidos);
}

// Nuevo: marcar como impreso
function toggleImpreso(id, checked) {
  const pedido = pedidos.find(p => p._id === id);
  if (!pedido) return;
  pedido.impreso = checked;
  // Podés agregar aquí un fetch PUT para guardar en backend si querés
}

window.onload = loadOrders;