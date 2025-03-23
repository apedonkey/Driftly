import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'gray';
  className?: string;
}

const variantClasses = {
  success: 'bg-green-900/30 text-green-300 border border-green-700',
  error: 'bg-red-900/30 text-red-300 border border-red-700',
  warning: 'bg-yellow-900/30 text-yellow-300 border border-yellow-700',
  info: 'bg-blue-900/30 text-blue-300 border border-blue-700',
  gray: 'bg-gray-800 text-gray-300 border border-gray-700'
};

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'gray',
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const variantClass = variantClasses[variant];
  
  return (
    <span className={`${baseClasses} ${variantClass} ${className}`}>
      {children}
    </span>
  );
};

export default Badge; 