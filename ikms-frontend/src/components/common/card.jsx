import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className, title }) => {
  return (
    <div className={cn('bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700', className)}>
      {title && (
        <h3 className="text-xl font-bold mb-4 text-gray-100">{title}</h3>
      )}
      {children}
    </div>
  );
};