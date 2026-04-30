import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Spinner } from '../ui/Spinner'

export function ProtectedRoute({
  requiresAdmin = false,
  requiresWrite = false,
}: {
  requiresAdmin?: boolean
  requiresWrite?: boolean
}) {
  const { session, isLoading, isAdmin, canWrite } = useAuth()
  const { countryId } = useParams<{ countryId: string }>()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  if (requiresAdmin && !isAdmin) return <Navigate to="/" replace />
  if (requiresWrite && countryId && !canWrite(countryId)) return <Navigate to={`/countries/${countryId}`} replace />

  return <Outlet />
}
