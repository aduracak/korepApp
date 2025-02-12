import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export const Subjects: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Predmeti</h1>
          <p className="text-gray-400">Upravljajte svojim predmetima</p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="p-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full opacity-20">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">Uskoro dostupno</h3>
          <p className="text-gray-400">Ova funkcionalnost će biti dostupna uskoro</p>
        </div>
      </div>
    </div>
  );
}; 