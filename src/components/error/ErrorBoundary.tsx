import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

export const ErrorBoundary: React.FC = () => {
  const error = useRouteError();
  
  let errorMessage = 'Došlo je do neočekivane greške.';
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-white/10"
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-red-500/10 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-white">Greška</h1>
        </div>
        
        <p className="text-gray-400 mb-6">{errorMessage}</p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/'}
          className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
        >
          Povratak na početnu
        </motion.button>
      </motion.div>
    </div>
  );
}; 