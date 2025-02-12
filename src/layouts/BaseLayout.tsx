import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export const BaseLayout: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white"
    >
      <Outlet />
    </motion.div>
  );
}; 