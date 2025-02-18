'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, GraduationCap, Plus } from 'lucide-react';
import { supabaseAdmin as supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ClassDialog } from '../admin/ClassDialog';
import { EditClassDialog } from './EditClassDialog';

interface Class {
  id: string;
  name: string;
  school_id: string;
  school: {
    name: string;
  };
  created_at: string;
}

export const ClassesTab: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('school_classes')
        .select(`
          *,
          school:schools (
            name
          )
        `)
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      toast.error('Došlo je do greške pri učitavanju razreda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj razred?')) return;

    try {
      const { error } = await supabase
        .from('school_classes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Razred je uspješno obrisan');
      fetchClasses();
    } catch (err) {
      console.error('Error deleting class:', err);
      toast.error('Došlo je do greške pri brisanju razreda');
    }
  };

  const handleEdit = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Lista razreda</h2>
        <button
          onClick={() => setIsNewDialogOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white font-medium flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novi Razred</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <motion.div
            key={classItem.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10 p-6"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(classItem)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => handleDelete(classItem.id)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{classItem.name}</h3>
                <p className="text-sm text-gray-400">{classItem.school.name}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <ClassDialog
        isOpen={isNewDialogOpen}
        onClose={() => setIsNewDialogOpen(false)}
        onSuccess={fetchClasses}
      />

      {selectedClass && (
        <EditClassDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          classItem={selectedClass}
          onSuccess={fetchClasses}
        />
      )}
    </div>
  );
}; 