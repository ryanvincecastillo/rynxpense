import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Archive, 
  ArchiveRestore,
  Filter,
  SortAsc,
  Eye,
  EyeOff
} from 'lucide-react';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget, useDuplicateBudget } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Button, 
  Card, 
  EmptyState, 
  LoadingSpinner, 
  Alert,
  Input,
  Badge
} from '../../components/ui';
import { BudgetFormModal } from '../../components/modals';
import { DuplicateBudgetModal } from '../../components/modals/DuplicateBudgetModal';
import { Budget, DuplicateBudgetOptions, CreateBudgetForm } from '../../types';
import { BudgetCard } from '../../components/features/budget';
import { DeleteConfirmModal, ArchiveConfirmModal } from '../../components/ui';
import { useFormatCurrency, useToast, useModal } from '../../hooks/common';

type SortOption = 'name' | 'created' | 'balance' | 'activity';
type ViewMode = 'grid' | 'list';

const BudgetsPage: React.FC = () => {
  const { user } = useAuth();

  // Modals
  const createModal = useModal();
  const deleteModal = useModal();
  const archiveModal = useModal();
  const duplicateModal = useModal();

  // State
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [budgetToArchive, setBudgetToArchive] = useState<Budget | null>(null);
  const [budgetToDuplicate, setBudgetToDuplicate] = useState<Budget | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('created');

  // API hooks
  const { data: budgetsResponse, isLoading, error } = useBudgets({ includeArchived });
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const duplicateBudgetMutation = useDuplicateBudget();

  const budgets: Budget[] = budgetsResponse?.data || [];
  const { formatCurrency } = useFormatCurrency();
  const { showError, showSuccess } = useToast();

  // Filter and sort budgets
  const { activeBudgets, archivedBudgets, totalStats } = useMemo(() => {
    const filtered = budgets.filter(budget =>
      budget.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'balance':
          // Assuming budget has summary data
          return (b.summary?.totalActualIncome || 0) - (a.summary?.totalActualIncome || 0);
        default:
          return 0;
      }
    });

    const active = sorted.filter(budget => !budget.isArchived);
    const archived = sorted.filter(budget => budget.isArchived);

    const stats = {
      totalBudgets: budgets.length,
      activeBudgets: active.length,
      archivedBudgets: archived.length,
    };

    return { activeBudgets: active, archivedBudgets: archived, totalStats: stats };
  }, [budgets, searchTerm, sortBy]);

  // Event handlers
  const closeModal = () => {
    createModal.close();
    setEditingBudget(null);
  };

  const closeDuplicateModal = () => {
    duplicateModal.close();
    setBudgetToDuplicate(null);
  };

  const handleBudgetSubmit = async (data: CreateBudgetForm) => {
    try {
      if (editingBudget) {
        await updateBudgetMutation.mutateAsync({
          id: editingBudget.id,
          data,
        });
        showSuccess('Budget updated successfully!');
      } else {
        await createBudgetMutation.mutateAsync(data);
        showSuccess('Budget created successfully!');
      }
      closeModal();
    } catch (error) {
      showError(editingBudget ? 'Failed to update budget' : 'Failed to create budget');
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    createModal.open();
  };

  const handleShowDeleteModal = (budget: Budget) => {
    setBudgetToDelete(budget);
    deleteModal.open();
  };

  const handleShowArchiveModal = (budget: Budget) => {
    setBudgetToArchive(budget);
    archiveModal.open();
  };

  const handleShowDuplicateModal = (budget: Budget) => {
    setBudgetToDuplicate(budget);
    duplicateModal.open();
  };

  const handleDeleteBudget = async () => {
    if (!budgetToDelete) return;
    
    try {
      await deleteBudgetMutation.mutateAsync(budgetToDelete.id);
      showSuccess('Budget deleted successfully!');
      deleteModal.close();
      setBudgetToDelete(null);
    } catch (error) {
      showError('Failed to delete budget');
    }
  };

  const handleArchiveBudget = async () => {
    if (!budgetToArchive) return;
    
    try {
      await updateBudgetMutation.mutateAsync({
        id: budgetToArchive.id,
        data: { isArchived: !budgetToArchive.isArchived },
      });
      showSuccess(budgetToArchive.isArchived ? 'Budget restored!' : 'Budget archived!');
      archiveModal.close();
      setBudgetToArchive(null);
    } catch (error) {
      showError('Failed to update budget');
    }
  };

  const handleDuplicateBudget = async (options: DuplicateBudgetOptions) => {
    if (!budgetToDuplicate) return;
    
    try {
      await duplicateBudgetMutation.mutateAsync({
        budgetId: budgetToDuplicate.id,
        options,
      });
      showSuccess('Budget duplicated successfully!');
      closeDuplicateModal();
    } catch (error) {
      showError('Failed to duplicate budget');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Alert type="error">
          Failed to load budgets. Please try refreshing the page.
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Budgets
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and track your financial budgets
            </p>
            
            {/* Stats */}
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="info" size="sm">
                {totalStats.activeBudgets} Active
              </Badge>
              {totalStats.archivedBudgets > 0 && (
                <Badge variant="secondary" size="sm">
                  {totalStats.archivedBudgets} Archived
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => createModal.open()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Budget
            </Button>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search budgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          {/* Controls Row - Mobile Stack, Desktop Row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            {/* Sort Dropdown */}
            <div className="flex-1 sm:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created">Sort by Created</option>
                <option value="name">Sort by Name</option>
                <option value="balance">Sort by Balance</option>
              </select>
            </div>

            {/* Mobile: Archive + View Mode in Row */}
            <div className="flex items-center justify-between sm:gap-3">
              {/* Archive Toggle */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIncludeArchived(!includeArchived)}
                className={`${
                  includeArchived ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50'
                } text-xs sm:text-sm px-2 sm:px-3`}
              >
                {includeArchived ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span className="ml-1">
                  {includeArchived ? 'Hide' : 'Show'} Archived
                </span>
              </Button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeBudgets.length === 0 && archivedBudgets.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No budgets found"
          description={searchTerm ? "No budgets match your search criteria." : "Create your first budget to start tracking your finances."}
          action={
            !searchTerm ? (
              <Button onClick={() => createModal.open()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-8">
          {/* Active Budgets */}
          {activeBudgets.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Active Budgets ({activeBudgets.length})
              </h2>
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                  : "space-y-3"
              }>
                {activeBudgets.map((budget) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    onEdit={handleEditBudget}
                    onDuplicate={handleShowDuplicateModal}
                    onArchive={handleShowArchiveModal}
                    onDelete={handleShowDeleteModal}
                    formatCurrency={formatCurrency}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Archived Budgets */}
          {includeArchived && archivedBudgets.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Archive className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-700">
                  Archived Budgets ({archivedBudgets.length})
                </h2>
              </div>
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 opacity-75"
                  : "space-y-3 opacity-75"
              }>
                {archivedBudgets.map((budget) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    onEdit={handleEditBudget}
                    onDuplicate={handleShowDuplicateModal}
                    onArchive={handleShowArchiveModal}
                    onDelete={handleShowDeleteModal}
                    formatCurrency={formatCurrency}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <BudgetFormModal
        isOpen={createModal.isOpen}
        onClose={closeModal}
        onSubmit={handleBudgetSubmit}
        editingBudget={editingBudget}
        isLoading={createBudgetMutation.isPending || updateBudgetMutation.isPending}
      />

      <DuplicateBudgetModal
        isOpen={duplicateModal.isOpen}
        onClose={closeDuplicateModal}
        budget={budgetToDuplicate}
        onDuplicate={handleDuplicateBudget}
        isLoading={duplicateBudgetMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.close();
          setBudgetToDelete(null);
        }}
        onConfirm={handleDeleteBudget}
        itemName={budgetToDelete?.name || ''}
        itemType="budget"
        isLoading={deleteBudgetMutation.isPending}
        warningText="All categories and transactions in this budget will also be deleted."
      />

      <ArchiveConfirmModal
        isOpen={archiveModal.isOpen}
        onClose={() => {
          archiveModal.close();
          setBudgetToArchive(null);
        }}
        onConfirm={handleArchiveBudget}
        itemName={budgetToArchive?.name || ''}
        itemType="budget"
        isArchived={budgetToArchive?.isArchived || false}
        isLoading={updateBudgetMutation.isPending}
      />
    </div>
  );
};

export default BudgetsPage;