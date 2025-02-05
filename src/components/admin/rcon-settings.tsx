import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Shield, Key, Power } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { RconSettings } from '@/types/database'

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

export default function RconSettingsForm() {
  const queryClient = useQueryClient()
  const [code, setCode] = useState('')
  const [isActive, setIsActive] = useState(false)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['rcon-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rcon_settings')
        .select('*')
        .single()

      if (error) throw error
      return data as RconSettings
    }
  })

  useEffect(() => {
    if (settings) {
      setCode(settings.code)
      setIsActive(settings.is_active)
    }
  }, [settings])

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<RconSettings>) => {
      const { data, error } = await supabase
        .from('rcon_settings')
        .update(newSettings)
        .eq('id', settings?.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rcon-settings'] })
      toast.success('RCON postavke su uspješno ažurirane')
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju RCON postavki')
      console.error('Error updating RCON settings:', error)
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Status kartica */}
      <motion.div
        variants={itemVariants}
        className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl opacity-10 blur"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-xl border border-white/5">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">RCON Status</h3>
              <p className="text-gray-400">Upravljanje RCON pristupom</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              {isActive ? 'Aktivno' : 'Neaktivno'}
            </span>
            <button
              onClick={() => updateSettings.mutate({ is_active: !isActive })}
              className={`relative p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-emerald-400/10 hover:bg-emerald-400/20' 
                  : 'bg-gray-700/50 hover:bg-gray-700/70'
              }`}
            >
              <Power className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* RCON kod forma */}
      <motion.div
        variants={itemVariants}
        className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl opacity-10 blur"></div>
        <div className="relative space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-xl border border-white/5">
              <Key className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">RCON Kod</h3>
              <p className="text-gray-400">Promjena RCON pristupnog koda</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 text-white placeholder-gray-500 transition-all duration-200"
                placeholder="Unesite novi RCON kod"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => updateSettings.mutate({ code })}
              disabled={updateSettings.isPending || !code}
              className="relative w-full px-4 py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 overflow-hidden group"
            >
              <span className={updateSettings.isPending ? 'opacity-0' : 'opacity-100'}>
                Sačuvaj promjene
              </span>
              
              {updateSettings.isPending && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              )}
              
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 