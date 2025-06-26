// src/constants/routes.ts
export const ROUTES = {
  // 🔧 FIX: Public routes (no authentication required)
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // 🔧 FIX: Protected routes (authentication required)
  DASHBOARD: '/dashboard',
  BUDGETS: '/budgets',
  TRANSACTIONS: '/transactions',
  CATEGORIES: '/categories',
  PROFILE: '/profile',
  SETTINGS: '/settings',

  // 🔧 FIX: API routes (for reference)
  API: {
    BASE: '/api/v1',
    AUTH: {
      LOGIN: '/api/v1/auth/login',
      REGISTER: '/api/v1/auth/register',
      LOGOUT: '/api/v1/auth/logout',
      REFRESH_TOKEN: '/api/v1/auth/refresh-token',
      FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
      RESET_PASSWORD: '/api/v1/auth/reset-password',
      VERIFY_EMAIL: '/api/v1/auth/verify-email',
      RESEND_VERIFICATION: '/api/v1/auth/resend-verification',
      LOGIN_REMEMBER_ME: '/api/v1/auth/login-remember-me',
      PROFILE: '/api/v1/auth/profile',
      CHANGE_PASSWORD: '/api/v1/auth/change-password',
    },
    BUDGETS: '/api/v1/budgets',
    CATEGORIES: '/api/v1/categories',
    TRANSACTIONS: '/api/v1/transactions',
  },
} as const;

// 🔧 FIX: Helper function to check if route is public
export const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = [
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
    ROUTES.VERIFY_EMAIL,
  ];
  
  return publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );
};

// 🔧 FIX: Helper function to check if route requires authentication
export const isProtectedRoute = (pathname: string): boolean => {
  const protectedRoutes = [
    ROUTES.DASHBOARD,
    ROUTES.BUDGETS,
    ROUTES.TRANSACTIONS,
    ROUTES.CATEGORIES,
    ROUTES.PROFILE,
    ROUTES.SETTINGS,
  ];
  
  return protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );
};

export default ROUTES;