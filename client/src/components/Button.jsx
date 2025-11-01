import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '', 
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900';
  
  const variantClasses = {
    primary: 'bg-gradient-electric text-white hover:shadow-lg hover:shadow-electric-500/30 hover:scale-105 shadow-lg focus:ring-electric-500',
    secondary: 'bg-gradient-secondary text-white hover:shadow-lg hover:shadow-secondary-500/30 hover:scale-105 shadow-lg focus:ring-secondary-500',
    accent: 'bg-gradient-neon text-white hover:shadow-lg hover:shadow-neon-500/30 hover:scale-105 shadow-lg focus:ring-neon-500',
    outline: 'border-2 border-white text-white hover:bg-white hover:text-neutral-900 focus:ring-white',
    ghost: 'text-neutral-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 focus:ring-white/50',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-lg hover:shadow-red-500/30 focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : 'cursor-pointer';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;
  
  return (
    <button 
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;