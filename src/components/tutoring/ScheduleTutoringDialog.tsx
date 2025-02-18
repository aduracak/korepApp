import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, BookOpen, GraduationCap, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface ScheduleTutoringDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Subject {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
  is_current_in_school: boolean;
}

interface Professor {
  id: string;
  first_name: string;
  last_name: string;
  subject_id: string;
}

export const ScheduleTutoringDialog: React.FC<ScheduleTutoringDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<string>('');
  const [isSelfStudy, setIsSelfStudy] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [duration, setDuration] = useState(90); // 1h 30min default
  const [location, setLocation] = useState<'online' | 'in_person'>('online');
  const [studyPlan, setStudyPlan] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopics();
      fetchProfessors();
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');
    
    if (data) {
      setSubjects(data);
    }
  };

  const fetchTopics = async () => {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', selectedSubject)
      .order('name');
    
    if (data) {
      setTopics(data);
    }
  };

  const fetchProfessors = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'professor')
      .eq('subject_id', selectedSubject);
    
    if (data) {
      setProfessors(data);
    }
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('tutoring_sessions')
      .insert({
        student_id: user.id,
        professor_id: isSelfStudy ? null : selectedProfessor,
        subject_id: selectedSubject,
        start_time: date,
        duration,
        type: isSelfStudy ? 'self_study' : 'individual',
        location,
        status: 'scheduled',
        topics: selectedTopics,
        study_plan: studyPlan
      });

    if (!error) {
      onClose();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Predmet
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
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
                Tip korepeticije
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsSelfStudy(false)}
                  className={`p-4 rounded-lg border ${
                    !isSelfStudy
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-white/10 text-gray-400 hover:bg-white/5'
                  } transition-colors`}
                >
                  <GraduationCap className="w-6 h-6 mx-auto mb-2" />
                  <span className="block text-sm">Sa profesorom</span>
                </button>
                <button
                  onClick={() => setIsSelfStudy(true)}
                  className={`p-4 rounded-lg border ${
                    isSelfStudy
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-white/10 text-gray-400 hover:bg-white/5'
                  } transition-colors`}
                >
                  <User className="w-6 h-6 mx-auto mb-2" />
                  <span className="block text-sm">Samostalno učenje</span>
                </button>
              </div>
            </div>

            {!isSelfStudy && selectedSubject && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Profesor
                </label>
                <div className="space-y-2">
                  {professors.map(professor => (
                    <button
                      key={professor.id}
                      onClick={() => setSelectedProfessor(professor.id)}
                      className={`w-full p-4 rounded-lg border ${
                        selectedProfessor === professor.id
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-white/10 text-gray-400 hover:bg-white/5'
                      } transition-colors text-left`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                          {professor.first_name[0]}{professor.last_name[0]}
                        </div>
                        <div>
                          <div className="font-medium">
                            {professor.first_name} {professor.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Dostupan/na
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Teme za učenje
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {topics.map(topic => (
                  <label
                    key={topic.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTopics([...selectedTopics, topic.id]);
                        } else {
                          setSelectedTopics(selectedTopics.filter(id => id !== topic.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-white/10 bg-slate-800 text-blue-500 focus:ring-blue-500/50"
                    />
                    <div>
                      <div className="font-medium text-white">{topic.name}</div>
                      {topic.is_current_in_school && (
                        <div className="text-sm text-emerald-400">
                          Trenutno se uči u školi
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Plan učenja
              </label>
              <textarea
                value={studyPlan}
                onChange={(e) => setStudyPlan(e.target.value)}
                placeholder="Opiši šta želiš da naučiš..."
                className="w-full h-32 px-4 py-3 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white resize-none"
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Datum
                </label>
                <input
                  type="date"
                  value={format(date, 'yyyy-MM-dd')}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Vrijeme
                </label>
                <input
                  type="time"
                  value={format(date, 'HH:mm')}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const newDate = new Date(date);
                    newDate.setHours(parseInt(hours));
                    newDate.setMinutes(parseInt(minutes));
                    setDate(newDate);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Trajanje
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              >
                <option value={90}>1h 30min</option>
                <option value={120}>2h</option>
                <option value={150}>2h 30min</option>
                <option value={180}>3h</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Lokacija
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLocation('online')}
                  className={`p-4 rounded-lg border ${
                    location === 'online'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-white/10 text-gray-400 hover:bg-white/5'
                  } transition-colors`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span>Online</span>
                  </div>
                </button>
                <button
                  onClick={() => setLocation('in_person')}
                  className={`p-4 rounded-lg border ${
                    location === 'in_person'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-white/10 text-gray-400 hover:bg-white/5'
                  } transition-colors`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Uživo</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
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
            <div className="bg-slate-900 border border-white/10 rounded-lg shadow-xl w-full max-w-lg pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Zakaži Korepeticiju
                    </h2>
                    <p className="text-sm text-gray-400">
                      Korak {step} od 3
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
              <div className="p-6">
                {renderStep()}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-white/10">
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                  className="px-4 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Nazad
                </button>
                <button
                  onClick={() => {
                    if (step === 3) {
                      handleSubmit();
                    } else {
                      setStep(step + 1);
                    }
                  }}
                  disabled={
                    (step === 1 && !selectedSubject) ||
                    (step === 1 && !isSelfStudy && !selectedProfessor) ||
                    (step === 2 && selectedTopics.length === 0)
                  }
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {step === 3 ? 'Zakaži' : 'Dalje'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 