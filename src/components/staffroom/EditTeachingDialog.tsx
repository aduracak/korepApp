'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarDays, GraduationCap, BookOpen, User } from 'lucide-react';
import { supabaseAdmin as supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface School {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
}

interface EditTeachingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  teaching: {
    id: string;
    class_id: string;
    subject_id: string;
    professor_id: string;
  };
}

export const EditTeachingDialog: React.FC<EditTeachingDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  teaching
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    professor_id: ''
  });

  useEffect(() => {
    if (teaching) {
      setFormData({
        class_id: teaching.class_id,
        subject_id: teaching.subject_id,
        professor_id: teaching.professor_id
      });
    }
  }, [teaching]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesResponse, subjectsResponse, teachersResponse] = await Promise.all([
          supabase.from('school_classes').select('id, name').order('name'),
          supabase.from('subjects').select('id, name').order('name'),
          supabase.from('profiles').select('id, first_name, last_name').eq('role', 'professor').order('first_name')
        ]);

        if (classesResponse.error) throw classesResponse.error;
        if (subjectsResponse.error) throw subjectsResponse.error;
        if (teachersResponse.error) throw teachersResponse.error;

        setClasses(classesResponse.data || []);
        setSubjects(subjectsResponse.data || []);
        setTeachers(teachersResponse.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Došlo je do greške pri učitavanju podataka');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!formData.class_id || !formData.subject_id || !formData.professor_id) {
        setError('Sva polja su obavezna');
        return;
      }

      const { error: updateError } = await supabase
        .from('teaching')
        .update({
          class_id: formData.class_id,
          subject_id: formData.subject_id,
          professor_id: formData.professor_id
        })
        .eq('id', teaching.id);

      if (updateError) throw updateError;

      toast.success('Nastava je uspješno ažurirana');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error updating teaching:', err);
      setError('Došlo je do greške pri ažuriranju nastave');
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
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 opacity-20 blur"></div>
            
            <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-xl border border-white/10">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg">
                    <CalendarDays className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Uredi nastavu</h2>
                    <p className="text-sm text-gray-400">Uredite podatke o nastavi</p>
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
                  <label htmlFor="class-id" className="block text-sm font-medium text-gray-400">
                    Razred
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GraduationCap className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      id="class-id"
                      value={formData.class_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, class_id: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-white"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Odaberite razred</option>
                      {classes.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject-id" className="block text-sm font-medium text-gray-400">
                    Predmet
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      id="subject-id"
                      value={formData.subject_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject_id: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-white"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Odaberite predmet</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="teacher-id" className="block text-sm font-medium text-gray-400">
                    Profesor
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      id="teacher-id"
                      value={formData.professor_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, professor_id: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-white"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Odaberite profesora</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.first_name} {teacher.last_name}
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
                    disabled={isLoading || !formData.class_id || !formData.subject_id || !formData.professor_id}
                    className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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