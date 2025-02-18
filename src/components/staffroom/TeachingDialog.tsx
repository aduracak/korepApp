import React, { useState } from 'react';
import { useSupabase } from '@supabase/auth-helpers-react';
import { toast } from 'react-hot-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TeachingDialog: React.FC = () => {
  const supabase = useSupabase();
  const [schoolClasses, setSchoolClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [professors, setProfessors] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedProfessor, setSelectedProfessor] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchSchoolClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('school_classes')
        .select('*')
        .order('name');
      if (error) throw error;
      setSchoolClasses(data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      toast.error('Došlo je do greške pri učitavanju razreda');
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      if (error) throw error;
      setSubjects(data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      toast.error('Došlo je do greške pri učitavanju predmeta');
    }
  };

  const fetchProfessors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professor')
        .order('first_name');
      if (error) throw error;
      setProfessors(data || []);
    } catch (err) {
      console.error('Error fetching professors:', err);
      toast.error('Došlo je do greške pri učitavanju profesora');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('teaching').insert([
        {
          class_id: selectedClass,
          subject_id: selectedSubject,
          professor_id: selectedProfessor,
        },
      ]);
      if (error) throw error;
      toast.success('Nastava je uspješno dodana');
      onClose();
    } catch (err) {
      console.error('Error adding teaching:', err);
      toast.error('Došlo je do greške pri dodavanju nastave');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Render your form components here */}
    </div>
  );
};

export default TeachingDialog; 