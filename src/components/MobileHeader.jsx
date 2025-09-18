import React from 'react';
import { useAuth } from '../hooks/useAuth';

const MobileHeader = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 lg:hidden safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Botón menú */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md hover:bg-gray-100 touch-target"
          aria-label="Abrir menú"
        >
          <span className="text-xl">☰</span>
        </button>

        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/rosemalognegro.png" 
            alt="Rosema POS" 
            className="h-8 w-auto"
          />
          <span className="ml-2 text-lg font-semibold text-gray-900 hidden xs:block">
            Rosema POS
          </span>
        </div>

        {/* Usuario */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 hidden xs:block max-w-20 truncate">
            {user?.email?.split('@')[0] || 'Usuario'}
          </span>
          <button
            onClick={logout}
            className="p-2 rounded-md hover:bg-gray-100 touch-target"
            aria-label="Cerrar sesión"
          >
            <span className="text-lg">🚪</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
