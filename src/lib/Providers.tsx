import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { router } from './routes';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

export function Providers() {
  return (
    <React.StrictMode>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
} 