let pedidos = []; // variable global

// Cargar todos los pedidos
function loadOrders() {
  fetch("http://localhost:3000/pedidos")
    .then(res => res.json())
    .then(data => {
      pedidos = data;

      // Ordenar por fecha de retiro (ascendente)
      pedidos.sort((a, b) => new Date(a.cliente.fechaRetiro) - new Date(b.cliente.fechaRetiro));

      const table = document.getElementById("ordersTable");
      table.innerHTML = "";
      pedidos.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(p.fecha).toLocaleString()}</td>
          <td>${p.cliente.vendedor || "-"}</td>
          <td>${p.cliente.nombreCliente}</td>
          <td>${p.cliente.localidad}</td>
          <td>${p.cliente.fechaRetiro}</td>
          <td>${p.carrito.map(item => `${item.cantidad} x ${item.producto} ($${item.precio})`).join("<br>")}</td>
          <td>$${p.total}</td>
          <td>
            <button onclick="deleteOrder('${p._id}')">Eliminar</button>
            <button onclick="downloadPDF('${p._id}')">PDF</button>
          </td>
        `;
        table.appendChild(row);
      });

      renderProductQuantities(pedidos);
    })
    .catch(err => console.error("Error cargando pedidos:", err));
}

// Renderizar tabla de cantidades por producto
function renderProductQuantities(pedidos) {
  const quantities = {};
  pedidos.forEach(p => {
    p.carrito.forEach(item => {
      if (!quantities[item.producto]) {
        quantities[item.producto] = 0;
      }
      quantities[item.producto] += item.cantidad;
    });
  });

  const tableBody = document.getElementById("productQuantitiesTable");
  tableBody.innerHTML = "";

  Object.entries(quantities).forEach(([producto, cantidad]) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${producto}</td>
      <td>${cantidad}</td>
    `;
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

  fetch(`http://localhost:3000/pedidos/vendedor/${vendedor}`)
    .then(res => res.json())
    .then(data => {
      pedidos = data;

      // Ordenar por fecha de retiro (ascendente)
      pedidos.sort((a, b) => new Date(a.cliente.fechaRetiro) - new Date(b.cliente.fechaRetiro));

      const table = document.getElementById("ordersTable");
      table.innerHTML = "";
      if (pedidos.length === 0) {
        table.innerHTML = "<tr><td colspan='8'>No hay pedidos para este vendedor.</td></tr>";
        return;
      }
      pedidos.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(p.fecha).toLocaleString()}</td>
          <td>${p.cliente.vendedor}</td>
          <td>${p.cliente.nombreCliente}</td>
          <td>${p.cliente.localidad}</td>
          <td>${p.cliente.fechaRetiro}</td>
          <td>${p.carrito.map(item => `${item.cantidad} x ${item.producto} ($${item.precio})`).join("<br>")}</td>
          <td>$${p.total}</td>
          <td>
            <button onclick="deleteOrder('${p._id}')">Eliminar</button>
            <button onclick="downloadPDF('${p._id}')">PDF</button>
          </td>
        `;
        table.appendChild(row);
      });

      renderProductQuantities(pedidos);
    })
    .catch(err => console.error("Error filtrando pedidos:", err));
}

// Eliminar pedido
function deleteOrder(id) {
  if (confirm("¿Seguro que quieres eliminar este pedido?")) {
    fetch(`http://localhost:3000/pedidos/${id}`, { method: "DELETE" })
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
  window.open(`http://localhost:3000/pedidos/${id}/pdf`, "_blank");
}

// Cargar pedidos al iniciar
window.onload = loadOrders;