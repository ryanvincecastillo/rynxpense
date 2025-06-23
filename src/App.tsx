import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layout components
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// Page components
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import BudgetsPage from './features/budgets/BudgetsPage';
import BudgetDetailsPage from './features/budgets/BudgetDetailsPage';
import SettingsPage from './features/settings/SettingsPage';

// Loading and error components
import { LoadingSpinner } from './components/ui';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ROUTES } from './constants/routes';

// Create React Query client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Auth Routes */}
                <Route
                  path="/login"
                  element={
                    <AuthLayout>
                      <LoginPage />
                    </AuthLayout>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <AuthLayout>
                      <RegisterPage />
                    </AuthLayout>
                  }
                />

                {/* Protected App Routes */}
                {/* <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <DashboardPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                /> */}
                <Route
                  path="/budgets"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <BudgetsPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/budgets/:budgetId"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <BudgetDetailsPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <SettingsPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to={ROUTES.BUDGETS} replace />} />

                {/* 404 route */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                        <p className="text-gray-600 mb-8">Page not found</p>
                        <button
                          onClick={() => (window.location.href = ROUTES.BUDGETS)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Go to Budgets
                        </button>
                      </div>
                    </div>
                  }
                />
              </Routes>

              {/* Global Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    style: {
                      background: '#10B981',
                    },
                  },
                  error: {
                    duration: 5000,
                    style: {
                      background: '#EF4444',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;