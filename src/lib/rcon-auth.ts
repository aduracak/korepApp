import { supabase } from './supabase'
import { toast } from 'sonner'

// Koristimo poseban prefix za RCON da se ne miješa sa drugim storage ključevima
const STORAGE_PREFIX = 'korep_rcon_v2_'
const AUTH_KEY = `${STORAGE_PREFIX}token`
const EXPIRY_KEY = `${STORAGE_PREFIX}expiry`

interface RconState {
  isAuthorized: boolean
  expiresAt: number | null
}

interface RconAuthResponse {
  success: boolean
  message: string
  timeRemaining?: number
}

function createSecureToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export const rconAuth = {
  state: {
    isAuthorized: false,
    expiresAt: null
  } as RconState,

  loadState(): void {
    const token = localStorage.getItem(AUTH_KEY)
    const expiry = localStorage.getItem(EXPIRY_KEY)

    console.log('Loading RCON state:', { token, expiry })

    if (token && expiry) {
      const expiryTime = parseInt(expiry)
      if (Date.now() < expiryTime) {
        this.state = {
          isAuthorized: true,
          expiresAt: expiryTime
        }
        console.log('RCON state loaded - authorized:', this.state)
      } else {
        this.clearAuth()
        console.log('RCON state loaded - expired')
      }
    } else {
      console.log('No RCON state found')
    }
  },

  async authorize(code: string): Promise<RconAuthResponse> {
    console.log('Attempting RCON authorization with code:', code)
    try {
      // Prvo očistimo staro stanje
      this.clearAuth()

      const { data, error } = await supabase
        .from('rcon_settings')
        .select('code, is_active')
        .single()

      console.log('RCON Supabase response:', { data, error })

      if (error) {
        console.error('RCON Supabase error:', error)
        throw new Error('Greška pri provjeri RCON koda')
      }

      if (!data.is_active) {
        console.log('RCON is not active')
        return {
          success: false,
          message: 'RCON pristup je trenutno deaktiviran'
        }
      }

      if (data.code !== code) {
        console.log('Invalid RCON code provided')
        return {
          success: false,
          message: 'Neispravan RCON kod'
        }
      }

      // 12 sati validnosti
      const expiresAt = Date.now() + 12 * 60 * 60 * 1000
      const token = createSecureToken()
      
      // Čistimo staro stanje prije postavljanja novog
      localStorage.removeItem(AUTH_KEY)
      localStorage.removeItem(EXPIRY_KEY)
      
      // Postavljamo novo stanje
      localStorage.setItem(AUTH_KEY, token)
      localStorage.setItem(EXPIRY_KEY, expiresAt.toString())
      
      this.state = {
        isAuthorized: true,
        expiresAt
      }

      console.log('RCON Authorization successful:', this.state)

      return {
        success: true,
        message: 'RCON autorizacija uspješna',
        timeRemaining: this.getTimeRemaining()
      }
    } catch (error) {
      console.error('RCON auth error:', error)
      return {
        success: false,
        message: 'Greška pri RCON autorizaciji'
      }
    }
  },

  clearAuth(): void {
    console.log('Clearing RCON auth')
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(EXPIRY_KEY)
    
    this.state = {
      isAuthorized: false,
      expiresAt: null
    }
  },

  isAuthorized(): boolean {
    this.loadState()
    console.log('Checking RCON authorization:', this.state)
    return this.state.isAuthorized
  },

  getTimeRemaining(): number {
    if (!this.state.expiresAt) return 0
    return Math.max(0, this.state.expiresAt - Date.now())
  },

  getFormattedTimeRemaining(): string {
    const ms = this.getTimeRemaining()
    if (ms <= 0) return '00:00:00'

    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
} 