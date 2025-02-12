import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Key, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const Settings = () => {
  const [newRconCode, setNewRconCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRconCodeChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Provjeri da li je korisnik autentificiran
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Niste prijavljeni. Molimo prijavite se ponovo.');
      }

      // Dohvati trenutne RCON postavke
      const { data: settings, error: fetchError } = await supabase
        .from('rcon_settings')
        .select('*')
        .single();

      if (fetchError) throw fetchError;

      // Ažuriraj RCON šifru
      const { error: updateError } = await supabase
        .from('rcon_settings')
        .update({ 
          code: newRconCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (updateError) throw updateError;

      setSuccess('RCON šifra je uspješno promijenjena');
      setNewRconCode('');
    } catch (err) {
      console.error('Error updating RCON code:', err);
      setError(err instanceof Error ? err.message : 'Došlo je do greške prilikom promjene RCON šifre');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Podešavanja</h1>
          <p className="text-gray-400">Upravljajte podešavanjima sistema</p>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-20 blur transition duration-300 group-hover:opacity-30" />
          <div className="relative p-6 bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-medium text-white">RCON Podešavanja</h2>
            </div>

            <form onSubmit={handleRconCodeChange} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="rconCode" className="block text-sm font-medium text-gray-400">
                  Nova RCON šifra
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="rconCode"
                    value={newRconCode}
                    onChange={(e) => setNewRconCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white placeholder-gray-500"
                    placeholder="Unesite novu RCON šifru"
                    required
                    disabled={isLoading}
                    autoComplete="off"
                  />
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

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-emerald-400">{success}</p>
                </motion.div>
              )}

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 group"
                >
                  <span className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    Promijeni RCON šifru
                  </span>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-20 blur transition duration-300 group-hover:opacity-30" />
          <div className="relative p-6 bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10">
            <h2 className="text-lg font-medium text-white mb-4">Ostala Podešavanja</h2>
            {/* Dodajte ostala podešavanja ovdje */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 