import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Lock, ChevronRight, ChevronLeft, Loader2, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RegisterWizardProps {
  isOpen: boolean;
  onClose: () => void;
  variant: 'professor' | 'student';
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  parent_names?: string;
  parent_phone?: string;
}

const initialFormData: FormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  confirm_password: '',
  parent_names: '',
  parent_phone: ''
};

export const RegisterWizard: React.FC<RegisterWizardProps> = ({
  isOpen,
  onClose,
  variant
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const getGradientColors = () => {
    return variant === 'professor' 
      ? 'from-emerald-400 to-cyan-400' 
      : 'from-purple-400 to-pink-400';
  };

  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(Boolean);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.first_name || !formData.last_name || !formData.phone) {
        setError('Molimo popunite sva polja');
        return;
      }
      if (variant === 'student' && (!formData.parent_names || !formData.parent_phone)) {
        setError('Molimo unesite podatke o roditelju');
        return;
      }
    }
    if (step === 2) {
      if (!formData.email || !formData.password || !formData.confirm_password) {
        setError('Molimo popunite sva polja');
        return;
      }
      if (!isPasswordValid()) {
        setError('Šifra ne zadovoljava sve uslove');
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setError('Šifre se ne podudaraju');
        return;
      }
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validacija
      if (!formData.first_name || !formData.last_name || !formData.phone || !formData.email || !formData.password) {
        throw new Error('Molimo popunite sva obavezna polja');
      }

      if (variant === 'student' && (!formData.parent_names || !formData.parent_phone)) {
        throw new Error('Molimo unesite podatke o roditelju');
      }

      if (!isPasswordValid()) {
        throw new Error('Šifra ne zadovoljava sve uslove');
      }

      if (formData.password !== formData.confirm_password) {
        throw new Error('Šifre se ne podudaraju');
      }

      // Register user with Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            role: variant,
            parent_names: variant === 'student' ? formData.parent_names : null,
            parent_phone: variant === 'student' ? formData.parent_phone : null
          }
        }
      });

      if (authError) throw authError;

      if (user) {
        // Sačekajmo da se trigger izvrši
        let profile = null;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!profile && attempts < maxAttempts) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Čekaj 1 sekundu između pokušaja
          
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (!profileError && data) {
            profile = data;
            break;
          }
          
          if (attempts === maxAttempts) {
            throw new Error('Nije moguće kreirati profil nakon više pokušaja');
          }
        }

        // Uspješna registracija
        onClose();
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Došlo je do greške prilikom registracije');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-400">
            Ime
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
              placeholder="Unesite ime"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-400">
            Prezime
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
              placeholder="Unesite prezime"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-400">
          Broj telefona
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
            placeholder="Unesite broj telefona"
            required
          />
        </div>
      </div>

      {variant === 'student' && (
        <>
          <div className="space-y-2">
            <label htmlFor="parent_names" className="block text-sm font-medium text-gray-400">
              Ime roditelja
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="parent_names"
                name="parent_names"
                value={formData.parent_names}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
                placeholder="Unesite ime roditelja"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-400">
              Broj telefona roditelja
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="parent_phone"
                name="parent_phone"
                value={formData.parent_phone}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
                placeholder="Unesite broj telefona roditelja"
                required
              />
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
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
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
            placeholder="Unesite email adresu"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-400">
          Šifra
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
            placeholder="Unesite šifru"
            required
          />
        </div>
        <div className="mt-2 space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.length ? 'bg-green-400' : 'bg-gray-600'}`}>
              {passwordValidation.length && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-400">Minimalno 8 karaktera</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.uppercase ? 'bg-green-400' : 'bg-gray-600'}`}>
              {passwordValidation.uppercase && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-400">Jedno veliko slovo</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.lowercase ? 'bg-green-400' : 'bg-gray-600'}`}>
              {passwordValidation.lowercase && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-400">Jedno malo slovo</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.number ? 'bg-green-400' : 'bg-gray-600'}`}>
              {passwordValidation.number && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-400">Jedan broj</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.special ? 'bg-green-400' : 'bg-gray-600'}`}>
              {passwordValidation.special && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-400">Jedan specijalni znak</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-400">
          Potvrda šifre
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
            placeholder="Potvrdite šifru"
            required
          />
        </div>
      </div>
    </div>
  );

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
                  <div className={`p-2.5 bg-gradient-to-r ${getGradientColors()} rounded-lg`}>
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Registracija</h2>
                    <p className="text-sm text-gray-400">
                      {variant === 'professor' ? 'Kreirajte profesorski račun' : 'Kreirajte učenički račun'}
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
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}

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

                <div className="flex items-center justify-between pt-2">
                  {step > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleBack}
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-white/5 rounded-lg text-white font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Nazad</span>
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type={step === 2 ? 'submit' : 'button'}
                    onClick={step === 1 ? handleNext : undefined}
                    disabled={isLoading}
                    className={`relative flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r ${getGradientColors()} rounded-lg text-white font-medium transition-all disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed ml-auto`}
                  >
                    <span className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                      {step === 1 ? 'Dalje' : 'Registruj se'}
                    </span>
                    {step === 1 && <ChevronRight className="w-5 h-5" />}
                    {step === 2 && isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    )}
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