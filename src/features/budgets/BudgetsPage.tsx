import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget, useDuplicateBudget } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Button, 
  Card, 
  EmptyState, 
  LoadingSpinner, 
  Alert
} from '../../components/ui';
import { BudgetFormModal } from '../../components/modals';
import toast from 'react-hot-toast';
import { Budget, DuplicateBudgetOptions, CreateBudgetForm } from '../../types';
import { DuplicateBudgetModal } from '../../components/modals/DuplicateBudgetModal';
import { BudgetCard } from '../../components/features/budget';
import { DeleteConfirmModal, ArchiveConfirmModal } from '../../components/ui';
import { useFormatCurrency, useToast, useModal } from '../../hooks/common';
import { arch } from 'os';
import { create } from 'domain';
import { PageHeader } from '../../components/shared/PageHeader';


const BudgetsPage: React.FC = () => {
  const { user } = useAuth();

  const createModal = useModal();
  const deleteModal = useModal();
  const archiveModal = useModal();
  const duplicateModal = useModal();

  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [budgetToArchive, setBudgetToArchive] = useState<Budget | null>(null);
  const [budgetToDuplicate, setBudgetToDuplicate] = useState<Budget | null>(null);

  // API hooks
  const { data: budgetsResponse, isLoading, error } = useBudgets({ includeArchived });
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const duplicateBudgetMutation = useDuplicateBudget();

  const budgets = budgetsResponse?.data || [];

  const { formatCurrency } = useFormatCurrency();
  const { showError, showSuccess } = useToast();

  // Handle create/update budget using our new modal
  const handleBudgetSubmit = async (data: CreateBudgetForm) => {
    try {
      if (editingBudget) {
        // Update existing budget
        await updateBudgetMutation.mutateAsync({
          id: editingBudget.id,
          data,
        });
        showSuccess('Budget updated successfully!');
      } else {
        // Create new budget
        await createBudgetMutation.mutateAsync(data);
        showSuccess('Budget created successfully!');
      }
      createModal.close();
      setEditingBudget(null);
    } catch (error: any) {
      showError(error.response?.data?.message || `Failed to ${editingBudget ? 'update' : 'create'} budget`);
    }
  };

  // Handle edit budget
  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    createModal.open();
  };

  // Handle duplicate budget
  const handleShowDuplicateModal = (budget: Budget) => {
    setBudgetToDuplicate(budget);
    duplicateModal.open();
  };

  const handleDuplicateBudget = async (options: DuplicateBudgetOptions) => {
    if (!budgetToDuplicate) return;
    
    try {
      await duplicateBudgetMutation.mutateAsync({
        budgetId: budgetToDuplicate.id,
        options
      });
      
      let message = `Budget "${budgetToDuplicate.name}" duplicated successfully!`;
      if (options.includeRecurringTransactions) {
        message += ' Recurring transactions included.';
      } else if (options.includeRecentTransactions) {
        message += ` Recent transactions (${options.recentDays} days) included.`;
      }
      
      showSuccess(message);
      duplicateModal.close();
      setBudgetToDuplicate(null);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to duplicate budget');
    }
  };

  // Handle archive/unarchive budget
  const handleShowArchiveModal = (budget: Budget) => {
    setBudgetToArchive(budget);
    archiveModal.open();
  };

  const handleArchiveBudget = async () => {
    if (!budgetToArchive) return;

    try {
      await updateBudgetMutation.mutateAsync({
        id: budgetToArchive.id,
        data: { isArchived: !budgetToArchive.isArchived },
      });
      showSuccess(`Budget ${budgetToArchive.isArchived ? 'unarchived' : 'archived'} successfully!`);
      archiveModal.close();
      setBudgetToArchive(null);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update budget');
    }
  };

  // Handle delete budget
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

  // Close modal
  const closeModal = () => {
    createModal.close();
    setEditingBudget(null);
  };

  // Close duplicate modal
  const closeDuplicateModal = () => {
    duplicateModal.close();
    setBudgetToDuplicate(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" className="mb-6">
        Failed to load budgets. Please try again.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Budgets"
        description={`Manage your budgets and track financial progress • ${budgets.length} budget(s)`}
        action={{
          label: "Create Budget",
          onClick: createModal.open,
          icon: <Plus className="h-4 w-4 mr-2" />
        }}
      >
        <label className="flex items-center space-x-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300"
          />
          <span>Show archived</span>
        </label>
      </PageHeader>

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <Card>
          <EmptyState
            icon={Plus}
            title="No Budgets Found"
            description={includeArchived ? "You don't have any budgets yet." : "You don't have any active budgets."}
            action={
              <Button onClick={() => createModal.open()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgets.map((budget: Budget) => (
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
        </div>
      )}

      {/* NEW: Use our standardized BudgetFormModal */}
      <BudgetFormModal
        isOpen={createModal.isOpen}
        onClose={closeModal}
        onSubmit={handleBudgetSubmit}
        editingBudget={editingBudget}
        isLoading={createBudgetMutation.isPending || updateBudgetMutation.isPending}
      />

      {/* Duplicate Budget Modal */}
      <DuplicateBudgetModal
        isOpen={duplicateModal.isOpen}
        onClose={closeDuplicateModal}
        budget={budgetToDuplicate}
        onDuplicate={handleDuplicateBudget}
        isLoading={duplicateBudgetMutation.isPending}
      />

      {/* Confirmation Modals */}
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