import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

/**
 * Custom hook para manejar la autenticación de Firebase
 * Proporciona el estado del usuario y funciones para login/logout
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efecto para escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup function para desuscribirse del listener
    return () => unsubscribe();
  }, []);

  /**
   * Función para iniciar sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise} - Promesa que resuelve con el usuario autenticado
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Error en login:', error);
      setError(getErrorMessage(error.code));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para cerrar sesión
   */
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      console.error('Error en logout:', error);
      setError('Error al cerrar sesión');
      throw error;
    }
  };

  /**
   * Función para obtener mensajes de error en español
   * @param {string} errorCode - Código de error de Firebase
   * @returns {string} - Mensaje de error en español
   */
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/user-disabled':
        return 'Usuario deshabilitado';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intente más tarde';
      default:
        return 'Error de autenticación. Verifique sus credenciales';
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
};
