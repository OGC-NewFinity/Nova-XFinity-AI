import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const Button3D = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button'
}) => {
  const baseClasses = 'font-bold rounded-xl transition-all transform relative overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30',
    secondary: 'bg-slate-800 text-white border-2 border-slate-700 hover:border-blue-500 hover:bg-slate-700',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const isDisabled = disabled || loading;
  
  return html`
    <button
      type=${type}
      className=${`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
        isDisabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:-translate-y-1 active:scale-95 active:translate-y-0'
      }`}
      onClick=${onClick}
      disabled=${isDisabled}
    >
      ${loading && html`
        <span className="absolute inset-0 flex items-center justify-center">
          <i className="fa-solid fa-spinner fa-spin"></i>
        </span>
      `}
      <span className=${loading ? 'opacity-0' : ''}>${children}</span>
    </button>
  `;
};

export default Button3D;
