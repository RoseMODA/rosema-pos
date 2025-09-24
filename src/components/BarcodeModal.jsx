import React, { useEffect, useMemo, useRef, useState } from "react";
import JsBarcode from "jsbarcode";

// === Utilidad para formatear precio ===
const fmtARS = (n) =>
  (n ?? "") === "" ? "" : new Intl.NumberFormat("es-AR").format(Number(n));

// === Código de barras en SVG (se dibuja al montar) ===
const BarcodeSVG = ({ value, height = 60, width = 1.2 }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && value) {
      JsBarcode(ref.current, String(value).toUpperCase(), {
        format: "CODE39",
        lineColor: "#000000",
        width: 1.5,   // barras seguras
        height: 60,
        displayValue: false,
        margin: 0,   // deja solo uno
      });

    }
  }, [value, height, width]);

  return (
    <svg
      ref={ref}
      style={{ maxWidth: "35mm", height: `15mm`, display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    />
  );
};




// === Etiqueta 2×1 pulgadas ===
// 100% inline styles para no depender de Tailwind en la impresión/iframe.
const Label2x1 = ({ product, talle, price }) => {
  const displayTalle =
    String(talle || "").trim().toLowerCase() === "unico" ? "u" : (talle ?? "-");

  return (
    <div
      style={{
        width: "35.8mm",
        height: "25.4mm",
        boxSizing: "border-box",
        padding: "4px",
        fontFamily: "system-ui, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Talle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontWeight: 700,
          justifyContent: "center",
          width: "100%",
          fontSize: "15px",
          lineHeight: 1,
          gap: "4px",
        }}
      >
        <span>Talle</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            width: "60px",
            height: "25px",
            borderRadius: "9999px",
            border: "1.5px solid #000",
            fontSize: "24px",
            textTransform: "uppercase",

          }}
        >
          {displayTalle}
        </div>
      </div>

      {/* Nombre producto */}
      <div
        style={{
          fontWeight: 700,
          fontSize: "9px",
          marginTop: "2px",
          maxWidth: "30mm",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "center",
        }}
        title={product?.articulo || ""}
      >
        {String(product?.articulo || "").toUpperCase()}
      </div>

      {/* Código de barras */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <BarcodeSVG value={product?.id} height={60} width={1.5} />
      </div>

      {/* ID */}
      <div style={{ fontSize: "9px", textAlign: "center" }}>
        {String(product?.id || "").toUpperCase()}
      </div>

      {/* Precio */}
      {price !== "" && (
        <div style={{ fontWeight: 800, fontSize: "17px", marginTop: "0.2px" }}>
          ${fmtARS(price)}
        </div>
      )}
    </div>
  );
};


// === Modal + impresión robusta por iframe oculto ===
const BarcodeModal = ({ isOpen, onClose, product }) => {
  const [showPrice, setShowPrice] = useState(false);
  const [customPrice, setCustomPrice] = useState("");
  const [selected, setSelected] = useState({});
  const priceToShow = customPrice || product?.precioCosto || "";

  // Referencia al contenedor de impresión (pre-renderizado y oculto off-screen)
  const printRef = useRef(null);

  const toggleAllTalles = (checked) => {
    const newSelected = {};
    (product?.variantes || []).forEach((v) => {
      newSelected[v.talle] = { checked, qty: selected[v.talle]?.qty || 1 };
    });
    setSelected(newSelected);
  };



  // Talle para previsualización
  const previewTalle = useMemo(() => {
    const firstSel = Object.entries(selected).find(([, v]) => v?.checked)?.[0];
    return firstSel ?? product?.variantes?.[0]?.talle ?? "-";
  }, [selected, product]);

  // Eliminar talles repetidos (conservando el primero que aparece)
  const uniqueVariantes = useMemo(() => {
    const seen = new Set();
    return (product?.variantes || []).filter(v => {
      if (seen.has(v.talle)) return false;
      seen.add(v.talle);
      return true;
    });
  }, [product]);

  // Lista de etiquetas a imprimir
  const labels = useMemo(() => {
    const out = [];
    uniqueVariantes.forEach((v) => {
      const t = v.talle;
      const row = selected[t];
      if (row?.checked) {
        const qty = Math.max(1, Number(row.qty) || 1);
        for (let i = 0; i < qty; i++) out.push({ talle: t });
      }
    });
    return out.length ? out : [{ talle: previewTalle }];
  }, [uniqueVariantes, selected, previewTalle]);




  if (!isOpen || !product) return null;

  const toggleTalle = (talle, checked) =>
    setSelected((p) => ({ ...p, [talle]: { checked, qty: p[talle]?.qty || 1 } }));

  const setQty = (talle, qty) =>
    setSelected((p) => ({ ...p, [talle]: { ...(p[talle] || { checked: true }), qty } }));

  const handlePrint = () => {
    // Pequeño delay para asegurar que los SVG de JsBarcode terminaron de dibujarse.
    setTimeout(() => {
      const mount = printRef.current;
      if (!mount) return;

      const html = mount.innerHTML;

      // Crea iframe oculto y escribe documento listo para imprimir
      const iframe = document.createElement("iframe");
      iframe.setAttribute("aria-hidden", "true");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>print</title>
<style>
  /* Forzamos tamaño exacto de página y sin márgenes */
  @page { size: 50.8mm 25.4mm; margin: 0; }
  html, body { margin: 0; padding: 0; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  /* contenedor por etiqueta -> una por página */
  .__print_item__ {
    display: flex;
    align-items: center;
    justify-content: center;
    page-break-after: always;
    width: 50.8mm;
    height: 25.4mm;
  }
</style>
</head>
<body>
${html}
<script>
  // Imprime cuando esté listo el layout del iframe
  window.onload = function () {
    setTimeout(function () {
      window.focus();
      window.print();
      setTimeout(function(){ window.close && window.close(); }, 250);
    }, 50);
  };
<\/script>
</body>
</html>`);
      doc.close();

      // Limpieza del iframe luego de imprimir (fallback si no cierra)
      const cleanup = () => {
        try { document.body.removeChild(iframe); } catch { }
        window.removeEventListener("focus", cleanup);
      };
      window.addEventListener("focus", cleanup);
    }, 30);
  };






  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[560px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-3">Imprimir etiquetas</h2>

        {/* Previsualización (mismas medidas reales) */}
        <div className="border p-8 mb-14 bg-gray-90 flex flex-col items-center">
          <Label2x1
            product={product}
            talle={previewTalle}
            price={showPrice ? priceToShow : ""}
          />
          <p className="text-[11px] text-gray-500 mt-2">Previsualización tamaño real</p>
        </div>

        {/* Selección de talles */}
        <h3 className="font-semibold mb-2">Talles disponibles</h3>

        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            onChange={(e) => {
              const newSelected = {};
              uniqueVariantes.forEach((v) => {
                newSelected[v.talle] = { checked: e.target.checked, qty: selected[v.talle]?.qty || 1 };
              });
              setSelected(newSelected);
            }}
            checked={
              uniqueVariantes.length > 0 &&
              uniqueVariantes.every((v) => selected[v.talle]?.checked)
            }
          />
          Seleccionar todos
        </label>


        <div className="grid grid-cols-2 gap-2 mb-3">
          {uniqueVariantes.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!selected[v.talle]?.checked}
                onChange={(e) => toggleTalle(v.talle, e.target.checked)}
              />
              <span className="w-14">{v.talle}</span>
              <input
                type="number"
                min="1"
                className="border p-1 w-16"
                value={selected[v.talle]?.qty ?? 1}
                onChange={(e) => setQty(v.talle, e.target.value)}
                title="Cantidad"
              />
            </div>
          ))}
        </div>


        {/* Precio */}
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={showPrice}
            onChange={() => setShowPrice((s) => !s)}
          />
          Mostrar precio
        </label>
        {showPrice && (
          <input
            type="number"
            placeholder="Precio personalizado"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            className="border p-1 w-full mb-3"
          />
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={handlePrint}
          >
            Imprimir
          </button>
        </div>
      </div>

      {/* === Área de impresión (PRE-RENDERIZADA y oculta fuera de pantalla) === */}
      <div
        ref={printRef}
        style={{
          position: "fixed",
          left: "-10000px", // fuera de pantalla para que se renderice pero no se vea
          top: 0,
          zIndex: -1,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        {labels.map((lbl, idx) => (
          <div key={idx} className="__print_item__">
            <Label2x1
              product={product}
              talle={lbl.talle}
              price={showPrice ? priceToShow : ""}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarcodeModal;
