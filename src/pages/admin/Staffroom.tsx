import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, School, BookOpen, Plus, Loader2, AlertCircle } from 'lucide-react';
import { supabaseAdmin as supabase } from '../../lib/supabase';
import type { School as SchoolType, Subject as SubjectType } from '../../types';
import { StaffroomDialog } from '../../components/admin/StaffroomDialog';

export const Staffroom = () => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [schoolsResponse, subjectsResponse] = await Promise.all([
        supabase.from('schools').select('*').order('name'),
        supabase.from('subjects').select('*').order('name')
      ]);

      if (schoolsResponse.error) throw schoolsResponse.error;
      if (subjectsResponse.error) throw subjectsResponse.error;

      setSchools(schoolsResponse.data);
      setSubjects(subjectsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Došlo je do greške prilikom učitavanja podataka');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Zbornica</h1>
            <p className="text-gray-400">Upravljajte školama i predmetima</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsDialogOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg text-white font-medium flex items-center space-x-2 hover:from-violet-600 hover:to-purple-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Dodaj novi</span>
        </motion.button>
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Škole */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 opacity-20 blur transition duration-300 group-hover:opacity-30" />
          <div className="relative p-6 bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-lg">
                <School className="w-5 h-5 text-violet-400" />
              </div>
              <h2 className="text-lg font-medium text-white">Škole</h2>
            </div>

            <div className="space-y-3">
              {schools.map(school => (
                <div
                  key={school.id}
                  className="p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">{school.name}</h3>
                      {school.address && (
                        <p className="text-sm text-gray-400">{school.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {schools.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Nema dodanih škola
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Predmeti */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 opacity-20 blur transition duration-300 group-hover:opacity-30" />
          <div className="relative p-6 bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-violet-400" />
              </div>
              <h2 className="text-lg font-medium text-white">Predmeti</h2>
            </div>

            <div className="space-y-3">
              {subjects.map(subject => (
                <div
                  key={subject.id}
                  className="p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">{subject.name}</h3>
                      {subject.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">{subject.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {subjects.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Nema dodanih predmeta
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <StaffroomDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}; 