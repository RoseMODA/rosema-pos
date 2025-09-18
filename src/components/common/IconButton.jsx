import React from 'react';

const IconButton = ({ 
  icon, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  children,
  className = '',
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target btn-touch';
  
  const variants = {
    primary: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-500'
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && (
        <span className={children ? 'mr-2' : ''}>{icon}</span>
      )}
      {children}
    </button>
  );
};

export default IconButton;
