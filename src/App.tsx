import React, { Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './lib/routes'
import { Toaster } from 'sonner'

// Loading komponenta
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
  </div>
)

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingSpinner />}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;