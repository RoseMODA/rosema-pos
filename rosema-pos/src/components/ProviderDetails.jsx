import React from 'react';

/**
 * Modal para mostrar detalles completos del proveedor
 * Incluye estadísticas de productos comprados y vendidos
 */
const ProviderDetails = ({ 
  provider, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete,
  productStats = { totalComprados: 0, totalVendidos: 0 }
}) => {
  if (!isOpen || !provider) return null;

  const formatWhatsAppLink = (number) => {
    if (!number) return null;
    const cleanNumber = number.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}`;
  };

  const formatWebLink = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {provider.proveedor || 'Proveedor sin nombre'}
            </h2>
            {provider.categoria && (
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
                {provider.categoria}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Estadísticas de productos */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Estadísticas de Productos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{productStats.totalComprados}</div>
                <div className="text-sm text-gray-600">Total Productos Comprados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{productStats.totalVendidos}</div>
                <div className="text-sm text-gray-600">Total Productos Vendidos</div>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {provider.cuit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">CUIT</label>
                  <p className="text-gray-900">{provider.cuit}</p>
                </div>
              )}
              
              {provider.whattsapp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">WhatsApp Principal</label>
                  <a 
                    href={formatWhatsAppLink(provider.whattsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 hover:underline"
                  >
                    {provider.whattsapp}
                  </a>
                </div>
              )}

              {provider.whattsapp2 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">WhatsApp Alternativo</label>
                  <a 
                    href={formatWhatsAppLink(provider.whattsapp2)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 hover:underline"
                  >
                    {provider.whattsapp2}
                  </a>
                </div>
              )}

              {provider.web && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Página Web</label>
                  <a 
                    href={formatWebLink(provider.web)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {provider.web}
                  </a>
                </div>
              )}

              {provider.catalogo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catálogo</label>
                  <a 
                    href={provider.catalogo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Ver catálogo
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Locales */}
          {provider.locales && provider.locales.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Locales</h3>
              <div className="space-y-3">
                {provider.locales.map((local, index) => {
                  const hasData = local.direccion || local.area || local.galeria || local.pasillo || local.local;
                  if (!hasData) return null;
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Local {index + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        {local.direccion && (
                          <div>
                            <span className="font-medium text-gray-700">Dirección:</span>
                            <p className="text-gray-900">{local.direccion}</p>
                          </div>
                        )}
                        {local.area && (
                          <div>
                            <span className="font-medium text-gray-700">Área:</span>
                            <p className="text-gray-900">{local.area}</p>
                          </div>
                        )}
                        {local.galeria && (
                          <div>
                            <span className="font-medium text-gray-700">Galería:</span>
                            <p className="text-gray-900">{local.galeria}</p>
                          </div>
                        )}
                        {local.pasillo && (
                          <div>
                            <span className="font-medium text-gray-700">Pasillo:</span>
                            <p className="text-gray-900">{local.pasillo}</p>
                          </div>
                        )}
                        {local.local && (
                          <div>
                            <span className="font-medium text-gray-700">Local:</span>
                            <p className="text-gray-900">{local.local}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {provider.tags && provider.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {provider.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Redes sociales */}
          {(provider.instagram || provider.tiktok) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Redes Sociales</h3>
              <div className="flex gap-4">
                {provider.instagram && (
                  <a
                    href={provider.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-pink-600 hover:text-pink-800 hover:underline"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </a>
                )}
                {provider.tiktok && (
                  <a
                    href={provider.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-black hover:text-gray-700 hover:underline"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    TikTok
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Calidad y Precios */}
          {(provider.calidad || provider.precios) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Evaluación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {provider.calidad && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Calidad</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      provider.calidad === 'excelente' ? 'bg-green-100 text-green-800' :
                      provider.calidad === 'buena' ? 'bg-blue-100 text-blue-800' :
                      provider.calidad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                      provider.calidad === 'mala' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {provider.calidad}
                    </span>
                  </div>
                )}
                {provider.precios && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precios</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      provider.precios === 'baratos' ? 'bg-green-100 text-green-800' :
                      provider.precios === 'buenos' ? 'bg-blue-100 text-blue-800' :
                      provider.precios === 'medios' || provider.precios === 'razonable' ? 'bg-yellow-100 text-yellow-800' :
                      provider.precios === 'caro' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {provider.precios}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Talles */}
          {provider.talles && provider.talles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Talles Disponibles</h3>
              <div className="flex flex-wrap gap-2">
                {provider.talles.map((talle, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                  >
                    {talle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {provider.notas && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{provider.notas}</p>
              </div>
            </div>
          )}

          {/* Fechas */}
          <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
            {provider.createdAt && (
              <p>Creado: {new Date(provider.createdAt.seconds * 1000).toLocaleDateString()}</p>
            )}
            {provider.updatedAt && (
              <p>Última actualización: {new Date(provider.updatedAt.seconds * 1000).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
          <button
            onClick={() => onEdit(provider)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(provider.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetails;
