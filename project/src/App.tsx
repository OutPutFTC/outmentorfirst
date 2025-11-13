import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import RegisterMentor from './pages/RegisterMentor';
import RegisterTeam from './pages/RegisterTeam';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanel from './pages/AdminPanel';

function AppContent() {
  const { user, profile } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [profileId, setProfileId] = useState<string | undefined>();

  // quando logado, vai pro dashboard por padrão
  if (user && currentView === 'landing') {
    setCurrentView('dashboard');
  }

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    setProfileId(id);
  };

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <Landing onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register-mentor':
        return <RegisterMentor onNavigate={handleNavigate} />;
      case 'register-team':
        return <RegisterTeam onNavigate={handleNavigate} />;
      case 'dashboard':
        return (
          <ProtectedRoute fallback={<Landing onNavigate={handleNavigate} />}>
            <Dashboard onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'profile':
        return (
          <ProtectedRoute fallback={<Landing onNavigate={handleNavigate} />}>
            <Profile profileId={profileId} onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'edit-profile':
        return (
          <ProtectedRoute fallback={<Landing onNavigate={handleNavigate} />}>
            <EditProfile onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'admin':
        return (
          <ProtectedRoute fallback={<Landing onNavigate={handleNavigate} />}>
            {profile?.is_admin ? (
              <AdminPanel />
            ) : (
              <div className="p-4">Acesso negado — você precisa ser admin.</div>
            )}
          </ProtectedRoute>
        );
      default:
        return <Landing onNavigate={handleNavigate} />;
    }
  };

  return renderView();
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
