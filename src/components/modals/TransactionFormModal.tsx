import React, { useState, useEffect } from 'react';
import { FormModal, Input, Select, Textarea } from '../ui';
import { CreateTransactionForm, Transaction, BudgetCategory } from '../../types';
import { Calendar, Repeat } from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionForm) => void;
  editingTransaction?: Transaction | null;
  isLoading?: boolean;
  budgetId: string;
  categories: BudgetCategory[];
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
  isLoading = false,
  budgetId,
  categories,
}) => {
  const [formData, setFormData] = useState<CreateTransactionForm>({
    budgetId,
    categoryId: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    isPosted: false,
    receiptUrl: '',
    isRecurring: false,
    dayOfMonth: new Date().getDate(),
    frequency: 'MONTHLY',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when modal opens or editing transaction changes
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setFormData({
          budgetId,
          categoryId: editingTransaction.categoryId,
          amount: editingTransaction.amount,
          description: editingTransaction.description,
          date: editingTransaction.date.split('T')[0], // Format date for input
          isPosted: editingTransaction.isPosted,
          receiptUrl: editingTransaction.receiptUrl || '',
          isRecurring: editingTransaction.isRecurring || false,
          dayOfMonth: editingTransaction.dayOfMonth || new Date().getDate(),
          frequency: editingTransaction.frequency || 'MONTHLY',
        });
      } else {
        setFormData({
          budgetId,
          categoryId: '',
          amount: 0,
          description: '',
          date: new Date().toISOString().split('T')[0],
          isPosted: false,
          receiptUrl: '',
          isRecurring: false,
          dayOfMonth: new Date().getDate(),
          frequency: 'MONTHLY',
        });
      }
      setErrors({});
    }
  }, [isOpen, editingTransaction, budgetId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description is too long';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.receiptUrl && !/^https?:\/\/.+/.test(formData.receiptUrl)) {
      newErrors.receiptUrl = 'Receipt URL must be a valid URL';
    }

    if (formData.isRecurring) {
      if (!formData.dayOfMonth || formData.dayOfMonth < 1 || formData.dayOfMonth > 31) {
        newErrors.dayOfMonth = 'Day of month must be between 1 and 31';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CreateTransactionForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Get category options grouped by type
  const incomeCategories = categories.filter(cat => cat.type === 'INCOME' && cat.isActive);
  const expenseCategories = categories.filter(cat => cat.type === 'EXPENSE' && cat.isActive);

  const categoryOptions = [
    ...incomeCategories.map(cat => ({ value: cat.id, label: `📈 ${cat.name}` })),
    ...expenseCategories.map(cat => ({ value: cat.id, label: `📉 ${cat.name}` })),
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTransaction ? 'Edit Transaction' : 'Create Transaction'}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitText={editingTransaction ? 'Update Transaction' : 'Create Transaction'}
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Category"
          value={formData.categoryId}
          onChange={(e) => handleInputChange('categoryId', e.target.value)}
          options={categoryOptions}
          error={errors.categoryId}
          placeholder="Select a category"
        />

        <Input
          label="Amount"
          type="number"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
          error={errors.amount}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
        />
      </div>

      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        error={errors.description}
        placeholder="What was this transaction for?"
        rows={2}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          error={errors.date}
          required
        />

        <Input
          label="Receipt URL (Optional)"
          type="url"
          value={formData.receiptUrl}
          onChange={(e) => handleInputChange('receiptUrl', e.target.value)}
          error={errors.receiptUrl}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isPosted"
            checked={formData.isPosted}
            onChange={(e) => handleInputChange('isPosted', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300"
          />
          <label htmlFor="isPosted" className="text-sm text-gray-700 flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Mark as posted (completed)</span>
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isRecurring"
            checked={formData.isRecurring}
            onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300"
          />
          <label htmlFor="isRecurring" className="text-sm text-gray-700 flex items-center space-x-2">
            <Repeat className="h-4 w-4" />
            <span>Make this a recurring transaction</span>
          </label>
        </div>

        {formData.isRecurring && (
          <div className="ml-7 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Select
              label="Frequency"
              value={formData.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value as 'WEEKLY' | 'MONTHLY' | 'YEARLY')}
              options={[
                { value: 'WEEKLY', label: 'Weekly' },
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'YEARLY', label: 'Yearly' },
              ]}
            />

            <Input
              label="Day of Month"
              type="number"
              value={formData.dayOfMonth}
              onChange={(e) => handleInputChange('dayOfMonth', parseInt(e.target.value) || 1)}
              error={errors.dayOfMonth}
              min="1"
              max="31"
              placeholder="1-31"
            />
          </div>
        )}
      </div>

      {/* Transaction Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {formData.description || 'Transaction Description'}
            </p>
            <p className="text-sm text-gray-600">
              {formData.date} • {formData.isPosted ? 'Posted' : 'Pending'}
              {formData.isRecurring && ` • Recurring ${(formData.frequency ?? 'MONTHLY').toLowerCase()}`}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg text-gray-900">
              ₱{formData.amount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </FormModal>
  );
};