import { lazy } from 'react'
import { AdminLayout } from '@/layouts/admin/AdminLayout'
import { RconProtectedRoute } from '@/components/auth/rcon-protected-route'
import { Suspense } from 'react'

// Loading komponenta
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
  </div>
)

// Lazy load admin komponente
const RconSettingsForm = lazy(() => import('@/components/admin/rcon-settings'))

export const adminRoutes = [
  {
    path: 'rcon',
    element: (
      <RconProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <div className="container py-6">
            <h1 className="text-2xl font-bold mb-6">RCON Postavke</h1>
            <RconSettingsForm />
          </div>
        </Suspense>
      </RconProtectedRoute>
    )
  }
] 