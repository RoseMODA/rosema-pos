import React from 'react';

/**
 * Página de Facturas ARCA del sistema POS Rosema
 * Sistema de facturación electrónica integrado (Etapa 8)
 */

import { subirFacturaARCA } from "../services/arcaService";

const handleSubirFactura = async () => {
  try {
    const factura = {
      total: 15000,
      fecha: new Date().toISOString().split("T")[0],
      metodoPago: "tarjeta_debito",
      tipoFactura: "C", // también podés usar "A" o "B"
    };


    const respuesta = await subirFacturaARCA(factura);

    const detalle = respuesta.respuestaCompleta?.FECAESolicitarResult?.FeDetResp?.FECAEDetResponse?.[0];

    if (detalle?.Resultado === "A") {
      alert(`✅ Factura C autorizada con CAE: ${detalle.CAE}\nVence: ${detalle.CAEFchVto}`);
    } else {
      const errorMsg =
        detalle?.Observaciones?.Obs?.[0]?.Msg ||
        "Factura rechazada o con observaciones.";
      alert(`⚠️ ${errorMsg}`);
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error al subir la factura a ARCA");
  }
};



const Invoices = () => {
  return (
    <div className="p-6">
      {/* Header de la página */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📄 Facturas ARCA</h1>
        <p className="text-gray-600 mt-2">Sistema de facturación electrónica</p>
      </div>


      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funcionalidades del sistema */}


        {/* Tipos de facturación automática */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Facturación Manual de pagos con:
          </h2>
          <div className="space-y-3">
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">💎</span>
                <div>
                  <div className="font-medium text-orange-900">Tarjeta Crédito</div>

                </div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">💳</span>
                <div>
                  <div className="font-medium text-purple-900">Tarjeta Débito</div>

                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📱</span>
                <div>
                  <div className="font-medium text-green-900">Código QR</div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de facturación */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">0</div>
          <div className="text-gray-600">Facturas Este Mes</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">$0</div>
          <div className="text-gray-600">Total Facturado</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">0</div>
          <div className="text-gray-600">Subidas a ARCA</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">0</div>
          <div className="text-gray-600">Pendientes</div>
        </div>
      </div>



      <button
        className="btn-secondary"
        onClick={handleSubirFactura}>
        <span className="mr-2">📤</span> Subir a ARCA
      </button>



      {/* Lista de facturas */}
      <div className="card-rosema mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Historial de Facturas
        </h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-600">
            El historial de facturas se mostrará aquí una vez implementado
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Incluirá búsqueda, filtros e impresion
          </p>
        </div>
      </div>




    </div>
  );
};

export default Invoices;
