import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Componente Layout principal del sistema POS Rosema
 * Contiene el sidebar de navegación y el área de contenido principal
 */
const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar fijo */}
      <Sidebar />
      
      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Contenido principal con scroll */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
