import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Filter,
  BookOpen,
  Loader2,
  Trash2,
  PencilLine,
  AlertCircle,
  Users as UsersIcon,
  School
} from 'lucide-react';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import _ from 'lodash';
import type { User } from '../../types';

interface UsersGridProps {
  onEdit: (user: User) => void;
}

export const UsersGrid: React.FC<UsersGridProps> = ({ onEdit }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'professor' | 'student'>('all');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isDeleteLoading, setIsDeleteLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
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

      if (fetchError) throw fetchError;

      setUsers(data as User[]);
      setFilteredUsers(data as User[]);

      // Extract unique subjects
      const uniqueSubjects = Array.from(
        new Set(
          data
            .filter(user => user.role === 'professor')
            .flatMap(user => user.professor_schools?.map(ps => ps.subject?.name) || [])
            .filter(Boolean)
        )
      );
      setSubjects(uniqueSubjects as string[]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo je do greške pri učitavanju korisnika');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const debouncedSearch = useCallback((searchTerm: string) => {
    const filtered = users.filter(user => {
      const matchesSearch = 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      
      const matchesSubject = selectedSubject === 'all' || 
        (user.role === 'professor' && user.professor_schools?.some(ps => ps.subject?.name === selectedSubject));

      return matchesSearch && matchesRole && matchesSubject;
    });

    setFilteredUsers(filtered);
  }, [selectedRole, selectedSubject, users]);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, selectedRole, selectedSubject, users, debouncedSearch]);

  const handleDelete = async (userId: string) => {
    try {
      setIsDeleteLoading(userId);
      setError('');

      // Prvo brišemo korisnika iz auth tabele
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      // Zatim brišemo profil iz profiles tabele
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      setUsers(prev => prev.filter(user => user.id !== userId));
      setFilteredUsers(prev => prev.filter(user => user.id !== userId));

    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Došlo je do greške pri brisanju korisnika');
    } finally {
      setIsDeleteLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pretraži korisnike..."
              className="pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 w-80"
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as 'all' | 'professor' | 'student')}
                className="pl-9 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              >
                <option value="all">Svi korisnici</option>
                <option value="professor">Profesori</option>
                <option value="student">Učenici</option>
              </select>
            </div>

            {selectedRole === 'professor' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                </div>
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                >
                  <option value="all">Svi predmeti</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredUsers.map(user => (
            <motion.div
              key={user.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg opacity-20 blur group-hover:opacity-30 transition-opacity"></div>
              
              <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-xl border border-white/10 p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                      <UsersIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit(user)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <PencilLine className="w-4 h-4 text-gray-400" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(user.id)}
                      disabled={isDeleteLoading === user.id}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleteLoading === user.id ? (
                        <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-400" />
                      )}
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {user.role === 'professor' && (
                    <>
                      <div>
                        <span className="text-gray-400">Telefon:</span>
                        <p className="text-white">{user.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Tip:</span>
                        <p className="text-white capitalize">
                          {user.role === 'professor' ? 'Profesor' : 'Učenik'}
                        </p>
                      </div>
                    </>
                  )}

                  {user.role === 'student' && (
                    <>
                      <div>
                        <span className="text-gray-400">Roditelj:</span>
                        <p className="text-white">{user.parent_names}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Telefon roditelja:</span>
                        <p className="text-white">{user.parent_phone}</p>
                      </div>
                    </>
                  )}
                </div>

                {user.role === 'professor' && user.professor_schools && user.professor_schools.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <span className="text-gray-400 text-sm font-medium">Škole i predmeti:</span>
                    <div className="flex flex-wrap gap-2">
                      {user.professor_schools.map((ps) => (
                        <div
                          key={ps.id}
                          className="px-3 py-1 bg-slate-800 rounded-full text-sm flex items-center space-x-2"
                        >
                          <School className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{ps.school?.name}</span>
                          <span className="text-gray-500">•</span>
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{ps.subject?.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredUsers.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20">
            <UsersIcon className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">Nema rezultata</h3>
            <p className="text-gray-400">Nismo pronašli korisnike koji odgovaraju vašoj pretrazi</p>
          </div>
        </div>
      )}
    </div>
  );
}; 