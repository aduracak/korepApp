'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, CalendarDays, Plus } from 'lucide-react';
import { supabaseAdmin as supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { TeachingDialog } from '../admin/TeachingDialog';
import { EditTeachingDialog } from './EditTeachingDialog';

interface Teaching {
  id: string;
  class_id: string;
  subject_id: string;
  professor_id: string;
  class: {
    name: string;
  };
  subject: {
    name: string;
  };
  professor: {
    first_name: string;
    last_name: string;
  };
  created_at: string;
}

export const TeachingTab: React.FC = () => {
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTeaching, setSelectedTeaching] = useState<Teaching | null>(null);

  const fetchTeachings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('teaching')
        .select(`
          *,
          class:school_classes (
            name
          ),
          subject:subjects (
            name
          ),
          professor:profiles (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachings(data || []);
    } catch (err) {
      console.error('Error fetching teachings:', err);
      toast.error('Došlo je do greške pri učitavanju nastave');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovu nastavu?')) return;

    try {
      const { error } = await supabase
        .from('teaching')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Nastava je uspješno obrisana');
      fetchTeachings();
    } catch (err) {
      console.error('Error deleting teaching:', err);
      toast.error('Došlo je do greške pri brisanju nastave');
    }
  };

  const handleEdit = (teaching: Teaching) => {
    setSelectedTeaching(teaching);
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    fetchTeachings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Lista nastave</h2>
        <button
          onClick={() => setIsNewDialogOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg text-white font-medium flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Nastava</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachings.map((teaching) => (
          <motion.div
            key={teaching.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10 p-6"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(teaching)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => handleDelete(teaching.id)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{teaching.subject.name}</h3>
                <p className="text-sm text-gray-400">{teaching.class.name}</p>
                <p className="text-sm text-gray-400">
                  {teaching.professor.first_name} {teaching.professor.last_name}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <TeachingDialog
        isOpen={isNewDialogOpen}
        onClose={() => setIsNewDialogOpen(false)}
        onSuccess={fetchTeachings}
      />

      {selectedTeaching && (
        <EditTeachingDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          teaching={selectedTeaching}
          onSuccess={fetchTeachings}
        />
      )}
    </div>
  );
}; 