// rynxpense/src/App.tsx
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
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import EmailVerificationPage from './features/auth/EmailVerificationPage';
import EmailVerificationNeededPage from './features/auth/EmailVerificationNeededPage';
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

// 🔧 FIXED: Protected Route Component with proper public route handling
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, requiresVerification } = useAuth();

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

  // Check if user needs email verification
  if (requiresVerification || !user.isEmailVerified) {
    return <Navigate to="/email-verification-needed" replace />;
  }

  return <>{children}</>;
};

// 🔧 FIXED: Public Route Component (prevents authenticated users from accessing auth pages)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, requiresVerification } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If user is authenticated and verified, redirect to budgets
  if (user && !requiresVerification && user.isEmailVerified) {
    return <Navigate to="/budgets" replace />;
  }

  // Allow access to public routes
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
                {/* 🔧 FIXED: Public Auth Routes with PublicRoute wrapper */}
                <Route
                  path={ROUTES.LOGIN}
                  element={
                    <PublicRoute>
                      <AuthLayout>
                        <LoginPage />
                      </AuthLayout>
                    </PublicRoute>
                  }
                />
                <Route
                  path={ROUTES.REGISTER}
                  element={
                    <PublicRoute>
                      <AuthLayout>
                        <RegisterPage />
                      </AuthLayout>
                    </PublicRoute>
                  }
                />
                <Route
                  path={ROUTES.FORGOT_PASSWORD}
                  element={
                    <PublicRoute>
                      <AuthLayout>
                        <ForgotPasswordPage />
                      </AuthLayout>
                    </PublicRoute>
                  }
                />
                
                {/* 🔧 CRITICAL FIX: Reset Password Route - Public, no authentication */}
                <Route
                  path={ROUTES.RESET_PASSWORD}
                  element={
                    <PublicRoute>
                      <AuthLayout>
                        <ResetPasswordPage />
                      </AuthLayout>
                    </PublicRoute>
                  }
                />
                
                <Route
                  path={ROUTES.VERIFY_EMAIL}
                  element={
                    <PublicRoute>
                      <AuthLayout>
                        <EmailVerificationPage />
                      </AuthLayout>
                    </PublicRoute>
                  }
                />
                
                <Route
                  path="/email-verification-needed"
                  element={
                    <AuthLayout>
                      <EmailVerificationNeededPage />
                    </AuthLayout>
                  }
                />

                {/* 🔧 FIXED: Protected App Routes */}
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

                {/* Default Routes */}
                <Route path="/" element={<Navigate to="/budgets" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
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
                }}
              />

              {/* React Query DevTools (only in development) */}
              {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;