import React from 'react';

const TextArea = ({ 
  label, 
  error, 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  const baseTextAreaClasses = 'w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-300 font-medium resize-none';
  
  const variantClasses = {
    default: 'bg-gray-50 backdrop-blur-sm border border-gray-300 text-white placeholder-gray-400 focus:ring-2 focus:ring-electric-500 focus:border-electric-500',
    dark: 'bg-gray-100 backdrop-blur-sm border border-gray-200 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-electric-500 focus:border-electric-500'
  };
  
  const textAreaClasses = `${baseTextAreaClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea 
        className={textAreaClasses}
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

export default TextArea;