import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, ChevronUp } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationBellProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ 
  notifications,
  onMarkAllRead 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-6 h-6 text-gray-300" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center"
            >
              <span className="text-xs font-medium text-white">{unreadCount}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Povezujuća strelica */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-4 top-[calc(100%-2px)] w-4 h-4 z-[9999]"
            >
              <ChevronUp className="w-4 h-4 text-white/10" />
            </motion.div>

            {/* Prozor obavijesti */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{ isolation: 'isolate' }}
              className="absolute right-0 mt-2 w-80 bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg overflow-hidden z-[9999]"
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-white">Obavještenja</h3>
                  {unreadCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onMarkAllRead}
                      className="p-2 rounded-lg hover:bg-white/5 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                        !notification.read ? 'bg-white/5' : ''
                      }`}
                    >
                      <h4 className="font-medium text-white">{notification.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                      <span className="text-xs text-gray-500 mt-2 block">
                        {notification.time}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    Nema novih obavještenja
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}; 