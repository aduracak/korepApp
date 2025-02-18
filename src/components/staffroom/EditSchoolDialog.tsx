'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, School, MapPin } from 'lucide-react';
import { supabaseAdmin as supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface EditSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  school: {
    id: string;
    name: string;
    address: string | null;
  };
}

export const EditSchoolDialog: React.FC<EditSchoolDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  school
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });

  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name,
        address: school.address || ''
      });
    }
  }, [school]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!formData.name) {
        setError('Naziv škole je obavezan');
        return;
      }

      const { error: updateError } = await supabase
        .from('schools')
        .update({
          name: formData.name,
          address: formData.address || null
        })
        .eq('id', school.id);

      if (updateError) throw updateError;

      toast.success('Škola je uspješno ažurirana');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error updating school:', err);
      setError('Došlo je do greške pri ažuriranju škole');
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
                    <School className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Uredi školu</h2>
                    <p className="text-sm text-gray-400">Uredite podatke o školi</p>
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
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500"
                      placeholder="Unesite adresu škole"
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
                    disabled={isLoading || !formData.name}
                    className="px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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