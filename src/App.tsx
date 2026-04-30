import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { CountryDetailPage } from './pages/CountryDetailPage'
import { UploadPage } from './pages/UploadPage'
import { ActionPlansPage } from './pages/ActionPlansPage'
import { ActionPlanDetailPage } from './pages/ActionPlanDetailPage'
import { AllActionPlansPage } from './pages/AllActionPlansPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { ElementLensPage } from './pages/ElementLensPage'

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route index element={<DashboardPage />} />

                  <Route path="/countries/:countryId" element={<CountryDetailPage />} />
                  <Route path="/countries/:countryId/action-plans" element={<ActionPlansPage />} />
                  <Route path="/countries/:countryId/action-plans/:planId" element={<ActionPlanDetailPage />} />

                  <Route element={<ProtectedRoute requiresWrite />}>
                    <Route path="/countries/:countryId/upload" element={<UploadPage />} />
                  </Route>

                  <Route path="/elements/:pillarName/:elementName" element={<ElementLensPage />} />

                  <Route element={<ProtectedRoute requiresAdmin />}>
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/admin/all-plans" element={<AllActionPlansPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </I18nextProvider>
  )
}
