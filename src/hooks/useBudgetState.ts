import { useState, useCallback } from 'react';
import { Transaction, BudgetCategory } from '../types';

export type ActiveTab = 'overview' | 'categories' | 'transactions';

export interface BudgetModalState {
  showCreateCategoryModal: boolean;
  showEditCategoryModal: boolean;
  showCreateTransactionModal: boolean;
  showEditTransactionModal: boolean;
  showDeleteConfirmModal: boolean;
  showActionsMenu: boolean;
  showEditBudgetModal: boolean;
}

export interface BudgetFilters {
  categories: {
    type: 'INCOME' | 'EXPENSE' | '';
    showInactive: boolean;
    search: string;
  };
  transactions: {
    isPosted?: boolean;
    isRecurring?: boolean;
    categoryId?: string;
    search: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

export interface BudgetState {
  activeTab: ActiveTab;
  modalState: BudgetModalState;
  filters: BudgetFilters;
  editingItem: Transaction | BudgetCategory | null;
}

const initialModalState: BudgetModalState = {
  showCreateCategoryModal: false,
  showEditCategoryModal: false,
  showCreateTransactionModal: false,
  showEditTransactionModal: false,
  showDeleteConfirmModal: false,
  showActionsMenu: false,
  showEditBudgetModal: false,
};

const initialFilters: BudgetFilters = {
  categories: {
    type: '',
    showInactive: false,
    search: '',
  },
  transactions: {
    search: '',
  },
};

export const useBudgetState = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [modalState, setModalState] = useState<BudgetModalState>(initialModalState);
  const [filters, setFilters] = useState<BudgetFilters>(initialFilters);
  const [editingItem, setEditingItem] = useState<Transaction | BudgetCategory | null>(null);

  const updateModalState = useCallback((updates: Partial<BudgetModalState>) => {
    setModalState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateFilters = useCallback((filterType: keyof BudgetFilters, updates: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: { ...prev[filterType], ...updates }
    }));
  }, []);

  const resetState = useCallback(() => {
    setActiveTab('overview');
    setModalState(initialModalState);
    setFilters(initialFilters);
    setEditingItem(null);
  }, []);

  return {
    // State
    activeTab,
    modalState,
    filters,
    editingItem,
    
    // Setters
    setActiveTab,
    setModalState,
    setFilters,
    setEditingItem,
    
    // Helpers
    updateModalState,
    updateFilters,
    resetState,
  };
};