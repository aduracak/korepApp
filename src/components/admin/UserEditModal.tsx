import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { User } from '@/types/database';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userData: Partial<User>) => Promise<void>;
}

export function UserEditModal({ isOpen, onClose, user, onSave }: UserEditModalProps) {
  const [formData, setFormData] = useState<Partial<User>>(user || {});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        role: 'student',
        status: 'active'
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      setError('Greška pri spremanju podataka');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {user ? 'Uredi korisnika' : 'Novi korisnik'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Osnovni podaci */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Osnovni podaci</h3>
                  
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-400">
                      Ime
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name || ''}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-400">
                      Prezime
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name || ''}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-400">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                    />
                  </div>
                </div>

                {/* Dodatni podaci */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Dodatni podaci</h3>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-400">
                      Uloga
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role || 'student'}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                    >
                      <option value="student">Učenik</option>
                      <option value="professor">Profesor</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-400">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status || 'active'}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                    >
                      <option value="active">Aktivan</option>
                      <option value="inactive">Neaktivan</option>
                    </select>
                  </div>

                  {formData.role === 'student' && (
                    <>
                      <div>
                        <label htmlFor="parent_name" className="block text-sm font-medium text-gray-400">
                          Ime roditelja
                        </label>
                        <input
                          type="text"
                          id="parent_name"
                          name="parent_name"
                          value={formData.parent_name || ''}
                          onChange={handleChange}
                          className="mt-1 w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-400">
                          Telefon roditelja
                        </label>
                        <input
                          type="tel"
                          id="parent_phone"
                          name="parent_phone"
                          value={formData.parent_phone || ''}
                          onChange={handleChange}
                          className="mt-1 w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="school" className="block text-sm font-medium text-gray-400">
                          Škola
                        </label>
                        <input
                          type="text"
                          id="school"
                          name="school"
                          value={formData.school || ''}
                          onChange={handleChange}
                          className="mt-1 w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="grade" className="block text-sm font-medium text-gray-400">
                          Razred
                        </label>
                        <input
                          type="text"
                          id="grade"
                          name="grade"
                          value={formData.grade || ''}
                          onChange={handleChange}
                          className="mt-1 w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                        />
                      </div>
                    </>
                  )}

                  {formData.role === 'professor' && (
                    <>
                      <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-400">
                          Biografija
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio || ''}
                          onChange={handleChange}
                          rows={3}
                          className="mt-1 w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="subjects" className="block text-sm font-medium text-gray-400">
                          Predmeti
                        </label>
                        <input
                          type="text"
                          id="subjects"
                          name="subjects"
                          value={formData.subjects?.join(', ') || ''}
                          onChange={(e) => {
                            const subjects = e.target.value.split(',').map(s => s.trim());
                            setFormData(prev => ({ ...prev, subjects }));
                          }}
                          className="mt-1 w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                          placeholder="Matematika, Fizika, ..."
                        />
                      </div>

                      <div>
                        <label htmlFor="qualifications" className="block text-sm font-medium text-gray-400">
                          Kvalifikacije
                        </label>
                        <input
                          type="text"
                          id="qualifications"
                          name="qualifications"
                          value={formData.qualifications?.join(', ') || ''}
                          onChange={(e) => {
                            const qualifications = e.target.value.split(',').map(q => q.trim());
                            setFormData(prev => ({ ...prev, qualifications }));
                          }}
                          className="mt-1 w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                          placeholder="Diplomirani profesor, ..."
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isLoading ? 'Spremanje...' : 'Spremi'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 