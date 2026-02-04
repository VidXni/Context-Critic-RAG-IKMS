import React from 'react';
import { Header } from './header';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
};