import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Landing } from '../pages/Landing';
import { RconProtectedRoute } from '../components/auth/RconProtectedRoute';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Users } from '../pages/admin/Users';
import { Staffroom } from '../pages/admin/Staffroom';
import { History as AdminHistory } from '../pages/admin/History';
import { Settings as AdminSettings } from '../pages/admin/Settings';
import { Dashboard as AdminDashboard } from '../pages/admin/Dashboard';
import { Dashboard as ProfessorDashboard } from '../pages/professor/Dashboard';
import { Diary } from '../pages/professor/Diary';
import { Students as ProfessorStudents } from '../pages/professor/Students';
import { Lessons as ProfessorLessons } from '../pages/professor/Lessons';
import { Subjects as ProfessorSubjects } from '../pages/professor/Subjects';
import { Settings as ProfessorSettings } from '../pages/professor/Settings';
import { Dashboard as StudentDashboard } from '../pages/student/Dashboard';
import { Lessons as StudentLessons } from '../pages/student/Lessons';
import { Grades } from '../pages/student/Grades';
import { Settings as StudentSettings } from '../pages/student/Settings';
import { ErrorBoundary } from '../components/error/ErrorBoundary';
import { ProfessorLayout } from '../components/layout/ProfessorLayout';
import { StudentLayout } from '../components/layout/StudentLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ResetPassword } from '../pages/auth/ResetPassword';
import { Tutoring } from '../pages/professor/Tutoring';
import { Tutoring as StudentTutoring } from '../pages/student/Tutoring';

// Loading komponenta
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/auth/reset-password',
    element: <ResetPassword />,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/admin',
    element: (
      <RconProtectedRoute>
        <AdminLayout />
      </RconProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AdminDashboard />
          </Suspense>
        )
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Users />
          </Suspense>
        )
      },
      {
        path: 'staffroom',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Staffroom />
          </Suspense>
        )
      },
      {
        path: 'history',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AdminHistory />
          </Suspense>
        )
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AdminSettings />
          </Suspense>
        )
      }
    ]
  },
  {
    path: '/professor',
    element: (
      <ProtectedRoute requiredRole="professor">
        <ProfessorLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorDashboard />
          </Suspense>
        )
      },
      {
        path: 'students',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorStudents />
          </Suspense>
        )
      },
      {
        path: 'lessons',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorLessons />
          </Suspense>
        )
      },
      {
        path: 'diary',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Diary />
          </Suspense>
        )
      },
      {
        path: 'subjects',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorSubjects />
          </Suspense>
        )
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfessorSettings />
          </Suspense>
        )
      },
      {
        path: 'tutoring',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Tutoring />
          </Suspense>
        )
      }
    ]
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentDashboard />
          </Suspense>
        )
      },
      {
        path: 'lessons',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentLessons />
          </Suspense>
        )
      },
      {
        path: 'tutoring',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentTutoring />
          </Suspense>
        )
      },
      {
        path: 'grades',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Grades />
          </Suspense>
        )
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentSettings />
          </Suspense>
        )
      }
    ]
  }
]); 