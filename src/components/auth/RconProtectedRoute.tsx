import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { rconAuth } from '../../services/rconAuth';
import { RconAuthModal } from './RconAuthModal';
import { motion } from 'framer-motion';

interface RconProtectedRouteProps {
  children: React.ReactNode;
}

export const RconProtectedRoute: React.FC<RconProtectedRouteProps> = ({ children }) => {
  const [showModal, setShowModal] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthorized = await rconAuth.isAuthorized();
        setIsAuthenticated(isAuthorized);
        if (isAuthorized) {
          setShowModal(false);
        }
      } catch (error) {
        console.error('Error checking RCON authorization:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  const handleRconSubmit = async (code: string) => {
    try {
      const isValid = await rconAuth.verifyRconCode(code);
      if (isValid) {
        setIsAuthenticated(true);
        setShowModal(false);
      }
      return isValid;
    } catch (error) {
      console.error('Error verifying RCON code:', error);
      return false;
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 rounded-lg bg-slate-800/50 backdrop-blur-xl border border-white/10"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </motion.div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  if (!showModal && !isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <RconAuthModal
      isOpen={showModal}
      onClose={handleModalClose}
      onSubmit={handleRconSubmit}
    />
  );
}; 