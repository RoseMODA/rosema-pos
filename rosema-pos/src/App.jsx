import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Statistics from './pages/Statistics';
import Sales from './pages/Sales';
import SalesNew from './pages/SalesNew';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Goals from './pages/Goals';
import Invoices from './pages/Invoices';

/**
 * Componente principal de la aplicación Rosema POS
 * Maneja el routing y la protección de rutas basada en autenticación
 */
function App() {
  const { isAuthenticated, loading } = useAuth();

  // MODO DESARROLLO: Permitir acceso directo a ventas
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Mostrar loading mientras se verifica el estado de autenticación
  if (loading && !isDevelopment) {
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
        {/* Ruta de login */}
        <Route 
          path="/login" 
          element={
            (isAuthenticated && !isDevelopment) ? <Navigate to="/" replace /> : <Login />
          } 
        />
        
        {/* MODO DESARROLLO: Ruta directa a ventas sin autenticación */}
        {isDevelopment && (
          <Route path="/sales-dev" element={<Sales />} />
        )}
        
        {/* Rutas protegidas - solo accesibles si está autenticado */}
        {(isAuthenticated || isDevelopment) ? (
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="sales" element={<Sales />} />
            <Route path="sales-new" element={<SalesNew />} />
            <Route path="products" element={<Products />} />
            <Route path="customers" element={<Customers />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="goals" element={<Goals />} />
            <Route path="invoices" element={<Invoices />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
        
        {/* Ruta por defecto */}
        <Route 
          path="*" 
          element={
            <Navigate to={(isAuthenticated || isDevelopment) ? "/" : "/login"} replace />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
