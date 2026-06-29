import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ProtectedRoute from './ProtectedRoute'
import RoleGuard from './RoleGuard'
import ErrorBoundary from '../components/ui/ErrorBoundary'

/**
 * All pages are lazy-loaded for code splitting.
 * Phases add their pages below as they are built.
 */

// ── Public ──────────────────────────────────────────────────
const LandingPage = lazy(() => import('../pages/public/LandingPage'))
const LockoutPage = lazy(() => import('../pages/auth/LockoutPage'))

// ── Admin ───────────────────────────────────────────────────
const AdminDashboard    = lazy(() => import('../pages/admin/DashboardPage'))
const AdminEmployees    = lazy(() => import('../pages/admin/EmployeesPage'))
const AdminTeams        = lazy(() => import('../pages/admin/TeamsPage'))
const AdminShifts       = lazy(() => import('../pages/admin/ShiftsPage'))
const AdminPlanning     = lazy(() => import('../pages/admin/PlanningPage'))
const AdminLeave        = lazy(() => import('../pages/admin/LeaveRequestsPage'))
const AdminReports      = lazy(() => import('../pages/admin/ReportsPage'))
const AdminHistory      = lazy(() => import('../pages/admin/HistoryPage'))
const AdminSettings     = lazy(() => import('../pages/admin/SettingsPage'))
const AdminDevices      = lazy(() => import('../pages/admin/DevicesPage'))
const EmployeeProfile   = lazy(() => import('../pages/admin/EmployeeProfilePage'))
const AdminPointageLive = lazy(() => import('../pages/admin/PointageLivePage'))
const AdminTasks        = lazy(() => import('../pages/admin/TasksPage'))
const AdminSkills       = lazy(() => import('../pages/admin/SkillsPage'))

// ── Employee ─────────────────────────────────────────────────
const EmpDashboard      = lazy(() => import('../pages/employee/DashboardPage'))
const EmpPlanning       = lazy(() => import('../pages/employee/MyPlanningPage'))
const EmpPointage       = lazy(() => import('../pages/employee/MyPointagePage'))
const EmpLeave          = lazy(() => import('../pages/employee/MyLeaveRequestsPage'))
const EmpHistory        = lazy(() => import('../pages/employee/MyHistoryPage'))
const EmpProfile        = lazy(() => import('../pages/employee/MyProfilePage'))
const EmpTasks          = lazy(() => import('../pages/employee/MyTasksPage'))

// ── Layouts ──────────────────────────────────────────────────
const AdminLayout    = lazy(() => import('../layouts/AdminLayout'))
const EmployeeLayout = lazy(() => import('../layouts/EmployeeLayout'))

// ── Global page fallback loader ──────────────────────────────
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-surface-50 dark:bg-dark-900">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      <p className="text-sm text-slate-400">Loading…</p>
    </div>
  </div>
)

const AppRouter = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── Public ── */}
        <Route path="/"        element={<LandingPage />} />
        <Route path="/lockout" element={<LockoutPage />} />

        {/* ── Admin ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="admin">
                <AdminLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<AdminDashboard />} />
          <Route path="employees"     element={<AdminEmployees />} />
          <Route path="employees/:id" element={<EmployeeProfile />} />
          <Route path="teams"         element={<AdminTeams />} />
          <Route path="shifts"        element={<AdminShifts />} />
          <Route path="planning"      element={<AdminPlanning />} />
          <Route path="leave-requests" element={<AdminLeave />} />
          <Route path="reports"       element={<AdminReports />} />
          <Route path="history"       element={<AdminHistory />} />
          <Route path="settings"      element={<AdminSettings />} />
          <Route path="devices"       element={<AdminDevices />} />
          <Route path="pointage-live" element={<AdminPointageLive />} />
          <Route path="tasks"        element={<AdminTasks />} />
          <Route path="skills"       element={<AdminSkills />} />
          <Route path="pauses"       element={<Navigate to="/admin/planning" replace />} />
        </Route>

        {/* ── Employee ── */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="employee">
                <EmployeeLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"        element={<EmpDashboard />} />
          <Route path="my-planning"      element={<EmpPlanning />} />
          <Route path="my-pointage"      element={<EmpPointage />} />
          <Route path="my-leave-requests" element={<EmpLeave />} />
          <Route path="my-history"       element={<EmpHistory />} />
          <Route path="my-profile"       element={<EmpProfile />} />
          <Route path="my-tasks"        element={<EmpTasks />} />
        </Route>

        {/* ── 404 fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
    </ErrorBoundary>
  </BrowserRouter>
)

export default AppRouter