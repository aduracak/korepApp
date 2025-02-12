import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  School, 
  BookOpen, 
  GraduationCap,
  Users as UsersIcon,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    role?: 'professor' | 'student';
    parent_names?: string;
    parent_phone?: string;
    subject?: string;
    school?: string;
    grades?: string[];
  };
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'professor' | 'student';
  parent_names?: string;
  parent_phone?: string;
  subject?: string;
  school?: string;
  grades?: string[];
  password?: string;
}

const initialFormData: FormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'student',
  parent_names: '',
  parent_phone: '',
  subject: '',
  school: '',
  grades: [],
  password: ''
};

export const UserDialog: React.FC<UserDialogProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([
    'Matematika',
    'Fizika',
    'Hemija',
    'Biologija',
    'Informatika',
    'Engleski jezik',
    'Njemački jezik'
  ]);
  const [schools, setSchools] = useState<string[]>([
    'Prva gimnazija',
    'Druga gimnazija',
    'Treća gimnazija',
    'Četvrta gimnazija',
    'Peta gimnazija'
  ]);

  useEffect(() => {
    if (user) {
      setFormData({
        ...initialFormData,
        ...user
      });
    } else {
      setFormData(initialFormData);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (user?.id) {
        // Update existing user
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            role: formData.role,
            parent_names: formData.role === 'student' ? formData.parent_names : null,
            parent_phone: formData.role === 'student' ? formData.parent_phone : null,
            subject: formData.role === 'professor' ? formData.subject : null,
            school: formData.role === 'professor' ? formData.school : null,
            grades: formData.role === 'professor' ? formData.grades : null
          })
          .eq('id', user.id);

        if (updateError) throw updateError;
      } else {
        // Create new user
        const { data: { user: authUser }, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password || Math.random().toString(36).slice(-8)
        });

        if (authError) throw authError;

        if (authUser) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authUser.id,
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                parent_names: formData.role === 'student' ? formData.parent_names : null,
                parent_phone: formData.role === 'student' ? formData.parent_phone : null,
                subject: formData.role === 'professor' ? formData.subject : null,
                school: formData.role === 'professor' ? formData.school : null,
                grades: formData.role === 'professor' ? formData.grades : null
              }
            ]);

          if (profileError) throw profileError;
        }
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setIsLoading(false);
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
            className="relative w-full max-w-2xl"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg opacity-20 blur"></div>
            
            <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-xl border border-white/10">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {user ? 'Uredi korisnika' : 'Novi korisnik'}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {user ? 'Uredite podatke korisnika' : 'Kreirajte novog korisnika'}
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

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
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

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-6">
                  {!user && (
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                        Email
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
                          placeholder="Unesite email"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-400">
                      Telefon
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
                        placeholder="Unesite telefon"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">
                    Tip korisnika
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData(prev => ({ ...prev, role: 'professor' }))}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${
                        formData.role === 'professor'
                          ? 'bg-blue-500/10 border-blue-500/50 text-white'
                          : 'border-white/10 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <GraduationCap className="w-6 h-6" />
                      <span>Profesor</span>
                      {formData.role === 'professor' && (
                        <Check className="w-5 h-5 ml-auto text-blue-500" />
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${
                        formData.role === 'student'
                          ? 'bg-blue-500/10 border-blue-500/50 text-white'
                          : 'border-white/10 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <BookOpen className="w-6 h-6" />
                      <span>Učenik</span>
                      {formData.role === 'student' && (
                        <Check className="w-5 h-5 ml-auto text-blue-500" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Professor Fields */}
                {formData.role === 'professor' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-400">
                        Predmet
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BookOpen className="w-5 h-5 text-gray-400" />
                        </div>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                          required
                        >
                          <option value="">Odaberite predmet</option>
                          {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="school" className="block text-sm font-medium text-gray-400">
                        Škola
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <School className="w-5 h-5 text-gray-400" />
                        </div>
                        <select
                          id="school"
                          name="school"
                          value={formData.school}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                          required
                        >
                          <option value="">Odaberite školu</option>
                          {schools.map(school => (
                            <option key={school} value={school}>{school}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Student Fields */}
                {formData.role === 'student' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="parent_names" className="block text-sm font-medium text-gray-400">
                        Ime roditelja
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UsersIcon className="w-5 h-5 text-gray-400" />
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
                        Telefon roditelja
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
                          placeholder="Unesite telefon roditelja"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Field (only for new users) */}
                {!user && (
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
                        placeholder="Ostavite prazno za automatsku generaciju"
                      />
                    </div>
                  </div>
                )}

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

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2.5 bg-white/5 rounded-lg text-white font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Odustani
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    className="relative px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white font-medium hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all"
                  >
                    <span className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                      {user ? 'Sačuvaj' : 'Kreiraj'}
                    </span>
                    {isLoading && (
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