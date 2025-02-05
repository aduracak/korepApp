import { ReactNode } from 'react'
import { rconAuth } from '@/lib/rcon-auth'
import { RconAuth } from './rcon-auth'

interface RconProtectedRouteProps {
  children: ReactNode
}

export function RconProtectedRoute({ children }: RconProtectedRouteProps) {
  // Samo provjeravamo RCON autentifikaciju, ne i regularnu
  const isRconAuthorized = rconAuth.isAuthorized()

  if (!isRconAuthorized) {
    return <RconAuth />
  }

  return <>{children}</>
} 