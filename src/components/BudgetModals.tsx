import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Repeat, Info } from 'lucide-react';
import { Budget, BudgetCategoriesResponse, DuplicateBudgetOptions } from '../types';
import { EditingItem, ModalState } from '../hooks/useBudgetState';
import { Button, Input, Modal, Select, Textarea } from './ui';
import { DuplicateBudgetModal } from './modals/DuplicateBudgetModal';
import { CategoryFormModal } from './modals';

// Form validation schemas
const budgetUpdateSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name too long'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Category type is required' }),
  plannedAmount: z.number().min(0, 'Planned amount must be positive').optional().default(0),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

const transactionSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  date: z.string().min(1, 'Date is required'),
  isPosted: z.boolean().optional().default(false),
  receiptUrl: z.string().url('Invalid receipt URL').optional().or(z.literal('')),
  isRecurring: z.boolean().optional().default(false),
  dayOfMonth: z.number().min(1).max(31).optional(),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']).optional().default('MONTHLY'),
});

type BudgetUpdateFormData = z.infer<typeof budgetUpdateSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;
type TransactionFormData = z.infer<typeof transactionSchema>;

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
    },
  });

  const transactionForm = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      isPosted: false,
      receiptUrl: '',
      isRecurring: false,
      frequency: 'MONTHLY',
    },
  });

  // Watch form values
  const watchedCategoryType = categoryForm.watch('type');
  const watchedCategoryColor = categoryForm.watch('color');

  // Reset forms when modals open/close or editing items change
  useEffect(() => {
    if (modalState.showEditModal && budget) {
      budgetForm.reset({
        name: budget.name,
        description: budget.description || '',
        color: budget.color || colorOptions[0],
      });
    }
  }, [modalState.showEditModal, budget, budgetForm]);

  useEffect(() => {
    if (modalState.showCategoryModal) {
      if (editingItem.category) {
        // Editing existing category
        categoryForm.reset({
          name: editingItem.category.name,
          type: editingItem.category.type,
          plannedAmount: editingItem.category.plannedAmount,
          color: editingItem.category.color,
        });
      } else {
        // Creating new category with preselected type
        const preselectedType = editingItem.data?.type || editingItem.data?.preselectedType;
        const defaultColor = preselectedType 
          ? (preselectedType === 'INCOME' ? incomeColors[0] : expenseColors[0])
          : incomeColors[0];
        
        categoryForm.reset({
          name: '',
          type: preselectedType || 'INCOME',
          plannedAmount: 0,
          color: defaultColor,
        });
      }
    }
  }, [modalState.showCategoryModal, editingItem, categoryForm]);

  useEffect(() => {
    if (modalState.showTransactionModal) {
      if (editingItem.transaction) {
        transactionForm.reset({
          categoryId: editingItem.transaction.categoryId,
          amount: editingItem.transaction.amount,
          description: editingItem.transaction.description,
          date: format(new Date(editingItem.transaction.date), 'yyyy-MM-dd'),
          isPosted: editingItem.transaction.isPosted,
          receiptUrl: editingItem.transaction.receiptUrl || '',
          isRecurring: editingItem.transaction.isRecurring || false,
          dayOfMonth: editingItem.transaction.dayOfMonth,
          frequency: editingItem.transaction.frequency || 'MONTHLY',
        });
      } else {
        transactionForm.reset({
          categoryId: editingItem.data?.categoryId || '',
          amount: 0,
          description: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          isPosted: false,
          receiptUrl: '',
          isRecurring: false,
          frequency: 'MONTHLY',
        });
      }
    }
  }, [modalState.showTransactionModal, editingItem, transactionForm]);

  // Auto-set color when category type changes
  useEffect(() => {
    if (watchedCategoryType && !watchedCategoryColor) {
      const colors = watchedCategoryType === 'INCOME' ? incomeColors : expenseColors;
      categoryForm.setValue('color', colors[0]);
    }
  }, [watchedCategoryType, watchedCategoryColor, categoryForm]);

  // Get color options based on category type
  const getColorOptions = (type: 'INCOME' | 'EXPENSE') => {
    return type === 'INCOME' ? incomeColors : expenseColors;
  };

  // Get available categories for transactions
  const availableCategories = categoriesData ? 
    [...(categoriesData.income || []), ...(categoriesData.expense || [])].map(category => ({ 
      value: category.id, 
      label: `${category.name} (${category.type})` 
    })) : [];

  return (
    <>
      {/* Edit Budget Modal */}
      <Modal
        isOpen={modalState.showEditModal}
        onClose={() => onClose('showEditModal')}
        title="Edit Budget"
      >
        <form onSubmit={budgetForm.handleSubmit((data) => onSubmit('budget', data))} className="space-y-4">
          <Input
            label="Budget Name"
            placeholder="e.g., Monthly Household Budget"
            error={budgetForm.formState.errors.name?.message}
            {...budgetForm.register('name')}
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Brief description of this budget"
            rows={3}
            error={budgetForm.formState.errors.description?.message}
            {...budgetForm.register('description')}
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
                  onClick={() => budgetForm.setValue('color', color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    budgetForm.watch('color') === color
                      ? 'border-gray-400 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => onClose('showEditModal')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={budgetForm.formState.isSubmitting}>
              Update Budget
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enhanced Category Modal */}
      <CategoryFormModal
        isOpen={modalState.showCategoryModal}
        onClose={() => onClose('showCategoryModal')}
        onSubmit={(data) => onSubmit('category', data)}
        editingCategory={editingItem.category}
        isLoading={false} budgetId={''}      />

      {/* Transaction Modal */}
      <Modal
        isOpen={modalState.showTransactionModal}
        onClose={() => onClose('showTransactionModal')}
        title={editingItem.transaction ? 'Edit Transaction' : 'Add New Transaction'}
        size="lg"
      >
        <form onSubmit={transactionForm.handleSubmit((data) => onSubmit('transaction', data))} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category *"
              placeholder="Select a category"
              options={availableCategories}
              error={transactionForm.formState.errors.categoryId?.message}
              {...transactionForm.register('categoryId')}
            />

            <Input
              label="Amount *"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={transactionForm.formState.errors.amount?.message}
              {...transactionForm.register('amount', { valueAsNumber: true })}
            />
          </div>

          <Input
            label="Description *"
            placeholder="e.g., Grocery shopping at SM"
            error={transactionForm.formState.errors.description?.message}
            {...transactionForm.register('description')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date *"
              type="date"
              error={transactionForm.formState.errors.date?.message}
              {...transactionForm.register('date')}
            />

            <Input
              label="Receipt URL (Optional)"
              type="url"
              placeholder="https://example.com/receipt.jpg"
              error={transactionForm.formState.errors.receiptUrl?.message}
              {...transactionForm.register('receiptUrl')}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPosted"
              {...transactionForm.register('isPosted')}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="isPosted" className="text-sm text-gray-700">
              Mark as posted/confirmed
            </label>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="isRecurring"
                {...transactionForm.register('isRecurring')}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 flex items-center">
                <Repeat className="h-4 w-4 mr-1" />
                Make this a recurring transaction
              </label>
            </div>

            {transactionForm.watch('isRecurring') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <Select
                  label="Frequency"
                  options={[
                    { value: 'WEEKLY', label: 'Weekly' },
                    { value: 'MONTHLY', label: 'Monthly' },
                    { value: 'YEARLY', label: 'Yearly' },
                  ]}
                  {...transactionForm.register('frequency')}
                />

                <Input
                  label="Day of Month (1-31)"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="15"
                  error={transactionForm.formState.errors.dayOfMonth?.message}
                  {...transactionForm.register('dayOfMonth', { valueAsNumber: true })}
                />

                <div className="md:col-span-2">
                  <div className="flex items-start space-x-2 text-sm text-blue-700">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      This transaction will automatically repeat based on your selected frequency.
                      You can manage recurring transactions from the budget overview.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => onClose('showTransactionModal')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={transactionForm.formState.isSubmitting}>
              {editingItem.transaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Duplicate Budget Modal */}
      <DuplicateBudgetModal
        isOpen={modalState.showDuplicateModal}
        onClose={() => onClose('showDuplicateModal')}
        budget={budget}
        onDuplicate={(options: DuplicateBudgetOptions) => onSubmit('duplicateBudget', options)}
        isLoading={false}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modalState.showDeleteModal}
        onClose={() => onClose('showDeleteModal')}
        title="Delete Budget"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete "<strong>{budget?.name}</strong>"?
          </p>
          <p className="text-sm text-red-600">
            This action cannot be undone and will permanently delete all associated categories and transactions.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => onClose('showDeleteModal')}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => onSubmit('deleteBudget', {})}
            >
              Delete Budget
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BudgetModals;