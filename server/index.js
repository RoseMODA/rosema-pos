// server/index.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Afip from "@afipsdk/afip.js";
import fs from "fs";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🧾 Instancia del SDK (usa CUIT de prueba si no tenés certificado todavía)
const afip = new Afip({ CUIT: 20409378472 });

/**
 * 📦 Endpoint principal para emitir facturas electrónicas
 * Permite Factura A (1), B (6) o C (11)
 */
app.post("/api/facturas", async (req, res) => {
  try {
    const { total, metodoPago, tipoFactura = "C", cliente = {} } = req.body;

    // Solo se factura si el pago fue electrónico
    if (!["tarjeta_credito", "tarjeta_debito", "qr"].includes(metodoPago)) {
      return res.status(400).json({ error: "El método de pago no requiere factura electrónica" });
    }

    // Asignamos tipo de factura según el parámetro
    const tipoMap = { A: 1, B: 6, C: 11 };
    const cbteTipo = tipoMap[tipoFactura.toUpperCase()] || 11;

    // Obtenemos el último comprobante autorizado
    const lastVoucher = await afip.ElectronicBilling.getLastVoucher(1, cbteTipo);
    const newVoucherNumber = lastVoucher + 1;

    const fecha = new Date().toISOString().split("T")[0];

    // Datos básicos de la factura
    const data = {
      CantReg: 1,
      PtoVta: 1,
      CbteTipo: cbteTipo,
      Concepto: 1, // Productos
      DocTipo: cliente.docTipo || 99, // 99 = Consumidor final
      DocNro: cliente.docNro || 0,
      CbteDesde: newVoucherNumber,
      CbteHasta: newVoucherNumber,
      CbteFch: parseInt(fecha.replace(/-/g, "")),
      ImpTotal: total,
      ImpTotConc: 0,
      ImpNeto: cbteTipo === 1 || cbteTipo === 6 ? total / 1.21 : total, // para A/B separar IVA
      ImpOpEx: 0,
      ImpIVA: cbteTipo === 1 || cbteTipo === 6 ? total - total / 1.21 : 0,
      ImpTrib: 0,
      MonId: "PES",
      MonCotiz: 1,
      CondicionIVAReceptorId: cliente.condicionIVA || 5, // consumidor final
    };

    if (cbteTipo === 1 || cbteTipo === 6) {
      // Agregar IVA si corresponde
      data.Iva = [
        {
          Id: 5, // 21%
          BaseImp: total / 1.21,
          Importe: total - total / 1.21,
        },
      ];
    }

    // Creamos la factura electrónica
    const factura = await afip.ElectronicBilling.createVoucher(data);

    // Creamos PDF automático con el comprobante
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Factura ${tipoFactura}</h2>
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Número:</strong> ${newVoucherNumber}</p>
          <p><strong>Total:</strong> $${total}</p>
          <p><strong>CAE:</strong> ${factura.CAE}</p>
          <p><strong>Vencimiento CAE:</strong> ${factura.CAEFchVto}</p>
          <hr />
          <p>POS Rosema — Facturación electrónica con AFIP SDK</p>
        </body>
      </html>
    `;

    const pdfRes = await afip.ElectronicBilling.createPDF({
      html,
      file_name: `factura_${tipoFactura}_${newVoucherNumber}`,
      options: {
        width: 8,
        marginLeft: 0.4,
        marginRight: 0.4,
        marginTop: 0.4,
        marginBottom: 0.4,
      },
    });

    res.json({
      mensaje: `Factura ${tipoFactura} generada correctamente`,
      cae: factura.CAE,
      vencimiento: factura.CAEFchVto,
      numero: newVoucherNumber,
      pdf: pdfRes.file, // URL de descarga
    });
  } catch (error) {
    console.error("❌ Error al generar factura:", error);
    res.status(500).json({
      error: "Error al generar factura",
      detalle: error.message,
    });
  }
});

app.listen(3001, () =>
  console.log("🧾 Servidor AFIP SDK activo en puerto 3001 (Facturas A, B y C + PDF)")
);
