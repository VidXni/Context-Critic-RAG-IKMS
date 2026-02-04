import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      <p className="mt-2 text-gray-600">{text}</p>
    </div>
  );
};