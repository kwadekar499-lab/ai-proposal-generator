import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import AuthPage      from './pages/AuthPage';
import VerifyEmail   from './pages/VerifyEmail';
import ProfileSetup  from './pages/ProfileSetup';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard     from './pages/Dashboard';
import ProposalView  from './pages/ProposalView';
import History       from './pages/History';
import AdminAnalytics from './pages/AdminAnalytics';
import Toast         from './components/Toast';

const isDev = import.meta.env.DEV;

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--clr-bg, #0f172a)',
      color: 'var(--clr-text, #f8fafc)',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div className="generating-ring" style={{ width: '40px', height: '40px' }} />
      <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted, #94a3b8)' }}>Connecting to InsForge…</span>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuth, profile, authLoading, profileLoading } = useApp();

  if (authLoading || profileLoading) {
    return <LoadingScreen />;
  }

  if (!isAuth)  return <Navigate to="/login" replace />;
  if (!profile) return <Navigate to="/setup" replace />;

  return children;
}

function AppRoutes() {
  const { isAuth, profile, authLoading, profileLoading, toast } = useApp();

  if (authLoading || (isAuth && profileLoading)) {
    return <LoadingScreen />;
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} key={toast.id} />}
      <Routes>
        <Route path="/login" element={
          isAuth ? (profile ? <Navigate to="/dashboard" replace /> : <Navigate to="/setup" replace />) : <AuthPage />
        }/>
        <Route path="/verify-email" element={
          isAuth ? (profile ? <Navigate to="/dashboard" replace /> : <Navigate to="/setup" replace />) : <VerifyEmail />
        }/>
        <Route path="/setup" element={
          !isAuth ? <Navigate to="/login" replace /> :
          profile ? <Navigate to="/dashboard" replace /> : <ProfileSetup />
        }/>
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/history"        element={<History />} />
          {/* Allow /analytics only in DEV environment for debugging; redirect production users to dashboard */}
          <Route path="/analytics"      element={isDev ? <AdminAnalytics /> : <Navigate to="/dashboard" replace />} />
          <Route path="/proposal/:id"   element={<ProposalView />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
