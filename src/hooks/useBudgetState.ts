import { useState } from 'react';
import { BudgetCategory, Transaction } from '../types';

export type ActiveTab = 'overview' | 'budget-planning' | 'transactions';
export type ActionType = 'create' | 'edit' | 'delete' | 'duplicate';

export interface ModalState {
  showEditModal: boolean;
  showDeleteModal: boolean;
  showActionsMenu: boolean;
  showDuplicateModal: boolean;
  showCategoryModal: boolean;
  showTransactionModal: boolean;
}

export interface FilterState {
  categories: {
    type: 'INCOME' | 'EXPENSE' | '';
    showInactive: boolean;
    searchTerm: string; // Added search term
  };
  transactions: {
    isPosted?: boolean;
    isRecurring?: boolean;
    search: string;
  };
}

export interface EditingItem {
  category: BudgetCategory | null;
  transaction: Transaction | null;
}

export const useBudgetState = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  
  const [modalState, setModalState] = useState<ModalState>({
    showEditModal: false,
    showDeleteModal: false,
    showActionsMenu: false,
    showDuplicateModal: false,
    showCategoryModal: false,
    showTransactionModal: false,
  });

  const [filters, setFilters] = useState<FilterState>({
    categories: {
      type: '',
      showInactive: false,
      searchTerm: '', // Added search term
    },
    transactions: {
      isPosted: undefined,
      isRecurring: undefined,
      search: '',
    },
  });

  const [editingItem, setEditingItem] = useState<EditingItem>({
    category: null,
    transaction: null,
  });

  // Helper functions to update state
  const closeAllModals = () => {
    setModalState({
      showEditModal: false,
      showDeleteModal: false,
      showActionsMenu: false,
      showDuplicateModal: false,
      showCategoryModal: false,
      showTransactionModal: false,
    });
    setEditingItem({
      category: null,
      transaction: null,
    });
  };

  const openModal = (modalName: keyof ModalState) => {
    setModalState(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof ModalState) => {
    setModalState(prev => ({ ...prev, [modalName]: false }));
  };

  // Helper to update category filters
  const updateCategoryFilters = (updates: Partial<FilterState['categories']>) => {
    setFilters(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        ...updates,
      },
    }));
  };

  // Helper to update transaction filters
  const updateTransactionFilters = (updates: Partial<FilterState['transactions']>) => {
    setFilters(prev => ({
      ...prev,
      transactions: {
        ...prev.transactions,
        ...updates,
      },
    }));
  };

  return {
    activeTab,
    setActiveTab,
    modalState,
    setModalState,
    filters,
    setFilters,
    editingItem,
    setEditingItem,
    closeAllModals,
    openModal,
    closeModal,
    updateCategoryFilters,
    updateTransactionFilters,
  };
};