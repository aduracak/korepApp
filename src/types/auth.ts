export type UserRole = 'admin' | 'professor' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  // Dodatna polja za učenike
  parent_name?: string;
  parent_phone?: string;
  school?: string;
  grade?: string;
  // Dodatna polja za profesore
  subjects?: string[];
  qualifications?: string[];
  bio?: string;
}

export interface AuthState {
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
} 