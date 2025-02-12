import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import { AuthError } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  variant: 'professor' | 'student';
}

export const LoginDialog: React.FC<LoginDialogProps> = ({
  isOpen,
  onClose,
  variant
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const navigate = useNavigate();

  const getGradientColors = () => {
    return variant === 'professor' 
      ? 'from-emerald-400 to-cyan-400' 
      : 'from-purple-400 to-pink-400';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Pokušaj prijave
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        // Obrada specifičnih grešaka pri prijavi
        if (signInError instanceof AuthError) {
          switch (signInError.message) {
            case 'Invalid login credentials':
              throw new Error('Pogrešna email adresa ili šifra');
            case 'Email not confirmed':
              throw new Error('Molimo potvrdite vašu email adresu prije prijave');
            case 'User not found':
              throw new Error('Korisnički račun ne postoji');
            default:
              throw signInError;
          }
        }
        throw signInError;
      }

      if (user) {
        // 2. Provjeri da li je email potvrđen
        if (!user.email_confirmed_at) {
          throw new Error('Molimo potvrdite vašu email adresu prije prijave');
        }

        // 3. Provjeri ulogu u profiles tabeli
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          if (profileError.code === '42501') { // PGRST116: Row level security violation
            throw new Error('Problem sa pristupom profilu. Molimo pokušajte ponovo.');
          } else if (profileError.code === 'PGRST204') {
            throw new Error('Profil nije pronađen. Molimo kontaktirajte podršku.');
          }
          throw new Error('Problem sa pristupom profilu. Molimo pokušajte ponovo.');
        }

        if (!profile) {
          throw new Error('Profil nije pronađen. Molimo kontaktirajte podršku.');
        }

        if (profile.role !== variant) {
          throw new Error(
            variant === 'professor' 
              ? 'Niste autorizovani kao profesor. Molimo prijavite se na učenički panel.' 
              : 'Niste autorizovani kao učenik. Molimo prijavite se na profesorski panel.'
          );
        }

        // 4. Uspješna prijava - preusmjeri korisnika
        onClose();
        navigate(variant === 'professor' ? '/professor' : '/student');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Došlo je do greške prilikom prijave');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
                    <div className={`p-2.5 bg-gradient-to-r ${getGradientColors()} rounded-lg`}>
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Prijava</h2>
                      <p className="text-sm text-gray-400">
                        {variant === 'professor' ? 'Pristupite vašem profesorskom panelu' : 'Pristupite vašem učeničkom panelu'}
                      </p>
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                      Email adresa
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
                        placeholder="Unesite email adresu"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                        Šifra
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsResetPasswordOpen(true)}
                        className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Zaboravili ste šifru?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
                        placeholder="Unesite šifru"
                        required
                        disabled={isLoading}
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
                      className={`relative w-full px-4 py-2.5 bg-gradient-to-r ${getGradientColors()} hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 group`}
                    >
                      <span className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                        Prijavi se
                      </span>
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResetPasswordDialog
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
      />
    </>
  );
}; 