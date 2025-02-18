import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Clock, School } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, differenceInSeconds } from 'date-fns';

interface TutoringSession {
  id: string;
  subject: {
    name: string;
  };
  professor: {
    first_name: string;
    last_name: string;
  } | null;
  start_time: string;
  duration: number;
  status: string;
  type: string;
  topics: string[];
}

interface SessionTimer {
  id: string;
  elapsed_time: number;
  is_paused: boolean;
  last_pause: string | null;
}

export const ActiveTutoring: React.FC = () => {
  const [activeSessions, setActiveSessions] = useState<TutoringSession[]>([]);
  const [sessionTimers, setSessionTimers] = useState<Record<string, SessionTimer>>({});
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchActiveSessions();
    const subscription = supabase
      .channel('tutoring_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tutoring_sessions'
      }, () => {
        fetchActiveSessions();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateElapsedTimes();
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionTimers]);

  const fetchActiveSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: sessions } = await supabase
      .from('tutoring_sessions')
      .select(`
        id,
        subject:subject_id(name),
        professor:professor_id(first_name, last_name),
        start_time,
        duration,
        status,
        type,
        topics
      `)
      .eq('student_id', user.id)
      .eq('status', 'in_progress');

    if (sessions) {
      setActiveSessions(sessions);
      fetchSessionTimers(sessions.map(s => s.id));
    }
  };

  const fetchSessionTimers = async (sessionIds: string[]) => {
    const { data: timers } = await supabase
      .from('session_timers')
      .select('*')
      .in('session_id', sessionIds);

    if (timers) {
      const timerMap: Record<string, SessionTimer> = {};
      timers.forEach(timer => {
        timerMap[timer.session_id] = timer;
      });
      setSessionTimers(timerMap);
    }
  };

  const updateElapsedTimes = () => {
    const newElapsedTimes: Record<string, number> = {};

    Object.entries(sessionTimers).forEach(([sessionId, timer]) => {
      if (!timer.is_paused) {
        const session = activeSessions.find(s => s.id === sessionId);
        if (session) {
          const startTime = new Date(session.start_time);
          const elapsed = timer.elapsed_time + differenceInSeconds(new Date(), timer.last_pause ? new Date(timer.last_pause) : startTime);
          newElapsedTimes[sessionId] = elapsed;
        }
      } else {
        newElapsedTimes[sessionId] = timer.elapsed_time;
      }
    });

    setElapsedTimes(newElapsedTimes);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = (session: TutoringSession, elapsedSeconds: number) => {
    const totalSeconds = session.duration * 60;
    return (elapsedSeconds / totalSeconds) * 100;
  };

  const handlePauseResume = async (sessionId: string, timer: SessionTimer) => {
    const now = new Date().toISOString();
    const newIsPaused = !timer.is_paused;

    const { data: updatedTimer } = await supabase
      .from('session_timers')
      .update({
        is_paused: newIsPaused,
        last_pause: now,
        elapsed_time: elapsedTimes[sessionId] || timer.elapsed_time
      })
      .eq('id', timer.id)
      .select()
      .single();

    if (updatedTimer) {
      setSessionTimers(prev => ({
        ...prev,
        [sessionId]: updatedTimer
      }));
    }
  };

  if (activeSessions.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10 p-6">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20">
            <School className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">Nema aktivnih korepeticija</h3>
            <p className="text-gray-400">Trenutno nemate aktivnih korepeticija</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeSessions.map(session => {
        const timer = sessionTimers[session.id];
        const elapsedTime = elapsedTimes[session.id] || 0;
        const progress = calculateProgress(session, elapsedTime);

        return (
          <motion.div
            key={session.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10 p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <School className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {session.subject.name}
                  </h3>
                  <p className="text-gray-400">
                    {session.professor 
                      ? `${session.professor.first_name} ${session.professor.last_name}`
                      : 'Samostalno učenje'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">
                  Počelo u {format(new Date(session.start_time), 'HH:mm')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400">
                  Preostalo vrijeme: {formatTime(elapsedTime)}
                </div>
                <div className="text-gray-400">
                  {Math.round(progress)}%
                </div>
              </div>
              <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500"
                  style={{ width: `${progress}%` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {timer && (
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => handlePauseResume(session.id, timer)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  {timer.is_paused ? (
                    <Play className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Pause className="w-5 h-5 text-yellow-400" />
                  )}
                </button>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}; 