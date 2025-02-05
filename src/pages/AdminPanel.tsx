import React, { useState, useEffect, useCallback } from 'react';
import { Users, Settings, ChevronDown, Search, Edit2, Trash2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import UserDialog from '../components/UserDialog';
import UserTooltip from '../components/UserTooltip';
import type { User } from '../types/database';

interface UpdatedUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export default function AdminPanel() {
  const [activeMenu, setActiveMenu] = useState('all-users');
  const [showUserSubmenu, setShowUserSubmenu] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredUser, setHoveredUser] = useState<User | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const fetchUsers = useCallback(async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('last_name', { ascending: true });

      if (activeMenu === 'professors') {
        query = query.eq('role', 'professor');
      } else if (activeMenu === 'students') {
        query = query.eq('role', 'student');
      }

      const { data, error } = await query;
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [activeMenu]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleMouseEnter = (user: User, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltipPosition({
      x: rect.right + 10,
      y: rect.top,
    });
    setHoveredUser(user);
  };

  const filteredUsers = users.filter(user => 
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const menuItems = [
    {
      icon: <Users className="w-5 h-5 text-blue-500" />,
      label: 'Korisnici',
      submenu: [
        { id: 'all-users', label: 'Svi korisnici' },
        { id: 'professors', label: 'Profesori' },
        { id: 'students', label: 'Učenici' },
        { id: 'new-user', label: 'Novi korisnik' },
      ],
    },
    {
      icon: <Settings className="w-5 h-5 text-purple-500" />,
      label: 'Postavke',
    },
  ];

  const handleUpdateUser = async (updatedUserData: UpdatedUserData) => {
    // implementation
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <div key={item.label}>
              <button
                onClick={() => {
                  if (item.submenu) {
                    setShowUserSubmenu(!showUserSubmenu);
                  }
                }}
                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
                {item.submenu && (
                  <ChevronDown
                    className={`ml-auto w-4 h-4 transition-transform ${
                      showUserSubmenu ? 'transform rotate-180' : ''
                    }`}
                  />
                )}
              </button>
              {item.submenu && showUserSubmenu && (
                <div className="pl-12 py-2 space-y-1">
                  {item.submenu.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        setActiveMenu(subItem.id);
                        if (subItem.id === 'new-user') {
                          setSelectedUser({} as User);
                        }
                      }}
                      className={`w-full text-left py-1 px-2 text-sm rounded ${
                        activeMenu === subItem.id
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeMenu === 'all-users' && 'Svi korisnici'}
              {activeMenu === 'professors' && 'Profesori'}
              {activeMenu === 'students' && 'Učenici'}
              {activeMenu === 'new-user' && 'Novi korisnik'}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Pretraži korisnike..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setSelectedUser({} as User)}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Dodaj korisnika
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ime i prezime
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uloga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td
                      className="px-6 py-4"
                      onMouseEnter={(e) => handleMouseEnter(user, e)}
                      onMouseLeave={() => setHoveredUser(null)}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'professor'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'professor' ? 'Profesor' : 'Učenik'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            // Handle delete
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Dialog */}
      {selectedUser && (
        <UserDialog
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={async (updatedUserData) => {
            try {
              if (selectedUser.id) {
                // Update existing user
                const { error } = await supabase
                  .from('profiles')
                  .update(updatedUserData)
                  .eq('id', selectedUser.id);
                if (error) throw error;
              } else {
                // Create new user
                const { error } = await supabase
                  .from('profiles')
                  .insert([updatedUserData]);
                if (error) throw error;
              }
              await fetchUsers();
              setSelectedUser(null);
            } catch (error) {
              console.error('Error saving user:', error);
            }
          }}
        />
      )}

      {/* User Tooltip */}
      {hoveredUser && (
        <UserTooltip
          user={hoveredUser}
          position={tooltipPosition}
        />
      )}
    </div>
  );
}