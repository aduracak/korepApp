// Base interfaces
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// User related interfaces
export interface User extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'admin' | 'professor' | 'student';
  parent_names?: string;
  parent_phone?: string;
  professor_schools?: ProfessorSchool[];
}

// School related interfaces
export interface School extends BaseEntity {
  name: string;
  address: string | null;
  classes?: SchoolClass[];
}

export interface SchoolClass extends BaseEntity {
  name: string;
  school_id: string;
  school?: School;
  teachings?: Teaching[];
}

// Subject related interfaces
export interface Subject extends BaseEntity {
  name: string;
  description: string | null;
  teachings?: Teaching[];
}

// Teaching related interfaces
export interface Teaching extends BaseEntity {
  class_id: string;
  subject_id: string;
  professor_id: string;
  class?: SchoolClass;
  subject?: Subject;
  professor?: User;
}

export interface ProfessorSchool extends BaseEntity {
  professor_id: string;
  school_id: string;
  subject_id: string;
  school?: School;
  subject?: Subject;
  professor?: User;
}

// Schedule related interfaces
export interface TeachingSchedule extends BaseEntity {
  teaching_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  teaching?: Teaching;
}

// Helper types
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type UserRole = 'admin' | 'professor' | 'student';

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

export interface SchoolSubject {
  school_id: string;
  subject_ids: string[];
} 