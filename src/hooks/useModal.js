/**
 * Custom hook para manejar estado de modales
 */

import { useState, useCallback } from 'react';

export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);

  const openModal = useCallback((modalData = null) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
    if (isOpen) {
      setData(null);
    }
  }, [isOpen]);

  return {
    isOpen,
    data,
    openModal,
    closeModal,
    toggleModal
  };
};

/**
 * Hook para manejar múltiples modales
 */
export const useModals = (modalNames = []) => {
  const [modals, setModals] = useState(() => {
    const initialState = {};
    modalNames.forEach(name => {
      initialState[name] = {
        isOpen: false,
        data: null
      };
    });
    return initialState;
  });

  const openModal = useCallback((modalName, data = null) => {
    setModals(prev => ({
      ...prev,
      [modalName]: {
        isOpen: true,
        data
      }
    }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setModals(prev => ({
      ...prev,
      [modalName]: {
        isOpen: false,
        data: null
      }
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(prev => {
      const newState = {};
      Object.keys(prev).forEach(key => {
        newState[key] = {
          isOpen: false,
          data: null
        };
      });
      return newState;
    });
  }, []);

  const toggleModal = useCallback((modalName) => {
    setModals(prev => ({
      ...prev,
      [modalName]: {
        isOpen: !prev[modalName]?.isOpen,
        data: prev[modalName]?.isOpen ? null : prev[modalName]?.data
      }
    }));
  }, []);

  const isModalOpen = useCallback((modalName) => {
    return modals[modalName]?.isOpen || false;
  }, [modals]);

  const getModalData = useCallback((modalName) => {
    return modals[modalName]?.data || null;
  }, [modals]);

  return {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    toggleModal,
    isModalOpen,
    getModalData
  };
};
