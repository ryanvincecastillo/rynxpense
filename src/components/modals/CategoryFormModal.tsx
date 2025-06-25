import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, 
  Palette, 
  Check, 
  AlertCircle, 
  Save,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Info,
  Shuffle,
  Calculator
} from 'lucide-react';

// UI Components
import { 
  Button, 
  Input,
  Alert
} from '../ui';
import Modal from '../ui/Modal/Modal';

// Types
import { CreateCategoryForm, BudgetCategory } from '../../types';

// Utils
import { isValidHexColor } from '../../utils';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

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

const MAX_NAME_LENGTH = 50;
const MAX_PLANNED_AMOUNT = 999999999;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const getColorName = (colorValue: string, type: 'INCOME' | 'EXPENSE'): string => {
  const preset = PRESET_COLORS[type].find((color: { value: string; name: string }) => color.value === colorValue);
  return preset ? preset.name : 'Custom';
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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

const CategoryTypeSelector: React.FC<{
  selectedType: 'INCOME' | 'EXPENSE';
  onTypeChange: (type: 'INCOME' | 'EXPENSE') => void;
  disabled?: boolean;
}> = ({ selectedType, onTypeChange, disabled = false }) => {
  return (
    <div className="space-y-2">
      <Label required>Category Type</Label>
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

const ColorPicker: React.FC<{
  selectedColor: string;
  categoryType: 'INCOME' | 'EXPENSE';
  onColorChange: (color: string) => void;
  showCustomInput: boolean;
  onToggleCustomInput: () => void;
  disabled?: boolean;
}> = ({ 
  selectedColor, 
  categoryType, 
  onColorChange, 
  showCustomInput, 
  onToggleCustomInput, 
  disabled = false 
}) => {
  const [customColorInput, setCustomColorInput] = useState(selectedColor);
  const currentPresetColors = PRESET_COLORS[categoryType];

  const handleCustomColorChange = useCallback((value: string) => {
    setCustomColorInput(value);
    if (isValidHexColor(value)) {
      onColorChange(value);
    }
  }, [onColorChange]);

  const handleRandomColor = useCallback(() => {
    const randomColor = generateRandomColor();
    onColorChange(randomColor);
    setCustomColorInput(randomColor);
  }, [onColorChange]);

  return (
    <div className="space-y-4">
      {/* Color Preview */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div 
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0"
          style={{ backgroundColor: selectedColor }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">
            {getColorName(selectedColor, categoryType)}
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
          <span className="text-sm font-medium text-gray-700">
            {categoryType === 'INCOME' ? 'Income Colors' : 'Expense Colors'}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onToggleCustomInput}
            disabled={disabled}
            className="text-xs"
          >
            {showCustomInput ? (
              <>
                <EyeOff className="w-3 h-3 mr-1" />
                Hide Custom
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 mr-1" />
                Custom Color
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
          {currentPresetColors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => onColorChange(color.value)}
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
                <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-sm" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Input */}
      {showCustomInput && (
        <div className="space-y-2">
          <Label htmlFor="custom-color">Custom Color (Hex)</Label>
          <div className="flex gap-2">
            <Input
              id="custom-color"
              type="text"
              value={customColorInput}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              placeholder="#22C55E"
              disabled={disabled}
              className="font-mono text-sm"
              maxLength={7}
            />
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              disabled={disabled}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed"
              title="Color picker"
            />
          </div>
          {customColorInput && !isValidHexColor(customColorInput) && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Please enter a valid hex color (e.g., #22C55E)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const CategoryPreview: React.FC<{
  name: string;
  type: 'INCOME' | 'EXPENSE';
  plannedAmount: number;
  color: string;
}> = ({ name, type, plannedAmount, color }) => {
  return (
    <div className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {type === 'INCOME' ? (
            <TrendingUp className="w-5 h-5 text-white drop-shadow-sm" />
          ) : (
            <TrendingDown className="w-5 h-5 text-white drop-shadow-sm" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {name || 'Category Name'}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              type === 'INCOME' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {type === 'INCOME' ? '💰 Income' : '💸 Expense'}
            </span>
            <span className="font-mono">
              {formatCurrency(plannedAmount)}
            </span>
          </div>
        </div>
      </div>
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

  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: preselectedType || 'EXPENSE',
    plannedAmount: 0,
    color: DEFAULT_COLORS[preselectedType || 'EXPENSE'],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomColor, setShowCustomColor] = useState(false);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const isFormLoading = isLoading || isSubmitting;
  const isEditMode = Boolean(editingCategory);

  const isFormValid = useMemo(() => {
    return formData.name.trim().length >= 2 && 
           formData.name.trim().length <= MAX_NAME_LENGTH &&
           formData.plannedAmount >= 0 &&
           formData.plannedAmount <= MAX_PLANNED_AMOUNT &&
           isValidHexColor(formData.color);
  }, [formData]);

  // ========================================
  // FORM INITIALIZATION
  // ========================================

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        const newFormData = {
          name: editingCategory.name,
          type: editingCategory.type,
          plannedAmount: editingCategory.plannedAmount,
          color: editingCategory.color,
        };
        setFormData(newFormData);
        
        // Check if the editing category uses a custom color
        const allPresetColors: string[] = [
          ...PRESET_COLORS.INCOME.map((c: { value: string; name: string }) => c.value),
          ...PRESET_COLORS.EXPENSE.map((c: { value: string; name: string }) => c.value)
        ];
        setShowCustomColor(!allPresetColors.includes(newFormData.color));
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

  // ========================================
  // VALIDATION
  // ========================================

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    // Name validation
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Category name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (trimmedName.length > MAX_NAME_LENGTH) {
      newErrors.name = `Category name must be ${MAX_NAME_LENGTH} characters or less`;
    }

    // Planned amount validation
    if (formData.plannedAmount < 0) {
      newErrors.plannedAmount = 'Planned amount cannot be negative';
    } else if (formData.plannedAmount > MAX_PLANNED_AMOUNT) {
      newErrors.plannedAmount = 'Planned amount is too large';
    }

    // Color validation
    if (!isValidHexColor(formData.color)) {
      newErrors.color = 'Please select or enter a valid color';
    }

    return newErrors;
  }, [formData]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleInputChange = useCallback((field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'plannedAmount' 
      ? Math.max(0, parseFloat(e.target.value) || 0)
      : e.target.value;
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleTypeChange = useCallback((type: 'INCOME' | 'EXPENSE') => {
    setFormData(prev => ({ ...prev, type }));
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: undefined }));
    }
  }, [errors.type]);

  const handleColorChange = useCallback((color: string) => {
    setFormData(prev => ({ ...prev, color }));
    if (errors.color) {
      setErrors(prev => ({ ...prev, color: undefined }));
    }
  }, [errors.color]);

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
        name: formData.name.trim(),
        type: formData.type,
        plannedAmount: formData.plannedAmount,
        color: formData.color,
      };

      await onSubmit(submitData);
      // Modal will be closed by parent component on success
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

        {/* Category Name Field */}
        <div className="space-y-1">
          <Label htmlFor="category-name" required>
            Category Name
          </Label>
          <Input
            id="category-name"
            type="text"
            value={formData.name}
            onChange={handleInputChange('name')}
            placeholder="e.g., Groceries, Salary, Entertainment"
            disabled={isFormLoading}
            className={`
              ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              text-base sm:text-sm
            `}
            maxLength={MAX_NAME_LENGTH}
            autoFocus
            autoComplete="off"
          />
          <div className="flex justify-between items-start">
            {errors.name ? (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.name}
              </p>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Info className="w-3 h-3" />
                Choose a descriptive name for this category
              </div>
            )}
            <span className="text-xs text-gray-400 ml-2">
              {formData.name.length}/{MAX_NAME_LENGTH}
            </span>
          </div>
        </div>

        {/* Category Type Selector */}
        <CategoryTypeSelector
          selectedType={formData.type}
          onTypeChange={handleTypeChange}
          disabled={isFormLoading}
        />

        {/* Planned Amount Field */}
        <div className="space-y-1">
          <Label htmlFor="planned-amount" required>
            Planned Amount
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₱</span>
            </div>
            <Input
              id="planned-amount"
              type="number"
              value={formData.plannedAmount}
              onChange={handleInputChange('plannedAmount')}
              placeholder="0.00"
              disabled={isFormLoading}
              className={`
                pl-8 text-base sm:text-sm
                ${errors.plannedAmount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              `}
              min="0"
              max={MAX_PLANNED_AMOUNT}
              step="0.01"
            />
          </div>
          <div className="flex justify-between items-start">
            {errors.plannedAmount ? (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.plannedAmount}
              </p>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calculator className="w-3 h-3" />
                Set your budget limit for this category
              </div>
            )}
            {formData.plannedAmount > 0 && (
              <span className="text-xs text-gray-500 ml-2 font-mono">
                {formatCurrency(formData.plannedAmount)}
              </span>
            )}
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-1">
          <Label>Category Color</Label>
          <ColorPicker
            selectedColor={formData.color}
            categoryType={formData.type}
            onColorChange={handleColorChange}
            showCustomInput={showCustomColor}
            onToggleCustomInput={() => setShowCustomColor(prev => !prev)}
            disabled={isFormLoading}
          />
          {errors.color && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.color}
            </p>
          )}
        </div>

        {/* Category Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <CategoryPreview
            name={formData.name}
            type={formData.type}
            plannedAmount={formData.plannedAmount}
            color={formData.color}
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
                {isEditMode ? 'Update Category' : 'Create Category'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryFormModal;