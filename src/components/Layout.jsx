import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

/**
 * Componente Layout principal del sistema POS Rosema
 * Responsivo con sidebar para desktop y header móvil
 */
const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Header móvil - solo visible en pantallas pequeñas */}
      <MobileHeader onMenuClick={toggleMobileMenu} />
      
      {/* Overlay para móvil cuando el menú está abierto */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}
      
      {/* Sidebar - responsive */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        fixed lg:static
        inset-y-0 left-0
        z-50 lg:z-auto
        w-64
        transition-transform duration-300 ease-in-out
        lg:transition-none
      `}>
        <Sidebar onMobileClose={closeMobileMenu} />
      </div>
      
      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Espaciado para header móvil */}
        <div className="h-16 lg:h-0" />
        
        {/* Contenido principal con scroll */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
