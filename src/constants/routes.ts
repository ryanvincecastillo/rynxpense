export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_EMAIL_NEEDED: '/email-verification-needed', // NEW
  
  // App routes
  DASHBOARD: '/dashboard',
  BUDGETS: '/budgets',
  BUDGET_DETAILS: '/budgets/:budgetId',
  SETTINGS: '/settings',
  
  // Utility
  HOME: '/',
} as const;

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.BUDGETS,
  ROUTES.SETTINGS,
] as const;