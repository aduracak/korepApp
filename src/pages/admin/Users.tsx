import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users as UsersIcon, Search, Filter, Plus, Mail, Phone, User as UserIcon, Users as UsersGroupIcon, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { UserDialog } from '../../components/admin/UserDialog';
import { UsersGrid } from '../../components/admin/UsersGrid';
import type { User } from '../../types';

interface ProfessorSchool {
  id: string;
  school_id: string;
  subject_id: string;
  school: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  };
}

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          professor_schools (
            id,
            school:school_id (
              id,
              name
            ),
            subject:subject_id (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Došlo je do greške prilikom učitavanja korisnika');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsDeleting(userId);
      setError(null);

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Također moramo obrisati korisnika iz auth tabele
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) throw authError;

      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Došlo je do greške prilikom brisanja korisnika');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && user.role === selectedFilter;
  });

  const handleOpenDialog = (user?: User) => {
    setSelectedUser(user || undefined);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedUser(undefined);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <UsersIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Korisnici</h1>
            <p className="text-gray-400">Upravljajte profesorima i učenicima</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenDialog()}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white font-medium flex items-center space-x-2 hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
        >
          <span>Novi korisnik</span>
        </motion.button>
      </div>

      <UsersGrid onEdit={handleOpenDialog} />

      <UserDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        user={selectedUser}
      />
    </div>
  );
}; 