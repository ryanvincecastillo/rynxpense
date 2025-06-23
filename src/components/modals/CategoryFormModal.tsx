import React, { useState, useEffect, useCallback } from 'react';
import { X, Palette, Check, AlertCircle, Save, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

// UI Components
import { 
  Modal,
  Button, 
  Input,
  Alert
} from '../ui';

// Types
import { CreateCategoryForm, BudgetCategory } from '../../types';

// Utils
import { isValidHexColor } from '../../utils';

// Constants
const PRESET_COLORS = {
  INCOME: [
    '#22C55E', // Green
    '#10B981', // Emerald  
    '#16A34A', // Green-600
    '#15803D', // Green-700
    '#84CC16', // Lime
    '#65A30D', // Lime-600
    '#059669', // Emerald-600
    '#047857', // Emerald-700
    '#14B8A6', // Teal
    '#0D9488', // Teal-600
    '#06B6D4', // Cyan
    '#0891B2', // Cyan-600
  ],
  EXPENSE: [
    '#EF4444', // Red
    '#DC2626', // Red-600
    '#B91C1C', // Red-700
    '#F97316', // Orange
    '#EA580C', // Orange-600
    '#F59E0B', // Amber
    '#D97706', // Amber-600
    '#EC4899', // Pink
    '#DB2777', // Pink-600
    '#8B5CF6', // Violet
    '#7C3AED', // Violet-600
    '#6366F1', // Indigo
  ],
};

const DEFAULT_COLORS = {
  INCOME: '#22C55E',
  EXPENSE: '#EF4444',
};

// Simple color generation function
const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

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

// Simple Label component
const Label: React.FC<{ htmlFor?: string; className?: string; children: React.ReactNode }> = ({
  htmlFor,
  className = '',
  children
}) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
);

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCategory,
  isLoading = false,
  budgetId,
  preselectedType,
}) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: preselectedType || 'EXPENSE',
    plannedAmount: 0,
    color: DEFAULT_COLORS[preselectedType || 'EXPENSE'],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomColor, setShowCustomColor] = useState(false);

  // Get current preset colors based on type
  const currentPresetColors = PRESET_COLORS[formData.type];

  // Initialize form when modal opens or editing category changes
  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        setFormData({
          name: editingCategory.name,
          type: editingCategory.type,
          plannedAmount: editingCategory.plannedAmount,
          color: editingCategory.color,
        });
        // Check if the editing category uses a custom color
        const allPresetColors = [...PRESET_COLORS.INCOME, ...PRESET_COLORS.EXPENSE];
        setShowCustomColor(!allPresetColors.includes(editingCategory.color));
      } else {
        const defaultType = preselectedType || 'EXPENSE';
        setFormData({
          name: '',
          type: defaultType,
          plannedAmount: 0,
          color: DEFAULT_COLORS[defaultType],
        });
        setShowCustomColor(false);
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, editingCategory, preselectedType]);

  // Update color when type changes (only for new categories)
  useEffect(() => {
    if (!editingCategory && !showCustomColor) {
      setFormData(prev => ({
        ...prev,
        color: DEFAULT_COLORS[prev.type],
      }));
    }
  }, [formData.type, editingCategory, showCustomColor]);

  // Validation function
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Category name must be 50 characters or less';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = 'Category type is required';
    }

    // Planned amount validation
    if (formData.plannedAmount < 0) {
      newErrors.plannedAmount = 'Planned amount cannot be negative';
    } else if (formData.plannedAmount > 999999999) {
      newErrors.plannedAmount = 'Planned amount is too large';
    }

    // Color validation
    if (!formData.color || !isValidHexColor(formData.color)) {
      newErrors.color = 'Please select a valid color';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Input change handlers
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, name: value }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  }, [errors.name]);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'INCOME' | 'EXPENSE';
    setFormData(prev => ({ ...prev, type: value }));
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: undefined }));
    }
  }, [errors.type]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseFloat(e.target.value) || 0);
    setFormData(prev => ({ ...prev, plannedAmount: value }));
    if (errors.plannedAmount) {
      setErrors(prev => ({ ...prev, plannedAmount: undefined }));
    }
  }, [errors.plannedAmount]);

  const handleColorChange = useCallback((color: string) => {
    setFormData(prev => ({ ...prev, color }));
    if (errors.color) {
      setErrors(prev => ({ ...prev, color: undefined }));
    }
  }, [errors.color]);

  const handleCustomColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleColorChange(value);
  }, [handleColorChange]);

  const handleGenerateRandomColor = useCallback(() => {
    const randomColor = generateRandomColor();
    handleColorChange(randomColor);
  }, [handleColorChange]);

  // Form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const submitData: CreateCategoryForm = {
        budgetId,
        name: formData.name.trim(),
        type: formData.type,
        plannedAmount: formData.plannedAmount,
        color: formData.color,
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
  }, [formData, validateForm, isSubmitting, onSubmit, budgetId]);

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
      title={editingCategory ? 'Edit Category' : 'Create Category'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error Alert */}
        {errors.general && (
          <Alert type="error" className="mb-4">
            {errors.general}
          </Alert>
        )}

        {/* Category Name */}
        <div className="space-y-2">
          <Label htmlFor="category-name">
            Category Name *
          </Label>
          <Input
            id="category-name"
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Enter category name"
            disabled={isFormLoading}
            className={errors.name ? 
              'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            maxLength={50}
          />
          {errors.name && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.name}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {formData.name.length}/50 characters
          </p>
        </div>

        {/* Category Type - Segmented Control */}
        <div className="space-y-3">
          <Label>
            Category Type *
          </Label>
          <div className="relative">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => handleTypeChange({ target: { value: 'INCOME' } } as any)}
                disabled={isFormLoading}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium
                  transition-all duration-200 relative overflow-hidden
                  ${formData.type === 'INCOME'
                    ? 'bg-green-500 text-white shadow-md ring-1 ring-green-400'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }
                  ${isFormLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Income</span>
                {formData.type === 'INCOME' && (
                  <div className="absolute inset-0 bg-green-600/10 rounded-md -z-10"></div>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange({ target: { value: 'EXPENSE' } } as any)}
                disabled={isFormLoading}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium
                  transition-all duration-200 relative overflow-hidden
                  ${formData.type === 'EXPENSE'
                    ? 'bg-red-500 text-white shadow-md ring-1 ring-red-400'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }
                  ${isFormLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <TrendingDown className="h-4 w-4" />
                <span>Expense</span>
                {formData.type === 'EXPENSE' && (
                  <div className="absolute inset-0 bg-red-600/10 rounded-md -z-10"></div>
                )}
              </button>
            </div>
          </div>
          {errors.type && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.type}
            </p>
          )}
        </div>

        {/* Planned Amount */}
        <div className="space-y-2">
          <Label htmlFor="planned-amount">
            Planned Amount *
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="planned-amount"
              type="number"
              value={formData.plannedAmount || ''}
              onChange={handleAmountChange}
              placeholder="0.00"
              disabled={isFormLoading}
              className={`pl-10 ${errors.plannedAmount ? 
                'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              min="0"
              step="0.01"
            />
          </div>
          {errors.plannedAmount && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.plannedAmount}
            </p>
          )}
        </div>

        {/* Color Selection */}
        <div className="space-y-3">
          <Label>
            Category Color *
          </Label>
          
          {/* Preset Colors */}
          <div className="grid grid-cols-6 gap-2">
            {currentPresetColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorChange(color)}
                disabled={isFormLoading}
                className={`
                  relative w-10 h-10 rounded-lg border-2 transition-all
                  hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${formData.color === color 
                    ? 'border-gray-900 ring-2 ring-blue-500' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  ${isFormLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              >
                {formData.color === color && (
                  <Check className="h-4 w-4 text-white absolute inset-0 m-auto drop-shadow-sm" />
                )}
              </button>
            ))}
          </div>

          {/* Custom Color */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCustomColor(!showCustomColor)}
              disabled={isFormLoading}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <Palette className="h-4 w-4" />
              {showCustomColor ? 'Use Preset Colors' : 'Custom Color'}
            </button>
            
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleGenerateRandomColor}
              disabled={isFormLoading}
              className="text-xs"
            >
              Random
            </Button>
          </div>

          {/* Custom Color Input */}
          {showCustomColor && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={handleCustomColorChange}
                  disabled={isFormLoading}
                  className="w-12 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={handleCustomColorChange}
                  placeholder="#22C55E"
                  disabled={isFormLoading}
                  className="flex-1"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>
          )}

          {errors.color && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.color}
            </p>
          )}
        </div>

        {/* Color Preview */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full border border-gray-300"
              style={{ backgroundColor: formData.color }}
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {formData.name || 'Category Name'}
              </p>
              <p className="text-xs text-gray-600">
                {formData.type === 'INCOME' ? '💰 Income' : '💸 Expense'} • 
                ₱{formData.plannedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
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
            disabled={isFormLoading || !formData.name.trim()}
            className="w-full sm:w-auto sm:flex-1 order-1 sm:order-2"
          >
            <Save className="h-4 w-4 mr-2" />
            
            {isFormLoading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {editingCategory 
              ? (isFormLoading ? 'Updating...' : 'Update Category')
              : (isFormLoading ? 'Creating...' : 'Create Category')
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};