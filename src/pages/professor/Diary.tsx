import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, School, GraduationCap, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { School as SchoolType, SchoolClass, DiaryEntry, DiaryFilters } from '../../types/diary';
import { NewLessonDialog } from '../../components/diary/NewLessonDialog';

export const Diary: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string; }[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filters, setFilters] = useState<DiaryFilters>({
    school_id: null,
    subject_id: null,
    class_id: null
  });
  const [isNewLessonDialogOpen, setIsNewLessonDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfessorSchools();
  }, []);

  useEffect(() => {
    if (filters.school_id) {
      fetchSchoolClasses();
      fetchProfessorSubjects();
    }
  }, [filters.school_id]);

  useEffect(() => {
    if (filters.school_id && filters.subject_id && filters.class_id) {
      fetchDiaryEntries();
    }
  }, [filters]);

  const fetchProfessorSchools = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: professorSchools, error } = await supabase
        .from('professor_schools')
        .select(`
          id,
          school:school_id(
            id,
            name
          )
        `)
        .eq('professor_id', user.id);

      if (error) throw error;

      const uniqueSchools = Array.from(
        new Set(professorSchools.map(ps => ps.school.id))
      ).map(id => professorSchools.find(ps => ps.school.id === id)?.school);

      setSchools(uniqueSchools);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfessorSubjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('professor_schools')
        .select(`
          subject:subject_id(
            id,
            name
          )
        `)
        .eq('professor_id', user.id)
        .eq('school_id', filters.school_id);

      if (error) throw error;

      const uniqueSubjects = Array.from(
        new Set(data.map(ps => ps.subject.id))
      ).map(id => data.find(ps => ps.subject.id === id)?.subject);

      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchSchoolClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('school_classes')
        .select('*')
        .eq('school_id', filters.school_id)
        .order('year')
        .order('name');

      if (error) throw error;

      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchDiaryEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('diary_entries')
        .select(`
          *,
          school:school_id(*),
          class:class_id(*),
          subject:subject_id(*),
          absent_students(
            id,
            student:student_id(
              id,
              first_name,
              last_name
            )
          )
        `)
        .eq('professor_id', user.id)
        .eq('school_id', filters.school_id)
        .eq('subject_id', filters.subject_id)
        .eq('class_id', filters.class_id)
        .order('date', { ascending: false })
        .order('period_number');

      if (error) throw error;

      setEntries(data);
    } catch (error) {
      console.error('Error fetching diary entries:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Dnevnik</h1>
            <p className="text-gray-400">Pregled i upravljanje dnevnikom</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsNewLessonDialogOpen(true)}
          disabled={!filters.school_id || !filters.subject_id || !filters.class_id}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg text-white font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          <span>Novi Čas</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Škola
          </label>
          <select
            value={filters.school_id || ''}
            onChange={(e) => setFilters({ ...filters, school_id: e.target.value || null, subject_id: null, class_id: null })}
            className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
          >
            <option value="">Odaberi školu</option>
            {schools.map(school => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Predmet
          </label>
          <select
            value={filters.subject_id || ''}
            onChange={(e) => setFilters({ ...filters, subject_id: e.target.value || null, class_id: null })}
            disabled={!filters.school_id}
            className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Odaberi predmet</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Razred
          </label>
          <select
            value={filters.class_id || ''}
            onChange={(e) => setFilters({ ...filters, class_id: e.target.value || null })}
            disabled={!filters.school_id || !filters.subject_id}
            className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Odaberi razred</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      {!filters.school_id || !filters.subject_id || !filters.class_id ? (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10 p-6">
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Odaberite filtere</h2>
            <p className="text-gray-400">
              Odaberite školu, predmet i razred da vidite dnevnik
            </p>
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10 p-6">
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Dnevnik je prazan</h2>
            <p className="text-gray-400">
              Kliknite na "Novi Čas" da dodate prvi čas u dnevnik
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {entry.lesson_title}
                    </h3>
                    <p className="text-gray-400">
                      Čas #{entry.lesson_number} • {entry.period_number}. čas
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(entry.date).toLocaleDateString('bs')}
                </div>
              </div>

              {entry.absent_students && entry.absent_students.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">
                    Odsutni učenici:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {entry.absent_students.map(absent => (
                      <div
                        key={absent.id}
                        className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-400"
                      >
                        {absent.student?.first_name} {absent.student?.last_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {entry.notes && (
                <div className="mt-4 text-sm text-gray-400">
                  {entry.notes}
                </div>
              )}
    </motion.div>
          ))}
        </div>
      )}

      {/* New Lesson Dialog */}
      {filters.school_id && filters.subject_id && filters.class_id && (
        <NewLessonDialog
          isOpen={isNewLessonDialogOpen}
          onClose={() => setIsNewLessonDialogOpen(false)}
          schoolId={filters.school_id}
          subjectId={filters.subject_id}
          classId={filters.class_id}
          onSuccess={() => {
            setIsNewLessonDialogOpen(false);
            fetchDiaryEntries();
          }}
        />
      )}
    </div>
  );
}; 