import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Key, Loader2, AlertCircle } from 'lucide-react';

interface RconAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rconCode: string) => Promise<boolean>;
}

export const RconAuthModal: React.FC<RconAuthModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [rconCode, setRconCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const isValid = await onSubmit(rconCode);
      if (isValid) {
        setAttempts(0);
        onClose();
      } else {
        setAttempts(prev => prev + 1);
        if (attempts + 1 >= MAX_ATTEMPTS) {
          setError('Previše neuspješnih pokušaja. Bićete preusmjereni na početnu stranicu.');
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setError(`Pogrešna RCON šifra. Preostalo pokušaja: ${MAX_ATTEMPTS - (attempts + 1)}`);
        }
      }
    } catch (err) {
      setError('Došlo je do greške. Pokušajte ponovo.');
    } finally {
      setIsLoading(false);
      setRconCode('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg opacity-20 blur"></div>
            
            <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-xl border border-white/10">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-lg border border-white/10">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">RCON Autentifikacija</h2>
                    <p className="text-sm text-gray-400">Unesite vašu RCON šifru</p>
                  </div>
                </div>
                {!isLoading && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </motion.button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="rconCode" className="block text-sm font-medium text-gray-400">
                    RCON Šifra
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="rconCode"
                      value={rconCode}
                      onChange={(e) => setRconCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
                      placeholder="Unesite RCON šifru"
                      required
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-2"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}

                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 group"
                  >
                    <span className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                      Potvrdi
                    </span>
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 