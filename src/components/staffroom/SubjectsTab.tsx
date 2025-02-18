'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, BookOpen, Plus } from 'lucide-react';
import { supabaseAdmin as supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { StaffroomDialog } from '../admin/StaffroomDialog';
import { EditSubjectDialog } from './EditSubjectDialog';

interface Subject {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export const SubjectsTab: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      toast.error('Došlo je do greške pri učitavanju predmeta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Prvo provjeravamo povezane podatke
      const [
        { data: teachings, error: teachingsError },
        { data: lessons, error: lessonsError },
        { data: topics, error: topicsError },
        { data: tests, error: testsError },
        { data: grades, error: gradesError }
      ] = await Promise.all([
        supabase.from('teaching_schedules').select('id').eq('subject_id', id),
        supabase.from('lessons').select('id').eq('subject_id', id),
        supabase.from('topics').select('id').eq('subject_id', id),
        supabase.from('tests').select('id').eq('subject_id', id),
        supabase.from('grades').select('id').eq('subject_id', id)
      ]);

      if (teachingsError || lessonsError || topicsError || testsError || gradesError) 
        throw new Error('Greška pri provjeri povezanih podataka');

      const relatedData = [];
      if (teachings?.length) relatedData.push(`${teachings.length} časova nastave`);
      if (lessons?.length) relatedData.push(`${lessons.length} lekcija`);
      if (topics?.length) relatedData.push(`${topics.length} tema`);
      if (tests?.length) relatedData.push(`${tests.length} testova`);
      if (grades?.length) relatedData.push(`${grades.length} ocjena`);

      const message = relatedData.length > 0
        ? `Ovaj predmet ima povezane podatke:\n- ${relatedData.join('\n- ')}\n\nBrisanjem predmeta obrisat će se i svi povezani podaci. Jeste li sigurni da želite nastaviti?`
        : 'Jeste li sigurni da želite obrisati ovaj predmet?';

      if (!confirm(message)) return;

      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Predmet je uspješno obrisan');
      fetchSubjects();
    } catch (err) {
      console.error('Error deleting subject:', err);
      toast.error('Došlo je do greške pri brisanju predmeta');
    }
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Lista predmeta</h2>
        <button
          onClick={() => setIsNewDialogOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white font-medium flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novi Predmet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <motion.div
            key={subject.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10 p-6"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(subject)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{subject.name}</h3>
                {subject.description && (
                  <p className="text-sm text-gray-400">{subject.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <StaffroomDialog
        isOpen={isNewDialogOpen}
        onClose={() => setIsNewDialogOpen(false)}
        onSuccess={fetchSubjects}
      />

      {selectedSubject && (
        <EditSubjectDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          subject={selectedSubject}
          onSuccess={fetchSubjects}
        />
      )}
    </div>
  );
}; 