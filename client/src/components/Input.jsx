import React from 'react';

const Input = ({ 
  label, 
  error, 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  const baseInputClasses = 'w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-300 font-medium';
  
  const variantClasses = {
    default: 'bg-neutral-800/50 backdrop-blur-sm border border-white/20 text-white placeholder-neutral-400 focus:ring-2 focus:ring-electric-500 focus:border-electric-500',
    dark: 'bg-neutral-900/70 backdrop-blur-sm border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-electric-500 focus:border-electric-500'
  };
  
  const inputClasses = `${baseInputClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-neutral-200 mb-2">
          {label}
        </label>
      )}
      <input 
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;