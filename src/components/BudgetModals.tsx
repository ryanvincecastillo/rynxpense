// components/BudgetModals.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Repeat, Info, Calendar, DollarSign } from 'lucide-react';

// Types
import { Budget, BudgetCategoriesResponse, Transaction, BudgetCategory } from '../types';

// UI Components
import { Button, Input, Modal, Select, Textarea } from './ui';

// Import existing modals if available, otherwise we'll create inline forms
// import { CategoryFormModal, TransactionFormModal, BudgetFormModal } from './modals';

// Type definitions to match what we defined in BudgetDetailsPage
export interface ModalState {
  showCreateCategoryModal: boolean;
  showEditCategoryModal: boolean;
  showCreateTransactionModal: boolean;
  showEditTransactionModal: boolean;
  showDeleteConfirmModal: boolean;
  showActionsMenu: boolean;
  showEditBudgetModal: boolean;
}

export type EditingItem = Transaction | BudgetCategory | null;

// Form validation schemas
const budgetUpdateSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
});

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name too long'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Category type is required' }),
  plannedAmount: z.number().min(0, 'Planned amount must be positive'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const transactionSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  date: z.string().min(1, 'Date is required'),
  isPosted: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
});

type BudgetUpdateFormData = z.infer<typeof budgetUpdateSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;
type TransactionFormData = z.infer<typeof transactionSchema>;

// Color options
const colorOptions = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const incomeColors = ['#22C55E', '#10B981', '#059669', '#047857', '#065F46'];
const expenseColors = ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'];

interface BudgetModalsProps {
  budget: Budget;
  categoriesData: BudgetCategoriesResponse | undefined;
  modalState: ModalState;
  editingItem: EditingItem;
  onClose: (modalName?: keyof ModalState) => void;
  onSubmit: (type: string, data: any) => Promise<void>;
  formatCurrency: (amount: number) => string;
}

const BudgetModals: React.FC<BudgetModalsProps> = ({
  budget,
  categoriesData,
  modalState,
  editingItem,
  onClose,
  onSubmit,
  formatCurrency,
}) => {
  // Form hooks
  const budgetForm = useForm<BudgetUpdateFormData>({
    resolver: zodResolver(budgetUpdateSchema),
    defaultValues: {
      name: budget?.name || '',
      description: budget?.description || '',
      color: budget?.color || colorOptions[0],
    },
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'INCOME',
      plannedAmount: 0,
      color: incomeColors[0],
      description: '',
      isActive: true,
    },
  });

  const transactionForm = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      categoryId: '',
      amount: 0,
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      isPosted: false,
      isRecurring: false,
      frequency: 'MONTHLY',
    },
  });

  // Watch form values
  const watchedCategoryType = categoryForm.watch('type');
  const watchedIsRecurring = transactionForm.watch('isRecurring');

  // Reset forms when modals open/close or editing items change
  useEffect(() => {
    if (modalState.showEditBudgetModal && budget) {
      budgetForm.reset({
        name: budget.name,
        description: budget.description || '',
        color: budget.color || colorOptions[0],
      });
    }
  }, [modalState.showEditBudgetModal, budget, budgetForm]);

  useEffect(() => {
    if (modalState.showCreateCategoryModal || modalState.showEditCategoryModal) {
      if (editingItem && 'plannedAmount' in editingItem) {
        // Editing existing category
        const category = editingItem as BudgetCategory;
        categoryForm.reset({
          name: category.name,
          type: category.type,
          plannedAmount: category.plannedAmount,
          color: category.color,
          description: category.description || '',
          isActive: category.isActive,
        });
      } else {
        // Creating new category
        categoryForm.reset({
          name: '',
          type: 'INCOME',
          plannedAmount: 0,
          color: incomeColors[0],
          description: '',
          isActive: true,
        });
      }
    }
  }, [modalState.showCreateCategoryModal, modalState.showEditCategoryModal, editingItem, categoryForm]);

  useEffect(() => {
    if (modalState.showCreateTransactionModal || modalState.showEditTransactionModal) {
      if (editingItem && 'amount' in editingItem) {
        // Editing existing transaction
        const transaction = editingItem as Transaction;
        transactionForm.reset({
          categoryId: transaction.categoryId,
          amount: Math.abs(transaction.amount),
          description: transaction.description,
          date: format(new Date(transaction.date), 'yyyy-MM-dd'),
          isPosted: transaction.isPosted,
          isRecurring: transaction.isRecurring,
          frequency: transaction.frequency || 'MONTHLY',
        });
      } else {
        // Creating new transaction
        transactionForm.reset({
          categoryId: '',
          amount: 0,
          description: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          isPosted: false,
          isRecurring: false,
          frequency: 'MONTHLY',
        });
      }
    }
  }, [modalState.showCreateTransactionModal, modalState.showEditTransactionModal, editingItem, transactionForm]);

  // Update category color when type changes
  useEffect(() => {
    const colors = watchedCategoryType === 'INCOME' ? incomeColors : expenseColors;
    categoryForm.setValue('color', colors[0]);
  }, [watchedCategoryType, categoryForm]);

  // Get available categories for transactions
  const availableCategories = categoriesData ? 
    [...(categoriesData.income || []), ...(categoriesData.expense || [])].map(category => ({ 
      value: category.id, 
      label: `${category.name} (${category.type})` 
    })) : [];

  // Handle form submissions
  const handleBudgetSubmit = async (data: BudgetUpdateFormData) => {
    try {
      await onSubmit('budget', data);
      onClose('showEditBudgetModal');
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const handleCategorySubmit = async (data: CategoryFormData) => {
    try {
      await onSubmit('category', data);
      onClose('showCreateCategoryModal');
      onClose('showEditCategoryModal');
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleTransactionSubmit = async (data: TransactionFormData) => {
    try {
      await onSubmit('transaction', data);
      onClose('showCreateTransactionModal');
      onClose('showEditTransactionModal');
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  return (
    <>
      {/* Edit Budget Modal */}
      <Modal
        isOpen={modalState.showEditBudgetModal}
        onClose={() => onClose('showEditBudgetModal')}
        title="Edit Budget"
        size="md"
      >
        <form onSubmit={budgetForm.handleSubmit(handleBudgetSubmit)} className="space-y-4">
          <Input
            label="Budget Name *"
            placeholder="e.g., Monthly Household Budget"
            {...budgetForm.register('name')}
            error={budgetForm.formState.errors.name?.message}
          />

          <Textarea
            label="Description"
            placeholder="Brief description of this budget"
            rows={3}
            {...budgetForm.register('description')}
            error={budgetForm.formState.errors.description?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => budgetForm.setValue('color', color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    budgetForm.watch('color') === color
                      ? 'border-gray-400 scale-110 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {budgetForm.formState.errors.color && (
              <p className="text-red-500 text-sm mt-1">{budgetForm.formState.errors.color.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => onClose('showEditBudgetModal')}>
              Cancel
            </Button>
            <Button type="submit" disabled={budgetForm.formState.isSubmitting}>
              {budgetForm.formState.isSubmitting ? 'Updating...' : 'Update Budget'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Category Modal */}
      <Modal
        isOpen={modalState.showCreateCategoryModal}
        onClose={() => onClose('showCreateCategoryModal')}
        title="Create Category"
        size="md"
      >
        <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
          <Input
            label="Category Name *"
            placeholder="e.g., Salary, Groceries, Rent"
            {...categoryForm.register('name')}
            error={categoryForm.formState.errors.name?.message}
          />

          <Select
            label="Type *"
            {...categoryForm.register('type')}
            error={categoryForm.formState.errors.type?.message}
            options={[
              { value: 'INCOME', label: 'Income' },
              { value: 'EXPENSE', label: 'Expense' },
            ]}
          />

          <Input
            label="Planned Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...categoryForm.register('plannedAmount', { valueAsNumber: true })}
            error={categoryForm.formState.errors.plannedAmount?.message}
          />

          <Textarea
            label="Description"
            placeholder="Optional description for this category"
            rows={2}
            {...categoryForm.register('description')}
            error={categoryForm.formState.errors.description?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(watchedCategoryType === 'INCOME' ? incomeColors : expenseColors).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => categoryForm.setValue('color', color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    categoryForm.watch('color') === color
                      ? 'border-gray-400 scale-110 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {categoryForm.formState.errors.color && (
              <p className="text-red-500 text-sm mt-1">{categoryForm.formState.errors.color.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => onClose('showCreateCategoryModal')}>
              Cancel
            </Button>
            <Button type="submit" disabled={categoryForm.formState.isSubmitting}>
              {categoryForm.formState.isSubmitting ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={modalState.showEditCategoryModal}
        onClose={() => onClose('showEditCategoryModal')}
        title="Edit Category"
        size="md"
      >
        <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
          <Input
            label="Category Name *"
            placeholder="e.g., Salary, Groceries, Rent"
            {...categoryForm.register('name')}
            error={categoryForm.formState.errors.name?.message}
          />

          <Select
            label="Type *"
            {...categoryForm.register('type')}
            error={categoryForm.formState.errors.type?.message}
            options={[
              { value: 'INCOME', label: 'Income' },
              { value: 'EXPENSE', label: 'Expense' },
            ]}
          />

          <Input
            label="Planned Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...categoryForm.register('plannedAmount', { valueAsNumber: true })}
            error={categoryForm.formState.errors.plannedAmount?.message}
          />

          <Textarea
            label="Description"
            placeholder="Optional description for this category"
            rows={2}
            {...categoryForm.register('description')}
            error={categoryForm.formState.errors.description?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(watchedCategoryType === 'INCOME' ? incomeColors : expenseColors).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => categoryForm.setValue('color', color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    categoryForm.watch('color') === color
                      ? 'border-gray-400 scale-110 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {categoryForm.formState.errors.color && (
              <p className="text-red-500 text-sm mt-1">{categoryForm.formState.errors.color.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => onClose('showEditCategoryModal')}>
              Cancel
            </Button>
            <Button type="submit" disabled={categoryForm.formState.isSubmitting}>
              {categoryForm.formState.isSubmitting ? 'Updating...' : 'Update Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Transaction Modal */}
      <Modal
        isOpen={modalState.showCreateTransactionModal}
        onClose={() => onClose('showCreateTransactionModal')}
        title="Add Transaction"
        size="lg"
      >
        <form onSubmit={transactionForm.handleSubmit(handleTransactionSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category *"
              placeholder="Select a category"
              options={availableCategories}
              {...transactionForm.register('categoryId')}
              error={transactionForm.formState.errors.categoryId?.message}
            />

            <Input
              label="Amount *"
              type="number"
              step="0.01"
              placeholder="0.00"
              leftIcon={DollarSign}
              {...transactionForm.register('amount', { valueAsNumber: true })}
              error={transactionForm.formState.errors.amount?.message}
            />
          </div>

          <Input
            label="Description *"
            placeholder="e.g., Grocery shopping at SM"
            {...transactionForm.register('description')}
            error={transactionForm.formState.errors.description?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date *"
              type="date"
              leftIcon={Calendar}
              {...transactionForm.register('date')}
              error={transactionForm.formState.errors.date?.message}
            />

            <div className="flex items-center space-x-4 pt-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...transactionForm.register('isPosted')}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Mark as posted</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...transactionForm.register('isRecurring')}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Recurring</span>
              </label>
            </div>
          </div>

          {watchedIsRecurring && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <Repeat className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Recurring Transaction</h4>
                  <Select
                    label="Frequency"
                    {...transactionForm.register('frequency')}
                    options={[
                      { value: 'WEEKLY', label: 'Weekly' },
                      { value: 'MONTHLY', label: 'Monthly' },
                      { value: 'YEARLY', label: 'Yearly' },
                    ]}
                  />
                  <p className="text-xs text-blue-700 mt-2">
                    <Info className="h-3 w-3 inline mr-1" />
                    Future transactions will be automatically created based on this schedule.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => onClose('showCreateTransactionModal')}>
              Cancel
            </Button>
            <Button type="submit" disabled={transactionForm.formState.isSubmitting}>
              {transactionForm.formState.isSubmitting ? 'Adding...' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Transaction Modal */}
      <Modal
        isOpen={modalState.showEditTransactionModal}
        onClose={() => onClose('showEditTransactionModal')}
        title="Edit Transaction"
        size="lg"
      >
        <form onSubmit={transactionForm.handleSubmit(handleTransactionSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category *"
              placeholder="Select a category"
              options={availableCategories}
              {...transactionForm.register('categoryId')}
              error={transactionForm.formState.errors.categoryId?.message}
            />

            <Input
              label="Amount *"
              type="number"
              step="0.01"
              placeholder="0.00"
              leftIcon={DollarSign}
              {...transactionForm.register('amount', { valueAsNumber: true })}
              error={transactionForm.formState.errors.amount?.message}
            />
          </div>

          <Input
            label="Description *"
            placeholder="e.g., Grocery shopping at SM"
            {...transactionForm.register('description')}
            error={transactionForm.formState.errors.description?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date *"
              type="date"
              leftIcon={Calendar}
              {...transactionForm.register('date')}
              error={transactionForm.formState.errors.date?.message}
            />

            <div className="flex items-center space-x-4 pt-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...transactionForm.register('isPosted')}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Mark as posted</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...transactionForm.register('isRecurring')}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Recurring</span>
              </label>
            </div>
          </div>

          {watchedIsRecurring && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <Repeat className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Recurring Transaction</h4>
                  <Select
                    label="Frequency"
                    {...transactionForm.register('frequency')}
                    options={[
                      { value: 'WEEKLY', label: 'Weekly' },
                      { value: 'MONTHLY', label: 'Monthly' },
                      { value: 'YEARLY', label: 'Yearly' },
                    ]}
                  />
                  <p className="text-xs text-blue-700 mt-2">
                    <Info className="h-3 w-3 inline mr-1" />
                    Changes to recurring settings will apply to future transactions.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => onClose('showEditTransactionModal')}>
              Cancel
            </Button>
            <Button type="submit" disabled={transactionForm.formState.isSubmitting}>
              {transactionForm.formState.isSubmitting ? 'Updating...' : 'Update Transaction'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default BudgetModals;