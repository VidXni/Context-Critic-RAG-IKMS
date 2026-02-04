import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  className,
  ...props 
}) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};