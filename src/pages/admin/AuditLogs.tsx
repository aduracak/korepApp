import React from 'react';
import { motion } from 'framer-motion';
import { History } from 'lucide-react';

const AuditLogs: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-4">
        <History className="w-8 h-8 text-emerald-400" />
        <h1 className="text-3xl font-bold text-white">AuditLogs</h1>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <p className="text-gray-400">Pratite sve aktivnosti i promjene u sistemu. Pregledajte historiju prijava, izmjena i drugih važnih događaja. Osigurajte sigurnost i transparentnost platforme kroz detaljan uvid u sve sistemske operacije.</p>
      </div>
    </motion.div>
  );
};

export default AuditLogs; 