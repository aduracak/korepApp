import React from 'react';
import { useRouteError } from 'react-router-dom';

export const ErrorBoundary: React.FC = () => {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-white/10 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Oops! Nešto je pošlo po zlu</h2>
        <p className="text-gray-400 mb-6">
          {error instanceof Error ? error.message : 'Dogodila se neočekivana greška.'}
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
        >
          Povratak na početnu
        </button>
      </div>
    </div>
  );
}; 