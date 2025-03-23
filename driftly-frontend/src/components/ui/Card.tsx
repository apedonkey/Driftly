import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-secondary-bg shadow-md rounded-lg overflow-hidden border border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

export default Card; 