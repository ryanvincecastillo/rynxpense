import React, { useState } from 'react';
import { Plus, Filter, Grid3X3, List, Search, Archive, ArchiveRestore } from 'lucide-react';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget, useDuplicateBudget } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Button, 
  Card, 
  EmptyState, 
  LoadingSpinner, 
  Alert,
  Input
} from '../../components/ui';
import { BudgetFormModal } from '../../components/modals';
import { Budget, DuplicateBudgetOptions, CreateBudgetForm } from '../../types';
import { DuplicateBudgetModal } from '../../components/modals/DuplicateBudgetModal';
import { BudgetCard } from '../../components/features/budget';
import { DeleteConfirmModal, ArchiveConfirmModal } from '../../components/ui';
import { useFormatCurrency, useToast, useModal } from '../../hooks/common';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // API hooks
  const { data: budgetsResponse, isLoading, error } = useBudgets({ includeArchived });
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const duplicateBudgetMutation = useDuplicateBudget();

  const budgets: Budget[] = budgetsResponse?.data || [];
  const { formatCurrency } = useFormatCurrency();
  const { showError, showSuccess } = useToast();

  // Filter budgets based on search term
  const filteredBudgets = budgets.filter(budget =>
    budget.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate active and archived budgets
  const activeBudgets = filteredBudgets.filter(budget => !budget.isArchived);
  const archivedBudgets = filteredBudgets.filter(budget => budget.isArchived);

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
    } catch (error: any) {
      showError(error.response?.data?.message || `Failed to ${editingBudget ? 'update' : 'create'} budget`);
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    createModal.open();
  };

  const handleShowDuplicateModal = (budget: Budget) => {
    setBudgetToDuplicate(budget);
    duplicateModal.open();
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
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to duplicate budget');
    }
  };

  const handleShowArchiveModal = (budget: Budget) => {
    setBudgetToArchive(budget);
    archiveModal.open();
  };

  const handleArchiveBudget = async () => {
    if (!budgetToArchive) return;
    
    try {
      await updateBudgetMutation.mutateAsync({
        id: budgetToArchive.id,
        data: { isArchived: !budgetToArchive.isArchived }
      });
      showSuccess(`Budget ${budgetToArchive.isArchived ? 'unarchived' : 'archived'} successfully!`);
      archiveModal.close();
      setBudgetToArchive(null);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update budget');
    }
  };

  const handleShowDeleteModal = (budget: Budget) => {
    setBudgetToDelete(budget);
    deleteModal.open();
  };

  const handleDeleteBudget = async () => {
    if (!budgetToDelete) return;
    
    try {
      await deleteBudgetMutation.mutateAsync(budgetToDelete.id);
      showSuccess('Budget deleted successfully!');
      deleteModal.close();
      setBudgetToDelete(null);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to delete budget');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert type="error" title="Error loading budgets">
            {error.message}
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Budgets
              </h1>
              <p className="text-gray-600">
                Manage and track your financial budgets
              </p>
            </div>
            <Button 
              onClick={() => createModal.open()}
              className="shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Budget
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search budgets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Archive Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIncludeArchived(!includeArchived)}
                  className={includeArchived ? 'bg-gray-100' : ''}
                >
                  {includeArchived ? (
                    <>
                      <ArchiveRestore className="h-4 w-4 mr-2" />
                      Hide Archived
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      Show Archived
                    </>
                  )}
                </Button>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            {budgets.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>{activeBudgets.length} Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>{archivedBudgets.length} Archived</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>{filteredBudgets.length} Total {searchTerm && 'Found'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Budget Grid/List */}
        {filteredBudgets.length === 0 ? (
          <Card className="shadow-lg">
            <EmptyState
              icon={Plus}
              title={searchTerm ? "No budgets found" : "No Budgets Found"}
              description={
                searchTerm 
                  ? `No budgets match "${searchTerm}". Try adjusting your search.`
                  : includeArchived 
                  ? "You don't have any budgets yet." 
                  : "You don't have any active budgets."
              }
              action={
                !searchTerm && (
                  <Button onClick={() => createModal.open()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Budget
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' 
              : 'space-y-4'
            }
          `}>
            {/* Active Budgets */}
            {activeBudgets.map((budget: Budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={handleEditBudget}
                onDuplicate={handleShowDuplicateModal}
                onArchive={handleShowArchiveModal}
                onDelete={handleShowDeleteModal}
                formatCurrency={formatCurrency}
              />
            ))}

            {/* Archived Budgets (if showing) */}
            {includeArchived && archivedBudgets.length > 0 && (
              <>
                {activeBudgets.length > 0 && (
                  <div className={`
                    ${viewMode === 'grid' ? 'col-span-full' : 'w-full'}
                    border-t border-gray-300 pt-6 mt-6
                  `}>
                    <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                      <Archive className="h-5 w-5 mr-2" />
                      Archived Budgets
                    </h3>
                  </div>
                )}
                {archivedBudgets.map((budget: Budget) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    onEdit={handleEditBudget}
                    onDuplicate={handleShowDuplicateModal}
                    onArchive={handleShowArchiveModal}
                    onDelete={handleShowDeleteModal}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </>
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
    </div>
  );
};

export default BudgetsPage;