import { createBrowserRouter } from 'react-router-dom';
import { BaseLayout } from '@/layouts/BaseLayout';
import { RconProtectedRoute } from '@/components/auth/rcon-protected-route';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { RegisterWizard } from '@/components/auth/RegisterWizard';
import { LoginForm } from '@/components/auth/LoginForm';
import {
  Landing,
  HomeBase,
  StudentDiary,
  StudentCalendar,
  StudentTutoring,
  StudentWorkHub,
  AdminHomeBase,
  Users,
  AuditLogs,
  Notifications,
  Settings,
  ProfessorHomeBase,
  ProfessorDiary,
  ProfessorCalendar,
  ProfessorTutoring
} from './lazyComponents';
import { adminRoutes } from '@/routes/admin';

// Loading komponenta
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
  </div>
);

const routes = [
  {
    path: '/',
    element: <BaseLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '', element: <Landing /> },
      { path: 'login', element: <LoginForm /> },
      { path: 'register', element: <RegisterWizard /> },
      {
        path: 'ucenik',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
        children: [
          { path: '', element: <HomeBase /> },
          { path: 'diary', element: <StudentDiary /> },
          { path: 'calendar', element: <StudentCalendar /> },
          { path: 'tutoring', element: <StudentTutoring /> },
          { path: 'workhub', element: <StudentWorkHub /> },
        ],
      },
      {
        path: 'admin',
        element: (
          <RconProtectedRoute>
            <AdminLayout />
          </RconProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
        children: [
          { path: '', element: <AdminHomeBase /> },
          { path: 'users', element: <Users /> },
          { path: 'audit-logs', element: <AuditLogs /> },
          { path: 'notifications', element: <Notifications /> },
          { path: 'settings', element: <Settings /> },
          ...adminRoutes
        ],
      },
      {
        path: 'professor',
        element: (
          <ProtectedRoute allowedRoles={['professor']}>
            <ProfessorLayout />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
        children: [
          { path: '', element: <ProfessorHomeBase /> },
          { path: 'diary', element: <ProfessorDiary /> },
          { path: 'calendar', element: <ProfessorCalendar /> },
          { path: 'tutoring', element: <ProfessorTutoring /> },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes); 