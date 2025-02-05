import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialFormData: FormData = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const steps = [
  {
    title: 'Lični podaci',
    description: 'Unesite vaše osnovne informacije',
    fields: ['first_name', 'last_name', 'phone'],
  },
  {
    title: 'Pristupni podaci',
    description: 'Kreirajte vaš korisnički račun',
    fields: ['email', 'password', 'confirmPassword'],
  },
];

export function RegisterWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const role = location.state?.role || 'student';

  const validateStep = (step: number) => {
    const currentFields = steps[step].fields;
    const newErrors: Partial<FormData> = {};
    let isValid = true;

    currentFields.forEach((field) => {
      const value = formData[field as keyof FormData];
      
      if (!value) {
        newErrors[field as keyof FormData] = 'Ovo polje je obavezno';
        isValid = false;
      }

      if (field === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Unesite ispravnu email adresu';
        isValid = false;
      }

      if (field === 'password' && value) {
        if (value.length < 8) {
          newErrors.password = 'Šifra mora imati najmanje 8 karaktera';
          isValid = false;
        }
        if (!/[A-Z]/.test(value)) {
          newErrors.password = 'Šifra mora sadržavati veliko slovo';
          isValid = false;
        }
        if (!/[a-z]/.test(value)) {
          newErrors.password = 'Šifra mora sadržavati malo slovo';
          isValid = false;
        }
        if (!/[0-9]/.test(value)) {
          newErrors.password = 'Šifra mora sadržavati broj';
          isValid = false;
        }
        if (!/[!@#$%^&*]/.test(value)) {
          newErrors.password = 'Šifra mora sadržavati specijalni karakter';
          isValid = false;
        }
      }

      if (field === 'confirmPassword' && value !== formData.password) {
        newErrors.confirmPassword = 'Šifre se ne podudaraju';
        isValid = false;
      }

      if (field === 'phone' && value && !/^\+?[\d\s-]{9,}$/.test(value)) {
        newErrors.phone = 'Unesite ispravan broj telefona';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    try {
      setIsLoading(true);
      await signUp({
        ...formData,
        role: role
      });
      navigate('/login', { state: { role } });
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
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
                {role === 'professor' ? 'Registracija profesora' : 'Registracija učenika'}
              </h1>
              <p className="text-gray-400 mt-1">Kreirajte vaš novi račun</p>
            </div>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>

          <div className="mb-8">
            <div className="flex justify-between relative">
              {steps.map((step, index) => (
                <React.Fragment key={step.title}>
                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        index <= currentStep
                          ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400'
                          : 'border-gray-600 text-gray-600'
                      }`}
                    >
                      {index < currentStep ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm ${
                        index <= currentStep ? 'text-emerald-400' : 'text-gray-600'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute top-5 left-0 h-[2px] w-full -z-10 transform -translate-y-1/2 ${
                        index < currentStep ? 'bg-emerald-400' : 'bg-gray-600'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {currentStep === 0 && (
                  <>
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-400 mb-1">
                        Ime
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
                        placeholder="Unesite vaše ime"
                      />
                      {errors.first_name && (
                        <p className="mt-1 text-sm text-red-400">{errors.first_name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-400 mb-1">
                        Prezime
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
                        placeholder="Unesite vaše prezime"
                      />
                      {errors.last_name && (
                        <p className="mt-1 text-sm text-red-400">{errors.last_name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">
                        Broj telefona
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
                        placeholder="+387"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                      )}
                    </div>
                  </>
                )}

                {currentStep === 1 && (
                  <>
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
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                      )}
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
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
                        Potvrda šifre
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between pt-4">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Nazad
                </button>
              )}
              <div className="ml-auto">
                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg font-medium transition-all duration-200 group"
                  >
                    Dalje
                    <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white rounded-full border-t-transparent mr-2"
                        />
                        Registracija...
                      </>
                    ) : (
                      'Završi registraciju'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          <p className="mt-8 text-center text-gray-400">
            Već imate račun?{' '}
            <button
              onClick={() => navigate('/login', { state: { role } })}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Prijavite se
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
} 