# Estructura del Código - Sistema POS Rosema

## 📁 Organización de Carpetas

### `/components/`
Componentes React organizados por funcionalidad y reutilización.

#### `/components/common/`
Componentes reutilizables en toda la aplicación:
- `StatsCard.jsx` - Tarjetas de estadísticas
- `SearchBar.jsx` - Barra de búsqueda con funcionalidad de limpieza
- `Modal.jsx` - Modal base con manejo de teclado y overlay
- `LoadingSpinner.jsx` - Spinner de carga configurable
- `ErrorMessage.jsx` - Mensajes de error con botón de reintento

#### `/components/Products/`
Componentes específicos para la gestión de productos:
- `ProductsStats.jsx` - Estadísticas de productos
- `ProductsFilters.jsx` - Panel de filtros y búsqueda
- `ProductsTable.jsx` - Tabla de productos con acciones
- `ProductDetailsModal.jsx` - Modal de detalles completos

### `/hooks/`
Custom hooks para lógica de negocio reutilizable:
- `useProductFilters.js` - Filtrado, búsqueda y ordenamiento
- `useModal.js` - Manejo de estado de modales múltiples
- `useFormValidation.js` - Validación de formularios con reglas

### `/utils/`
Funciones helper y utilidades:
- `formatters.js` - Formateo de datos (precios, fechas, etc.)
- `validators.js` - Validaciones de formularios
- `calculations.js` - Cálculos de negocio (precios, stock, etc.)
- `constants.js` - Constantes del sistema
- `productHelpers.js` - Helpers específicos para productos

### `/services/`
Servicios para comunicación con APIs y Firebase.

### `/pages/`
Páginas principales de la aplicación.

## 🎯 Principios de Diseño

### 1. **Responsabilidad Única**
Cada componente tiene una sola responsabilidad bien definida.

### 2. **Reutilización**
Componentes comunes pueden ser usados en múltiples páginas.

### 3. **Separación de Responsabilidades**
- **Componentes**: Solo presentación y UI
- **Hooks**: Lógica de negocio y estado
- **Utils**: Funciones puras y helpers
- **Services**: Comunicación con APIs

### 4. **Testabilidad**
Cada función y componente puede ser testeado de forma aislada.

## 📝 Convenciones de Código

### Importaciones
```javascript
// Hooks personalizados
import { useProductFilters } from '../hooks/useProductFilters';

// Componentes comunes
import { StatsCard, LoadingSpinner } from '../components/common';

// Utilidades
import { formatPrice, calculateTotalStock } from '../utils';
```

### Estructura de Componentes
```javascript
/**
 * Descripción del componente
 */
const ComponentName = ({ prop1, prop2, onAction }) => {
  // Hooks
  const { data, loading } = useCustomHook();
  
  // Handlers
  const handleAction = () => {
    // lógica
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### Custom Hooks
```javascript
export const useCustomHook = (initialData) => {
  // Estado
  const [data, setData] = useState(initialData);
  
  // Efectos
  useEffect(() => {
    // lógica
  }, []);
  
  // Handlers
  const handleUpdate = useCallback(() => {
    // lógica
  }, []);
  
  // Return
  return {
    data,
    loading,
    handleUpdate
  };
};
```

### Funciones Utility
```javascript
/**
 * Descripción de la función
 * @param {type} param - Descripción del parámetro
 * @returns {type} Descripción del retorno
 */
export const utilityFunction = (param) => {
  // Lógica pura sin efectos secundarios
  return result;
};
```

## 🚀 Mejores Prácticas

### 1. **Props Drilling**
Evitar pasar props a través de múltiples niveles. Usar hooks personalizados.

### 2. **Estado Local vs Global**
- Estado local: Para UI y componentes específicos
- Hooks personalizados: Para lógica compartida
- Context: Solo para estado verdaderamente global

### 3. **Manejo de Errores**
```javascript
try {
  await apiCall();
} catch (error) {
  console.error('Error específico:', error);
  // Mostrar mensaje al usuario
}
```

### 4. **Optimización**
- Usar `useCallback` para funciones que se pasan como props
- Usar `useMemo` para cálculos costosos
- Evitar re-renders innecesarios

## 🔧 Herramientas de Desarrollo

### Debugging
```javascript
// En desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

### Testing
```javascript
// Ejemplo de test para componente
import { render, screen } from '@testing-library/react';
import StatsCard from './StatsCard';

test('renders stats card with correct value', () => {
  render(<StatsCard title="Test" value={100} />);
  expect(screen.getByText('100')).toBeInTheDocument();
});
```

## 📚 Recursos Adicionales

- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**Mantener esta estructura para un código limpio y escalable** ✨
