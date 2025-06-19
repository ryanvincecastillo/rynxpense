// Base types matching your API schema
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Budget types
export interface Budget {
  id: string;
  name: string;
  description?: string;
  color: string;
  userId: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  collaborators?: BudgetCollaborator[];
  categories?: BudgetCategory[];
  summary?: BudgetSummary;
  _count?: {
    categories: number;
    transactions: number;
  };
}

export interface BudgetCollaborator {
  id: string;
  budgetId: string;
  userId: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  createdAt: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

// Category types
export interface BudgetCategory {
  id: string;
  budgetId: string;
  name: string;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  plannedAmount: number;
  actualAmount: number;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  budget?: Pick<Budget, 'id' | 'name' | 'userId'>;
  transactions?: Transaction[];
  _count?: {
    transactions: number;
  };
}

// UPDATED: Transaction types with recurring fields
export interface Transaction {
  id: string;
  budgetId: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  isPosted: boolean;
  receiptUrl?: string;
  // NEW: Recurring transaction fields
  isRecurring?: boolean;
  dayOfMonth?: number;
  frequency?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  createdAt: string;
  updatedAt: string;
  budget?: Pick<Budget, 'id' | 'name' | 'color'>;
  category?: Pick<BudgetCategory, 'id' | 'name' | 'type' | 'color' | 'plannedAmount' | 'actualAmount'>;
}

// Summary types
export interface BudgetSummary {
  totalPlannedIncome: number;
  totalActualIncome: number;
  totalPlannedExpenses: number;
  totalActualExpenses: number;
  netPlanned: number;
  netActual: number;
  categoryCount: number;
  transactionCount: number;
}

export interface TransactionSummary {
  totalAmount: number;
  postedAmount: number;
  pendingAmount: number;
  transactionCount: number;
  postedCount: number;
  pendingCount: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Special response type for transactions with summary
export interface TransactionsResponse {
  success: boolean;
  message: string;
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: TransactionSummary;
}

export interface BudgetCategoriesResponse {
  income: BudgetCategory[];
  expense: BudgetCategory[];
  summary: {
    totalPlannedIncome: number;
    totalActualIncome: number;
    totalPlannedExpenses: number;
    totalActualExpenses: number;
    netPlanned: number;
    netActual: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  currency?: string;
}

export interface CreateBudgetForm {
  name: string;
  description?: string;
  color?: string;
}

export interface CreateCategoryForm {
  budgetId: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  plannedAmount: number;
  color?: string;
}

// UPDATED: Create transaction form with recurring fields
export interface CreateTransactionForm {
  budgetId: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  isPosted?: boolean;
  receiptUrl?: string;
  // NEW: Recurring fields
  isRecurring?: boolean;
  dayOfMonth?: number;
  frequency?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

// Query parameters
export interface BudgetQueryParams {
  page?: number;
  limit?: number;
  includeArchived?: boolean;
  search?: string;
}

export interface CategoryQueryParams {
  budgetId?: string;
  type?: 'INCOME' | 'EXPENSE';
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// UPDATED: Transaction query params with recurring filter
export interface TransactionQueryParams {
  budgetId?: string;
  categoryId?: string;
  isPosted?: boolean;
  isRecurring?: boolean; // NEW: Filter for recurring transactions
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: 'date' | 'amount' | 'description' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// NEW: Duplication options type
export interface DuplicateBudgetOptions {
  includeRecurringTransactions?: boolean;
  includeRecentTransactions?: boolean;
  recentDays?: number;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Component prop types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  errors?: string[];
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  children?: NavItem[];
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Theme types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
  };
}