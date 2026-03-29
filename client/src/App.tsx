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
import { syncOfflineResults } from './services/syncService';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetwork } from './hooks/useNetwork';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  const { user, checkAuth, isAuthenticated, isCheckingAuth } = useAuthStore();
  const { loadStreak } = useStreakStore();
  const isOnline = useNetwork();
  const [dismissOfflineBanner, setDismissOfflineBanner] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
        loadStreak(user.id);
    }
  }, [user, loadStreak]);

  useEffect(() => {
    if (isOnline) {
      setDismissOfflineBanner(false);
      if (user) {
        syncOfflineResults();
      }
    }
  }, [isOnline, user]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-brand-100 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background blobs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-brand-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-brand-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60"
          animate={{ scale: [1, 1.1, 1], x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/3 w-64 h-64 md:w-80 md:h-80 bg-brand-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60"
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -50, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Glowing effect behind logo */}
            <motion.div 
              className="absolute inset-0 bg-brand-blue-400 rounded-2xl blur-xl opacity-40"
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <img 
              src="/logo.jpg" 
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.jpg'; }}
              alt="Loading..." 
              className="relative w-32 h-32 md:w-40 md:h-40 object-contain rounded-2xl shadow-2xl border-4 border-white backdrop-blur-sm" 
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col items-center mt-8"
          >
            <div className="flex items-center space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-brand-blue-500 rounded-full"
                  animate={{ y: ["0%", "-60%", "0%"] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </div>
            <p className="mt-6 text-brand-900 font-medium tracking-wide text-lg">
              Waking up the server...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-brand-100 text-brand-900 flex flex-col font-sans transition-colors duration-200">
        <AnimatePresence>
          {!isOnline && !dismissOfflineBanner && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500 text-yellow-900 px-4 py-3 text-center shadow-md flex justify-between items-center"
            >
              <div className="flex items-center space-x-2 flex-grow justify-center pl-8">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold text-sm tracking-wide">You are currently offline. Running in offline mode.</span>
              </div>
              <button 
                onClick={() => setDismissOfflineBanner(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1.5 px-3 rounded text-xs transition-colors shadow-sm ml-auto"
                aria-label="Dismiss offline warning"
              >
                OK
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
