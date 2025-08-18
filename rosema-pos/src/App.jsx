import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Home from './pages/Home';

/**
 * Componente principal de la aplicación Rosema POS
 * Maneja el routing y la protección de rutas basada en autenticación
 */
function App() {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading mientras se verifica el estado de autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando Rosema POS...</p>
          <p className="mt-2 text-sm text-gray-500">Verificando autenticación</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Ruta de login - solo accesible si no está autenticado */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } 
        />
        
        {/* Ruta principal (Home/Dashboard) - solo accesible si está autenticado */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Home /> : <Navigate to="/login" replace />
          } 
        />
        
        {/* Ruta por defecto - redirige según el estado de autenticación */}
        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated ? "/" : "/login"} replace />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
