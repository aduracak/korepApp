import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Lock, 
  School, 
  BookOpen, 
  GraduationCap,
  Users as UsersIcon,
  Loader2,
  AlertCircle,
  Check,
  Plus,
  Trash
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { User, School as SchoolType, Subject as SubjectType, SchoolSubject } from '../../types';

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'professor' | 'student';
  parent_names?: string;
  parent_phone?: string;
  password?: string;
  school_subjects: SchoolSubject[];
}

const initialFormData: FormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'student',
  parent_names: '',
  parent_phone: '',
  password: '',
  school_subjects: []
};

export const UserDialog: React.FC<UserDialogProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchSchoolsAndSubjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setFormData({
        ...initialFormData,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        parent_names: user.parent_names,
        parent_phone: user.parent_phone,
        school_subjects: user.professor_schools?.reduce((acc, ps) => {
          const existingSchool = acc.find(s => s.school_id === ps.school_id);
          if (existingSchool) {
            existingSchool.subject_ids.push(ps.subject_id);
          } else {
            acc.push({
              school_id: ps.school_id,
              subject_ids: [ps.subject_id]
            });
          }
          return acc;
        }, [] as SchoolSubject[]) || []
      });
    } else {
      setFormData(initialFormData);
    }
  }, [user]);

  const fetchSchoolsAndSubjects = async () => {
    try {
      const [schoolsResponse, subjectsResponse] = await Promise.all([
        supabase.from('schools').select('*').order('name'),
        supabase.from('subjects').select('*').order('name')
      ]);

      if (schoolsResponse.error) throw schoolsResponse.error;
      if (subjectsResponse.error) throw subjectsResponse.error;

      setSchools(schoolsResponse.data);
      setSubjects(subjectsResponse.data);
    } catch (error) {
      console.error('Error fetching schools and subjects:', error);
      setError('Došlo je do greške pri učitavanju škola i predmeta');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSchool = () => {
    setFormData(prev => ({
      ...prev,
      school_subjects: [
        ...prev.school_subjects,
        { school_id: '', subject_ids: [] }
      ]
    }));
  };

  const handleRemoveSchool = (index: number) => {
    setFormData(prev => ({
      ...prev,
      school_subjects: prev.school_subjects.filter((_, i) => i !== index)
    }));
  };

  const handleSchoolChange = (index: number, school_id: string) => {
    setFormData(prev => ({
      ...prev,
      school_subjects: prev.school_subjects.map((ss, i) => 
        i === index ? { ...ss, school_id, subject_ids: [] } : ss
      )
    }));
  };

  const handleSubjectChange = (schoolIndex: number, subject_id: string) => {
    setFormData(prev => ({
      ...prev,
      school_subjects: prev.school_subjects.map((ss, i) => {
        if (i === schoolIndex) {
          const subject_ids = ss.subject_ids.includes(subject_id)
            ? ss.subject_ids.filter(id => id !== subject_id)
            : [...ss.subject_ids, subject_id];
          return { ...ss, subject_ids };
        }
        return ss;
      })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (user?.id) {
        console.log('Updating existing user:', user.id);
        console.log('Form data:', formData);

        // Update existing user
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            role: formData.role,
            parent_names: formData.role === 'student' ? formData.parent_names : null,
            parent_phone: formData.role === 'student' ? formData.parent_phone : null
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }
        console.log('Profile updated successfully');

        if (formData.role === 'professor') {
          // Prepare new professor_schools entries
          const professor_schools = formData.school_subjects
            .flatMap(ss => 
              ss.subject_ids.map(subject_id => ({
                professor_id: user.id,
                school_id: ss.school_id,
                subject_id
              }))
            )
            .filter(ps => ps.school_id && ps.subject_id);

          console.log('New professor_schools entries:', professor_schools);

          // Prvo dohvatimo postojeće zapise
          const { data: existingEntries, error: fetchError } = await supabase
            .from('professor_schools')
            .select('*')
            .eq('professor_id', user.id);

          if (fetchError) {
            console.error('Error fetching existing entries:', fetchError);
            throw fetchError;
          }
          console.log('Existing professor_schools entries:', existingEntries);

          // Provjerimo da li ima promjena
          const hasChanges = !existingEntries || existingEntries.length !== professor_schools.length || 
            !existingEntries.every(existing => 
              professor_schools.some(ps => 
                ps.school_id === existing.school_id && 
                ps.subject_id === existing.subject_id
              )
            );

          // Samo ako ima promjena, ažuriramo zapise
          if (hasChanges) {
            // Prvo brišemo postojeće zapise
            const { error: deleteError } = await supabase
              .from('professor_schools')
              .delete()
              .eq('professor_id', user.id);

            if (deleteError) {
              console.error('Error deleting professor schools:', deleteError);
              throw new Error('Greška pri brisanju postojećih škola profesora');
            }
            console.log('Existing entries deleted successfully');

            // Zatim dodajemo nove zapise ako ih ima
            if (professor_schools.length > 0) {
              const { data: inserted, error: insertError } = await supabase
                .from('professor_schools')
                .insert(professor_schools)
                .select();

              if (insertError) {
                console.error('Error inserting professor schools:', insertError);
                throw new Error('Greška pri dodavanju škola profesora');
              }
              console.log('New entries inserted successfully:', inserted);
            }
          }
        }
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
            .insert([{
              id: authUser.id,
              first_name: formData.first_name,
              last_name: formData.last_name,
              email: formData.email,
              phone: formData.phone,
              role: formData.role,
              parent_names: formData.role === 'student' ? formData.parent_names : null,
              parent_phone: formData.role === 'student' ? formData.parent_phone : null
            }]);

          if (profileError) throw profileError;

          if (formData.role === 'professor') {
            const professor_schools = formData.school_subjects
              .flatMap(ss => 
                ss.subject_ids.map(subject_id => ({
                  professor_id: authUser.id,
                  school_id: ss.school_id,
                  subject_id
                }))
              )
              .filter(ps => ps.school_id && ps.subject_id);

            if (professor_schools.length > 0) {
              const { error: psError } = await supabase
                .from('professor_schools')
                .insert(professor_schools);

              if (psError) {
                console.error('Error creating professor schools:', psError);
                throw new Error('Greška pri dodavanju škola profesora');
              }
            }
          }
        }
      }

      onClose();
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Došlo je do greške pri spremanju podataka');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
          >
            <div className="bg-slate-900 border border-white/10 rounded-lg shadow-xl w-full max-w-lg pointer-events-auto flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Uredi korisnika
                    </h2>
                    <p className="text-sm text-gray-400">
                      Uredite podatke korisnika
                    </p>
                  </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Ime
                    </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                        placeholder="Unesite ime"
                      />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Prezime
                    </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                        placeholder="Unesite prezime"
                      />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                      Telefon
                    </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                    placeholder="Unesite broj telefona"
                      />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Tip korisnika
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'professor' }))}
                      className={`p-4 rounded-lg border ${
                        formData.role === 'professor'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-white/10 text-gray-400 hover:bg-white/5'
                      } transition-colors flex items-center justify-center space-x-2`}
                    >
                      <GraduationCap className="w-5 h-5" />
                      <span>Profesor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                      className={`p-4 rounded-lg border ${
                        formData.role === 'student'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-white/10 text-gray-400 hover:bg-white/5'
                      } transition-colors flex items-center justify-center space-x-2`}
                    >
                      <BookOpen className="w-5 h-5" />
                      <span>Učenik</span>
                    </button>
                  </div>
                </div>

                {formData.role === 'professor' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-400">
                        Škole i predmeti
                      </label>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddSchool}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Dodaj školu</span>
                      </motion.button>
                    </div>

                    {formData.school_subjects.map((schoolSubject, schoolIndex) => (
                      <div key={schoolIndex} className="space-y-3 p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-4">
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                        Škola
                      </label>
                        <select
                              value={schoolSubject.school_id}
                              onChange={(e) => handleSchoolChange(schoolIndex, e.target.value)}
                              className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                        >
                          <option value="">Odaberite školu</option>
                          {schools.map(school => (
                                <option key={school.id} value={school.id}>
                                  {school.name}
                                </option>
                          ))}
                        </select>
                      </div>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleRemoveSchool(schoolIndex)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors self-end"
                          >
                            <Trash className="w-4 h-4 text-red-400" />
                          </motion.button>
                    </div>

                        {schoolSubject.school_id && (
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              Predmeti
                      </label>
                            <div className="flex flex-wrap gap-2">
                              {subjects.map(subject => (
                                <label
                                  key={subject.id}
                                  className={`px-3 py-1.5 rounded-lg border cursor-pointer flex items-center space-x-2 transition-colors ${
                                    schoolSubject.subject_ids.includes(subject.id)
                                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                      : 'border-white/10 text-gray-400 hover:bg-white/5'
                                  }`}
                                >
                        <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={schoolSubject.subject_ids.includes(subject.id)}
                                    onChange={() => handleSubjectChange(schoolIndex, subject.id)}
                                  />
                                  <BookOpen className="w-4 h-4" />
                                  <span>{subject.name}</span>
                                </label>
                              ))}
                    </div>
                  </div>
                )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end p-6 border-t border-white/10 space-x-4 flex-shrink-0">
                <button
                    onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 transition-colors"
                  >
                    Odustani
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white font-medium"
                >
                  Sačuvaj
                </button>
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 