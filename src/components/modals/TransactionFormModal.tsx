// TransactionFormModal.tsx - Clean Mobile-First Version
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Plus,
  Minus,
  Calendar,
  FileText,
  Clock,
  Receipt,
  Repeat,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui';
import { Alert } from '../ui/Alert';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface BudgetCategory {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  isActive: boolean;
  color?: string; // Add color property
}

interface Transaction {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  date: string;
  isPosted: boolean;
  isRecurring: boolean;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  dayOfMonth?: number;
  receiptUrl?: string;
}

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
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
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

interface FormErrors {
  categoryId?: string;
  amount?: string;
  description?: string;
  date?: string;
  dayOfMonth?: string;
  receiptUrl?: string;
  general?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_DESCRIPTION_LENGTH = 3;
const MAX_DESCRIPTION_LENGTH = 255;
const QUICK_AMOUNTS = [100, 500, 1000, 2500, 5000];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface ImprovedTypeSelectorProps {
  selectedType: 'INCOME' | 'EXPENSE';
  onTypeChange: (type: 'INCOME' | 'EXPENSE') => void;
  disabled?: boolean;
}

const ImprovedTypeSelector: React.FC<ImprovedTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Category Type <span className="text-red-500">*</span>
      </label>
      
      {/* Segmented Control */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => onTypeChange('INCOME')}
          disabled={disabled}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium
            transition-all duration-200 ease-in-out
            ${selectedType === 'INCOME'
              ? 'bg-green-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <Plus className="h-4 w-4" />
          Income
        </button>
        
        <button
          type="button"
          onClick={() => onTypeChange('EXPENSE')}
          disabled={disabled}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium
            transition-all duration-200 ease-in-out
            ${selectedType === 'EXPENSE'
              ? 'bg-red-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <Minus className="h-4 w-4" />
          Expense
        </button>
      </div>
    </div>
  );
};

interface SmartCategorySelectorProps {
  categories: BudgetCategory[];
  selectedType: 'INCOME' | 'EXPENSE';
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  error?: string;
  disabled?: boolean;
}

const SmartCategorySelector: React.FC<SmartCategorySelectorProps> = ({
  categories,
  selectedType,
  selectedCategoryId,
  onCategoryChange,
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => cat.isActive && cat.type === selectedType);
  }, [categories, selectedType]);

  const selectedCategory = useMemo(() => {
    return filteredCategories.find(cat => cat.id === selectedCategoryId);
  }, [filteredCategories, selectedCategoryId]);

  const handleSelect = (categoryId: string) => {
    onCategoryChange(categoryId);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-category-selector]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="space-y-2" data-category-selector>
      <label className="block text-sm font-medium text-gray-700">
        Category <span className="text-red-500">*</span>
      </label>
      
      <div className="relative">
        {/* Custom Select Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            relative w-full bg-white border-2 rounded-lg shadow-sm pl-3 pr-10 py-3 text-left 
            cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-colors
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
        >
          <span className="flex items-center">
            {selectedCategory ? (
              <>
                <div 
                  className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                  style={{ backgroundColor: selectedCategory.color || '#6B7280' }}
                />
                <span className="block truncate text-gray-900 font-medium">
                  {selectedCategory.name}
                </span>
              </>
            ) : (
              <span className="block truncate text-gray-500">
                Select a category
              </span>
            )}
          </span>
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown 
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg border border-gray-200 py-1 text-base overflow-auto">
            {filteredCategories.length === 0 ? (
              <div className="px-3 py-3 text-gray-500 text-center text-sm">
                No {selectedType.toLowerCase()} categories available
              </div>
            ) : (
              <>
                {/* Clear selection option */}
                {selectedCategoryId && (
                  <button
                    type="button"
                    onClick={() => handleSelect('')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 border-b border-gray-100"
                  >
                    Clear selection
                  </button>
                )}
                
                {/* Category options */}
                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSelect(category.id)}
                    className={`
                      w-full text-left px-3 py-3 hover:bg-gray-50 focus:bg-gray-50 
                      focus:outline-none transition-colors
                      ${selectedCategoryId === category.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                    `}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                        style={{ backgroundColor: category.color || '#6B7280' }}
                      />
                      <span className="block truncate font-medium">
                        {category.name}
                      </span>
                      {selectedCategoryId === category.id && (
                        <span className="ml-auto">
                          <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

interface CompactAmountInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  error?: string;
}

const CompactAmountInput: React.FC<CompactAmountInputProps> = ({
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const [inputValue, setInputValue] = useState(value > 0 ? value.toString() : '');

  useEffect(() => {
    setInputValue(value > 0 ? value.toString() : '');
  }, [value]);

  const handleInputChange = (newValue: string) => {
    const cleanValue = newValue.replace(/[^\d.]/g, '');
    setInputValue(cleanValue);
    
    const numValue = parseFloat(cleanValue) || 0;
    onChange(numValue);
  };

  const handleQuickAmount = (amount: number) => {
    onChange(amount);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Amount <span className="text-red-500">*</span>
      </label>
      
      {/* Amount Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 font-medium">₱</span>
        </div>
        
        <input
          type="number"
          inputMode="decimal"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled}
          className={`
            block w-full pl-8 pr-4 py-3 text-lg font-semibold
            border-2 rounded-lg shadow-sm
            placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            transition-colors
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300'
            }
          `}
          placeholder="0"
        />
      </div>

      {/* Quick amounts - smaller and inline */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handleQuickAmount(amount)}
            disabled={disabled}
            className="
              flex-shrink-0 px-3 py-1 text-sm font-medium text-gray-600 
              bg-gray-100 hover:bg-gray-200 
              border border-gray-300 rounded-full
              focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {formatCurrency(amount)}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

interface CompactFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

const CompactField: React.FC<CompactFieldProps> = ({
  label,
  required = false,
  error,
  children,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  label: string;
}

const Toggle: React.FC<ToggleProps> = ({
  enabled,
  onChange,
  disabled = false,
  label,
}) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        disabled={disabled}
        className={`
          relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full 
          border-2 border-transparent transition-colors duration-200 ease-in-out 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-4 w-4 transform rounded-full 
            bg-white shadow ring-0 transition duration-200 ease-in-out
            ${enabled ? 'translate-x-4' : 'translate-x-0'}
          `}
        />
      </button>
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

  const [formData, setFormData] = useState<FormData>(() => ({
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
  }));

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const isFormLoading = isLoading || isSubmitting;
  const isEditMode = Boolean(editingTransaction);

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
    if (editingTransaction && isOpen) {
      // Convert date to proper format for date input (YYYY-MM-DD)
      const formatDateForInput = (dateString: string | undefined) => {
        try {
          // Handle various date formats
          if (!dateString) {
            return new Date().toISOString().split('T')[0];
          }
          
          const date = new Date(dateString);
          
          // Check if date is valid
          if (isNaN(date.getTime())) {
            console.warn('Invalid date provided:', dateString);
            return new Date().toISOString().split('T')[0];
          }
          
          return date.toISOString().split('T')[0];
        } catch (error) {
          console.error('Date formatting error:', error);
          return new Date().toISOString().split('T')[0];
        }
      };

      const categoryType = editingTransaction.categoryId ? 
        categories.find(c => c.id === editingTransaction.categoryId)?.type : undefined;

      setFormData({
        selectedType: categoryType || 'EXPENSE',
        categoryId: editingTransaction.categoryId || '',
        amount: Number(editingTransaction.amount) || 0,
        description: editingTransaction.description || '',
        date: formatDateForInput(editingTransaction.date),
        isPosted: Boolean(editingTransaction.isPosted ?? true),
        receiptUrl: editingTransaction.receiptUrl || '',
        isRecurring: Boolean(editingTransaction.isRecurring ?? false),
        dayOfMonth: Number(editingTransaction.dayOfMonth) || new Date().getDate(),
        frequency: editingTransaction.frequency || 'MONTHLY',
      });
    } else if (isOpen) {
      setFormData({
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
    }
    
    if (isOpen) {
      setErrors({});
      setShowAdvanced(false);
    }
  }, [editingTransaction, preselectedType, categories, isOpen]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < MIN_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`;
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.isRecurring && (formData.dayOfMonth < 1 || formData.dayOfMonth > 31)) {
      newErrors.dayOfMonth = 'Day of month must be between 1 and 31';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const submitData = {
        budgetId,
        categoryId: formData.categoryId,
        description: formData.description.trim(),
        amount: formData.amount,
        date: formData.date,
        isPosted: formData.isPosted,
        receiptUrl: formData.receiptUrl.trim() || undefined,
        isRecurring: formData.isRecurring,
        dayOfMonth: formData.isRecurring ? formData.dayOfMonth : undefined,
        frequency: formData.isRecurring ? formData.frequency : undefined,
      };

      await onSubmit(submitData);
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
      size="md"
      className="sm:max-w-md mx-4 sm:mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {errors.general && (
          <Alert variant="error">
            <p className="text-sm">{errors.general}</p>
          </Alert>
        )}

        {/* Transaction Type */}
        <ImprovedTypeSelector
          selectedType={formData.selectedType}
          onTypeChange={(type) => {
            setFormData(prev => ({ ...prev, selectedType: type, categoryId: '' }));
            setErrors(prev => ({ ...prev, categoryId: undefined }));
          }}
          disabled={isFormLoading}
        />

        {/* Category */}
        <SmartCategorySelector
          categories={categories}
          selectedType={formData.selectedType}
          selectedCategoryId={formData.categoryId}
          onCategoryChange={(categoryId) => {
            setFormData(prev => ({ ...prev, categoryId }));
            setErrors(prev => ({ ...prev, categoryId: undefined }));
          }}
          error={errors.categoryId}
          disabled={isFormLoading}
        />

        {/* Amount */}
        <CompactAmountInput
          value={formData.amount}
          onChange={(amount) => {
            setFormData(prev => ({ ...prev, amount }));
            setErrors(prev => ({ ...prev, amount: undefined }));
          }}
          disabled={isFormLoading}
          error={errors.amount}
        />

        {/* Description */}
        <CompactField label="Description" required error={errors.description}>
          <textarea
            value={formData.description}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, description: e.target.value }));
              setErrors(prev => ({ ...prev, description: undefined }));
            }}
            maxLength={MAX_DESCRIPTION_LENGTH}
            rows={2}
            disabled={isFormLoading}
            placeholder="What is this for?"
            className={`
              block w-full px-3 py-2 text-base
              border-2 rounded-lg shadow-sm
              placeholder-gray-400 resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500
              ${errors.description 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300'
              }
            `}
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
          </div>
        </CompactField>

        {/* Date */}
        <CompactField label="Date" required error={errors.date}>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, date: e.target.value }));
              setErrors(prev => ({ ...prev, date: undefined }));
            }}
            disabled={isFormLoading}
            className="
              block w-full px-3 py-3 text-base
              border-2 border-gray-300 rounded-lg shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500
            "
          />
        </CompactField>

        {/* Posted Toggle */}
        <Toggle
          enabled={formData.isPosted}
          onChange={(isPosted) => setFormData(prev => ({ ...prev, isPosted }))}
          disabled={isFormLoading}
          label="Mark as posted"
        />

        {/* Advanced Options */}
        <div className="border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={isFormLoading}
            className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-800"
          >
            <span>Advanced options</span>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4">
              {/* Receipt URL */}
              <CompactField label="Receipt URL" error={errors.receiptUrl}>
                <input
                  type="url"
                  value={formData.receiptUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, receiptUrl: e.target.value }))}
                  placeholder="https://..."
                  disabled={isFormLoading}
                  className="
                    block w-full px-3 py-2 text-base
                    border-2 border-gray-300 rounded-lg shadow-sm
                    placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    disabled:bg-gray-50 disabled:text-gray-500
                  "
                />
              </CompactField>

              {/* Recurring */}
              <Toggle
                enabled={formData.isRecurring}
                onChange={(isRecurring) => setFormData(prev => ({ ...prev, isRecurring }))}
                disabled={isFormLoading}
                label="Recurring transaction"
              />

              {formData.isRecurring && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                  <CompactField label="Frequency">
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                      disabled={isFormLoading}
                      className="
                        block w-full px-2 py-2 text-sm
                        border border-gray-300 rounded-lg
                        bg-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      "
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </CompactField>

                  <CompactField label="Day" error={errors.dayOfMonth}>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dayOfMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) || 1 }))}
                      disabled={isFormLoading}
                      className={`
                        block w-full px-2 py-2 text-sm
                        border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.dayOfMonth ? 'border-red-300' : 'border-gray-300'}
                      `}
                    />
                  </CompactField>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isFormLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid || isFormLoading}
            className="flex-1"
          >
            {isFormLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update' : 'Save'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionFormModal;