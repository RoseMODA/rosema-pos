import React, { useState, useEffect } from 'react';
import { getAllProviders } from "../services/providersService";


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
  const [direcciones, setDirecciones] = useState([]);
  const [areas, setAreas] = useState([]);
  const [galerias, setGalerias] = useState([]);

  // Dirección
  const [direccionInput, setDireccionInput] = useState("");
  const [direccionSugs, setDireccionSugs] = useState([]);

  // Área
  const [areaInput, setAreaInput] = useState("");
  const [areaSugs, setAreaSugs] = useState([]);

  // Galería
  const [galeriaInput, setGaleriaInput] = useState("");
  const [galeriaSugs, setGaleriaSugs] = useState([]);


  const getSuggestions = (value, list) => {
    if (!value.trim()) return [];
    return list.filter(item =>
      item.toLowerCase().includes(value.toLowerCase())
    );
  };




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
        tags: Array.isArray(provider.tags) ? provider.tags : [],
        instagram: provider.instagram || '',
        tiktok: provider.tiktok || '',
        calidad: provider.calidad || '',
        precios: provider.precios || '',
        notas: provider.notas || '',
        talles: Array.isArray(provider.talles) ? provider.talles : []
      });
      setTallesInput(Array.isArray(provider.talles) ? provider.talles.join(', ') : '');
    } else {
      // Reset form when no provider (adding new)
      setFormData({
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
      setTallesInput('');
    }
  }, [provider]);

  useEffect(() => {
    if (isOpen) {
      // cuando abre el modal cargo sugerencias globales
      getAllProviders().then(providers => {
        const allDirecciones = [];
        const allAreas = [];
        const allGalerias = [];

        providers.forEach(p => {
          (p.locales || []).forEach(l => {
            if (l.direccion) allDirecciones.push(l.direccion.toUpperCase());
            if (l.area) allAreas.push(l.area.toUpperCase());
            if (l.galeria) allGalerias.push(l.galeria.toUpperCase());
          });
        });

        setDirecciones([...new Set(allDirecciones)]);
        setAreas([...new Set(allAreas)]);
        setGalerias([...new Set(allGalerias)]);
      });
    }
  }, [isOpen]);

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

    // Preparar datos para guardar, asegurando que no haya valores null
    const dataToSave = {
      proveedor: formData.proveedor.trim(),
      cuit: formData.cuit.trim() || null,
      whattsapp: formData.whattsapp.trim() || null,
      whattsapp2: formData.whattsapp2.trim() || null,
      catalogo: formData.catalogo.trim() || null,
      web: formData.web.trim() || null,
      categoria: formData.categoria.trim() || null,
      locales: localesLimpios.length > 0
        ? localesLimpios
        : [{ direccion: '', area: '', galeria: '', pasillo: '', local: '' }],
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      instagram: formData.instagram.trim() || null,
      tiktok: formData.tiktok.trim() || null,
      calidad: formData.calidad.trim() || null,
      precios: formData.precios.trim() || null,
      notas: formData.notas.trim() || null,
      talles: Array.isArray(formData.talles) ? formData.talles : []
    };

    // 🔥 Actualizar las listas de sugerencias
    setDirecciones(prev => [
      ...new Set([...prev, ...localesLimpios.map(l => l.direccion).filter(Boolean)])
    ]);
    setAreas(prev => [
      ...new Set([...prev, ...localesLimpios.map(l => l.area).filter(Boolean)])
    ]);
    setGalerias(prev => [
      ...new Set([...prev, ...localesLimpios.map(l => l.galeria).filter(Boolean)])
    ]);

    console.log('🔍 DEBUG: Datos a enviar:', dataToSave);
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
                onChange={(e) => handleInputChange('proveedor', e.target.value.toUpperCase())}
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
                Catálogo (WhatsApp)
              </label>
              <input
                type="text"
                value={formData.catalogo}
                onChange={(e) => {
                  let value = e.target.value.trim();

                  // Si escribe solo el número, armamos el link wa.me
                  if (value && !value.startsWith("https://wa.me/")) {
                    // quitar espacios y símbolos tipo "+" o "-"
                    value = value.replace(/\D/g, "");
                    value = "https://wa.me/c/549" + value;
                  }

                  handleInputChange("catalogo", value);
                }}
                className="w-full input-rosema"
                placeholder="Ej: 5491122334455 → https://wa.me/5491122334455"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Página Web
              </label>
              <input
                type="text"
                value={formData.web}
                onChange={(e) => {
                  let value = e.target.value.trim();

                  // Si no empieza con http:// o https://, lo completamos
                  if (value && !/^https?:\/\//i.test(value)) {
                    value = "https://" + value;
                  }

                  handleInputChange("web", value);
                }}
                className="w-full input-rosema"
                placeholder="Ej: mi-tienda.com → https://mi-tienda.com"
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

                  {/* Dirección */}
                  <div className="relative">
                    <input
                      type="text"
                      value={direccionInput}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setDireccionInput(val);
                        setDireccionSugs(getSuggestions(val, direcciones));
                        handleLocalChange(index, "direccion", val);
                      }}
                      onBlur={() => setTimeout(() => setDireccionSugs([]), 150)}
                      placeholder="Dirección"
                      className="input-rosema w-full"
                    />
                    {direccionSugs.length > 0 && (
                      <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto w-full">
                        {direccionSugs.map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                            onClick={() => {
                              setDireccionInput(sug);
                              handleLocalChange(index, "direccion", sug);
                              setDireccionSugs([]);
                            }}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Área */}
                  <div className="relative">
                    <input
                      type="text"
                      value={areaInput}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setAreaInput(val);
                        setAreaSugs(getSuggestions(val, areas));
                        handleLocalChange(index, "area", val);
                      }}
                      onBlur={() => setTimeout(() => setAreaSugs([]), 150)}
                      placeholder="Área"
                      className="input-rosema w-full"
                    />
                    {areaSugs.length > 0 && (
                      <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto w-full">
                        {areaSugs.map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                            onClick={() => {
                              setAreaInput(sug);
                              handleLocalChange(index, "area", sug);
                              setAreaSugs([]);
                            }}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Galería */}
                  <div className="relative">
                    <input
                      type="text"
                      value={galeriaInput}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setGaleriaInput(val);
                        setGaleriaSugs(getSuggestions(val, galerias));
                        handleLocalChange(index, "galeria", val);
                      }}
                      onBlur={() => setTimeout(() => setGaleriaSugs([]), 150)}
                      placeholder="Galería"
                      className="input-rosema w-full"
                    />
                    {galeriaSugs.length > 0 && (
                      <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto w-full">
                        {galeriaSugs.map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                            onClick={() => {
                              setGaleriaInput(sug);
                              handleLocalChange(index, "galeria", sug);
                              setGaleriaSugs([]);
                            }}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>


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
                type="text"
                value={formData.instagram}
                onChange={(e) => {
                  let value = e.target.value;
                  if (value && !value.startsWith("https://www.instagram.com/")) {
                    value = "https://www.instagram.com/" + value.replace(/^https?:\/\/(www\.)?instagram\.com\//, "");
                  }
                  handleInputChange("instagram", value);
                }}
                className="w-full input-rosema"
                placeholder="usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TikTok
              </label>
              <input
                type="text"
                value={formData.tiktok}
                onChange={(e) => {
                  let value = e.target.value;
                  if (value && !value.startsWith("https://www.tiktok.com/@")) {
                    value = "https://www.tiktok.com/@" + value.replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/, "");
                  }
                  handleInputChange("tiktok", value);
                }}
                className="w-full input-rosema"
                placeholder="usuario"
              />
            </div>
          </div>


          {/* Calidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calidad
            </label>
            <div className="flex gap-2 flex-wrap">
              {calidadOptions.map(c => {
                const colorMap = {
                  excelente: {
                    base: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
                    active: "bg-green-500 text-white border-green-500"
                  },
                  buena: {
                    base: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200",
                    active: "bg-blue-500 text-white border-blue-500"
                  },
                  media: {
                    base: "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200",
                    active: "bg-yellow-500 text-white border-yellow-500"
                  },
                  mala: {
                    base: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
                    active: "bg-red-500 text-white border-red-500"
                  },
                }

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleInputChange("calidad", c)}
                    className={`px-3 py-2 rounded-lg border transition ${formData.calidad === c ? colorMap[c].active : colorMap[c].base
                      }`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Precios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precios
            </label>
            <div className="flex gap-2 flex-wrap">
              {preciosOptions.map(p => {
                const colorMap = {
                  baratos: {
                    base: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
                    active: "bg-green-500 text-white border-green-500"
                  },
                  buenos: {
                    base: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200",
                    active: "bg-blue-500 text-white border-blue-500"
                  },
                  medios: {
                    base: "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200",
                    active: "bg-yellow-500 text-white border-yellow-500"
                  },
                  razonable: {
                    base: "bg-pink-100 text-pink-700 border-pink-300 hover:bg-pink-200",
                    active: "bg-pink-500 text-white border-pink-500"
                  },
                  caro: {
                    base: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
                    active: "bg-red-500 text-white border-red-500"
                  },
                }

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleInputChange("precios", p)}
                    className={`px-3 py-2 rounded-lg border transition ${formData.precios === p ? colorMap[p].active : colorMap[p].base
                      }`}
                  >
                    {p}
                  </button>
                )
              })}
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
              onChange={(e) => handleTallesChange(e.target.value.toUpperCase())}
              className="w-full input-rosema"
              placeholder="Separar por comas: S, M, L, XL, 38, 40, 42"
            />
            <p className="text-sm text-gray-500 mt-1">
              Ingrese los talles separados por comas
            </p>

            {/* Tabla visual de talles */}
            <div className="mt-3 space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Adulto (letras):</span>
                <p className="text-gray-600">
                  XS, S, M, L, XL, XXL, 3XL, 4XL, 5XL, 6XL
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Adulto (números):</span>
                <p className="text-gray-600">
                  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Adulto (europeo):</span>
                <p className="text-gray-600">
                  34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 58, 60
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Niños:</span>
                <p className="text-gray-600">
                  4, 6, 8, 10, 12, 14, 16, 18
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Bebés:</span>
                <p className="text-gray-600">
                  0M, 3M, 6M, 9M, 1A, 2A, 3A, 4A
                </p>
              </div>
            </div>
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
