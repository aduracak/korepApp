import React from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon } from 'lucide-react';

export const History = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg">
          <HistoryIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Historija</h1>
          <p className="text-gray-400">Pregledajte historiju aktivnosti</p>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 opacity-20 blur transition duration-300 group-hover:opacity-30" />
          <div className="relative p-6 bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10">
            <h2 className="text-lg font-medium text-white mb-4">Nedavne Aktivnosti</h2>
            {/* Add your content here */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 