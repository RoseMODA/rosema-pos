import React, { useState, useEffect } from 'react';

/**
 * Formulario para crear/editar proveedores
 * Implementa todos los campos requeridos según la Etapa 5
 */
const ProviderForm = ({ 
  provider = null, 
  isOpen, 
  onClose, 
  onSave, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    proveedor: '',
    cuit: '',
    whattsapp: '',
    whattsapp2: '',
    catalogo: '',
    web: '',
    categoria: '',
    locales: [{ direccion: '', area: '', galeria: '', pasillo: '', local: '' }],
    tags: [],
    instagram: '',
    tiktok: '',
    calidad: '',
    precios: '',
    notas: '',
    talles: []
  });

  const [tagInput, setTagInput] = useState('');
  const [tallesInput, setTallesInput] = useState('');
  const [categoriaInput, setCategoriaInput] = useState('');

  // Opciones predefinidas
  const categoriaOptions = [
    'mujer', 'hombre', 'niños', 'niñas', 'bebes', 'juvenil', 'ambos', 'lenceria', 'importado'
  ];

  const calidadOptions = [
    'excelente', 'buena', 'media', 'mala'
  ];

  const preciosOptions = [
    'baratos', 'buenos', 'medios', 'razonable', 'caro'
  ];

  // Cargar datos del proveedor si está editando
  useEffect(() => {
    if (provider) {
      setFormData({
        proveedor: provider.proveedor || '',
        cuit: provider.cuit || '',
        whattsapp: provider.whattsapp || '',
        whattsapp2: provider.whattsapp2 || '',
        catalogo: provider.catalogo || '',
        web: provider.web || '',
        categoria: provider.categoria || '',
        locales: provider.locales && provider.locales.length > 0 
          ? provider.locales 
          : [{ direccion: '', area: '', galeria: '', pasillo: '', local: '' }],
        tags: provider.tags || [],
        instagram: provider.instagram || '',
        tiktok: provider.tiktok || '',
        calidad: provider.calidad || '',
        precios: provider.precios || '',
        notas: provider.notas || '',
        talles: provider.talles || []
      });
      setTallesInput(provider.talles ? provider.talles.join(', ') : '');
    }
  }, [provider]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocalChange = (index, field, value) => {
    const newLocales = [...formData.locales];
    newLocales[index] = { ...newLocales[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      locales: newLocales
    }));
  };

  const addLocal = () => {
    setFormData(prev => ({
      ...prev,
      locales: [...prev.locales, { direccion: '', area: '', galeria: '', pasillo: '', local: '' }]
    }));
  };

  const removeLocal = (index) => {
    if (formData.locales.length > 1) {
      const newLocales = formData.locales.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        locales: newLocales
      }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTallesChange = (value) => {
    setTallesInput(value);
    const tallesArray = value.split(',').map(t => t.trim()).filter(t => t);
    setFormData(prev => ({
      ...prev,
      talles: tallesArray
    }));
  };

  const handleCategoriaSelect = (categoria) => {
    setFormData(prev => ({
      ...prev,
      categoria
    }));
    setCategoriaInput('');
  };

  const addNewCategoria = () => {
    if (categoriaInput.trim() && !categoriaOptions.includes(categoriaInput.trim())) {
      handleCategoriaSelect(categoriaInput.trim());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.proveedor.trim()) {
      alert('El nombre del proveedor es requerido');
      return;
    }

    // Limpiar locales vacíos
    const localesLimpios = formData.locales.filter(local => 
      local.direccion || local.area || local.galeria || local.pasillo || local.local
    );

    const dataToSave = {
      ...formData,
      locales: localesLimpios.length > 0 ? localesLimpios : [{ direccion: '', area: '', galeria: '', pasillo: '', local: '' }]
    };

    onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {provider ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Proveedor *
              </label>
              <input
                type="text"
                value={formData.proveedor}
                onChange={(e) => handleInputChange('proveedor', e.target.value)}
                className="w-full input-rosema"
                placeholder="Nombre del proveedor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CUIT
              </label>
              <input
                type="text"
                value={formData.cuit}
                onChange={(e) => handleInputChange('cuit', e.target.value)}
                className="w-full input-rosema"
                placeholder="20-12345678-9"
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Principal
              </label>
              <input
                type="text"
                value={formData.whattsapp}
                onChange={(e) => handleInputChange('whattsapp', e.target.value)}
                className="w-full input-rosema"
                placeholder="1123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Alternativo
              </label>
              <input
                type="text"
                value={formData.whattsapp2}
                onChange={(e) => handleInputChange('whattsapp2', e.target.value)}
                className="w-full input-rosema"
                placeholder="1123456789"
              />
            </div>
          </div>

          {/* Enlaces */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catálogo (Link)
              </label>
              <input
                type="url"
                value={formData.catalogo}
                onChange={(e) => handleInputChange('catalogo', e.target.value)}
                className="w-full input-rosema"
                placeholder="https://wa.me/c/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Página Web
              </label>
              <input
                type="url"
                value={formData.web}
                onChange={(e) => handleInputChange('web', e.target.value)}
                className="w-full input-rosema"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={formData.categoria}
                onChange={(e) => handleCategoriaSelect(e.target.value)}
                className="flex-1 input-rosema"
              >
                <option value="">Seleccionar categoría existente</option>
                {categoriaOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                value={categoriaInput}
                onChange={(e) => setCategoriaInput(e.target.value)}
                placeholder="Nueva categoría"
                className="flex-1 input-rosema"
              />
              <button
                type="button"
                onClick={addNewCategoria}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                +Nueva
              </button>
            </div>
            {formData.categoria && (
              <div className="text-sm text-gray-600">
                Categoría seleccionada: <span className="font-medium">{formData.categoria}</span>
              </div>
            )}
          </div>

          {/* Locales */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Locales
              </label>
              <button
                type="button"
                onClick={addLocal}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Agregar Local
              </button>
            </div>
            
            {formData.locales.map((local, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Local {index + 1}</h4>
                  {formData.locales.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLocal(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={local.direccion}
                    onChange={(e) => handleLocalChange(index, 'direccion', e.target.value)}
                    placeholder="Dirección"
                    className="input-rosema"
                  />
                  <input
                    type="text"
                    value={local.area}
                    onChange={(e) => handleLocalChange(index, 'area', e.target.value)}
                    placeholder="Área"
                    className="input-rosema"
                  />
                  <input
                    type="text"
                    value={local.galeria}
                    onChange={(e) => handleLocalChange(index, 'galeria', e.target.value)}
                    placeholder="Galería"
                    className="input-rosema"
                  />
                  <input
                    type="text"
                    value={local.pasillo}
                    onChange={(e) => handleLocalChange(index, 'pasillo', e.target.value)}
                    placeholder="Pasillo"
                    className="input-rosema"
                  />
                  <input
                    type="text"
                    value={local.local}
                    onChange={(e) => handleLocalChange(index, 'local', e.target.value)}
                    placeholder="Local"
                    className="input-rosema"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Agregar tag"
                className="flex-1 input-rosema"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Agregar
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Redes sociales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="url"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                className="w-full input-rosema"
                placeholder="https://www.instagram.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TikTok
              </label>
              <input
                type="url"
                value={formData.tiktok}
                onChange={(e) => handleInputChange('tiktok', e.target.value)}
                className="w-full input-rosema"
                placeholder="https://www.tiktok.com/..."
              />
            </div>
          </div>

          {/* Calidad y Precios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calidad
              </label>
              <select
                value={formData.calidad}
                onChange={(e) => handleInputChange('calidad', e.target.value)}
                className="w-full input-rosema"
              >
                <option value="">Seleccionar calidad</option>
                {calidadOptions.map(calidad => (
                  <option key={calidad} value={calidad}>{calidad}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precios
              </label>
              <select
                value={formData.precios}
                onChange={(e) => handleInputChange('precios', e.target.value)}
                className="w-full input-rosema"
              >
                <option value="">Seleccionar nivel de precios</option>
                {preciosOptions.map(precio => (
                  <option key={precio} value={precio}>{precio}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Talles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Talles
            </label>
            <input
              type="text"
              value={tallesInput}
              onChange={(e) => handleTallesChange(e.target.value)}
              className="w-full input-rosema"
              placeholder="Separar por comas: S, M, L, XL, 38, 40, 42"
            />
            <p className="text-sm text-gray-500 mt-1">
              Ingrese los talles separados por comas
            </p>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => handleInputChange('notas', e.target.value)}
              rows={3}
              className="w-full input-rosema"
              placeholder="Notas adicionales sobre el proveedor..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (provider ? 'Actualizar' : 'Crear')} Proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderForm;
