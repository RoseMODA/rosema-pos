/**
 * Funciones de validación para formularios del sistema POS Rosema
 */

/**
 * Validar código de barras
 */
export const validateBarcode = (barcode) => {
  if (!barcode || !barcode.trim()) {
    return { isValid: false, error: 'El código de barras es obligatorio' };
  }
  
  if (barcode.length < 3) {
    return { isValid: false, error: 'El código debe tener al menos 3 caracteres' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validar nombre de artículo
 */
export const validateArticleName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'El nombre del artículo es obligatorio' };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validar precio
 */
export const validatePrice = (price, fieldName = 'precio') => {
  if (!price && price !== 0) {
    return { isValid: false, error: `El ${fieldName} es obligatorio` };
  }
  
  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice < 0) {
    return { isValid: false, error: `El ${fieldName} debe ser un número válido mayor o igual a 0` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validar stock
 */
export const validateStock = (stock) => {
  if (stock === null || stock === undefined || stock === '') {
    return { isValid: false, error: 'El stock es obligatorio' };
  }
  
  const numStock = parseInt(stock);
  if (isNaN(numStock) || numStock < 0) {
    return { isValid: false, error: 'El stock debe ser un número entero mayor o igual a 0' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validar email
 */
export const validateEmail = (email) => {
  if (!email) return { isValid: true, error: null }; // Email es opcional
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'El formato del email no es válido' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validar teléfono
 */
export const validatePhone = (phone) => {
  if (!phone) return { isValid: true, error: null }; // Teléfono es opcional
  
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 8) {
    return { isValid: false, error: 'El teléfono debe tener al menos 8 dígitos' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validar formulario de producto completo
 */
export const validateProductForm = (formData) => {
  const errors = {};
  
  // Validar campos básicos
  const barcodeValidation = validateBarcode(formData.id);
  if (!barcodeValidation.isValid) {
    errors.id = barcodeValidation.error;
  }
  
  const nameValidation = validateArticleName(formData.articulo);
  if (!nameValidation.isValid) {
    errors.articulo = nameValidation.error;
  }
  
  if (!formData.categoria) {
    errors.categoria = 'La categoría es obligatoria';
  }
  
  if (!formData.proveedorId) {
    errors.proveedorId = 'El proveedor es obligatorio';
  }
  
  const costValidation = validatePrice(formData.precioCosto, 'precio de costo');
  if (!costValidation.isValid) {
    errors.precioCosto = costValidation.error;
  }
  
  // Validar variantes
  if (formData.variantes && formData.variantes.length > 0) {
    formData.variantes.forEach((variante, index) => {
      const priceValidation = validatePrice(variante.precioVenta, 'precio de venta');
      if (!priceValidation.isValid) {
        errors[`variante_${index}_precio`] = priceValidation.error;
      }
      
      const stockValidation = validateStock(variante.stock);
      if (!stockValidation.isValid) {
        errors[`variante_${index}_stock`] = stockValidation.error;
      }
    });
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validar formulario de proveedor
 */
export const validateProviderForm = (formData) => {
  const errors = {};
  
  if (!formData.proveedor || !formData.proveedor.trim()) {
    errors.proveedor = 'El nombre del proveedor es obligatorio';
  }
  
  if (formData.whattsapp) {
    const phoneValidation = validatePhone(formData.whattsapp);
    if (!phoneValidation.isValid) {
      errors.whattsapp = phoneValidation.error;
    }
  }
  
  if (formData.whattsapp2) {
    const phone2Validation = validatePhone(formData.whattsapp2);
    if (!phone2Validation.isValid) {
      errors.whattsapp2 = phone2Validation.error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
