const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const PDFDocument = require("pdfkit");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://localhost:27017/pedidosDB");

// Esquema de pedidos
const pedidoSchema = new mongoose.Schema({
  cliente: {
    vendedor: String,
    nombreCliente: String,
    localidad: String,
    fechaRetiro: String
  },
  carrito: [
    {
      producto: String,
      precio: Number,
      cantidad: Number
    }
  ],
  total: Number,
  fecha: { type: Date, default: Date.now }
});

const Pedido = mongoose.model("Pedido", pedidoSchema);

// Crear pedido
app.post("/pedidos", async (req, res) => {
  try {
    const nuevoPedido = new Pedido(req.body);
    await nuevoPedido.save();
    res.json({ id: nuevoPedido._id, mensaje: "Pedido guardado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al guardar el pedido" });
  }
});

// Listar todos los pedidos
app.get("/pedidos", async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ fecha: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
});

// Eliminar pedido
app.delete("/pedidos/:id", async (req, res) => {
  try {
    await Pedido.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Pedido eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el pedido" });
  }
});

// Editar pedido
app.put("/pedidos/:id", async (req, res) => {
  try {
    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ mensaje: "Pedido actualizado correctamente", pedido: pedidoActualizado });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el pedido" });
  }
});

// Filtrar por vendedor
app.get("/pedidos/vendedor/:vendedor", async (req, res) => {
  try {
    const pedidos = await Pedido.find({ "cliente.vendedor": req.params.vendedor }).sort({ fecha: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener pedidos del vendedor" });
  }
});

// PDF
app.get("/pedidos/:id/pdf", async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=pedido_${pedido._id}.pdf`);

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text("Comprobante de Pedido", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Vendedor: ${pedido.cliente.vendedor}`);
    doc.text(`Cliente: ${pedido.cliente.nombreCliente}`);
    doc.text(`Localidad: ${pedido.cliente.localidad}`);
    doc.text(`Fecha de Retiro: ${pedido.cliente.fechaRetiro}`);
    doc.moveDown();

    doc.text("Productos:");
    pedido.carrito.forEach(item => {
      doc.text(`- ${item.cantidad} x ${item.producto} ($${item.precio})`);
    });
    doc.moveDown();

    doc.text(`Total: $${pedido.total}`, { align: "right" });
    doc.text(`Fecha: ${new Date(pedido.fecha).toLocaleString()}`, { align: "right" });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: "Error al generar PDF" });
  }
});

app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));