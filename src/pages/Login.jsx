import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Componente de página de Login para el sistema POS Rosema
 * Maneja la autenticación de usuarios con email y contraseña
 */
const Login = () => {
  // Estados locales para el formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook personalizado para autenticación
  const { login, error, isAuthenticated, loading } = useAuth();

  // Si el usuario ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Mostrar loading mientras se verifica el estado de autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  /**
   * Maneja el envío del formulario de login
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(email, password);
      // El redirect se maneja automáticamente por el useAuth hook
    } catch (error) {
      // El error se maneja en el hook useAuth
      console.error('Error en login:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header del formulario */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">R</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Rosema POS
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Punto de Venta
          </p>
        </div>

        {/* Formulario de login */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="card-rosema">
            <div className="space-y-4">
              {/* Campo de email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-rosema"
                  placeholder="Ingrese su email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Campo de contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input-rosema"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Mostrar errores */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Botón de submit */}
              <button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="btn-rosema w-full flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Sistema POS para Tienda Rosema
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Salto de las Rosas - WhatsApp: 260 438-1502
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
