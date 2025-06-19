import { BudgetCategory } from ".";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BudgetModalState {
  showCreateCategoryModal: boolean;
  showEditCategoryModal: boolean;
  showCreateTransactionModal: boolean;
  showEditTransactionModal: boolean;
  showDeleteConfirmModal: boolean;
  showActionsMenu: boolean;
  showEditBudgetModal: boolean; // Add this missing property
}

export type EditingItem = Transaction | BudgetCategory | null;

// Update Transaction interface to include missing properties
export interface Transaction {
  id: string;
  budgetId: string;
  categoryId: string;
  description: string;
  amount: number;
  date: string;
  isPosted: boolean;
  isRecurring: boolean;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  recurringDay?: number; // Add this missing property
  createdAt: string;
  updatedAt: string;
  category?: BudgetCategory;
}

// Export the modal state type for BudgetModals component
export type ModalState = BudgetModalState;