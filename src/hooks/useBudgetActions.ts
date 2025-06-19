import { useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { Budget } from '../types';
import { BudgetModalState } from './useBudgetState';

interface UseBudgetActionsProps {
  budget: Budget | undefined;
  budgetId: string;
  navigate: NavigateFunction;
  setModalState: (updates: Partial<BudgetModalState>) => void;
  setEditingItem: (item: any) => void;
}

export const useBudgetActions = ({
  budget,
  budgetId,
  navigate,
  setModalState,
  setEditingItem,
}: UseBudgetActionsProps) => {
  
  const handleQuickAction = useCallback((action: string, type?: 'INCOME' | 'EXPENSE') => {
    switch (action) {
      case 'addIncome':
        setEditingItem(null);
        setModalState({ showCreateCategoryModal: true });
        // Pre-fill with income type in your form component
        break;
      case 'addExpense':
        setEditingItem(null);
        setModalState({ showCreateCategoryModal: true });
        // Pre-fill with expense type in your form component
        break;
      case 'addTransaction':
        setEditingItem(null);
        setModalState({ showCreateTransactionModal: true });
        break;
      default:
        console.warn('Unknown quick action:', action);
    }
  }, [setEditingItem, setModalState]);

  const handleMenuAction = useCallback((action: string) => {
    switch (action) {
      case 'edit':
        setModalState({ showEditBudgetModal: true });
        break;
      case 'duplicate':
        // Handle budget duplication
        console.log('Duplicate budget:', budgetId);
        break;
      case 'archive':
        // Handle budget archiving
        console.log('Archive budget:', budgetId);
        break;
      case 'delete':
        // Handle budget deletion with confirmation
        console.log('Delete budget:', budgetId);
        break;
      case 'export':
        // Handle budget export
        console.log('Export budget:', budgetId);
        break;
      default:
        console.warn('Unknown menu action:', action);
    }
    setModalState({ showActionsMenu: false });
  }, [budgetId, setModalState]);

  const handleTransactionAction = useCallback((action: string, transaction?: any, data?: any) => {
    switch (action) {
      case 'create':
        setEditingItem(null);
        setModalState({ showCreateTransactionModal: true });
        break;
      case 'edit':
        if (transaction) {
          setEditingItem(transaction);
          setModalState({ showEditTransactionModal: true });
        }
        break;
      case 'delete':
        if (transaction) {
          setEditingItem(transaction);
          setModalState({ showDeleteConfirmModal: true });
        }
        break;
      default:
        console.warn('Unknown transaction action:', action);
    }
  }, [setEditingItem, setModalState]);

  const handleCategoryAction = useCallback((action: string, category?: any, data?: any) => {
    switch (action) {
      case 'create':
        setEditingItem(null);
        setModalState({ showCreateCategoryModal: true });
        break;
      case 'edit':
        if (category) {
          setEditingItem(category);
          setModalState({ showEditCategoryModal: true });
        }
        break;
      case 'delete':
        if (category) {
          setEditingItem(category);
          setModalState({ showDeleteConfirmModal: true });
        }
        break;
      default:
        console.warn('Unknown category action:', action);
    }
  }, [setEditingItem, setModalState]);

  const handleCloseModal = useCallback(() => {
    setModalState({
      showCreateCategoryModal: false,
      showEditCategoryModal: false,
      showCreateTransactionModal: false,
      showEditTransactionModal: false,
      showDeleteConfirmModal: false,
      showEditBudgetModal: false,
    });
    setEditingItem(null);
  }, [setEditingItem, setModalState]);

  return {
    handleQuickAction,
    handleMenuAction,
    handleTransactionAction,
    handleCategoryAction,
    handleCloseModal,
  };
};