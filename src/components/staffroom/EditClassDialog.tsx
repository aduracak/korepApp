'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, School } from 'lucide-react';
import { supabaseAdmin as supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface School {
  id: string;
  name: string;
}

interface EditClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  classItem: {
    id: string;
    name: string;
    school_id: string;
    school: {
      name: string;
    };
  };
}

export const EditClassDialog: React.FC<EditClassDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  classItem
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    school_id: ''
  });

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setSchools(data || []);
      } catch (err) {
        console.error('Error fetching schools:', err);
        toast.error('Došlo je do greške pri učitavanju škola');
      }
    };

    if (isOpen) {
      fetchSchools();
    }
  }, [isOpen]);

  useEffect(() => {
    if (classItem) {
      setFormData({
        name: classItem.name,
        school_id: classItem.school_id
      });
    }
  }, [classItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!formData.name) {
        setError('Naziv razreda je obavezan');
        return;
      }

      if (!formData.school_id) {
        setError('Škola je obavezna');
        return;
      }

      const { error: updateError } = await supabase
        .from('school_classes')
        .update({
          name: formData.name,
          school_id: formData.school_id
        })
        .eq('id', classItem.id);

      if (updateError) throw updateError;

      toast.success('Razred je uspješno ažuriran');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error updating class:', err);
      setError('Došlo je do greške pri ažuriranju razreda');
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
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur"></div>
            
            <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-xl border border-white/10">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Uredi razred</h2>
                    <p className="text-sm text-gray-400">Uredite podatke o razredu</p>
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
                <div className="space-y-2">
                  <label htmlFor="class-name" className="block text-sm font-medium text-gray-400">
                    Naziv razreda
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GraduationCap className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="class-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white placeholder-gray-500"
                      placeholder="Unesite naziv razreda"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="school-id" className="block text-sm font-medium text-gray-400">
                    Škola
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <School className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      id="school-id"
                      value={formData.school_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, school_id: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Odaberite školu</option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-2"
                  >
                    <div className="text-sm text-red-400">{error}</div>
                  </motion.div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 transition-colors"
                  >
                    Odustani
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !formData.name || !formData.school_id}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white/100 rounded-full animate-spin" />
                        <span>Ažuriranje...</span>
                      </>
                    ) : (
                      <span>Sačuvaj promjene</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 