import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const role = location.state?.role;

  useEffect(() => {
    if (user) {
      if (user.role === 'professor' && role === 'professor') {
        navigate('/professor');
      } else if (user.role === 'student' && role === 'student') {
        navigate('/ucenik');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        setError('Nemate pristup ovom panelu. Molimo prijavite se sa odgovarajućim računom.');
      }
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      await signIn(formData.email, formData.password);
    } catch (error) {
      setError('Neispravni podaci za prijavu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-white/10">
          <div className="flex items-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </motion.button>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-white">
                {role === 'professor' ? 'Prijava profesora' : role === 'student' ? 'Prijava učenika' : 'Prijava'}
              </h1>
              <p className="text-gray-400 mt-1">Prijavite se na vaš račun</p>
            </div>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                Email adresa
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
                placeholder="vasa@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                Šifra
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-600 text-emerald-400 focus:ring-emerald-400/50 focus:ring-offset-0 bg-slate-900/50"
                />
                <span className="ml-2 text-sm text-gray-400">Zapamti me</span>
              </label>

              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                Zaboravili ste šifru?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 group"
            >
              <span className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <LogIn className="w-5 h-5 inline-block mr-2" />
                Prijava
              </span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white rounded-full border-t-transparent"
                  />
                </div>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-400">
            Nemate račun?{' '}
            <button
              onClick={() => navigate('/register', { state: { role } })}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Registrujte se
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
} 