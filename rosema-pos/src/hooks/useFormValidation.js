/**
 * Custom hook para validación de formularios reutilizable
 */

import { useState, useCallback, useMemo } from 'react';

export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar un campo específico
  const validateField = useCallback((fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return null;
  }, [validationRules, values]);

  // Validar todos los campos
  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validateField]);

  // Manejar cambio de valor
  const handleChange = useCallback((fieldName, value) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Validar campo si ya fue tocado
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  }, [touched, validateField]);

  // Manejar blur (campo tocado)
  const handleBlur = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Validar campo al perder foco
    const error = validateField(fieldName, values[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, [values, validateField]);

  // Resetear formulario
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Establecer errores manualmente
  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  // Establecer múltiples errores
  const setFieldErrors = useCallback((newErrors) => {
    setErrors(prev => ({
      ...prev,
      ...newErrors
    }));
  }, []);

  // Limpiar errores
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Limpiar error específico
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // Establecer valores múltiples
  const setFieldValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    try {
      const isValid = validateAll();
      if (!isValid) {
        setIsSubmitting(false);
        return false;
      }

      await onSubmit(values);
      setIsSubmitting(false);
      return true;
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }, [values, validateAll]);

  // Estado computado
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const hasErrors = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  return {
    // Estados
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    hasErrors,
    isDirty,

    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Utilidades
    validateField,
    validateAll,
    reset,
    setFieldError,
    setFieldErrors,
    clearErrors,
    clearFieldError,
    setFieldValues
  };
};

// Reglas de validación comunes
export const validationRules = {
  required: (message = 'Este campo es obligatorio') => (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return null;
  },

  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Debe tener al menos ${min} caracteres`;
    }
    return null;
  },

  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `No puede tener más de ${max} caracteres`;
    }
    return null;
  },

  email: (message = 'Email inválido') => (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message;
    }
    return null;
  },

  number: (message = 'Debe ser un número válido') => (value) => {
    if (value && isNaN(Number(value))) {
      return message;
    }
    return null;
  },

  min: (min, message) => (value) => {
    if (value && Number(value) < min) {
      return message || `Debe ser mayor o igual a ${min}`;
    }
    return null;
  },

  max: (max, message) => (value) => {
    if (value && Number(value) > max) {
      return message || `Debe ser menor o igual a ${max}`;
    }
    return null;
  },

  pattern: (regex, message = 'Formato inválido') => (value) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return null;
  },

  custom: (validator, message) => (value, allValues) => {
    if (!validator(value, allValues)) {
      return message;
    }
    return null;
  }
};
