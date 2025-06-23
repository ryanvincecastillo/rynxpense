import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar, 
  Repeat, 
  Receipt, 
  DollarSign, 
  Save, 
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// UI Components
import { 
  Modal,
  Button, 
  Input, 
  Select, 
  Textarea,
  Alert
} from '../ui';

// Form Components
import { CurrencyInput } from '../forms/CurrencyInput';

// Types
import { CreateTransactionForm, Transaction, BudgetCategory } from '../../types';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionForm) => void;
  editingTransaction?: Transaction | null;
  isLoading?: boolean;
  budgetId: string;
  categories: BudgetCategory[];
  preselectedType?: 'INCOME' | 'EXPENSE';
}

interface FormData {
  selectedType: 'INCOME' | 'EXPENSE';
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  isPosted: boolean;
  receiptUrl: string;
  isRecurring: boolean;
  dayOfMonth: number;
  frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

interface FormErrors {
  categoryId?: string;
  amount?: string;
  description?: string;
  date?: string;
  receiptUrl?: string;
  dayOfMonth?: string;
  general?: string;
}

// Simple Label component for consistency
const Label: React.FC<{ htmlFor?: string; className?: string; children: React.ReactNode }> = ({
  htmlFor,
  className = '',
  children
}) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
);

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
  isLoading = false,
  budgetId,
  categories,
  preselectedType,
}) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    selectedType: preselectedType || 'EXPENSE',
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

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get category options based on selected type and active categories
  const categoryOptions = useMemo(() => {
    const activeCategories = categories.filter(cat => 
      cat.isActive && cat.type === formData.selectedType
    );
    
    return activeCategories.map(cat => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [categories, formData.selectedType]);

  // Get selected category info
  const selectedCategory = useMemo(() => {
    return categories.find(cat => cat.id === formData.categoryId);
  }, [categories, formData.categoryId]);

  // Initialize form when modal opens or editing transaction changes
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        // For editing, determine type from the existing category
        const existingCategory = categories.find(cat => cat.id === editingTransaction.categoryId);
        const transactionType = existingCategory?.type || 'EXPENSE';
        
        setFormData({
          selectedType: transactionType,
          categoryId: editingTransaction.categoryId,
          amount: Math.abs(editingTransaction.amount),
          description: editingTransaction.description,
          date: editingTransaction.date.split('T')[0],
          isPosted: editingTransaction.isPosted,
          receiptUrl: editingTransaction.receiptUrl || '',
          isRecurring: editingTransaction.isRecurring || false,
          dayOfMonth: editingTransaction.dayOfMonth || new Date().getDate(),
          frequency: editingTransaction.frequency || 'MONTHLY',
        });
      } else {
        // For new transactions, use preselected type or default to EXPENSE
        const defaultType = preselectedType || 'EXPENSE';
        const matchingCategories = categories.filter(cat => 
          cat.type === defaultType && cat.isActive
        );
        const defaultCategoryId = matchingCategories.length > 0 ? matchingCategories[0].id : '';
        
        setFormData({
          selectedType: defaultType,
          categoryId: defaultCategoryId,
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
      setIsSubmitting(false);
    }
  }, [isOpen, editingTransaction, preselectedType, categories]);

  // Validation function
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Category validation
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    // Amount validation
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (formData.amount > 999999999) {
      newErrors.amount = 'Amount is too large';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    } else if (formData.description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    // Receipt URL validation
    if (formData.receiptUrl && !/^https?:\/\/.+/.test(formData.receiptUrl)) {
      newErrors.receiptUrl = 'Receipt URL must be a valid URL (http:// or https://)';
    }

    // Recurring validation
    if (formData.isRecurring) {
      if (!formData.dayOfMonth || formData.dayOfMonth < 1 || formData.dayOfMonth > 31) {
        newErrors.dayOfMonth = 'Day of month must be between 1 and 31';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Input change handlers
  const handleTypeChange = useCallback((type: 'INCOME' | 'EXPENSE') => {
    setFormData(prev => {
      // Auto-select first category of the new type
      const availableCategories = categories.filter(cat => 
        cat.isActive && cat.type === type
      );
      const firstCategoryId = availableCategories.length > 0 ? availableCategories[0].id : '';
      
      return {
        ...prev,
        selectedType: type,
        categoryId: firstCategoryId,
      };
    });
  }, [categories]);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, categoryId: value }));
    if (errors.categoryId) {
      setErrors(prev => ({ ...prev, categoryId: undefined }));
    }
  }, [errors.categoryId]);

  const handleAmountChange = useCallback((value: number) => {
    setFormData(prev => ({ ...prev, amount: value }));
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: undefined }));
    }
  }, [errors.amount]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, description: value }));
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: undefined }));
    }
  }, [errors.description]);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, date: value }));
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: undefined }));
    }
  }, [errors.date]);

  const handleReceiptChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, receiptUrl: value }));
    if (errors.receiptUrl) {
      setErrors(prev => ({ ...prev, receiptUrl: undefined }));
    }
  }, [errors.receiptUrl]);

  const handleFrequencyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    setFormData(prev => ({ ...prev, frequency: value }));
  }, []);

  const handleRecurringChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, isRecurring: checked }));
  }, []);

  // Form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const submitData: CreateTransactionForm = {
        budgetId,
        categoryId: formData.categoryId,
        amount: formData.amount,
        description: formData.description.trim(),
        date: formData.date,
        isPosted: formData.isPosted,
        receiptUrl: formData.receiptUrl.trim() || undefined,
        isRecurring: formData.isRecurring,
        dayOfMonth: formData.isRecurring ? formData.dayOfMonth : undefined,
        frequency: formData.isRecurring ? formData.frequency : undefined,
      };

      await onSubmit(submitData);
      // Note: onClose should be called by the parent after successful submission
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({
        general: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, isSubmitting, onSubmit, budgetId, selectedCategory]);

  // Handle modal close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const isFormLoading = isLoading || isSubmitting;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error Alert */}
        {errors.general && (
          <Alert type="error" className="mb-4">
            {errors.general}
          </Alert>
        )}

        {/* Transaction Type - Segmented Control */}
        <div className="space-y-3">
          <Label>
            Transaction Type *
          </Label>
          <div className="relative">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => handleTypeChange('INCOME')}
                disabled={isFormLoading}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium
                  transition-all duration-200 relative overflow-hidden
                  ${formData.selectedType === 'INCOME'
                    ? 'bg-green-500 text-white shadow-md ring-1 ring-green-400'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }
                  ${isFormLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Income</span>
                {formData.selectedType === 'INCOME' && (
                  <div className="absolute inset-0 bg-green-600/10 rounded-md -z-10"></div>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('EXPENSE')}
                disabled={isFormLoading}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium
                  transition-all duration-200 relative overflow-hidden
                  ${formData.selectedType === 'EXPENSE'
                    ? 'bg-red-500 text-white shadow-md ring-1 ring-red-400'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }
                  ${isFormLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <TrendingDown className="h-4 w-4" />
                <span>Expense</span>
                {formData.selectedType === 'EXPENSE' && (
                  <div className="absolute inset-0 bg-red-600/10 rounded-md -z-10"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category-select">
            {formData.selectedType === 'INCOME' ? 'Income ' : 'Expense '}Category *
          </Label>
          <Select
            id="category-select"
            value={formData.categoryId}
            onChange={handleCategoryChange}
            options={[
              { value: '', label: categoryOptions.length > 0 ? 'Select a category' : `No ${formData.selectedType.toLowerCase()} categories available` },
              ...categoryOptions
            ]}
            disabled={isFormLoading || categoryOptions.length === 0}
            className={errors.categoryId ? 
              'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          />
          {errors.categoryId && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.categoryId}
            </p>
          )}
          {categoryOptions.length === 0 && (
            <p className="text-sm text-gray-500">
              No {formData.selectedType.toLowerCase()} categories found. Please create one first.
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount-input">
            Amount *
          </Label>
          <CurrencyInput
            id="amount-input"
            value={formData.amount}
            onChange={handleAmountChange}
            disabled={isFormLoading}
            error={errors.amount}
          />
          {errors.amount && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.amount}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description-input">
            Description *
          </Label>
          <Textarea
            id="description-input"
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Enter transaction description..."
            disabled={isFormLoading}
            className={errors.description ? 
              'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            rows={3}
            maxLength={500}
          />
          {errors.description && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.description}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Date and Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date-input">
              Date *
            </Label>
            <div className="relative">
              <Input
                id="date-input"
                type="date"
                value={formData.date}
                onChange={handleDateChange}
                disabled={isFormLoading}
                className={errors.date ? 
                  'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.date && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.date}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label>Status</Label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={!formData.isPosted}
                  onChange={() => setFormData(prev => ({ ...prev, isPosted: false }))}
                  disabled={isFormLoading}
                  className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                />
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-gray-700">Pending</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={formData.isPosted}
                  onChange={() => setFormData(prev => ({ ...prev, isPosted: true }))}
                  disabled={isFormLoading}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">Posted</span>
              </label>
            </div>
          </div>
        </div>

        {/* Receipt URL - Optional */}
        <div className="space-y-2">
          <Label htmlFor="receipt-input">
            Receipt URL <span className="text-gray-500">(optional)</span>
          </Label>
          <div className="relative">
            <Input
              id="receipt-input"
              type="url"
              value={formData.receiptUrl}
              onChange={handleReceiptChange}
              placeholder="https://example.com/receipt.pdf"
              disabled={isFormLoading}
              className={errors.receiptUrl ? 
                'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            <Receipt className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.receiptUrl && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.receiptUrl}
            </p>
          )}
        </div>

        {/* Recurring Transaction */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="recurring-checkbox"
              checked={formData.isRecurring}
              onChange={(e) => handleRecurringChange(e.target.checked)}
              disabled={isFormLoading}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
            />
            <Label htmlFor="recurring-checkbox" className="flex items-center space-x-2 cursor-pointer">
              <Repeat className="h-4 w-4 text-blue-600" />
              <span>Make this a recurring transaction</span>
            </Label>
          </div>

          {formData.isRecurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-2">
                <Label htmlFor="frequency-select">Frequency</Label>
                <Select
                  id="frequency-select"
                  value={formData.frequency}
                  onChange={handleFrequencyChange}
                  options={[
                    { value: 'WEEKLY', label: 'Weekly' },
                    { value: 'MONTHLY', label: 'Monthly' },
                    { value: 'YEARLY', label: 'Yearly' },
                  ]}
                  disabled={isFormLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="day-input">Day of Month</Label>
                <Input
                  id="day-input"
                  type="number"
                  value={formData.dayOfMonth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) || 1 }))}
                  min="1"
                  max="31"
                  disabled={isFormLoading}
                  className={errors.dayOfMonth ? 
                    'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {errors.dayOfMonth && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.dayOfMonth}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Transaction Preview */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-700">Transaction Preview</p>
            </div>
            {selectedCategory && (
              <div
                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: selectedCategory.color }}
              >
                {formData.selectedType === 'INCOME' ? '💰 Income' : '💸 Expense'}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {formData.description || 'Transaction Description'}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedCategory?.name || `No ${formData.selectedType.toLowerCase()} category selected`} • {formData.date || 'No date'} • {formData.isPosted ? 'Posted' : 'Pending'}
                  {formData.isRecurring && ` • Recurring ${formData.frequency.toLowerCase()}`}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${
                  formData.selectedType === 'INCOME' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formData.selectedType === 'INCOME' ? '+' : '-'}₱{formData.amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isFormLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isFormLoading || !formData.categoryId || !formData.description.trim() || !formData.amount}
            className="w-full sm:w-auto sm:flex-1 order-1 sm:order-2"
          >
            <Save className="h-4 w-4 mr-2" />
            
            {isFormLoading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {editingTransaction 
              ? (isFormLoading ? 'Updating...' : 'Update Transaction')
              : (isFormLoading ? 'Creating...' : 'Create Transaction')
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};