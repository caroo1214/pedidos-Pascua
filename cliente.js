function loadClientOrders() {
  const vendedor = document.getElementById("clientNumberLookup").value.trim();

  if (!vendedor) {
    alert("Por favor ingresa tu nombre de vendedor.");
    return;
  }

  fetch(`http://localhost:3000/pedidos/vendedor/${vendedor}`)
    .then(res => res.json())
    .then(pedidos => {
      const table = document.getElementById("clientOrdersTable");
      table.innerHTML = "";

      if (pedidos.length === 0) {
        table.innerHTML = "<tr><td colspan='5'>No hay pedidos para este vendedor.</td></tr>";
        return;
      }

      pedidos.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(p.fecha).toLocaleString()}</td>
          <td>${p.cliente.nombreCliente}</td>
          <td>${p.cliente.localidad}</td>
          <td>${p.carrito.map(item => `${item.cantidad} x ${item.producto} ($${item.precio})`).join("<br>")}</td>
          <td>$${p.total}</td>
        `;
        table.appendChild(row);
      });
    })
    .catch(err => console.error("Error cargando pedidos:", err));
}