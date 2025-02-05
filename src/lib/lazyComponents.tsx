import React, { Suspense } from 'react';
import { motion } from 'framer-motion';

// Loading komponenta
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 border-2 border-emerald-400 rounded-full border-t-transparent"
    />
  </div>
);

// Lazy komponenta
export const LazyComponent = ({ component: Component }: { component: React.ComponentType<any> }) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );
};

// Lazy wrapper komponenta
function withSuspense<T extends object>(Component: React.ComponentType<T>) {
  return function WithSuspenseComponent(props: T) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Lazy imports sa withSuspense wrapperom
const Landing = withSuspense(React.lazy(() => import('../pages/Landing')));
const HomeBase = withSuspense(React.lazy(() => import('../pages/student/HomeBase')));
const StudentDiary = withSuspense(React.lazy(() => import('../pages/student/Diary')));
const StudentCalendar = withSuspense(React.lazy(() => import('../pages/student/Calendar')));
const StudentTutoring = withSuspense(React.lazy(() => import('../pages/student/Tutoring')));
const StudentWorkHub = withSuspense(React.lazy(() => import('../pages/student/WorkHub')));

// Admin komponente
const AdminHomeBase = withSuspense(React.lazy(() => import('../pages/admin/HomeBase')));
const Users = withSuspense(React.lazy(() => import('../pages/admin/Users')));
const AuditLogs = withSuspense(React.lazy(() => import('../pages/admin/AuditLogs')));
const Notifications = withSuspense(React.lazy(() => import('../pages/admin/Notifications')));
const Settings = withSuspense(React.lazy(() => import('../pages/admin/Settings')));

// Professor komponente
const ProfessorHomeBase = withSuspense(React.lazy(() => import('../pages/professor/HomeBase')));
const ProfessorDiary = withSuspense(React.lazy(() => import('../pages/professor/Diary')));
const ProfessorCalendar = withSuspense(React.lazy(() => import('../pages/professor/Calendar')));
const ProfessorTutoring = withSuspense(React.lazy(() => import('../pages/professor/Tutoring')));

export {
  LoadingSpinner,
  withSuspense,
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
}; 