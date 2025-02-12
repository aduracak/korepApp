import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, School, BookOpen, MapPin, FileText, Loader2, AlertCircle } from 'lucide-react';
import { supabaseAdmin as supabase } from '../../lib/supabase';
import type { School as SchoolType, Subject as SubjectType } from '../../types';

interface StaffroomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type DialogType = 'school' | 'subject';

export const StaffroomDialog: React.FC<StaffroomDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [activeType, setActiveType] = useState<DialogType>('school');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [schoolData, setSchoolData] = useState({
    name: '',
    address: ''
  });

  const [subjectData, setSubjectData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (activeType === 'school') {
        const { error: schoolError } = await supabase
          .from('schools')
          .insert([{
            name: schoolData.name,
            address: schoolData.address
          }]);

        if (schoolError) throw schoolError;
      } else {
        const { error: subjectError } = await supabase
          .from('subjects')
          .insert([{
            name: subjectData.name,
            description: subjectData.description
          }]);

        if (subjectError) throw subjectError;
      }

      onSuccess?.();
      onClose();
      // Reset form data
      setSchoolData({ name: '', address: '' });
      setSubjectData({ name: '', description: '' });
    } catch (err) {
      console.error('Error saving data:', err);
      setError(err instanceof Error ? err.message : 'Došlo je do greške prilikom spremanja');
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
            className="relative w-full max-w-lg"
          >
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 opacity-20 blur"></div>
            
            <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-xl border border-white/10">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
                    {activeType === 'school' ? (
                      <School className="w-6 h-6 text-white" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {activeType === 'school' ? 'Nova škola' : 'Novi predmet'}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {activeType === 'school' ? 'Dodajte novu školu' : 'Dodajte novi predmet'}
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

              <div className="p-6 border-b border-white/10">
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveType('school')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                      activeType === 'school'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <School className="w-4 h-4" />
                      <span>Škola</span>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveType('subject')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                      activeType === 'subject'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Predmet</span>
                    </div>
                  </motion.button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {activeType === 'school' ? (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="school-name" className="block text-sm font-medium text-gray-400">
                        Naziv škole
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <School className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="school-name"
                          value={schoolData.name}
                          onChange={(e) => setSchoolData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500"
                          placeholder="Unesite naziv škole"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="school-address" className="block text-sm font-medium text-gray-400">
                        Adresa
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="school-address"
                          value={schoolData.address}
                          onChange={(e) => setSchoolData(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500"
                          placeholder="Unesite adresu škole"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="subject-name" className="block text-sm font-medium text-gray-400">
                        Naziv predmeta
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BookOpen className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="subject-name"
                          value={subjectData.name}
                          onChange={(e) => setSubjectData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500"
                          placeholder="Unesite naziv predmeta"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject-description" className="block text-sm font-medium text-gray-400">
                        Opis predmeta
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                        <textarea
                          id="subject-description"
                          value={subjectData.description}
                          onChange={(e) => setSubjectData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500 min-h-[100px] resize-none"
                          placeholder="Unesite opis predmeta"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </>
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
                    className="relative px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg text-white font-medium hover:from-violet-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all"
                  >
                    <span className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                      Sačuvaj
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