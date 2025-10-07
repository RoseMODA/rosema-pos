// src/services/arcaService.js
export async function subirFacturaARCA(factura) {
  const response = await fetch("http://localhost:3001/api/facturas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(factura),
  });

  return await response.json();
}
