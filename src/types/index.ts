export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'professor' | 'student';
  parent_names?: string;
  parent_phone?: string;
  subject?: string;
  school?: string;
  grades?: string[];
  created_at: string;
}

export interface Lesson {
  id: string;
  professor_id: string;
  student_id: string;
  subject: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface Grade {
  id: string;
  student_id: string;
  professor_id: string;
  subject: string;
  value: number;
  notes?: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  classes?: Class[];
}

export interface School {
  id: string;
  name: string;
  address?: string;
  created_at: string;
  updated_at: string;
  classes?: Class[];
}

export interface Class {
  id: string;
  name: string;
  school_id: string;
  created_at: string;
  updated_at: string;
  school?: School;
  subjects?: Subject[];
}

export interface ClassSubject {
  id: string;
  class_id: string;
  subject_id: string;
  created_at: string;
  class?: Class;
  subject?: Subject;
} 