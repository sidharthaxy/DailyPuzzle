import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { PuzzlePage } from './pages/PuzzlePage';
import AuthPage from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { Header } from './components/Header';
import { GlobalModal } from './components/GlobalModal';
import { DailyOverview } from './pages/DailyOverview';
import { useAuthStore } from './store/authStore';
import { useStreakStore } from './store/streakStore';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  const { user, checkAuth, isAuthenticated, isCheckingAuth } = useAuthStore();
  const { loadStreak } = useStreakStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
        loadStreak(user.id);
    }
  }, [user, loadStreak]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-brand-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-brand-100 text-brand-900 flex flex-col font-sans transition-colors duration-200">
        <Header />
        <GlobalModal />
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" replace />} />
            <Route path="/signup" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" replace />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/daily/:date" element={<ProtectedRoute><DailyOverview /></ProtectedRoute>} />
            <Route path="/puzzle" element={<ProtectedRoute><PuzzlePage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
