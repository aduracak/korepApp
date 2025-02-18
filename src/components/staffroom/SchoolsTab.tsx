'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, School, Plus } from 'lucide-react';
import { supabaseAdmin as supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { StaffroomDialog } from '../admin/StaffroomDialog';
import { EditSchoolDialog } from './EditSchoolDialog';

interface School {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
}

export const SchoolsTab: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (error) throw error;
      setSchools(data || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
      toast.error('Došlo je do greške pri učitavanju škola');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Prvo provjeravamo ima li škola povezanih razreda
      const { data: classes, error: classesError } = await supabase
        .from('school_classes')
        .select('id')
        .eq('school_id', id);

      if (classesError) throw classesError;

      const message = classes && classes.length > 0
        ? `Ova škola ima ${classes.length} povezanih razreda. Brisanjem škole obrisat će se i svi povezani razredi i nastava. Jeste li sigurni da želite nastaviti?`
        : 'Jeste li sigurni da želite obrisati ovu školu?';

      if (!confirm(message)) return;

      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Škola je uspješno obrisana');
      fetchSchools();
    } catch (err) {
      console.error('Error deleting school:', err);
      toast.error('Došlo je do greške pri brisanju škole');
    }
  };

  const handleEdit = (school: School) => {
    setSelectedSchool(school);
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Lista škola</h2>
        <button
          onClick={() => setIsNewDialogOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg text-white font-medium flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Škola</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((school) => (
          <motion.div
            key={school.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10 p-6"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(school)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => handleDelete(school.id)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
                <School className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{school.name}</h3>
                {school.address && (
                  <p className="text-sm text-gray-400">{school.address}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <StaffroomDialog
        isOpen={isNewDialogOpen}
        onClose={() => setIsNewDialogOpen(false)}
        onSuccess={fetchSchools}
      />

      {selectedSchool && (
        <EditSchoolDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          school={selectedSchool}
          onSuccess={fetchSchools}
        />
      )}
    </div>
  );
}; 