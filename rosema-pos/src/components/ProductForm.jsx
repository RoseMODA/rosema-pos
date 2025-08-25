import React, { useState, useEffect } from 'react';
import { useProviders } from '../hooks/useProviders';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';

/**
 * Componente modal para crear y editar productos
 * Implementa todos los campos según la estructura de data/articulos.json
 */
const ProductForm = ({ isOpen, onClose, onSubmit, product = null, mode = 'create' }) => {
  const { providers, loadProviders, addProvider } = useProviders();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    id: '', // Código de barras
    articulo: '', // Nombre del artículo
    descripcion: '',
    categoria: '',
    subcategorias: [],
    temporada: '',
    proveedorId: '',
    precioCosto: '',
    precioVentaSugerido: '',
    gananciaPercent: 50, // Porcentaje por defecto
    variantes: [],
    tags: [],
    imagenes: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [providerSearch, setProviderSearch] = useState('');
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [newSubcategoria, setNewSubcategoria] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Opciones predefinidas
  const categorias = ['mujer', 'hombre', 'niños-bebes', 'otros'];
  const temporadas = ['verano', 'invierno', 'otoño', 'primavera', 'todo el año'];
  const subcategoriasComunes = [
    'remeras', 'pantalones', 'vestidos', 'faldas', 'shorts', 'buzos', 'camperas',
    'jeans', 'camisas', 'blusas', 'sweaters', 'abrigos', 'ropa interior',
    'calzado', 'accesorios', 'carteras', 'cinturones'
  ];

  // Cargar proveedores al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadProviders();
    }
  }, [isOpen, loadProviders]);

  // Filtrar proveedores según búsqueda
  useEffect(() => {
    if (providerSearch.trim()) {
      const filtered = providers.filter(provider =>
        provider.proveedor.toLowerCase().includes(providerSearch.toLowerCase())
      );
      setFilteredProviders(filtered);
    } else {
      setFilteredProviders([]);
    }
  }, [providerSearch, providers]);

  // Cargar datos del producto en modo edición
  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        id: product.id || '',
        articulo: product.articulo || '',
        descripcion: product.descripcion || '',
        categoria: product.categoria || '',
        subcategorias: product.subcategorias || [],
        temporada: product.temporada || '',
        proveedorId: product.proveedorId || '',
        precioCosto: product.precioCosto || '',
        precioVentaSugerido: calculateSuggestedPrice(product.precioCosto, 50),
        gananciaPercent: 50,
        variantes: product.variantes || [],
        tags: product.tags || [],
        imagenes: product.imagenes || []
      });
    } else if (mode === 'create') {
      // Resetear formulario para crear nuevo producto
      setFormData({
        id: '',
        articulo: '',
        descripcion: '',
        categoria: '',
        subcategorias: [],
        temporada: '',
        proveedorId: '',
        precioCosto: '',
        precioVentaSugerido: '',
        gananciaPercent: 50,
        variantes: [],
        tags: [],
        imagenes: []
      });
    }
  }, [product, mode]);

  /**
   * Calcular precio de venta sugerido
   */
  const calculateSuggestedPrice = (costo, ganancia) => {
    if (!costo || !ganancia) return '';
    const costoNum = parseFloat(costo);
    const gananciaNum = parseFloat(ganancia);
    return Math.round(costoNum * (1 + gananciaNum / 100));
  };

  /**
   * Calcular porcentaje de ganancia
   */
  const calculateProfitPercent = (costo, precioVenta) => {
    if (!costo || !precioVenta) return 0;
    const costoNum = parseFloat(costo);
    const precioNum = parseFloat(precioVenta);
    return Math.round(((precioNum - costoNum) / costoNum) * 100);
  };

  /**
   * Manejar cambios en campos del formulario
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Sincronizar precios y ganancia
    if (field === 'precioCosto' || field === 'gananciaPercent') {
      const newSuggestedPrice = calculateSuggestedPrice(
        field === 'precioCosto' ? value : formData.precioCosto,
        field === 'gananciaPercent' ? value : formData.gananciaPercent
      );
      setFormData(prev => ({
        ...prev,
        precioVentaSugerido: newSuggestedPrice
      }));
    }

    if (field === 'precioVentaSugerido') {
      const newProfitPercent = calculateProfitPercent(formData.precioCosto, value);
      setFormData(prev => ({
        ...prev,
        gananciaPercent: newProfitPercent
      }));
    }

    // Limpiar errores
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  /**
   * Agregar nueva variante
   */
  const addVariante = () => {
    const newVariante = {
      talla: '',
      color: '',
      stock: 0,
      precioVenta: formData.precioVentaSugerido || 0
    };
    setFormData(prev => ({
      ...prev,
      variantes: [...prev.variantes, newVariante]
    }));
  };

  /**
   * Eliminar variante
   */
  const removeVariante = (index) => {
    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.filter((_, i) => i !== index)
    }));
  };

  /**
   * Actualizar variante
   */
  const updateVariante = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.map((variante, i) =>
        i === index ? { ...variante, [field]: value } : variante
      )
    }));
  };

  /**
   * Aplicar precio sugerido a todas las variantes
   */
  const applyPriceToAllVariants = () => {
    if (!formData.precioVentaSugerido) {
      alert('Primero ingresa un precio de venta sugerido');
      return;
    }

    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.map(variante => ({
        ...variante,
        precioVenta: formData.precioVentaSugerido
      }))
    }));
  };

  /**
   * Agregar tag
   */
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  /**
   * Eliminar tag
   */
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  /**
   * Agregar subcategoría
   */
  const addSubcategoria = (subcategoria) => {
    if (!formData.subcategorias.includes(subcategoria)) {
      setFormData(prev => ({
        ...prev,
        subcategorias: [...prev.subcategorias, subcategoria]
      }));
    }
  };

  /**
   * Eliminar subcategoría
   */
  const removeSubcategoria = (subcategoriaToRemove) => {
    setFormData(prev => ({
      ...prev,
      subcategorias: prev.subcategorias.filter(sub => sub !== subcategoriaToRemove)
    }));
  };

  /**
   * Seleccionar proveedor
   */
  const selectProvider = (provider) => {
    setFormData(prev => ({
      ...prev,
      proveedorId: provider.id
    }));
    setProviderSearch(provider.proveedor);
    setFilteredProviders([]);
  };

  /**
   * Manejar selección de imágenes
   */
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validar tipos de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validFiles = files.filter(file => validTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      alert('Solo se permiten archivos de imagen (JPG, PNG, WEBP)');
    }

    // Limitar a 5 imágenes máximo
    const totalImages = imageFiles.length + validFiles.length;
    if (totalImages > 5) {
      alert('Máximo 5 imágenes permitidas');
      return;
    }

    // Agregar archivos
    setImageFiles(prev => [...prev, ...validFiles]);

    // Crear previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, {
          file,
          url: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * Eliminar imagen
   */
  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Subir imágenes a Firebase Storage
   */
  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadPromises = imageFiles.map(async (file) => {
      const fileName = `productos/${formData.id}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    });

    try {
      const urls = await Promise.all(uploadPromises);
      setUploadingImages(false);
      return urls;
    } catch (error) {
      setUploadingImages(false);
      throw error;
    }
  };

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};

    // Campos obligatorios
    if (!formData.id.trim()) newErrors.id = 'El código de barras es obligatorio';
    if (!formData.articulo.trim()) newErrors.articulo = 'El nombre del artículo es obligatorio';
    if (!formData.categoria) newErrors.categoria = 'La categoría es obligatoria';
    if (!formData.proveedorId) newErrors.proveedorId = 'El proveedor es obligatorio';
    if (!formData.precioCosto) newErrors.precioCosto = 'El costo por unidad es obligatorio';

    // Validar variantes
    formData.variantes.forEach((variante, index) => {
      if (!variante.precioVenta) {
        newErrors[`variante_${index}_precio`] = 'El precio de venta es obligatorio';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Subir imágenes si hay archivos nuevos
      let imageUrls = formData.imagenes || [];
      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadImages();
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      // Preparar datos finales
      const finalData = {
        ...formData,
        imagenes: imageUrls
      };

      await onSubmit(finalData);
      onClose();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar modal
   */
  const handleClose = () => {
    setFormData({
      id: '',
      articulo: '',
      descripcion: '',
      categoria: '',
      subcategorias: [],
      temporada: '',
      proveedorId: '',
      precioCosto: '',
      precioVentaSugerido: '',
      gananciaPercent: 50,
      variantes: [],
      tags: [],
      imagenes: []
    });
    setErrors({});
    setProviderSearch('');
    setFilteredProviders([]);
    setImageFiles([]);
    setImagePreview([]);
    setUploadingImages(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Agregar Nuevo Producto' : 'Editar Producto'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código de barras */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Barras *
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                className={`w-full input-rosema ${errors.id ? 'border-red-500' : ''}`}
                placeholder="Ingrese código de barras"
              />
              {errors.id && <p className="text-red-500 text-sm mt-1">{errors.id}</p>}
            </div>

            {/* Nombre del artículo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Artículo *
              </label>
              <input
                type="text"
                value={formData.articulo}
                onChange={(e) => handleInputChange('articulo', e.target.value)}
                className={`w-full input-rosema ${errors.articulo ? 'border-red-500' : ''}`}
                placeholder="Ingrese nombre del artículo"
              />
              {errors.articulo && <p className="text-red-500 text-sm mt-1">{errors.articulo}</p>}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className="w-full input-rosema"
              rows="3"
              placeholder="Descripción del producto"
            />
          </div>

          {/* Categoría y Temporada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                className={`w-full input-rosema ${errors.categoria ? 'border-red-500' : ''}`}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.categoria && <p className="text-red-500 text-sm mt-1">{errors.categoria}</p>}
            </div>

            {/* Temporada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temporada
              </label>
              <select
                value={formData.temporada}
                onChange={(e) => handleInputChange('temporada', e.target.value)}
                className="w-full input-rosema"
              >
                <option value="">Seleccionar temporada</option>
                {temporadas.map(temp => (
                  <option key={temp} value={temp}>{temp}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subcategorías */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategorías
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.subcategorias.map(sub => (
                <span key={sub} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                  {sub}
                  <button
                    type="button"
                    onClick={() => removeSubcategoria(sub)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {subcategoriasComunes.map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => addSubcategoria(sub)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    formData.subcategorias.includes(sub)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
            <div className="flex mt-2">
              <input
                type="text"
                value={newSubcategoria}
                onChange={(e) => setNewSubcategoria(e.target.value)}
                className="flex-1 input-rosema"
                placeholder="Nueva subcategoría"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newSubcategoria.trim()) {
                      addSubcategoria(newSubcategoria.trim());
                      setNewSubcategoria('');
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newSubcategoria.trim()) {
                    addSubcategoria(newSubcategoria.trim());
                    setNewSubcategoria('');
                  }
                }}
                className="ml-2 btn-secondary"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor *
            </label>
            <div className="flex">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={providerSearch}
                  onChange={(e) => setProviderSearch(e.target.value)}
                  className={`w-full input-rosema ${errors.proveedorId ? 'border-red-500' : ''}`}
                  placeholder="Buscar proveedor..."
                />
                {filteredProviders.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredProviders.map(provider => (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => selectProvider(provider)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium">{provider.proveedor}</div>
                        <div className="text-sm text-gray-500">{provider.categoria}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowProviderForm(true)}
                className="ml-2 btn-secondary whitespace-nowrap"
              >
                + Nuevo Proveedor
              </button>
            </div>
            {errors.proveedorId && <p className="text-red-500 text-sm mt-1">{errors.proveedorId}</p>}
          </div>

          {/* Precios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Costo por unidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo por Unidad *
              </label>
              <input
                type="number"
                value={formData.precioCosto}
                onChange={(e) => handleInputChange('precioCosto', e.target.value)}
                className={`w-full input-rosema ${errors.precioCosto ? 'border-red-500' : ''}`}
                placeholder="0"
                min="0"
                step="0.01"
              />
              {errors.precioCosto && <p className="text-red-500 text-sm mt-1">{errors.precioCosto}</p>}
            </div>

            {/* Precio de venta sugerido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de Venta Sugerido
              </label>
              <input
                type="number"
                value={formData.precioVentaSugerido}
                onChange={(e) => handleInputChange('precioVentaSugerido', e.target.value)}
                className="w-full input-rosema"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            {/* % Ganancia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                % Ganancia
              </label>
              <input
                type="number"
                value={formData.gananciaPercent}
                onChange={(e) => handleInputChange('gananciaPercent', e.target.value)}
                className="w-full input-rosema"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Variantes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Variantes (Tallas, Colores, Stock)
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={applyPriceToAllVariants}
                  className="btn-secondary text-sm"
                >
                  Aplicar precio a todas
                </button>
                <button
                  type="button"
                  onClick={addVariante}
                  className="btn-rosema text-sm"
                >
                  + Agregar Variante
                </button>
              </div>
            </div>

            {formData.variantes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Talla</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Color</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Stock</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Precio Venta *</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.variantes.map((variante, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={variante.talla}
                            onChange={(e) => updateVariante(index, 'talla', e.target.value)}
                            className="w-full input-rosema"
                            placeholder="XS, S, M..."
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={variante.color}
                            onChange={(e) => updateVariante(index, 'color', e.target.value)}
                            className="w-full input-rosema"
                            placeholder="Rojo, Azul..."
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={variante.stock}
                            onChange={(e) => updateVariante(index, 'stock', parseInt(e.target.value) || 0)}
                            className="w-full input-rosema"
                            min="0"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={variante.precioVenta}
                            onChange={(e) => updateVariante(index, 'precioVenta', parseFloat(e.target.value) || 0)}
                            className={`w-full input-rosema ${errors[`variante_${index}_precio`] ? 'border-red-500' : ''}`}
                            min="0"
                            step="0.01"
                          />
                          {errors[`variante_${index}_precio`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`variante_${index}_precio`]}</p>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeVariante(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map(tag => (
                <span key={tag} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 input-rosema"
                placeholder="Agregar tag (ej: invierno, fiesta, jean)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={addTag}
                className="ml-2 btn-secondary"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes del Producto
            </label>
            
            {/* Imágenes existentes */}
            {formData.imagenes && formData.imagenes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Imágenes actuales:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.imagenes.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.imagenes.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, imagenes: newImages }));
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview de nuevas imágenes */}
            {imagePreview.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Nuevas imágenes a subir:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input para seleccionar imágenes */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-600">
                  Haz clic para seleccionar imágenes
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  JPG, PNG, WEBP (máximo 5 imágenes)
                </span>
              </label>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-rosema"
              disabled={loading || uploadingImages}
            >
              {uploadingImages ? 'Subiendo imágenes...' : loading ? 'Guardando...' : (mode === 'create' ? 'Crear Producto' : 'Actualizar Producto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
