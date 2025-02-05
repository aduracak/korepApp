import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  role: 'professor' | 'student';
}

export function AuthPopover({ isOpen, onClose, position, role }: AuthPopoverProps) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login', { state: { role } });
    onClose();
  };

  const handleRegister = () => {
    navigate('/register', { state: { role } });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />
          
          {/* Popover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{
              position: 'absolute',
              left: position.x,
              top: position.y,
              transformOrigin: 'top center'
            }}
            className="z-50 w-72 bg-slate-800/95 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">
                  {role === 'professor' ? 'Pristup profesorskom panelu' : 'Pristup učeničkom panelu'}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Odaberite način pristupa
                </p>
              </div>

              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg font-medium transition-all duration-200"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Prijava</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegister}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Nova registracija</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 