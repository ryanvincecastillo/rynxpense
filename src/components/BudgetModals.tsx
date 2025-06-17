import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Repeat, Info } from 'lucide-react';
import { Budget, BudgetCategoriesResponse, DuplicateBudgetOptions } from '../types';
import { EditingItem, ModalState } from '../hooks/useBudgetState';
import { Button, Input, Modal, Select, Textarea } from './ui';
import { DuplicateBudgetModal } from './modals/DuplicateBudgetModal';
import CategoryModal from './CategoryModal';

// Form validation schemas
const budgetUpdateSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100, 'Name too long'),
  description: z.string().optional(),
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
type TransactionFormData = z.infer<typeof transactionSchema>;

const colorOptions = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

interface BudgetModalsProps {
  budget: Budget;
  categoriesData: BudgetCategoriesResponse | undefined;
  modalState: ModalState;
  editingItem: EditingItem;
  onClose: (modalName?: keyof ModalState) => void;
  onSubmit: (type: string, data: any) => void;
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
  // Form instances
  const budgetForm = useForm<BudgetUpdateFormData>({
    resolver: zodResolver(budgetUpdateSchema),
  });

  const transactionForm = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      isPosted: false,
      isRecurring: false,
      frequency: 'MONTHLY',
    },
  });

  // Watch form values for transaction form
  const watchedTransactionIsRecurring = transactionForm.watch('isRecurring');
  const watchedTransactionFrequency = transactionForm.watch('frequency');

  // Initialize forms when editing
  React.useEffect(() => {
    if (budget && modalState.showEditModal) {
      budgetForm.reset({
        name: budget.name,
        description: budget.description || '',
        color: budget.color,
      });
    }
  }, [budget, modalState.showEditModal, budgetForm]);

  React.useEffect(() => {
    if (editingItem.transaction && modalState.showTransactionModal) {
      transactionForm.reset({
        categoryId: editingItem.transaction.categoryId,
        amount: editingItem.transaction.amount,
        description: editingItem.transaction.description,
        date: format(new Date(editingItem.transaction.date), 'yyyy-MM-dd'),
        isPosted: editingItem.transaction.isPosted,
        receiptUrl: editingItem.transaction.receiptUrl || '',
        isRecurring: editingItem.transaction.isRecurring || false,
        dayOfMonth: editingItem.transaction.dayOfMonth || undefined,
        frequency: editingItem.transaction.frequency || 'MONTHLY',
      });
    } else if (!editingItem.transaction && modalState.showTransactionModal) {
      transactionForm.reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        isPosted: false,
        isRecurring: false,
        frequency: 'MONTHLY',
      });
    }
  }, [editingItem.transaction, modalState.showTransactionModal, transactionForm]);

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
      <CategoryModal
        isOpen={modalState.showCategoryModal}
        onClose={() => onClose('showCategoryModal')}
        onSubmit={(data) => onSubmit('category', data)}
        editingCategory={editingItem.category}
        budgetId={budget.id}
        isLoading={false}
      />

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
              Mark as posted (transaction has been processed)
            </label>
          </div>

          {/* Recurring Transaction Section */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="isRecurring"
                {...transactionForm.register('isRecurring')}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 flex items-center">
                <Repeat className="h-4 w-4 mr-1" />
                This is a recurring transaction
              </label>
            </div>
            
            {watchedTransactionIsRecurring && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 text-sm text-blue-700 mb-3">
                  <Info className="h-4 w-4" />
                  <span>Recurring transactions will automatically appear in duplicated budgets</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <select
                      {...transactionForm.register('frequency')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>
                  
                  {watchedTransactionFrequency === 'MONTHLY' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day of Month
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        {...transactionForm.register('dayOfMonth', { valueAsNumber: true })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="25"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        e.g., 25 for rent due on the 25th of each month
                      </p>
                    </div>
                  )}
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
        onDuplicate={(options: DuplicateBudgetOptions) => onSubmit('duplicate', options)}
        isLoading={false}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modalState.showDeleteModal}
        onClose={() => onClose('showDeleteModal')}
        title="Delete Budget"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete "<strong>{budget.name}</strong>"? This action cannot be undone and will permanently delete all associated categories and transactions.
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