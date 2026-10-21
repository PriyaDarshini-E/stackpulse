import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
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

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
              <Navbar />
              <main className="flex-1">
              <React.Suspense
                fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
