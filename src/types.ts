export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'professor' | 'student';
  parent_names?: string;
  parent_phone?: string;
  professor_schools?: ProfessorSchool[];
}

export interface School {
  id: string;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ProfessorSchool {
  id: string;
  professor_id: string;
  school_id: string;
  subject_id: string;
  created_at: string;
  updated_at: string;
  school?: School;
  subject?: Subject;
}

export interface SchoolSubject {
  school_id: string;
  subject_ids: string[];
}

// Diary types
export interface DiaryEntry {
  id: string;
  professor_id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  date: string;
  period_number: number;
  lesson_number: number;
  start_time: string;
  end_time: string;
  lesson_title: string;
  lesson_type: LessonType;
  curriculum_unit: string | null;
  lesson_plan: string | null;
  homework: string | null;
  notes: string | null;
  school?: School;
  class?: SchoolClass;
  subject?: {
    id: string;
    name: string;
  };
  absent_students?: AbsentStudent[];
}

export type LessonType = 'lecture' | 'exercise' | 'review' | 'test' | 'written_exam';

export interface SchoolClass {
  id: string;
  school_id: string;
  name: string;
  year: number;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface AbsentStudent {
  id: string;
  diary_entry_id: string;
  student_id: string;
  student?: Student;
}

export interface DiaryFilters {
  school_id: string | null;
  subject_id: string | null;
  class_id: string | null;
} 