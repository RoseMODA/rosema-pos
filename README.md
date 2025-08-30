# Rosema POS - Sistema de Punto de Venta

Sistema de Punto de Venta desarrollado para la tienda Rosema, ubicada en Salto de las Rosas.

## 🏪 Información de la Tienda

- **Nombre:** Rosema
- **Ubicación:** Salto de las Rosas
- **WhatsApp:** 260 438-1502

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18+** - Biblioteca de JavaScript para interfaces de usuario
- **Vite** - Herramienta de construcción rápida
- **TailwindCSS** - Framework de CSS utilitario
- **React Router DOM** - Enrutamiento para aplicaciones React

### Backend
- **Firebase Authentication** - Autenticación de usuarios
- **Firestore Database** - Base de datos NoSQL
- **Firebase Storage** - Almacenamiento de archivos
- **Firebase Hosting** - Hosting web

## 📁 Estructura del Proyecto

```
rosema-pos/
├── src/
│   ├── assets/          # Imágenes, logos, etc.
│   ├── components/      # Componentes reutilizables
│   ├── pages/           # Páginas principales
│   ├── services/        # Configuración de Firebase
│   ├── utils/           # Funciones utilitarias
│   ├── hooks/           # Custom hooks
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Punto de entrada
│   └── style.css        # Estilos con TailwindCSS
├── public/              # Archivos estáticos
├── firebase.json        # Configuración de Firebase
└── package.json         # Dependencias y scripts
```

## 🎨 Paleta de Colores

- **Rojo Principal:** `#D62818`
- **Negro:** `#222222`
- **Blanco:** `#ffffff`
- **Gris:** `#f5f5f5`

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm, yarn, pnpm o bun

### Instalación
```bash
# Clonar el repositorio
git clone [url-del-repositorio]
cd rosema-pos

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor se ejecutará en `http://localhost:8000`

### Scripts Disponibles
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Construcción para producción
npm run preview  # Vista previa de la construcción
npm run lint     # Linter de código
```

## 🔐 Configuración de Firebase

El proyecto está configurado con Firebase para:
- **Authentication:** Autenticación con email y contraseña
- **Firestore:** Base de datos para productos, ventas, clientes, etc.
- **Storage:** Almacenamiento de imágenes de productos
- **Hosting:** Despliegue de la aplicación

### Despliegue
```bash
# Construir para producción
npm run build

# Desplegar a Firebase Hosting
firebase deploy
```

## 📋 Etapas de Desarrollo

### ✅ Etapa 1: Configuración Base (Completada)
- [x] Configuración de React con Vite
- [x] Integración con Firebase
- [x] Sistema de autenticación
- [x] Configuración de TailwindCSS
- [x] Estructura de carpetas
- [x] Componentes base (Login, Home)

### 🔄 Etapa 2: Dashboard y Navegación
- [ ] Menú lateral con navegación
- [ ] Dashboard principal con estadísticas
- [ ] Botones de acción rápida
- [ ] Mostrar fecha actual

### ⏳ Etapa 3: Sistema de Ventas
- [ ] Búsqueda de productos
- [ ] Carrito de compras
- [ ] Métodos de pago múltiples
- [ ] Gestión de stock
- [ ] Ventas en espera
- [ ] Impresión de recibos

### ⏳ Etapa 4: Gestión de Productos
- [ ] CRUD de productos
- [ ] Categorías y tags
- [ ] Gestión de stock por tallas/colores
- [ ] Subida de imágenes
- [ ] Códigos de barras

### ⏳ Etapa 5: Gestión de Clientes
- [ ] CRUD de clientes
- [ ] Historial de compras
- [ ] Estadísticas de clientes

### ⏳ Etapa 6: Gestión de Proveedores
- [ ] CRUD de proveedores
- [ ] Información detallada
- [ ] Filtros de búsqueda

### ⏳ Etapa 7: Estadísticas y Metas
- [ ] Gráficos de ventas
- [ ] Gestión de gastos
- [ ] Metas financieras

### ⏳ Etapa 8: Facturas ARCA
- [ ] Integración con sistema tributario
- [ ] Generación de facturas electrónicas

## 🔧 Funcionalidades Principales

### Sistema de Autenticación
- Login con email y contraseña
- Protección de rutas
- Manejo de sesiones
- Mensajes de error en español

### Interfaz de Usuario
- Diseño responsive
- Paleta de colores corporativa
- Componentes modulares
- Animaciones suaves

## 🤝 Contribución

Este es un proyecto privado para la tienda Rosema. Para contribuir:

1. Crear una rama para la nueva funcionalidad
2. Realizar los cambios siguiendo las convenciones del proyecto
3. Probar exhaustivamente
4. Crear un pull request

## 📞 Contacto

Para soporte o consultas sobre el sistema:
- **WhatsApp:** 260 438-1502
- **Tienda:** Rosema, Salto de las Rosas

## 📄 Licencia

Este proyecto es privado y está desarrollado específicamente para la tienda Rosema.

---

**Rosema POS** - Sistema de Punto de Venta © 2024
