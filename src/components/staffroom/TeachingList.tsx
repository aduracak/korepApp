import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const TeachingList: React.FC = () => {
  const [teachings, setTeachings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTeachings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('teaching')
        .select(`
          *,
          class:school_classes (
            id,
            name
          ),
          subject:subjects (
            id,
            name
          ),
          professor:profiles (
            id,
            first_name,
            last_name
          )
        `)
        .eq('professor.role', 'professor')
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
    try {
      setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col">
      {teachings.map((teaching) => (
        <div key={teaching.id} className="flex flex-col">
          <span className="font-medium">{teaching.subject.name}</span>
          <span className="text-sm text-gray-500">{teaching.class.name}</span>
          <span className="text-sm text-gray-500">
            {teaching.professor.first_name} {teaching.professor.last_name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TeachingList; 