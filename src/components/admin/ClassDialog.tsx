import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, School, BookOpen, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabaseAdmin } from '../../lib/supabase';
import type { School as SchoolType, Subject as SubjectType } from '../../types';

interface ClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  classId?: string;
}

export const ClassDialog: React.FC<ClassDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  classId
}) => {
  const [name, setName] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (classId) {
        fetchClassDetails();
      } else {
        resetForm();
      }
    }
  }, [isOpen, classId]);

  const resetForm = () => {
    setName('');
    setSelectedSchool('');
    setSelectedSubjects([]);
    setError('');
    setSuccess('');
  };

  const fetchData = async () => {
    try {
      setIsFetching(true);
      setError('');

      const [schoolsResponse, subjectsResponse] = await Promise.all([
        supabaseAdmin
          .from('schools')
          .select('*')
          .order('name'),
        supabaseAdmin
          .from('subjects')
          .select('*')
          .order('name')
      ]);

      if (schoolsResponse.error) throw schoolsResponse.error;
      if (subjectsResponse.error) throw subjectsResponse.error;

      setSchools(schoolsResponse.data || []);
      setSubjects(subjectsResponse.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Došlo je do greške prilikom učitavanja podataka. Molimo pokušajte ponovo.');
    } finally {
      setIsFetching(false);
    }
  };

  const fetchClassDetails = async () => {
    if (!classId) return;

    try {
      setIsFetching(true);
      setError('');

      const { data: classData, error: classError } = await supabaseAdmin
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (classError) throw classError;

      if (classData) {
        setName(classData.name);
        setSelectedSchool(classData.school_id);

        const { data: subjectsData, error: subjectsError } = await supabaseAdmin
          .from('class_subjects')
          .select('subject_id')
          .eq('class_id', classId);

        if (subjectsError) throw subjectsError;

        setSelectedSubjects(subjectsData?.map(s => s.subject_id) || []);
      }
    } catch (err) {
      console.error('Error fetching class details:', err);
      setError('Došlo je do greške prilikom učitavanja detalja razreda');
      onClose();
    } finally {
      setIsFetching(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError('Molimo unesite naziv razreda');
      return false;
    }
    if (!selectedSchool) {
      setError('Molimo odaberite školu');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // 1. Kreiraj ili ažuriraj razred
      const classData = {
        name: name.trim(),
        school_id: selectedSchool
      };

      let classResponse;
      if (classId) {
        classResponse = await supabaseAdmin
          .from('classes')
          .update(classData)
          .eq('id', classId)
          .select()
          .single();
      } else {
        classResponse = await supabaseAdmin
          .from('classes')
          .insert(classData)
          .select()
          .single();
      }

      if (classResponse.error) {
        if (classResponse.error.code === '23505') {
          throw new Error('Razred s ovim imenom već postoji u odabranoj školi');
        }
        throw classResponse.error;
      }

      const newClassId = classResponse.data.id;

      // 2. Ako ažuriramo postojeći razred, prvo obrišimo sve postojeće veze s predmetima
      if (classId) {
        const { error: deleteError } = await supabaseAdmin
          .from('class_subjects')
          .delete()
          .eq('class_id', classId);

        if (deleteError) throw deleteError;
      }

      // 3. Dodaj nove veze s predmetima
      if (selectedSubjects.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from('class_subjects')
          .insert(
            selectedSubjects.map(subjectId => ({
              class_id: newClassId,
              subject_id: subjectId
            }))
          );

        if (insertError) throw insertError;
      }

      setSuccess('Razred je uspješno sačuvan');
      onSuccess?.();

      // Resetuj formu i zatvori dijalog nakon 1 sekunde
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error saving class:', err);
      setError(err instanceof Error ? err.message : 'Došlo je do greške prilikom spremanja razreda');
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
                    <h2 className="text-xl font-semibold text-white">
                      {classId ? 'Uredi razred' : 'Novi razred'}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {classId ? 'Uredite postojeći razred' : 'Dodajte novi razred'}
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

              {isFetching ? (
                <div className="p-6 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="class-name" className="block text-sm font-medium text-gray-400">
                      Naziv razreda
                    </label>
                    <input
                      type="text"
                      id="class-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-500"
                      placeholder="Unesite naziv razreda"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="school" className="block text-sm font-medium text-gray-400">
                      Škola
                    </label>
                    <select
                      id="school"
                      value={selectedSchool}
                      onChange={(e) => setSelectedSchool(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Odaberite školu</option>
                      {schools.map(school => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">
                      Predmeti
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {subjects.map(subject => (
                        <label
                          key={subject.id}
                          className="flex items-center space-x-2 p-2 rounded-lg bg-slate-900/50 border border-white/10 cursor-pointer hover:bg-slate-900/70 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubjects.includes(subject.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSubjects(prev => [...prev, subject.id]);
                              } else {
                                setSelectedSubjects(prev => prev.filter(id => id !== subject.id));
                              }
                            }}
                            className="rounded border-white/10 bg-slate-800 text-violet-500 focus:ring-violet-500/50"
                            disabled={isLoading}
                          />
                          <span className="text-sm text-white">{subject.name}</span>
                        </label>
                      ))}
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

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start space-x-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-emerald-400">{success}</p>
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
                        {classId ? 'Sačuvaj izmjene' : 'Dodaj razred'}
                      </span>
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 