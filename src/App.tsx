import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './lib/routes';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <RouterProvider router={router} />
    </div>
  );
};