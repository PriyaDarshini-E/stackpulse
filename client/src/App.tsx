import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { Navbar } from './components/Navbar.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { Dashboard } from './pages/Dashboard.js';
import { DeveloperProfile } from './pages/DeveloperProfile.js';

// Lazy or placeholder imports for Phase 6 & 7
const Compare = React.lazy(() => import('./pages/Compare.js'));
const Pins = React.lazy(() => import('./pages/Pins.js'));
const SavedComparisons = React.lazy(() => import('./pages/SavedComparisons.js'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className={`min-h-screen font-sans ${isLoginPage ? 'bg-[#F4EFEA] text-[#1E362A]' : 'bg-[#0B0F19] text-slate-100 flex flex-col'}`}>
      {!isLoginPage && <Navbar />}
      <main className={isLoginPage ? '' : 'flex-1'}>
        <React.Suspense
          fallback={
            <div className={`min-h-[50vh] flex items-center justify-center ${isLoginPage ? 'text-[#234233]' : 'text-indigo-500'}`}>
              <div className={`w-8 h-8 border-4 ${isLoginPage ? 'border-[#234233]' : 'border-indigo-500'} border-t-transparent rounded-full animate-spin`}></div>
            </div>
          }
        >
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Core Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/developer/:username"
              element={
                <ProtectedRoute>
                  <DeveloperProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compare"
              element={
                <ProtectedRoute>
                  <Compare />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pins"
              element={
                <ProtectedRoute>
                  <Pins />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comparisons"
              element={
                <ProtectedRoute>
                  <SavedComparisons />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
