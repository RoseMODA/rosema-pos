import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Componente Sidebar para navegación del sistema POS Rosema
 * Menú lateral fijo con color rojo principal (#D62818)
 */
const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  /**
   * Maneja el cierre de sesión del usuario
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  /**
   * Elementos del menú de navegación
   */
  const menuItems = [
    {
      name: 'Inicio',
      path: '/',
      icon: '🏠',
      description: 'Dashboard principal'
    },
    {
      name: 'Estadísticas',
      path: '/statistics',
      icon: '📊',
      description: 'Reportes y análisis'
    },
    {
      name: 'Ventas',
      path: '/sales',
      icon: '💰',
      description: 'Gestión de ventas'
    },
    {
      name: 'Productos',
      path: '/products',
      icon: '👕',
      description: 'Inventario y catálogo'
    },
    {
      name: 'Clientes',
      path: '/customers',
      icon: '👥',
      description: 'Base de clientes'
    },
    {
      name: 'Proveedores',
      path: '/suppliers',
      icon: '🏪',
      description: 'Gestión de proveedores'
    },
    {
      name: 'Metas',
      path: '/goals',
      icon: '🎯',
      description: 'Objetivos y gastos'
    },
    {
      name: 'Facturas ARCA',
      path: '/invoices',
      icon: '📄',
      description: 'Facturación electrónica'
    }
  ];

  return (
    <div className="w-64 bg-red-600 text-white flex flex-col h-full shadow-lg" style={{ backgroundColor: '#D62818' }}>
      {/* Header del sidebar */}
      <div className="p-6 border-b border-red-700">
        <div className="flex items-center">
          <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center mr-3">
            <span className="text-red-600 text-xl font-bold">R</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Rosema POS</h1>
            <p className="text-red-200 text-sm">Sistema de Ventas</p>
          </div>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="p-4 border-b border-red-700">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-red-700 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.email || 'Usuario'}
            </p>
            <p className="text-xs text-red-200">Administrador</p>
          </div>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                ${isActive 
                  ? 'bg-white text-red-600 shadow-md' 
                  : 'text-red-100 hover:bg-red-700 hover:text-white'
                }
              `}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              <div className="flex-1">
                <div className={`font-medium ${isActive ? 'text-red-600' : 'text-white'}`}>
                  {item.name}
                </div>
                <div className={`text-xs ${isActive ? 'text-red-500' : 'text-red-200'} group-hover:text-red-100`}>
                  {item.description}
                </div>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer del sidebar */}
      <div className="p-4 border-t border-red-700">
        <div className="space-y-3">
          {/* Información de la tienda */}
          <div className="text-center">
            <p className="text-xs text-red-200">Salto de las Rosas</p>
            <p className="text-xs text-red-200">WhatsApp: 260 438-1502</p>
          </div>
          
          {/* Botón de cerrar sesión */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg transition-colors duration-200"
          >
            <span className="text-sm mr-2">🚪</span>
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
