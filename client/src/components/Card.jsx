import React from 'react';

const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  hoverEffect = false,
  ...props 
}) => {
  const baseClasses = 'rounded-2xl overflow-hidden';
  
  const variantClasses = {
    default: 'glass-effect border border-white/10',
    elevated: 'glass-effect border border-white/10 shadow-2xl',
    gradient: 'bg-gradient-to-br from-neutral-800/70 via-neutral-800/50 to-neutral-900/70 backdrop-blur-xl border border-neutral-700/50'
  };
  
  const hoverClasses = hoverEffect 
    ? 'transition-all duration-300 hover:shadow-electric-500/20 hover:shadow-2xl hover:-translate-y-1 hover:border-neutral-600/50' 
    : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;