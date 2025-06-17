import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { NavigateFunction } from 'react-router-dom';



import { ModalState, EditingItem } from './useBudgetState';
import { Budget, BudgetCategory, DuplicateBudgetOptions, Transaction } from '../types';
import { useCreateCategory, useCreateTransaction, useDeleteBudget, useDeleteCategory, useDeleteTransaction, useDuplicateBudget, useUpdateBudget, useUpdateCategory, useUpdateTransaction } from './useApi';

interface UseBudgetActionsProps {
  budget: Budget | undefined;
  budgetId: string;
  navigate: NavigateFunction;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  setEditingItem: React.Dispatch<React.SetStateAction<EditingItem>>;
}

export const useBudgetActions = ({
  budget,
  budgetId,
  navigate,
  setModalState,
  setEditingItem,
}: UseBudgetActionsProps) => {
  // Mutations
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const duplicateBudgetMutation = useDuplicateBudget();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  // Budget actions
  const handleUpdateBudget = useCallback(async (data: any) => {
    try {
      await updateBudgetMutation.mutateAsync({ id: budgetId, data });
      toast.success('Budget updated successfully!');
      setModalState(prev => ({ ...prev, showEditModal: false }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update budget');
    }
  }, [budgetId, updateBudgetMutation, setModalState]);

  const handleDuplicateBudget = useCallback(async (options: DuplicateBudgetOptions) => {
    if (!budget) return;
    
    try {
      const result = await duplicateBudgetMutation.mutateAsync({
        budgetId: budget.id,
        options,
      });
      
      let message = `Budget "${budget.name}" duplicated successfully!`;
      if (options.includeRecurringTransactions) {
        message += ' Recurring transactions included.';
      } else if (options.includeRecentTransactions) {
        message += ` Recent transactions (${options.recentDays} days) included.`;
      }
      
      toast.success(message);
      setModalState(prev => ({ ...prev, showDuplicateModal: false }));
      
      if (result?.data?.id) {
        navigate(`/budgets/${result.data.id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to duplicate budget');
    }
  }, [budget, duplicateBudgetMutation, setModalState, navigate]);

  const handleArchiveBudget = useCallback(async () => {
    if (!budget) return;
    
    try {
      await updateBudgetMutation.mutateAsync({
        id: budget.id,
        data: { isArchived: !budget.isArchived },
      });
      toast.success(`Budget ${budget.isArchived ? 'unarchived' : 'archived'} successfully!`);
      setModalState(prev => ({ ...prev, showActionsMenu: false }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update budget');
    }
  }, [budget, updateBudgetMutation, setModalState]);

  const handleDeleteBudget = useCallback(async () => {
    if (!budget) return;

    try {
      await deleteBudgetMutation.mutateAsync(budget.id);
      toast.success('Budget deleted successfully!');
      navigate('/budgets');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete budget');
    }
  }, [budget, deleteBudgetMutation, navigate]);

  // Category actions
  const handleCreateCategory = useCallback(async (data: any) => {
    try {
      await createCategoryMutation.mutateAsync({
        budgetId,
        ...data,
      });
      toast.success('Category created successfully!');
      setModalState(prev => ({ ...prev, showCategoryModal: false }));
      setEditingItem(prev => ({ ...prev, category: null }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  }, [budgetId, createCategoryMutation, setModalState, setEditingItem]);

  const handleUpdateCategory = useCallback(async (category: BudgetCategory, data: any) => {
    try {
      await updateCategoryMutation.mutateAsync({
        id: category.id,
        data: {
          name: data.name,
          plannedAmount: data.plannedAmount,
          color: data.color,
        },
      });
      toast.success('Category updated successfully!');
      setModalState(prev => ({ ...prev, showCategoryModal: false }));
      setEditingItem(prev => ({ ...prev, category: null }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  }, [updateCategoryMutation, setModalState, setEditingItem]);

  const handleToggleCategoryActive = useCallback(async (category: BudgetCategory) => {
    try {
      await updateCategoryMutation.mutateAsync({
        id: category.id,
        data: { isActive: !category.isActive },
      });
      toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  }, [updateCategoryMutation]);

  const handleDeleteCategory = useCallback(async (category: BudgetCategory) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      toast.success('Category deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  }, [deleteCategoryMutation]);

  // Transaction actions
  const handleCreateTransaction = useCallback(async (data: any) => {
    try {
      const payload = {
        budgetId,
        categoryId: data.categoryId,
        amount: data.amount,
        description: data.description,
        date: data.date,
        isPosted: data.isPosted || false,
        receiptUrl: data.receiptUrl || undefined,
        ...(data.isRecurring && {
          isRecurring: data.isRecurring,
          frequency: data.frequency,
          ...(data.frequency === 'MONTHLY' && data.dayOfMonth ? { dayOfMonth: data.dayOfMonth } : {}),
        }),
      };

      await createTransactionMutation.mutateAsync(payload);
      
      let successMessage = 'Transaction created successfully!';
      if (data.isRecurring) {
        successMessage += ` This ${data.frequency?.toLowerCase()} recurring transaction will appear in future budget duplicates.`;
      }
      
      toast.success(successMessage);
      setModalState(prev => ({ ...prev, showTransactionModal: false }));
      setEditingItem(prev => ({ ...prev, transaction: null }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create transaction');
    }
  }, [budgetId, createTransactionMutation, setModalState, setEditingItem]);

  const handleUpdateTransaction = useCallback(async (transaction: Transaction, data: any) => {
    try {
      const payload = {
        ...data,
        receiptUrl: data.receiptUrl || undefined,
        ...(data.isRecurring && {
          isRecurring: data.isRecurring,
          dayOfMonth: data.dayOfMonth,
          frequency: data.frequency,
        }),
      };

      await updateTransactionMutation.mutateAsync({
        id: transaction.id,
        data: payload,
      });
      
      toast.success('Transaction updated successfully!');
      setModalState(prev => ({ ...prev, showTransactionModal: false }));
      setEditingItem(prev => ({ ...prev, transaction: null }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update transaction');
    }
  }, [updateTransactionMutation, setModalState, setEditingItem]);

  const handleDeleteTransaction = useCallback(async (transaction: Transaction) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await deleteTransactionMutation.mutateAsync(transaction.id);
      toast.success('Transaction deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete transaction');
    }
  }, [deleteTransactionMutation]);

  // Generic action handlers
  const handleQuickAction = useCallback((action: string, type?: string) => {
    switch (action) {
      case 'addIncome':
        setEditingItem(prev => ({ ...prev, category: null }));
        setModalState(prev => ({ ...prev, showCategoryModal: true }));
        break;
      case 'addExpense':
        setEditingItem(prev => ({ ...prev, category: null }));
        setModalState(prev => ({ ...prev, showCategoryModal: true }));
        break;
      case 'addTransaction':
        setEditingItem(prev => ({ ...prev, transaction: null }));
        setModalState(prev => ({ ...prev, showTransactionModal: true }));
        break;
      default:
        break;
    }
  }, [setEditingItem, setModalState]);

  const handleMenuAction = useCallback((action: string) => {
    setModalState(prev => ({ ...prev, showActionsMenu: false }));
    
    switch (action) {
      case 'duplicate':
        setModalState(prev => ({ ...prev, showDuplicateModal: true }));
        break;
      case 'archive':
        handleArchiveBudget();
        break;
      case 'delete':
        setModalState(prev => ({ ...prev, showDeleteModal: true }));
        break;
      default:
        break;
    }
  }, [setModalState, handleArchiveBudget]);

  const handleCategoryAction = useCallback((action: string, category?: BudgetCategory, data?: any) => {
    switch (action) {
      case 'create':
        handleCreateCategory(data);
        break;
      case 'edit':
        if (category) {
          setEditingItem(prev => ({ ...prev, category }));
          setModalState(prev => ({ ...prev, showCategoryModal: true }));
        }
        break;
      case 'update':
        if (category) {
          handleUpdateCategory(category, data);
        }
        break;
      case 'toggleActive':
        if (category) {
          handleToggleCategoryActive(category);
        }
        break;
      case 'delete':
        if (category) {
          handleDeleteCategory(category);
        }
        break;
      default:
        break;
    }
  }, [handleCreateCategory, handleUpdateCategory, handleToggleCategoryActive, handleDeleteCategory, setEditingItem, setModalState]);

  const handleTransactionAction = useCallback((action: string, transaction?: Transaction, data?: any) => {
    switch (action) {
      case 'create':
        handleCreateTransaction(data);
        break;
      case 'edit':
        if (transaction) {
          setEditingItem(prev => ({ ...prev, transaction }));
          setModalState(prev => ({ ...prev, showTransactionModal: true }));
        }
        break;
      case 'update':
        if (transaction) {
          handleUpdateTransaction(transaction, data);
        }
        break;
      case 'delete':
        if (transaction) {
          handleDeleteTransaction(transaction);
        }
        break;
      default:
        break;
    }
  }, [handleCreateTransaction, handleUpdateTransaction, handleDeleteTransaction, setEditingItem, setModalState]);

  const handleCloseModal = useCallback((modalName?: keyof ModalState) => {
    if (modalName) {
      setModalState(prev => ({ ...prev, [modalName]: false }));
    } else {
      // Close all modals
      setModalState({
        showEditModal: false,
        showDeleteModal: false,
        showActionsMenu: false,
        showDuplicateModal: false,
        showCategoryModal: false,
        showTransactionModal: false,
      });
    }
    
    setEditingItem({
      category: null,
      transaction: null,
    });
  }, [setModalState, setEditingItem]);

  const handleModalSubmit = useCallback((type: string, data: any) => {
    switch (type) {
      case 'budget':
        handleUpdateBudget(data);
        break;
      case 'duplicate':
        handleDuplicateBudget(data);
        break;
      case 'deleteBudget':
        handleDeleteBudget();
        break;
      default:
        break;
    }
  }, [handleUpdateBudget, handleDuplicateBudget, handleDeleteBudget]);

  return {
    handleQuickAction,
    handleMenuAction,
    handleCategoryAction,
    handleTransactionAction,
    handleCloseModal,
    handleModalSubmit,
    // Individual handlers for direct use
    handleUpdateBudget,
    handleDuplicateBudget,
    handleArchiveBudget,
    handleDeleteBudget,
  };
};