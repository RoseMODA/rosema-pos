/**
 * Constantes del sistema POS Rosema
 */

/**
 * Categorías de productos disponibles
 */
export const PRODUCT_CATEGORIES = [
  { value: 'mujer', label: 'Mujer' },
  { value: 'hombre', label: 'Hombre' },
  { value: 'niños-bebes', label: 'Niños-Bebés' },
  { value: 'otros', label: 'Otros' }
];

/**
 * Temporadas disponibles
 */
export const SEASONS = [
  { value: 'verano', label: 'Verano' },
  { value: 'invierno', label: 'Invierno' },
  { value: 'otoño', label: 'Otoño' },
  { value: 'primavera', label: 'Primavera' },
  { value: 'todo el año', label: 'Todo el Año' }
];

/**
 * Subcategorías comunes de productos
 */
export const COMMON_SUBCATEGORIES = [
  'remeras',
  'pantalones',
  'vestidos',
  'faldas',
  'shorts',
  'buzos',
  'camperas',
  'jeans',
  'camisas',
  'blusas',
  'sweaters',
  'abrigos',
  'ropa interior',
  'calzado',
  'accesorios',
  'carteras',
  'cinturones'
];

/**
 * Métodos de pago disponibles
 */
export const PAYMENT_METHODS = [
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Transferencia', label: 'Transferencia' },
  { value: 'Débito', label: 'Débito' },
  { value: 'Crédito', label: 'Crédito' },
  { value: 'QR', label: 'QR' }
];

/**
 * Opciones de descuento predefinidas
 */
export const DISCOUNT_OPTIONS = [
  { value: 0, label: '0% (sin descuento)' },
  { value: 5, label: '5% OFF' },
  { value: 10, label: '10% OFF' },
  { value: 15, label: '15% OFF' },
  { value: 20, label: '20% OFF' }
];

/**
 * Opciones de ordenamiento para productos
 */
export const SORT_OPTIONS = [
  { value: 'created', label: 'Más Recientes' },
  { value: 'name', label: 'Ordenar por Nombre' },
  { value: 'price', label: 'Ordenar por Precio' },
  { value: 'stock', label: 'Ordenar por Stock' },
  { value: 'category', label: 'Ordenar por Categoría' }
];

/**
 * Opciones de orden (ascendente/descendente)
 */
export const ORDER_OPTIONS = [
  { value: 'asc', label: 'Ascendente' },
  { value: 'desc', label: 'Descendente' }
];

/**
 * Estados de stock
 */
export const STOCK_STATUS = {
  OUT_OF_STOCK: {
    value: 'out',
    label: 'Sin Stock',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  },
  LOW_STOCK: {
    value: 'low',
    label: 'Stock Bajo',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  IN_STOCK: {
    value: 'good',
    label: 'En Stock',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  }
};

/**
 * Límites del sistema
 */
export const LIMITS = {
  MAX_IMAGES_PER_PRODUCT: 5,
  LOW_STOCK_THRESHOLD: 5,
  MAX_VARIANTS_PER_PRODUCT: 50,
  MAX_TAGS_PER_PRODUCT: 20,
  MIN_BARCODE_LENGTH: 3,
  MIN_PRODUCT_NAME_LENGTH: 2
};

/**
 * Configuración de archivos
 */
export const FILE_CONFIG = {
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  IMAGE_QUALITY: 0.8
};

/**
 * Configuración de Firebase Storage
 */
export const STORAGE_PATHS = {
  PRODUCTS: 'productos',
  PROVIDERS: 'proveedores',
  RECEIPTS: 'recibos'
};

/**
 * Mensajes del sistema
 */
export const MESSAGES = {
  SUCCESS: {
    PRODUCT_CREATED: 'Producto creado exitosamente',
    PRODUCT_UPDATED: 'Producto actualizado exitosamente',
    PRODUCT_DELETED: 'Producto eliminado exitosamente',
    SALE_PROCESSED: 'Venta procesada exitosamente',
    PROVIDER_CREATED: 'Proveedor creado exitosamente',
    PROVIDER_UPDATED: 'Proveedor actualizado exitosamente'
  },
  ERROR: {
    PRODUCT_NOT_FOUND: 'Producto no encontrado',
    INSUFFICIENT_STOCK: 'Stock insuficiente',
    INVALID_BARCODE: 'Código de barras inválido',
    UPLOAD_FAILED: 'Error al subir archivo',
    NETWORK_ERROR: 'Error de conexión. Intente nuevamente',
    VALIDATION_ERROR: 'Por favor corrija los errores en el formulario'
  },
  CONFIRM: {
    DELETE_PRODUCT: '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
    DELETE_PROVIDER: '¿Estás seguro de que deseas eliminar este proveedor?',
    PROCESS_SALE: '¿Confirmar venta?',
    CREATE_SAMPLE_DATA: '¿Crear productos de ejemplo? Esto agregará productos de prueba a la base de datos.'
  }
};

/**
 * Configuración de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

/**
 * Configuración de búsqueda
 */
export const SEARCH_CONFIG = {
  MIN_SEARCH_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  MAX_RESULTS: 50
};

/**
 * Colores del tema
 */
export const THEME_COLORS = {
  PRIMARY: 'red-600',
  SECONDARY: 'gray-600',
  SUCCESS: 'green-600',
  WARNING: 'yellow-600',
  ERROR: 'red-600',
  INFO: 'blue-600'
};

/**
 * Clases CSS reutilizables
 */
export const CSS_CLASSES = {
  BUTTON_PRIMARY: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors',
  BUTTON_SECONDARY: 'bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors',
  INPUT: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500',
  CARD: 'bg-white rounded-lg shadow-md p-6',
  MODAL_OVERLAY: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
};
