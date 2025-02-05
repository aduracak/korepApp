export type UserRole = 'admin' | 'professor' | 'student'
export type UserStatus = 'active' | 'inactive'

export interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: UserRole
  status: UserStatus
  // Dodatni podaci za učenike
  parent_name: string | null
  parent_phone: string | null
  school: string | null
  grade: string | null
  // Dodatni podaci za profesore
  subjects: string[] | null
  education: string | null
  experience: string | null
  // Sistemski podaci
  created_at: string
  updated_at: string
  last_login: string | null
  avatar_url: string | null
}

export interface RconSettings {
  id: string
  code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at' | 'last_login'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      rcon_settings: {
        Row: RconSettings
        Insert: Omit<RconSettings, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<RconSettings, 'id' | 'created_at'>>
      }
    }
    Views: {
      [key: string]: {
        Row: Record<string, unknown>
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
  }
} 