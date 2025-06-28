// src/features/budgets/BudgetDetailsPage.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// API Hooks
import { 
  useBudget, 
  useBudgetSummary, 
  useBudgetCategories, 
  useTransactions,
  useUpdateBudget,
  useDuplicateBudget, 
  useDeleteBudget,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '../../hooks/useApi';

// Context & Hooks
import { useAuth } from '../../contexts/AuthContext';
import { useFormatCurrency, useToast } from '../../hooks/common';

// UI Components
import { 
  Button, 
  Alert, 
  LoadingSpinner, 
  Badge, 
  DeleteConfirmModal, 
  ArchiveConfirmModal 
} from '../../components/ui';

// Modal Components
import { 
  BudgetFormModal, 
  CategoryFormModal,
  TransactionFormModal
} from '../../components/modals';
import { DuplicateBudgetModal } from '../../components/modals/DuplicateBudgetModal';

// Feature Components
import { 
  BudgetActionsMenu, 
  BudgetOverviewTab, 
  BudgetTabs, 
  BudgetTransactionsTab, 
  BudgetDetailsHeader 
} from '../../components/features/budget';
import { BudgetCategoriesTab } from '../../components/features/budget/BudgetCategoriesTab';

// Icons
import { 
  MoreVertical, 
  Plus, 
  Filter, 
  Download,
  Share2,
  AlertCircle,
  Sparkles,
  Edit,
  Copy,
  Archive,
  Trash2
} from 'lucide-react';

// Types
import { 
  Transaction, 
  BudgetCategory, 
  Budget,
  CreateBudgetForm,
  CreateCategoryForm,
  CreateTransactionForm,
  DuplicateBudgetOptions,
} from '../../types';

// Constants
const TABS = {
  OVERVIEW: 'overview' as const,
  CATEGORIES: 'categories' as const, 
  TRANSACTIONS: 'transactions' as const
} as const;

type ActiveTab = 'overview' | 'categories' | 'transactions';

interface BudgetDetailsState {
  activeTab: ActiveTab;
  currentPage: number;
  modalState: {
    showCreateCategoryModal: boolean;
    showEditCategoryModal: boolean;
    showCreateTransactionModal: boolean;
    showEditTransactionModal: boolean;
    showDeleteConfirmModal: boolean;
    showActionsMenu: boolean;
    showEditBudgetModal: boolean;
    showDuplicateModal: boolean;
    showArchiveModal: boolean;
    showDeleteModal: boolean;
  };
  editingItem: Transaction | BudgetCategory | null;
  deleteConfirmation: {
    isOpen: boolean;
    type: 'transaction' | 'category' | null;
    item: Transaction | BudgetCategory | null;
    onConfirm: (() => void) | null;
  };
  filters: {
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
  };
}

const initialState: BudgetDetailsState = {
  activeTab: 'overview',
  currentPage: 1,
  modalState: {
    showCreateCategoryModal: false,
    showEditCategoryModal: false,
    showCreateTransactionModal: false,
    showEditTransactionModal: false,
    showDeleteConfirmModal: false,
    showActionsMenu: false,
    showEditBudgetModal: false,
    showDuplicateModal: false,
    showArchiveModal: false,
    showDeleteModal: false,
  },
  editingItem: null,
  deleteConfirmation: {
    isOpen: false,
    type: null,
    item: null,
    onConfirm: null,
  },
  filters: {
    categories: {
      type: '',
      showInactive: false,
      search: '',
    },
    transactions: {
      search: '',
    },
  },
};

const BudgetDetailsPage: React.FC = () => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatCurrency } = useFormatCurrency();
  const { toast } = useToast();

  // State
  const [state, setState] = useState<BudgetDetailsState>(initialState);
  const [preselectedType, setPreselectedType] = useState<'INCOME' | 'EXPENSE' | undefined>();

  // API Queries
  const { data: budget, isLoading: budgetLoading, error: budgetError } = useBudget(budgetId!);
  const { data: summary, isLoading: summaryLoading } = useBudgetSummary(budgetId!);
  const { data: categoriesData, isLoading: categoriesLoading } = useBudgetCategories(budgetId!);
  
  const transactionsParams = useMemo(() => ({
    budgetId: budgetId!,
    page: state.currentPage,
    limit: 1000,
    ...state.filters.transactions,
  }), [budgetId, state.currentPage, state.filters.transactions]);
  
  const { data: transactionsResponse, isLoading: transactionsLoading } = useTransactions(transactionsParams);

  // Get all categories for modals - moved before conditional returns
  const allCategories = useMemo(() => {
    if (!categoriesData) return [];
    return [...(categoriesData.income || []), ...(categoriesData.expense || [])];
  }, [categoriesData]);

  // API Mutations
  const updateBudgetMutation = useUpdateBudget();
  const duplicateBudgetMutation = useDuplicateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  // Helper functions
  const updateState = useCallback((updates: Partial<BudgetDetailsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateModalState = useCallback((updates: Partial<BudgetDetailsState['modalState']>) => {
    setState(prev => ({ 
      ...prev, 
      modalState: { ...prev.modalState, ...updates } 
    }));
  }, []);

  const updateFilters = useCallback((filterType: keyof BudgetDetailsState['filters'], updates: any) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [filterType]: { ...prev.filters[filterType], ...updates }}
    }));
  }, []);

  // Event Handlers
  const handleQuickAction = useCallback((action: string, type?: string) => {
    switch (action) {
      case 'addIncome':
        setPreselectedType('INCOME');
        updateModalState({ showCreateCategoryModal: true });
        break;
      case 'addExpense':
        setPreselectedType('EXPENSE');
        updateModalState({ showCreateCategoryModal: true });
        break;
      case 'addTransaction':
        updateModalState({ showCreateTransactionModal: true });
        break;
      default:
        console.warn('Unknown quick action:', action);
    }
  }, [updateModalState]);

  const handleMenuAction = useCallback((action: string) => {
    switch (action) {
      case 'edit':
        updateModalState({ showEditBudgetModal: true });
        break;
      case 'duplicate':
        updateModalState({ showDuplicateModal: true });
        break;
      case 'archive':
        updateModalState({ showArchiveModal: true });
        break;
      case 'delete':
        updateModalState({ showDeleteModal: true });
        break;
      case 'export':
        toast.success('Export functionality coming soon!');
        break;
      case 'share':
        toast.success('Share functionality coming soon!');
        break;
      default:
        console.warn('Unknown menu action:', action);
    }
    updateModalState({ showActionsMenu: false });
  }, [updateModalState, toast]);

  const handleTransactionAction = useCallback((action: string, transaction?: Transaction, data?: any) => {
    switch (action) {
      case 'create':
        setState(prev => ({ ...prev, editingItem: null }));
        updateModalState({ showCreateTransactionModal: true });
        break;
      case 'edit':
        if (transaction) {
          setState(prev => ({ ...prev, editingItem: transaction }));
          updateModalState({ showEditTransactionModal: true });
        }
        break;
      case 'delete':
        if (transaction) {
          setState(prev => ({ 
            ...prev, 
            deleteConfirmation: {
              isOpen: true,
              type: 'transaction',
              item: transaction,
              onConfirm: () => handleDeleteTransaction(transaction)
            }
          }));
        }
        break;
      default:
        console.warn('Unknown transaction action:', action);
    }
  }, [updateModalState]);

  const handleCategoryAction = useCallback((action: string, category?: BudgetCategory, data?: any) => {
    switch (action) {
      case 'create':
        setState(prev => ({ ...prev, editingItem: null }));
        updateModalState({ showCreateCategoryModal: true });
        break;
      case 'edit':
        if (category) {
          setState(prev => ({ ...prev, editingItem: category }));
          updateModalState({ showEditCategoryModal: true });
        }
        break;
      case 'delete':
        if (category) {
          setState(prev => ({ 
            ...prev, 
            deleteConfirmation: {
              isOpen: true,
              type: 'category',
              item: category,
              onConfirm: () => handleDeleteCategory(category)
            }
          }));
        }
        break;
      default:
        console.warn('Unknown category action:', action);
    }
  }, [updateModalState]);

  // Modal submission handlers
  const handleBudgetSubmit = useCallback(async (data: CreateBudgetForm) => {
    if (!budget) return;
    
    try {
      await updateBudgetMutation.mutateAsync({
        id: budget.id,
        data
      });
      toast.success('Budget updated successfully!');
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to update budget');
    }
  }, [budget, updateBudgetMutation, toast]);

  const handleCategorySubmit = useCallback(async (data: CreateCategoryForm) => {
    try {
      if (state.editingItem && 'type' in state.editingItem) {
        await updateCategoryMutation.mutateAsync({
          id: state.editingItem.id,
          data
        });
        toast.success('Category updated successfully!');
      } else {
        await createCategoryMutation.mutateAsync(data);
        toast.success('Category created successfully!');
      }
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save category');
    }
  }, [state.editingItem, createCategoryMutation, updateCategoryMutation, toast]);

  const handleTransactionSubmit = useCallback(async (data: CreateTransactionForm) => {
    try {
      if (state.editingItem && 'amount' in state.editingItem) {
        await updateTransactionMutation.mutateAsync({
          id: state.editingItem.id,
          data
        });
        toast.success('Transaction updated successfully!');
      } else {
        await createTransactionMutation.mutateAsync(data);
        toast.success('Transaction created successfully!');
      }
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save transaction');
    }
  }, [state.editingItem, createTransactionMutation, updateTransactionMutation, toast]);

  // Delete handlers
  const handleDeleteTransaction = useCallback(async (transaction: Transaction) => {
    try {
      await deleteTransactionMutation.mutateAsync(transaction.id);
      toast.success('Transaction deleted successfully!');
      setState(prev => ({ 
        ...prev, 
        deleteConfirmation: { isOpen: false, type: null, item: null, onConfirm: null }
      }));
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  }, [deleteTransactionMutation, toast]);

  const handleDeleteCategory = useCallback(async (category: BudgetCategory) => {
    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      toast.success('Category deleted successfully!');
      setState(prev => ({ 
        ...prev, 
        deleteConfirmation: { isOpen: false, type: null, item: null, onConfirm: null }
      }));
    } catch (error) {
      toast.error('Failed to delete category');
    }
  }, [deleteCategoryMutation, toast]);

  // Archive/Delete budget handlers
  const handleArchiveBudget = useCallback(async () => {
    if (!budget) return;
    
    try {
      await updateBudgetMutation.mutateAsync({
        id: budget.id,
        data: { isArchived: !budget.isArchived }
      });
      
      const action = budget.isArchived ? 'unarchived' : 'archived';
      toast.success(`Budget ${action} successfully!`);
      updateModalState({ showArchiveModal: false });
    } catch (error) {
      toast.error('Failed to update budget');
    }
  }, [budget, updateBudgetMutation, toast, updateModalState]);

  const handleDeleteBudget = useCallback(async () => {
    if (!budget) return;
    
    try {
      await deleteBudgetMutation.mutateAsync(budget.id);
      toast.success('Budget deleted successfully!');
      navigate('/budgets');
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  }, [budget, deleteBudgetMutation, toast, navigate]);

  const handleDuplicateBudget = useCallback(async (options: DuplicateBudgetOptions) => {
    if (!budget) return;
    
    try {
      await duplicateBudgetMutation.mutateAsync({
        budgetId: budget.id,
        ...options
      });
      toast.success('Budget duplicated successfully!');
      updateModalState({ showDuplicateModal: false });
    } catch (error) {
      toast.error('Failed to duplicate budget');
    }
  }, [budget, duplicateBudgetMutation, toast, updateModalState]);

  const handleCloseModal = useCallback(() => {
    updateModalState({
      showCreateCategoryModal: false,
      showEditCategoryModal: false,
      showCreateTransactionModal: false,
      showEditTransactionModal: false,
      showDeleteConfirmModal: false,
      showEditBudgetModal: false,
      showDuplicateModal: false,
      showArchiveModal: false,
      showDeleteModal: false,
    });
    setState(prev => ({ ...prev, editingItem: null }));
    setPreselectedType(undefined);
  }, [updateModalState]);

  const handleCloseDeleteConfirmation = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      deleteConfirmation: { isOpen: false, type: null, item: null, onConfirm: null }
    }));
  }, []);

  // Loading state
  if (budgetLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Loading budget details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (budgetError || !budget) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Alert className="max-w-md mx-auto mt-8">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h3 className="font-medium">Budget not found</h3>
            <p className="text-sm mt-1">The budget you're looking for doesn't exist or you don't have access to it.</p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <BudgetDetailsHeader
        budget={budget}
        formatCurrency={formatCurrency}
      >
        {/* Header Actions */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateModalState({ showActionsMenu: !state.modalState.showActionsMenu })}
            className="opacity-80 hover:opacity-100 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white hover:border-gray-300 transition-all duration-200"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {state.modalState.showActionsMenu && (
            <div 
              className="absolute top-full right-0 mt-2 z-50"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className="w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMenuAction('edit');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-3" />
                    Edit Budget
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMenuAction('duplicate');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-3" />
                    Duplicate Budget
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMenuAction('share');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-3" />
                    Share Budget
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMenuAction('export');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-3" />
                    Export Budget
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMenuAction('archive');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Archive className="h-4 w-4 mr-3" />
                    {budget.isArchived ? 'Unarchive Budget' : 'Archive Budget'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMenuAction('delete');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-3" />
                    Delete Budget
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </BudgetDetailsHeader>

      {/* Main Content */}
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> */}
        <div className="space-y-6">
          {/* Enhanced Tabs - Make THIS div sticky */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm sticky top-[140px] sm:top-[120px] lg:top-[250px] z-20">
            <BudgetTabs
              activeTab={state.activeTab}
              onTabChange={(tab) => updateState({ activeTab: tab })}
              summary={summary}
              categoriesCount={(categoriesData?.income?.length || 0) + (categoriesData?.expense?.length || 0)}
              transactionsCount={transactionsResponse?.data.pagination?.total || 0}
            />
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {state.activeTab === TABS.OVERVIEW && (
              <BudgetOverviewTab
                categoriesData={categoriesData}
                formatCurrency={formatCurrency}
                onQuickAction={handleQuickAction}
              />
            )}

            {state.activeTab === TABS.CATEGORIES && (
              <BudgetCategoriesTab
                categoriesData={categoriesData}
                filters={state.filters.categories}
                onFiltersChange={(filters) => updateFilters('categories', filters)}
                onCategoryAction={handleCategoryAction}
                formatCurrency={formatCurrency}
                isLoading={categoriesLoading}
              />
            )}

            {state.activeTab === TABS.TRANSACTIONS && (
              <BudgetTransactionsTab
                transactions={transactionsResponse?.data || []}
                categoriesData={categoriesData}
                filters={state.filters.transactions}
                onFiltersChange={(filters) => updateFilters('transactions', filters)}
                onTransactionAction={handleTransactionAction}
                formatCurrency={formatCurrency}
                isLoading={transactionsLoading}
              />
            )}
          </div>
        </div>
      {/* </div> */}

      {/* Floating Action Button - Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button
          onClick={() => handleQuickAction('addTransaction')}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* ALL MODALS */}
      
      {/* Budget Edit Modal */}
      <BudgetFormModal
        isOpen={state.modalState.showEditBudgetModal}
        onClose={handleCloseModal}
        onSubmit={handleBudgetSubmit}
        editingBudget={budget}
        isLoading={updateBudgetMutation.isPending}
      />

      {/* Category Create Modal */}
      <CategoryFormModal
        isOpen={state.modalState.showCreateCategoryModal}
        onClose={handleCloseModal}
        onSubmit={handleCategorySubmit}
        budgetId={budgetId!}
        preselectedType={preselectedType}
        isLoading={createCategoryMutation.isPending}
      />

      {/* Category Edit Modal */}
      <CategoryFormModal
        isOpen={state.modalState.showEditCategoryModal}
        onClose={handleCloseModal}
        onSubmit={handleCategorySubmit}
        editingCategory={state.editingItem as BudgetCategory}
        budgetId={budgetId!}
        isLoading={updateCategoryMutation.isPending}
      />

      {/* Transaction Create Modal */}
      <TransactionFormModal
        isOpen={state.modalState.showCreateTransactionModal}
        onClose={handleCloseModal}
        onSubmit={handleTransactionSubmit}
        budgetId={budgetId!}
        categories={allCategories}
        isLoading={createTransactionMutation.isPending}
      />

      {/* Transaction Edit Modal */}
      <TransactionFormModal
        isOpen={state.modalState.showEditTransactionModal}
        onClose={handleCloseModal}
        onSubmit={handleTransactionSubmit}
        editingTransaction={state.editingItem as Transaction}
        budgetId={budgetId!}
        categories={allCategories}
        isLoading={updateTransactionMutation.isPending}
      />

      {/* Duplicate Budget Modal */}
      <DuplicateBudgetModal
        isOpen={state.modalState.showDuplicateModal}
        onClose={handleCloseModal}
        onDuplicate={handleDuplicateBudget}
        budget={budget}
        isLoading={duplicateBudgetMutation.isPending}
      />

      {/* Archive Confirmation Modal */}
      <ArchiveConfirmModal
        isOpen={state.modalState.showArchiveModal}
        onClose={handleCloseModal}
        onConfirm={handleArchiveBudget}
        itemName={budget.name}
        itemType="budget"
        isArchived={budget.isArchived}
        isLoading={updateBudgetMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={state.modalState.showDeleteModal}
        onClose={handleCloseModal}
        onConfirm={handleDeleteBudget}
        itemName={budget.name}
        itemType="budget"
        isLoading={deleteBudgetMutation.isPending}
      />

      {/* Transaction/Category Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={state.deleteConfirmation.isOpen}
        onClose={handleCloseDeleteConfirmation}
        onConfirm={state.deleteConfirmation.onConfirm || (() => {})}
        itemName={
          state.deleteConfirmation.item 
            ? 'name' in state.deleteConfirmation.item 
              ? state.deleteConfirmation.item.name 
              : state.deleteConfirmation.item.description
            : ''
        }
        itemType={state.deleteConfirmation.type || 'item'}
        isLoading={
          state.deleteConfirmation.type === 'transaction' 
            ? deleteTransactionMutation.isPending 
            : deleteCategoryMutation.isPending
        }
      />
    </div>
  );
};

export default BudgetDetailsPage;