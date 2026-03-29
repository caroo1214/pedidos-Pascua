let pedidos = []; // variable global

// Cargar todos los pedidos
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

// Renderizar tabla de pedidos
function renderOrdersTable() {
  const table = document.getElementById("ordersTable");
  table.innerHTML = "";

  pedidos.forEach(p => {
    if (!p.estado) p.estado = "Pendiente"; // estado inicial
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

// Renderizar tabla de cantidades por producto
function renderProductQuantities(pedidos) {
  const quantities = {};
  pedidos.forEach(p => {
    if (p.estado === "Pendiente") { // solo contar pendientes
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

// Filtrar pedidos por vendedor
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

// Eliminar pedido
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

// Descargar PDF
function downloadPDF(id) {
  window.open(`/pedidos/${id}/pdf`, "_blank");
}

// Cambiar estado Pendiente <-> Entregado y guardar en servidor
function toggleEstado(id) {
  const pedido = pedidos.find(p => p._id === id);
  if (!pedido) return;

  pedido.estado = pedido.estado === "Pendiente" ? "Entregado" : "Pendiente";

  fetch(`/pedidos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: pedido.estado })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Estado actualizado:", data);
    renderOrdersTable();
    renderProductQuantities(pedidos);
  })
  .catch(err => console.error("Error actualizando estado:", err));
}

// Marcar como impreso y guardar en servidor
function toggleImpreso(id, checked) {
  const pedido = pedidos.find(p => p._id === id);
  if (!pedido) return;

  pedido.impreso = checked;

  fetch(`/pedidos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ impreso: pedido.impreso })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Impreso actualizado:", data);
  })
  .catch(err => console.error("Error actualizando impreso:", err));
}

window.onload = loadOrders;