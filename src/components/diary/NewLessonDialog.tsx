import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, BookOpen, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { DiaryEntry, Student, LessonType } from '../../types/diary';

interface NewLessonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  subjectId: string;
  classId: string;
  onSuccess: () => void;
}

export const NewLessonDialog: React.FC<NewLessonDialogProps> = ({
  isOpen,
  onClose,
  schoolId,
  subjectId,
  classId,
  onSuccess
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [lastLessonNumber, setLastLessonNumber] = useState(0);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    period_number: 1,
    start_time: '08:00',
    end_time: '08:45',
    lesson_title: '',
    lesson_type: 'lecture' as LessonType,
    curriculum_unit: '',
    lesson_plan: '',
    homework: '',
    notes: '',
    absent_student_ids: [] as string[]
  });

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
      fetchLastLessonNumber();
    }
  }, [isOpen, classId]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('class_students')
        .select('student:student_id(*)')
        .eq('class_id', classId);

      if (error) throw error;

      setStudents(data.map(cs => cs.student));
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchLastLessonNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('lesson_number')
        .eq('school_id', schoolId)
        .eq('subject_id', subjectId)
        .eq('class_id', classId)
        .order('lesson_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      setLastLessonNumber(data?.[0]?.lesson_number || 0);
    } catch (error) {
      console.error('Error fetching last lesson number:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const entry: Partial<DiaryEntry> = {
        professor_id: user.id,
        school_id: schoolId,
        subject_id: subjectId,
        class_id: classId,
        date: form.date,
        period_number: form.period_number,
        lesson_number: lastLessonNumber + 1,
        start_time: form.start_time,
        end_time: form.end_time,
        lesson_title: form.lesson_title,
        lesson_type: form.lesson_type,
        curriculum_unit: form.curriculum_unit || null,
        lesson_plan: form.lesson_plan || null,
        homework: form.homework || null,
        notes: form.notes || null
      };

      const { data: diaryEntry, error: diaryError } = await supabase
        .from('diary_entries')
        .insert(entry)
        .select()
        .single();

      if (diaryError) throw diaryError;

      if (form.absent_student_ids.length > 0) {
        const absentStudents = form.absent_student_ids.map(student_id => ({
          diary_entry_id: diaryEntry.id,
          student_id
        }));

        const { error: absentError } = await supabase
          .from('absent_students')
          .insert(absentStudents);

        if (absentError) throw absentError;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating diary entry:', error);
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
            <div className="bg-slate-900 border border-white/10 rounded-lg shadow-xl w-full max-w-2xl pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Novi Čas
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Datum
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Redni broj časa
                    </label>
                    <select
                      value={form.period_number}
                      onChange={(e) => setForm({ ...form, period_number: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map(num => (
                        <option key={num} value={num}>
                          {num}. čas
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Vrijeme početka
                    </label>
                    <input
                      type="time"
                      value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Vrijeme završetka
                    </label>
                    <input
                      type="time"
                      value={form.end_time}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Nastavna jedinica
                  </label>
                  <input
                    type="text"
                    value={form.lesson_title}
                    onChange={(e) => setForm({ ...form, lesson_title: e.target.value })}
                    placeholder="Unesite naziv nastavne jedinice"
                    className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Tip časa
                    </label>
                    <select
                      value={form.lesson_type}
                      onChange={(e) => setForm({ ...form, lesson_type: e.target.value as LessonType })}
                      className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                    >
                      <option value="lecture">Obrada</option>
                      <option value="exercise">Vježba</option>
                      <option value="review">Ponavljanje</option>
                      <option value="test">Test</option>
                      <option value="written_exam">Pismeni zadatak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Nastavna oblast
                    </label>
                    <input
                      type="text"
                      value={form.curriculum_unit}
                      onChange={(e) => setForm({ ...form, curriculum_unit: e.target.value })}
                      placeholder="Unesite nastavnu oblast"
                      className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Plan časa
                  </label>
                  <textarea
                    value={form.lesson_plan}
                    onChange={(e) => setForm({ ...form, lesson_plan: e.target.value })}
                    placeholder="Unesite plan časa"
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Domaća zadaća
                  </label>
                  <textarea
                    value={form.homework}
                    onChange={(e) => setForm({ ...form, homework: e.target.value })}
                    placeholder="Unesite domaću zadaću"
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Odsutni učenici
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {students.map(student => (
                      <label
                        key={student.id}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.absent_student_ids.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                absent_student_ids: [...form.absent_student_ids, student.id]
                              });
                            } else {
                              setForm({
                                ...form,
                                absent_student_ids: form.absent_student_ids.filter(id => id !== student.id)
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-white/10 bg-slate-800 text-emerald-400 focus:ring-emerald-400/50"
                        />
                        <span className="text-white">
                          {student.first_name} {student.last_name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Napomena
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Unesite napomenu"
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end p-6 border-t border-white/10 space-x-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 transition-colors"
                >
                  Odustani
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.lesson_title}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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