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
  TrendingDown,
  Loader2,
  Info,
  Calculator,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Tag,
  CalendarDays
} from 'lucide-react';

// UI Components
import { 
  Button, 
  Input, 
  Select, 
  Textarea,
  Alert
} from '../ui';
import Modal from '../ui/Modal/Modal';

// Types
import { CreateTransactionForm, Transaction, BudgetCategory } from '../../types';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_AMOUNT = 999999999;
const MIN_DESCRIPTION_LENGTH = 3;

const FREQUENCY_OPTIONS = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

const getFrequencyText = (frequency: string): string => {
  const option = FREQUENCY_OPTIONS.find(opt => opt.value === frequency);
  return option ? option.label : frequency;
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const Label: React.FC<{ 
  htmlFor?: string; 
  className?: string; 
  children: React.ReactNode;
  required?: boolean;
}> = ({ htmlFor, className = '', children, required = false }) => (
  <label 
    htmlFor={htmlFor} 
    className={`block text-sm font-semibold text-gray-800 mb-2 ${className}`}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const TransactionTypeSelector: React.FC<{
  selectedType: 'INCOME' | 'EXPENSE';
  onTypeChange: (type: 'INCOME' | 'EXPENSE') => void;
  disabled?: boolean;
}> = ({ selectedType, onTypeChange, disabled = false }) => {
  return (
    <div className="space-y-2">
      <Label required>Transaction Type</Label>
      <div className="relative">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => onTypeChange('INCOME')}
            disabled={disabled}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium
              transition-all duration-200 relative overflow-hidden
              ${selectedType === 'INCOME'
                ? 'bg-green-500 text-white shadow-md ring-1 ring-green-400'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <TrendingUp className="w-4 h-4" />
            Income
          </button>
          <button
            type="button"
            onClick={() => onTypeChange('EXPENSE')}
            disabled={disabled}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium
              transition-all duration-200 relative overflow-hidden
              ${selectedType === 'EXPENSE'
                ? 'bg-red-500 text-white shadow-md ring-1 ring-red-400'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <TrendingDown className="w-4 h-4" />
            Expense
          </button>
        </div>
      </div>
    </div>
  );
};

const CategorySelector: React.FC<{
  categories: BudgetCategory[];
  selectedType: 'INCOME' | 'EXPENSE';
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  error?: string;
  disabled?: boolean;
}> = ({ categories, selectedType, selectedCategoryId, onCategoryChange, error, disabled = false }) => {
  const categoryOptions = useMemo(() => {
    const activeCategories = categories.filter(cat => 
      cat.isActive && cat.type === selectedType
    );
    
    return activeCategories.map(cat => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [categories, selectedType]);

  const selectedCategory = useMemo(() => {
    return categories.find(cat => cat.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  return (
    <div className="space-y-2">
      <Label htmlFor="category-select" required>
        {selectedType === 'INCOME' ? 'Income' : 'Expense'} Category
      </Label>
      
      <div className="relative">
        <Select
          id="category-select"
          value={selectedCategoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={[
            { 
              value: '', 
              label: categoryOptions.length > 0 
                ? 'Select a category' 
                : `No ${selectedType.toLowerCase()} categories available` 
            },
            ...categoryOptions
          ]}
          disabled={disabled || categoryOptions.length === 0}
          className={`
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            text-base sm:text-sm
          `}
        />
        {selectedCategory && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <div
              className="w-4 h-4 rounded-full border border-white"
              style={{ backgroundColor: selectedCategory.color }}
            />
          </div>
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      ) : categoryOptions.length === 0 ? (
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <Tag className="w-3 h-3" />
          No {selectedType.toLowerCase()} categories found. Please create one first.
        </p>
      ) : (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Info className="w-3 h-3" />
          Choose the category for this transaction
        </div>
      )}
    </div>
  );
};

const RecurringOptions: React.FC<{
  isRecurring: boolean;
  frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  dayOfMonth: number;
  onRecurringChange: (isRecurring: boolean) => void;
  onFrequencyChange: (frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY') => void;
  onDayOfMonthChange: (day: number) => void;
  error?: string;
  disabled?: boolean;
}> = ({ 
  isRecurring, 
  frequency, 
  dayOfMonth, 
  onRecurringChange, 
  onFrequencyChange, 
  onDayOfMonthChange, 
  error, 
  disabled = false 
}) => {
  return (
    <div className="space-y-4">
      {/* Recurring Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-gray-500" />
          <Label className="mb-0">Recurring Transaction</Label>
        </div>
        <button
          type="button"
          onClick={() => onRecurringChange(!isRecurring)}
          disabled={disabled}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isRecurring ? 'bg-blue-600' : 'bg-gray-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
              ${isRecurring ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>

      {/* Recurring Settings */}
      {isRecurring && (
        <div className="pl-6 space-y-4 border-l-2 border-blue-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequency-select">Frequency</Label>
              <Select
                id="frequency-select"
                value={frequency}
                onChange={(e) => onFrequencyChange(e.target.value as 'WEEKLY' | 'MONTHLY' | 'YEARLY')}
                options={FREQUENCY_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                disabled={disabled}
                className="text-base sm:text-sm"
              />
            </div>
            
            {frequency === 'MONTHLY' && (
              <div>
                <Label htmlFor="day-of-month">Day of Month</Label>
                <Input
                  id="day-of-month"
                  type="number"
                  value={dayOfMonth}
                  onChange={(e) => onDayOfMonthChange(parseInt(e.target.value) || 1)}
                  min="1"
                  max="31"
                  disabled={disabled}
                  className={`
                    text-base sm:text-sm
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  `}
                />
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const TransactionPreview: React.FC<{
  formData: FormData;
  selectedCategory?: BudgetCategory;
}> = ({ formData, selectedCategory }) => {
  return (
    <div className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="flex items-start gap-3">
        {/* Transaction Icon */}
        <div
          className={`
            w-12 h-12 rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0
            ${formData.selectedType === 'INCOME' ? 'bg-green-500' : 'bg-red-500'}
          `}
          style={{ backgroundColor: selectedCategory?.color }}
        >
          {formData.selectedType === 'INCOME' ? (
            <TrendingUp className="w-6 h-6 text-white drop-shadow-sm" />
          ) : (
            <TrendingDown className="w-6 h-6 text-white drop-shadow-sm" />
          )}
        </div>

        {/* Transaction Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {formData.description || 'Transaction Description'}
              </h4>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${selectedCategory 
                    ? 'text-white' 
                    : formData.selectedType === 'INCOME' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }
                `}
                style={selectedCategory ? { backgroundColor: selectedCategory.color } : undefined}
                >
                  {selectedCategory?.name || `No ${formData.selectedType.toLowerCase()} category`}
                </span>
                <span className="text-xs text-gray-500">
                  {formData.date ? formatDate(formData.date) : 'No date'}
                </span>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${formData.isPosted 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                  }
                `}>
                  {formData.isPosted ? 'Posted' : 'Pending'}
                </span>
                {formData.isRecurring && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Recurring {getFrequencyText(formData.frequency).toLowerCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right ml-3">
              <p className={`
                font-bold text-lg
                ${formData.selectedType === 'INCOME' ? 'text-green-600' : 'text-red-600'}
              `}>
                {formData.selectedType === 'INCOME' ? '+' : '-'}{formatCurrency(formData.amount || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  const [formData, setFormData] = useState<FormData>({
    selectedType: preselectedType || 'EXPENSE',
    categoryId: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    isPosted: true,
    receiptUrl: '',
    isRecurring: false,
    dayOfMonth: new Date().getDate(),
    frequency: 'MONTHLY',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const isFormLoading = isLoading || isSubmitting;
  const isEditMode = Boolean(editingTransaction);

  const selectedCategory = useMemo(() => {
    return categories.find(cat => cat.id === formData.categoryId);
  }, [categories, formData.categoryId]);

  const categoryOptions = useMemo(() => {
    const activeCategories = categories.filter(cat => 
      cat.isActive && cat.type === formData.selectedType
    );
    
    return activeCategories.map(cat => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [categories, formData.selectedType]);

  const isFormValid = useMemo(() => {
    return formData.categoryId && 
           formData.amount > 0 &&
           formData.description.trim().length >= MIN_DESCRIPTION_LENGTH &&
           formData.description.length <= MAX_DESCRIPTION_LENGTH &&
           formData.date &&
           (!formData.isRecurring || (formData.dayOfMonth >= 1 && formData.dayOfMonth <= 31));
  }, [formData]);

  // ========================================
  // FORM INITIALIZATION
  // ========================================

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
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
        setShowAdvanced(Boolean(editingTransaction.receiptUrl || editingTransaction.isRecurring));
      } else {
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
          isPosted: true,
          receiptUrl: '',
          isRecurring: false,
          dayOfMonth: new Date().getDate(),
          frequency: 'MONTHLY',
        });
        setShowAdvanced(false);
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, editingTransaction, preselectedType, categories]);

  // ========================================
  // VALIDATION
  // ========================================

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    // Category validation
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    // Amount validation
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (formData.amount > MAX_AMOUNT) {
      newErrors.amount = 'Amount is too large';
    }

    // Description validation
    const trimmedDescription = formData.description.trim();
    if (!trimmedDescription) {
      newErrors.description = 'Description is required';
    } else if (trimmedDescription.length < MIN_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`;
    } else if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
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

    return newErrors;
  }, [formData]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleTypeChange = useCallback((type: 'INCOME' | 'EXPENSE') => {
    const availableCategories = categories.filter(cat => 
      cat.isActive && cat.type === type
    );
    const firstCategoryId = availableCategories.length > 0 ? availableCategories[0].id : '';
    
    setFormData(prev => ({
      ...prev,
      selectedType: type,
      categoryId: firstCategoryId,
    }));
  }, [categories]);

  const handleInputChange = useCallback((field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear related errors
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleAmountChange = useCallback((value: number) => {
    setFormData(prev => ({ ...prev, amount: value }));
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: undefined }));
    }
  }, [errors.amount]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId }));
    if (errors.categoryId) {
      setErrors(prev => ({ ...prev, categoryId: undefined }));
    }
  }, [errors.categoryId]);

  const handleRecurringChange = useCallback((isRecurring: boolean) => {
    setFormData(prev => ({ ...prev, isRecurring }));
  }, []);

  const handleFrequencyChange = useCallback((frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY') => {
    setFormData(prev => ({ ...prev, frequency }));
  }, []);

  const handleDayOfMonthChange = useCallback((dayOfMonth: number) => {
    setFormData(prev => ({ ...prev, dayOfMonth }));
    if (errors.dayOfMonth) {
      setErrors(prev => ({ ...prev, dayOfMonth: undefined }));
    }
  }, [errors.dayOfMonth]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
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
      // Modal will be closed by parent component on success
    } catch (error: any) {
      console.error('Transaction form submission error:', error);
      setErrors({
        general: error?.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, isSubmitting, onSubmit, budgetId]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  // ========================================
  // RENDER
  // ========================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Transaction' : 'Add Transaction'}
      size="lg"
      className="sm:max-w-md md:max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {errors.general && (
          <Alert type="error" className="mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 mb-1">Something went wrong</p>
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            </div>
          </Alert>
        )}

        {/* Transaction Type Selector */}
        <TransactionTypeSelector
          selectedType={formData.selectedType}
          onTypeChange={handleTypeChange}
          disabled={isFormLoading}
        />

        {/* Category Selector */}
        <CategorySelector
          categories={categories}
          selectedType={formData.selectedType}
          selectedCategoryId={formData.categoryId}
          onCategoryChange={handleCategoryChange}
          error={errors.categoryId}
          disabled={isFormLoading}
        />

        {/* Amount and Description Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount Field */}
          <div className="space-y-1">
            <Label htmlFor="amount-input" required>
              Amount
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₱</span>
              </div>
              <Input
                id="amount-input"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleAmountChange(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0.00"
                disabled={isFormLoading}
                className={`
                  pl-8 text-base sm:text-sm
                  ${errors.amount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                `}
                min="0"
                max={MAX_AMOUNT}
                step="0.01"
              />
            </div>
            {errors.amount ? (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.amount}
              </p>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calculator className="w-3 h-3" />
                Enter the transaction amount
              </div>
            )}
          </div>

          {/* Date Field */}
          <div className="space-y-1">
            <Label htmlFor="date-input" required>
              Date
            </Label>
            <Input
              id="date-input"
              type="date"
              value={formData.date}
              onChange={handleInputChange('date')}
              disabled={isFormLoading}
              className={`
                text-base sm:text-sm
                ${errors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              `}
            />
            {errors.date ? (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.date}
              </p>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <CalendarDays className="w-3 h-3" />
                When did this transaction occur?
              </div>
            )}
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-1">
          <Label htmlFor="description-input" required>
            Description
          </Label>
          <Textarea
            id="description-input"
            value={formData.description}
            onChange={handleInputChange('description')}
            placeholder="Enter transaction description..."
            disabled={isFormLoading}
            className={`
              text-base sm:text-sm min-h-[80px] resize-none
              ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            `}
            maxLength={MAX_DESCRIPTION_LENGTH}
            rows={3}
          />
          <div className="flex justify-between items-start">
            {errors.description ? (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.description}
              </p>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <FileText className="w-3 h-3" />
                Describe what this transaction is for
              </div>
            )}
            <span className="text-xs text-gray-400 ml-2">
              {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
        </div>

        {/* Transaction Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <Label className="mb-0">Mark as Posted</Label>
            <div className="text-xs text-gray-500">
              (Transaction has been completed)
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, isPosted: !prev.isPosted }))}
            disabled={isFormLoading}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${formData.isPosted ? 'bg-green-600' : 'bg-gray-200'}
              ${isFormLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                transition duration-200 ease-in-out
                ${formData.isPosted ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

        {/* Advanced Options Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={isFormLoading}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {showAdvanced ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Advanced Options
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Advanced Options
              </>
            )}
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-6 pl-6 border-l-2 border-blue-200">
            {/* Receipt URL */}
            <div className="space-y-1">
              <Label htmlFor="receipt-url">
                Receipt URL
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  id="receipt-url"
                  type="url"
                  value={formData.receiptUrl}
                  onChange={handleInputChange('receiptUrl')}
                  placeholder="https://example.com/receipt.pdf"
                  disabled={isFormLoading}
                  className={`
                    pl-10 text-base sm:text-sm
                    ${errors.receiptUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  `}
                />
              </div>
              {errors.receiptUrl ? (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {errors.receiptUrl}
                </p>
              ) : (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Receipt className="w-3 h-3" />
                  Optional: Link to receipt or proof of transaction
                </div>
              )}
            </div>

            {/* Recurring Options */}
            <RecurringOptions
              isRecurring={formData.isRecurring}
              frequency={formData.frequency}
              dayOfMonth={formData.dayOfMonth}
              onRecurringChange={handleRecurringChange}
              onFrequencyChange={handleFrequencyChange}
              onDayOfMonthChange={handleDayOfMonthChange}
              error={errors.dayOfMonth}
              disabled={isFormLoading}
            />
          </div>
        )}

        {/* Transaction Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <TransactionPreview
            formData={formData}
            selectedCategory={selectedCategory}
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200">
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
            disabled={!isFormValid || isFormLoading}
            className="w-full sm:w-auto sm:flex-1 order-1 sm:order-2"
          >
            {isFormLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update Transaction' : 'Create Transaction'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionFormModal;