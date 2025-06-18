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

const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);
  
    // Confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [budgetToArchive, setBudgetToArchive] = useState<Budget | null>(null);

  // Duplicate modal state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [budgetToDuplicate, setBudgetToDuplicate] = useState<Budget | null>(null);

  // API hooks
  const { data: budgetsResponse, isLoading, error } = useBudgets({ includeArchived });
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const duplicateBudgetMutation = useDuplicateBudget();

  const budgets = budgetsResponse?.data || [];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: user?.currency || 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle create/update budget using our new modal
  const handleBudgetSubmit = async (data: CreateBudgetForm) => {
    try {
      if (editingBudget) {
        // Update existing budget
        await updateBudgetMutation.mutateAsync({
          id: editingBudget.id,
          data,
        });
        toast.success('Budget updated successfully!');
      } else {
        // Create new budget
        await createBudgetMutation.mutateAsync(data);
        toast.success('Budget created successfully!');
      }
      setShowCreateModal(false);
      setEditingBudget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${editingBudget ? 'update' : 'create'} budget`);
    }
  };

  // Handle edit budget
  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setShowCreateModal(true);
  };

  // Handle duplicate budget
  const handleShowDuplicateModal = (budget: Budget) => {
    setBudgetToDuplicate(budget);
    setShowDuplicateModal(true);
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
      
      toast.success(message);
      setShowDuplicateModal(false);
      setBudgetToDuplicate(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to duplicate budget');
    }
  };

  // Handle archive/unarchive budget
  const handleShowArchiveModal = (budget: Budget) => {
    setBudgetToArchive(budget);
    setShowArchiveModal(true);
  };

  const handleArchiveBudget = async () => {
    if (!budgetToArchive) return;

    try {
      await updateBudgetMutation.mutateAsync({
        id: budgetToArchive.id,
        data: { isArchived: !budgetToArchive.isArchived },
      });
      toast.success(`Budget ${budgetToArchive.isArchived ? 'unarchived' : 'archived'} successfully!`);
      setShowArchiveModal(false);
      setBudgetToArchive(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update budget');
    }
  };

  // Handle delete budget
  const handleShowDeleteModal = (budget: Budget) => {
    setBudgetToDelete(budget);
    setShowDeleteModal(true);
  };

  const handleDeleteBudget = async () => {
    if (!budgetToDelete) return;

    try {
      await deleteBudgetMutation.mutateAsync(budgetToDelete.id);
      toast.success('Budget deleted successfully!');
      setShowDeleteModal(false);
      setBudgetToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete budget');
    }
  };

  // Close modal
  const closeModal = () => {
    setShowCreateModal(false);
    setEditingBudget(null);
  };

  // Close duplicate modal
  const closeDuplicateModal = () => {
    setShowDuplicateModal(false);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600">
            Manage your budgets and track financial progress • {budgets.length} budget(s)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span>Show archived</span>
          </label>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Budget
          </Button>
        </div>
      </div>

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <Card>
          <EmptyState
            icon={Plus}
            title="No Budgets Found"
            description={includeArchived ? "You don't have any budgets yet." : "You don't have any active budgets."}
            action={
              <Button onClick={() => setShowCreateModal(true)}>
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
        isOpen={showCreateModal}
        onClose={closeModal}
        onSubmit={handleBudgetSubmit}
        editingBudget={editingBudget}
        isLoading={createBudgetMutation.isPending || updateBudgetMutation.isPending}
      />

      {/* Duplicate Budget Modal */}
      <DuplicateBudgetModal
        isOpen={showDuplicateModal}
        onClose={closeDuplicateModal}
        budget={budgetToDuplicate}
        onDuplicate={handleDuplicateBudget}
        isLoading={duplicateBudgetMutation.isPending}
      />

      {/* Confirmation Modals */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setBudgetToDelete(null);
        }}
        onConfirm={handleDeleteBudget}
        itemName={budgetToDelete?.name || ''}
        itemType="budget"
        isLoading={deleteBudgetMutation.isPending}
        warningText="All categories and transactions in this budget will also be deleted."
      />

      <ArchiveConfirmModal
        isOpen={showArchiveModal}
        onClose={() => {
          setShowArchiveModal(false);
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