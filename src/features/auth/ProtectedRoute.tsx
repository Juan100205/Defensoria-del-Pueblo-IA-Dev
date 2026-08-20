import type { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../types/database'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: UserRole[]
  fallback?: ReactNode
}

export function ProtectedRoute({ children, roles, fallback }: ProtectedRouteProps) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>Cargando...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return fallback || null
  }

  if (roles && roles.length > 0 && !roles.includes(profile.role)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="card" style={{ padding: 32, textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
          <h3 style={{ marginBottom: 8 }}>Acceso restringido</h3>
          <p className="small muted">No tiene permisos para acceder a esta sección. Su rol actual es <b>{profile.role}</b>.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
