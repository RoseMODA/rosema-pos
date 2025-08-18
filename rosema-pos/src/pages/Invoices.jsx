import React from 'react';

/**
 * Página de Facturas ARCA del sistema POS Rosema
 * Sistema de facturación electrónica integrado (Etapa 8)
 */
const Invoices = () => {
  return (
    <div className="p-6">
      {/* Header de la página */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📄 Facturas ARCA</h1>
        <p className="text-gray-600 mt-2">Sistema de facturación electrónica</p>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button className="btn-rosema">
          <span className="mr-2">➕</span>
          Nueva Factura
        </button>
        <button className="btn-secondary">
          <span className="mr-2">📤</span>
          Subir a ARCA
        </button>
        <button className="btn-secondary">
          <span className="mr-2">📋</span>
          Ver Historial
        </button>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funcionalidades del sistema */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Sistema de Facturación (Etapa 8)
          </h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              CRUD completo de facturas
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Almacenamiento de PDF en Firebase Storage
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Registro automático para pagos electrónicos
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Preparación de datos para ARCA
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Integración con sistema tributario
            </div>
          </div>
        </div>

        {/* Tipos de facturación automática */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Facturación Automática
          </h2>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">💳</span>
                <div>
                  <div className="font-medium text-blue-900">Tarjeta Débito</div>
                  <div className="text-sm text-blue-700">Facturación automática</div>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">💎</span>
                <div>
                  <div className="font-medium text-purple-900">Tarjeta Crédito</div>
                  <div className="text-sm text-purple-700">Facturación automática</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📱</span>
                <div>
                  <div className="font-medium text-green-900">Código QR</div>
                  <div className="text-sm text-green-700">Facturación automática</div>
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
            Incluirá búsqueda, filtros y descarga de PDFs
          </p>
        </div>
      </div>

      {/* Integración ARCA */}
      <div className="card-rosema mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Integración con ARCA
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h3 className="font-medium text-red-900 mb-2">🔴 Estado Actual</h3>
            <p className="text-sm text-red-700">
              Sistema no conectado con ARCA
            </p>
            <p className="text-xs text-red-600 mt-1">
              Configuración pendiente para Etapa 8
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">🔵 Próximas Funciones</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Conexión API ARCA</li>
              <li>• Subida automática de facturas</li>
              <li>• Validación tributaria</li>
              <li>• Reportes fiscales</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Información importante */}
      <div className="card-rosema mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          ⚠️ Información Importante
        </h2>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800 mb-2">
            <strong>Requisitos para la integración con ARCA:</strong>
          </p>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Certificado digital válido</li>
            <li>• Credenciales de acceso a ARCA</li>
            <li>• Configuración de datos fiscales de la empresa</li>
            <li>• Validación de productos y servicios</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
