import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit3, Trash2, Archive, Eye, Copy } from 'lucide-react';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget, useDuplicateBudget } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Button, 
  Card, 
  EmptyState, 
  LoadingSpinner, 
  Modal, 
  Input, 
  Textarea,
  Badge,
  Alert
} from '../../components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Budget } from '../../types';
import { DuplicateBudgetOptions } from '../../interfaces/duplicateBudgetOptions';
import { DuplicateBudgetModal } from '../../components/modals/DuplicateBudgetModal';

// Form validation schema
const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

// Color options for budgets
const colorOptions = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);
  
  // NEW: Duplicate modal state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [budgetToDuplicate, setBudgetToDuplicate] = useState<Budget | null>(null);

  // API hooks
  const { data: budgetsResponse, isLoading, error } = useBudgets({ includeArchived });
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const duplicateBudgetMutation = useDuplicateBudget();

  const budgets = budgetsResponse?.data || [];

  // Form handling
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      color: colorOptions[0],
    },
  });

  const selectedColor = watch('color');

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: user?.currency || 'PHP',
    }).format(amount);
  };

  // Handle create budget
  const handleCreateBudget = async (data: BudgetFormData) => {
    try {
      await createBudgetMutation.mutateAsync(data);
      toast.success('Budget created successfully!');
      setShowCreateModal(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create budget');
    }
  };

  // Handle edit budget
  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    reset({
      name: budget.name,
      description: budget.description || '',
      color: budget.color,
    });
    setShowCreateModal(true);
  };

  // Handle update budget
  const handleUpdateBudget = async (data: BudgetFormData) => {
    if (!editingBudget) return;

    try {
      await updateBudgetMutation.mutateAsync({
        id: editingBudget.id,
        data,
      });
      toast.success('Budget updated successfully!');
      setShowCreateModal(false);
      setEditingBudget(null);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update budget');
    }
  };

  // Handle duplicate budget - NEW ENHANCED VERSION
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
  const handleArchiveBudget = async (budget: Budget) => {
    try {
      await updateBudgetMutation.mutateAsync({
        id: budget.id,
        data: { isArchived: !budget.isArchived },
      });
      toast.success(`Budget ${budget.isArchived ? 'unarchived' : 'archived'} successfully!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update budget');
    }
  };

  // Handle delete budget
  const handleDeleteBudget = async (budget: Budget) => {
    if (!window.confirm(`Are you sure you want to delete "${budget.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteBudgetMutation.mutateAsync(budget.id);
      toast.success('Budget deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete budget');
    }
  };

  // Close modal and reset form
  const closeModal = () => {
    setShowCreateModal(false);
    setEditingBudget(null);
    reset();
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
            Manage your budgets and financial planning • {budgets.length} budgets
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget: Budget) => (
            <Card key={budget.id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: budget.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                    {budget.isArchived && (
                      <Badge variant="secondary" size="sm" className="mt-1">
                        Archived
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditBudget(budget)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit budget"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  {/* ENHANCED: Duplicate button with modal */}
                  <button
                    onClick={() => handleShowDuplicateModal(budget)}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="Duplicate budget with options"
                    disabled={duplicateBudgetMutation.isPending}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleArchiveBudget(budget)}
                    className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                    title={budget.isArchived ? "Unarchive budget" : "Archive budget"}
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete budget"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {budget.description && (
                <p className="text-gray-600 text-sm mb-4">{budget.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Categories</p>
                  <p className="font-medium">{budget._count?.categories || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Transactions</p>
                  <p className="font-medium">{budget._count?.transactions || 0}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Created {new Date(budget.createdAt).toLocaleDateString()}
                  </span>
                  <Link to={`/budgets/${budget.id}`}>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Budget Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeModal}
        title={editingBudget ? 'Edit Budget' : 'Create New Budget'}
      >
        <form onSubmit={handleSubmit(editingBudget ? handleUpdateBudget : handleCreateBudget)} className="space-y-4">
          <Input
            label="Budget Name"
            placeholder="e.g., Monthly Household Budget"
            error={errors.name?.message}
            {...register('name')}
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Brief description of this budget"
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    selectedColor === color
                      ? 'border-gray-400 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-sm text-red-600 mt-1">{errors.color.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || createBudgetMutation.isPending || updateBudgetMutation.isPending}
            >
              {editingBudget ? 'Update Budget' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* NEW: Enhanced Duplicate Budget Modal */}
      <DuplicateBudgetModal
        isOpen={showDuplicateModal}
        onClose={closeDuplicateModal}
        budget={budgetToDuplicate}
        onDuplicate={handleDuplicateBudget}
        isLoading={duplicateBudgetMutation.isPending}
      />
    </div>
  );
};

export default BudgetsPage;