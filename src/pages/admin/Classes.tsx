import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, AlertCircle, School, BookOpen, Pencil, Trash2 } from 'lucide-react';
import { supabaseAdmin } from '../../lib/supabase';
import { ClassDialog } from '../../components/admin/ClassDialog';
import type { Class as ClassType, School as SchoolType, Subject as SubjectType } from '../../types';

interface ClassWithDetails extends Omit<ClassType, 'school' | 'subjects'> {
  school: SchoolType;
  subjects: SubjectType[];
}

export const Classes: React.FC = () => {
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Dohvatimo razrede sa školama i predmetima u jednom upitu
      const { data: classesWithDetails, error: classesError } = await supabaseAdmin
        .from('classes')
        .select(`
          *,
          school:schools (*),
          subjects:class_subjects (
            subject:subjects (*)
          )
        `)
        .order('name');

      if (classesError) throw classesError;

      if (!classesWithDetails) {
        setClasses([]);
        return;
      }

      // Transformiramo podatke u željeni format
      const formattedClasses = classesWithDetails.map(classItem => ({
        ...classItem,
        subjects: classItem.subjects.map(s => s.subject)
      }));

      setClasses(formattedClasses);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Došlo je do greške prilikom učitavanja razreda. Molimo pokušajte ponovo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDelete = async (classId: string) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovaj razred?')) return;

    try {
      setError('');

      const { error: deleteError } = await supabaseAdmin
        .from('classes')
        .delete()
        .eq('id', classId);

      if (deleteError) throw deleteError;

      setClasses(prev => prev.filter(c => c.id !== classId));
    } catch (err) {
      console.error('Error deleting class:', err);
      setError('Došlo je do greške prilikom brisanja razreda. Molimo pokušajte ponovo.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Razredi</h1>
          <p className="text-gray-400">Upravljajte razredima i njihovim predmetima</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setSelectedClassId(null);
            setIsDialogOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg text-white font-medium hover:from-violet-600 hover:to-purple-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Novi razred</span>
        </motion.button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="p-4 bg-violet-500/10 rounded-full mb-4">
            <School className="w-8 h-8 text-violet-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Nema razreda</h3>
          <p className="text-gray-400 max-w-sm">
            Još uvijek niste dodali nijedan razred. Kliknite na dugme "Novi razred" da dodate prvi razred.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(classItem => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 opacity-20 blur group-hover:opacity-30 transition-opacity"></div>
              <div className="relative p-6 bg-slate-800/90 backdrop-blur-xl rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-violet-500/10 rounded-lg">
                      <School className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{classItem.name}</h3>
                      <p className="text-sm text-gray-400">{classItem.school?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedClassId(classItem.id);
                        setIsDialogOpen(true);
                      }}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-gray-400" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(classItem.id)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </motion.button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <BookOpen className="w-4 h-4" />
                    <span>{classItem.subjects?.length || 0} predmeta</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {classItem.subjects?.map(subject => (
                      <span
                        key={subject.id}
                        className="px-2.5 py-1 text-xs font-medium bg-violet-500/10 text-violet-400 rounded-full"
                      >
                        {subject.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ClassDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedClassId(null);
        }}
        onSuccess={() => {
          fetchClasses();
          setIsDialogOpen(false);
          setSelectedClassId(null);
        }}
        classId={selectedClassId || undefined}
      />
    </div>
  );
} 