// CategoryFormModal.tsx - Mobile-First Version
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Plus,
  Minus,
  Save,
  Loader2,
  AlertCircle,
  Palette,
  Shuffle,
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
  plannedAmount: number;
  color: string;
}

interface CreateCategoryForm {
  budgetId: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  plannedAmount: number;
  color: string;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryForm) => Promise<void>;
  editingCategory?: BudgetCategory | null;
  isLoading?: boolean;
  budgetId: string;
  preselectedType?: 'INCOME' | 'EXPENSE';
}

interface FormData {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  plannedAmount: number;
  color: string;
}

interface FormErrors {
  name?: string;
  type?: string;
  plannedAmount?: string;
  color?: string;
  general?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_NAME_LENGTH = 50;
const MIN_NAME_LENGTH = 2;

const PRESET_COLORS = {
  INCOME: [
    { value: '#22C55E', name: 'Green' },
    { value: '#10B981', name: 'Emerald' },
    { value: '#16A34A', name: 'Green-600' },
    { value: '#15803D', name: 'Green-700' },
    { value: '#84CC16', name: 'Lime' },
    { value: '#65A30D', name: 'Lime-600' },
    { value: '#059669', name: 'Emerald-600' },
    { value: '#047857', name: 'Emerald-700' },
    { value: '#14B8A6', name: 'Teal' },
    { value: '#0D9488', name: 'Teal-600' },
    { value: '#06B6D4', name: 'Cyan' },
    { value: '#0891B2', name: 'Cyan-600' },
  ],
  EXPENSE: [
    { value: '#EF4444', name: 'Red' },
    { value: '#DC2626', name: 'Red-600' },
    { value: '#B91C1C', name: 'Red-700' },
    { value: '#F97316', name: 'Orange' },
    { value: '#EA580C', name: 'Orange-600' },
    { value: '#F59E0B', name: 'Amber' },
    { value: '#D97706', name: 'Amber-600' },
    { value: '#EC4899', name: 'Pink' },
    { value: '#DB2777', name: 'Pink-600' },
    { value: '#8B5CF6', name: 'Violet' },
    { value: '#7C3AED', name: 'Violet-600' },
    { value: '#6366F1', name: 'Indigo' },
  ],
};

const DEFAULT_COLORS = {
  INCOME: '#22C55E',
  EXPENSE: '#EF4444',
};

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000];

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

const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const getColorName = (colorValue: string, type: 'INCOME' | 'EXPENSE'): string => {
  const preset = PRESET_COLORS[type].find(color => color.value === colorValue);
  return preset ? preset.name : 'Custom';
};

const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface MobileCategoryTypeProps {
  selectedType: 'INCOME' | 'EXPENSE';
  onTypeChange: (type: 'INCOME' | 'EXPENSE') => void;
  disabled?: boolean;
}

const MobileCategoryType: React.FC<MobileCategoryTypeProps> = ({
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

interface MobileAmountInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  error?: string;
  label: string;
}

const MobileAmountInput: React.FC<MobileAmountInputProps> = ({
  value,
  onChange,
  disabled = false,
  error,
  label,
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
        {label} <span className="text-red-500">*</span>
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

      {/* Quick amounts */}
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

interface ColorPickerProps {
  selectedColor: string;
  selectedType: 'INCOME' | 'EXPENSE';
  onChange: (color: string) => void;
  disabled?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  selectedType,
  onChange,
  disabled = false,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customColorInput, setCustomColorInput] = useState(selectedColor);

  const availableColors = PRESET_COLORS[selectedType];

  const handleCustomColorChange = useCallback((value: string) => {
    setCustomColorInput(value);
    if (isValidHexColor(value)) {
      onChange(value);
    }
  }, [onChange]);

  const handleRandomColor = useCallback(() => {
    const randomColor = generateRandomColor();
    onChange(randomColor);
    setCustomColorInput(randomColor);
  }, [onChange]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Color <span className="text-red-500">*</span>
      </label>

      {/* Color Preview */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div 
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0"
          style={{ backgroundColor: selectedColor }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">
            {getColorName(selectedColor, selectedType)}
          </p>
          <p className="text-xs text-gray-500 font-mono">
            {selectedColor.toUpperCase()}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleRandomColor}
          disabled={disabled}
          className="p-2 h-8 w-8"
          title="Generate random color"
        >
          <Shuffle className="w-4 h-4" />
        </Button>
      </div>

      {/* Preset Colors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Preset Colors</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowCustomInput(!showCustomInput)}
            disabled={disabled}
            className="text-xs px-2 py-1"
          >
            {showCustomInput ? 'Hide Custom' : 'Custom Color'}
          </Button>
        </div>
        
        <div className="grid grid-cols-6 gap-2">
          {availableColors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => onChange(color.value)}
              disabled={disabled}
              className={`
                relative w-8 h-8 rounded-lg border-2 transition-all duration-200
                hover:scale-110 hover:border-gray-400 focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 
                disabled:cursor-not-allowed
                ${selectedColor === color.value 
                  ? 'border-gray-600 ring-2 ring-blue-500 ring-offset-1' 
                  : 'border-gray-200'
                }
              `}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {selectedColor === color.value && (
                <div className="w-4 h-4 text-white absolute inset-0 m-auto">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 drop-shadow-sm">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Input */}
      {showCustomInput && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">Custom Color (Hex)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customColorInput}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              placeholder="#3B82F6"
              disabled={disabled}
              className="flex-1 px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={7}
            />
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed"
              title="Color picker"
            />
          </div>
          {customColorInput && !isValidHexColor(customColorInput) && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Please enter a valid hex color (e.g., #3B82F6)
            </p>
          )}
        </div>
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCategory,
  isLoading = false,
  budgetId,
  preselectedType,
}) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  const [formData, setFormData] = useState<FormData>(() => ({
    name: '',
    type: preselectedType || 'EXPENSE',
    plannedAmount: 0,
            color: DEFAULT_COLORS[preselectedType || 'EXPENSE'],
  }));

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const isFormLoading = isLoading || isSubmitting;
  const isEditMode = Boolean(editingCategory);

  const isFormValid = useMemo(() => {
    const trimmedName = (formData.name || '').trim();
    return trimmedName.length >= MIN_NAME_LENGTH && 
           trimmedName.length <= MAX_NAME_LENGTH &&
           formData.plannedAmount >= 0 &&
           formData.color && formData.color.length > 0;
  }, [formData]);

  // ========================================
  // FORM INITIALIZATION
  // ========================================

  useEffect(() => {
    if (editingCategory && isOpen) {
      setFormData({
        name: editingCategory.name || '',
        type: editingCategory.type || 'EXPENSE',
        plannedAmount: Number(editingCategory.plannedAmount) || 0,
        color: editingCategory.color || DEFAULT_COLORS[editingCategory.type || 'EXPENSE'],
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        type: preselectedType || 'EXPENSE',
        plannedAmount: 0,
        color: DEFAULT_COLORS[preselectedType || 'EXPENSE'],
      });
    }
    
    if (isOpen) {
      setErrors({});
    }
  }, [editingCategory, preselectedType, isOpen]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    const trimmedName = (formData.name || '').trim();

    if (!trimmedName) {
      newErrors.name = 'Category name is required';
    } else if (trimmedName.length < MIN_NAME_LENGTH) {
      newErrors.name = `Name must be at least ${MIN_NAME_LENGTH} characters`;
    } else if (trimmedName.length > MAX_NAME_LENGTH) {
      newErrors.name = `Name must be less than ${MAX_NAME_LENGTH} characters`;
    }

    if (formData.plannedAmount < 0) {
      newErrors.plannedAmount = 'Planned amount cannot be negative';
    }

    if (!formData.color || formData.color.length === 0) {
      newErrors.color = 'Please select a color';
    }

    return newErrors;
  }, [formData]);

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
      const submitData: CreateCategoryForm = {
        budgetId,
        name: (formData.name || '').trim(),
        type: formData.type,
        plannedAmount: formData.plannedAmount,
        color: formData.color,
      };

      await onSubmit(submitData);
    } catch (error: any) {
      console.error('Category form submission error:', error);
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
      title={isEditMode ? 'Edit Category' : 'Create Category'}
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

        {/* Category Type */}
        <MobileCategoryType
          selectedType={formData.type}
          onTypeChange={(type) => {
            setFormData(prev => ({ 
              ...prev, 
              type,
              color: DEFAULT_COLORS[type] // Reset color when type changes
            }));
            setErrors(prev => ({ ...prev, type: undefined }));
          }}
          disabled={isFormLoading}
        />

        {/* Category Name */}
        <CompactField label="Category Name" required error={errors.name}>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              setErrors(prev => ({ ...prev, name: undefined }));
            }}
            maxLength={MAX_NAME_LENGTH}
            disabled={isFormLoading}
            placeholder="e.g., Groceries, Salary, Entertainment"
            className={`
              block w-full px-3 py-3 text-base
              border-2 rounded-lg shadow-sm
              placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500
              ${errors.name 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300'
              }
            `}
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {(formData.name || '').length}/{MAX_NAME_LENGTH}
          </div>
        </CompactField>

        {/* Planned Amount */}
        <MobileAmountInput
          value={formData.plannedAmount}
          onChange={(amount) => {
            setFormData(prev => ({ ...prev, plannedAmount: amount }));
            setErrors(prev => ({ ...prev, plannedAmount: undefined }));
          }}
          disabled={isFormLoading}
          error={errors.plannedAmount}
          label="Planned Amount"
        />

        {/* Color Picker */}
        <ColorPicker
          selectedColor={formData.color}
          selectedType={formData.type}
          onChange={(color) => {
            setFormData(prev => ({ ...prev, color }));
            setErrors(prev => ({ ...prev, color: undefined }));
          }}
          disabled={isFormLoading}
        />

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
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update' : 'Create'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryFormModal;