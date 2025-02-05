import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  UserPlus, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Check,
  X,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types/auth';
import { Helmet } from 'react-helmet-async';
import { UserEditModal } from '../../components/admin/UserEditModal';

interface UsersTableState {
  users: UserProfile[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  roleFilter: string;
  sortBy: {
    field: keyof UserProfile;
    direction: 'asc' | 'desc';
  };
  selectedUsers: string[];
  currentPage: number;
  itemsPerPage: number;
}

export default function Users() {
  const [state, setState] = useState<UsersTableState>({
    users: [],
    isLoading: true,
    error: null,
    searchTerm: '',
    roleFilter: 'all',
    sortBy: {
      field: 'created_at',
      direction: 'desc'
    },
    selectedUsers: [],
    currentPage: 1,
    itemsPerPage: 10
  });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [state.roleFilter, state.sortBy]);

  const fetchUsers = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      let query = supabase
        .from('profiles')
        .select('*')
        .order(state.sortBy.field, { ascending: state.sortBy.direction === 'asc' });

      if (state.roleFilter !== 'all') {
        query = query.eq('role', state.roleFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setState(prev => ({
        ...prev,
        users: data || [],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      setState(prev => ({
        ...prev,
        error: 'Greška pri dohvatanju korisnika',
        isLoading: false
      }));
    }
  };

  const handleSort = (field: keyof UserProfile) => {
    setState(prev => ({
      ...prev,
      sortBy: {
        field,
        direction: prev.sortBy.field === field && prev.sortBy.direction === 'asc' ? 'desc' : 'asc'
      }
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleRoleFilter = (role: string) => {
    setState(prev => ({ ...prev, roleFilter: role }));
  };

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleDelete = (user: UserProfile) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = async (userData: Partial<UserProfile>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      if (selectedUser) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update(userData)
          .eq('id', selectedUser.id);

        if (error) throw error;
      } else {
        // Create new user
        const { error } = await supabase
          .from('profiles')
          .insert([userData]);

        if (error) throw error;
      }

      await fetchUsers();
      setIsUserModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        users: prev.users.filter(u => u.id !== userToDelete.id),
        isLoading: false
      }));

      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      setState(prev => ({
        ...prev,
        error: 'Greška pri brisanju korisnika',
        isLoading: false
      }));
    }
  };

  const filteredUsers = state.users.filter(user => {
    const searchMatch = 
      user.first_name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(state.searchTerm.toLowerCase());

    return searchMatch;
  });

  const paginatedUsers = filteredUsers.slice(
    (state.currentPage - 1) * state.itemsPerPage,
    state.currentPage * state.itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / state.itemsPerPage);

  return (
    <>
      <Helmet>
        <title>Korisnici | Admin Panel</title>
        <meta name="description" content="Upravljanje korisnicima sistema" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <UsersIcon className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">Korisnici</h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedUser(null);
              setIsUserModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span>Novi korisnik</span>
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pretraži korisnike..."
                value={state.searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Role filter */}
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={state.roleFilter}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            >
              <option value="all">Svi korisnici</option>
              <option value="student">Učenici</option>
              <option value="professor">Profesori</option>
              <option value="admin">Administratori</option>
            </select>
          </div>

          {/* Export */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </motion.button>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Ime i prezime
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Uloga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Datum registracije
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {state.isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block w-6 h-6 border-2 border-emerald-400 rounded-full border-t-transparent"
                      />
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                      Nema pronađenih korisnika
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400 font-medium">
                              {user.first_name[0]}{user.last_name[0]}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.first_name} {user.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'professor'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : user.role === 'professor' ? 'Profesor' : 'Učenik'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status === 'active' ? 'Aktivan' : 'Neaktivan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(user)}
                            className="text-emerald-400 hover:text-emerald-300"
                          >
                            <Edit2 className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(user)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-white/10">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={state.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-white/10 text-sm font-medium rounded-md text-gray-400 bg-slate-900/50 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prethodna
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={state.currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-white/10 text-sm font-medium rounded-md text-gray-400 bg-slate-900/50 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sljedeća
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Prikazano <span className="font-medium">{(state.currentPage - 1) * state.itemsPerPage + 1}</span> do{' '}
                    <span className="font-medium">
                      {Math.min(state.currentPage * state.itemsPerPage, filteredUsers.length)}
                    </span>{' '}
                    od <span className="font-medium">{filteredUsers.length}</span> rezultata
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                      disabled={state.currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-white/10 bg-slate-900/50 text-sm font-medium text-gray-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Prethodna</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {/* Page numbers */}
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setState(prev => ({ ...prev, currentPage: i + 1 }))}
                        className={`relative inline-flex items-center px-4 py-2 border border-white/10 text-sm font-medium ${
                          state.currentPage === i + 1
                            ? 'z-10 bg-emerald-400 text-white'
                            : 'bg-slate-900/50 text-gray-400 hover:bg-slate-800'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                      disabled={state.currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-white/10 bg-slate-900/50 text-sm font-medium text-gray-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Sljedeća</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Edit Modal */}
      <UserEditModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleSaveUser}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg p-6 max-w-md w-full space-y-4"
          >
            <h3 className="text-lg font-medium text-white">Potvrda brisanja</h3>
            <p className="text-gray-400">
              Da li ste sigurni da želite obrisati korisnika{' '}
              <span className="font-medium text-white">
                {userToDelete.first_name} {userToDelete.last_name}
              </span>
              ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Odustani
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Obriši
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
} 