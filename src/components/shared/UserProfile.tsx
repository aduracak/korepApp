import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface UserProfileProps {
  name: string;
  role: string;
  avatar?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ name, role, avatar }) => {
  return (
    <motion.div 
      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-200"
      whileHover={{ scale: 1.02 }}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <User className="w-6 h-6 text-white" />
        )}
      </div>
      <div>
        <h3 className="font-medium text-white">{name}</h3>
        <p className="text-sm text-gray-400">{role}</p>
      </div>
    </motion.div>
  );
}; 