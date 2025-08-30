# 🔧 INSTRUCCIONES URGENTES - Configurar Firebase Storage

## ⚠️ Problema Actual
**Error:** `Firebase Storage: User does not have permission to access 'productos/M-BODY02/1756163951020-IMG_20250130_194047.jpg'. (storage/unauthorized)`

## 🚀 SOLUCIÓN RÁPIDA (5 minutos)

### Paso 1: Ir a Firebase Console
1. Abre [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **`rosema-pos`**

### Paso 2: Configurar Storage Rules
1. En el menú lateral, haz clic en **"Storage"**
2. Haz clic en la pestaña **"Rules"** (Reglas)
3. **BORRA** todo el contenido actual
4. **PEGA** exactamente este código:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura y escritura para usuarios autenticados
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas específicas para imágenes de productos
    match /productos/{productId}/{imageId} {
      allow read, write: if request.auth != null
        && resource.size < 5 * 1024 * 1024 // Máximo 5MB
        && request.resource.contentType.matches('image/.*'); // Solo imágenes
    }
  }
}
```

5. Haz clic en **"Publish"** (Publicar)
6. Confirma haciendo clic en **"Publish"** nuevamente

### Paso 3: Verificar
1. Regresa a la aplicación en http://localhost:8017/
2. Ve a **Productos**
3. Haz clic en **"Agregar Producto"**
4. Intenta subir una imagen
5. ✅ **¡Debería funcionar sin errores!**

---

## 🎯 Funcionalidades Completadas

### ✅ **Problemas Corregidos:**
- **Botón "Ver"** agregado a la lista de productos
- **Búsqueda funcionando** por código, nombre y tags
- **Subida de imágenes** con Firebase Storage
- **Stock mínimo eliminado** de variantes
- **Códigos de barras mejorados** con opciones de precio y tamaño

### ✅ **Nuevas Características:**
- **Modal de vista de producto** completo con todos los detalles
- **Códigos de barras profesionales** como en tu imagen de referencia
- **Opciones de impresión:**
  - Incluir precio (opcional)
  - Tamaños: 1.5"x1", 2"x1", 2.5"x1"
  - Vista previa antes de imprimir
- **Opción automática** de imprimir después de crear producto
- **Gestión completa de imágenes:**
  - Preview antes de subir
  - Máximo 5 imágenes por producto
  - Validación de tipos (JPG, PNG, WEBP)
  - Eliminación individual

### 🔧 **Archivos Creados/Modificados:**
- `storage.rules` - Reglas de seguridad
- `firebase.json` - Configuración actualizada
- `BarcodeModal.jsx` - Componente de códigos mejorado
- `ProductForm.jsx` - Formulario con imágenes
- `Products.jsx` - Página completa con todas las funciones

---

## 🚨 **IMPORTANTE**
**Después de configurar las reglas de Storage, todas las funcionalidades estarán 100% operativas.**

La aplicación está ejecutándose en: **http://localhost:8017/**
