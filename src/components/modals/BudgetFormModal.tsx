// BudgetFormModal.tsx - Mobile-First Version
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  Palette,
  Shuffle,
  Info,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui';
import { Alert } from '../ui/Alert';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Budget {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface CreateBudgetForm {
  name: string;
  description?: string;
  color: string;
}

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBudgetForm) => Promise<void>;
  editingBudget?: Budget | null;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  description: string;
  color: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  color?: string;
  general?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_NAME_LENGTH = 1;

const PRESET_COLORS = [
  { value: '#3B82F6', name: 'Blue' },
  { value: '#10B981', name: 'Emerald' },
  { value: '#F59E0B', name: 'Amber' },
  { value: '#EF4444', name: 'Red' },
  { value: '#8B5CF6', name: 'Violet' },
  { value: '#06B6D4', name: 'Cyan' },
  { value: '#84CC16', name: 'Lime' },
  { value: '#F97316', name: 'Orange' },
  { value: '#EC4899', name: 'Pink' },
  { value: '#6366F1', name: 'Indigo' },
  { value: '#14B8A6', name: 'Teal' },
  { value: '#EAB308', name: 'Yellow' },
];

const DEFAULT_COLOR = '#3B82F6';

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

const getColorName = (colorValue: string): string => {
  const preset = PRESET_COLORS.find(color => color.value === colorValue);
  return preset ? preset.name : 'Custom';
};

const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface CompactFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  helpText?: string;
}

const CompactField: React.FC<CompactFieldProps> = ({
  label,
  required = false,
  error,
  children,
  helpText,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      ) : helpText ? (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {helpText}
        </p>
      ) : null}
    </div>
  );
};

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onChange,
  disabled = false,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customColorInput, setCustomColorInput] = useState(selectedColor);

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
        Budget Color <span className="text-red-500">*</span>
      </label>

      {/* Color Preview */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div 
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0"
          style={{ backgroundColor: selectedColor }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">
            {getColorName(selectedColor)}
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
          {PRESET_COLORS.map((color) => (
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingBudget,
  isLoading = false,
}) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  const [formData, setFormData] = useState<FormData>(() => ({
    name: '',
    description: '',
    color: DEFAULT_COLOR,
  }));

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const isFormLoading = isLoading || isSubmitting;
  const isEditMode = Boolean(editingBudget);

  const isFormValid = useMemo(() => {
    const trimmedName = (formData.name || '').trim();
    return trimmedName.length >= MIN_NAME_LENGTH && 
           trimmedName.length <= MAX_NAME_LENGTH &&
           formData.description.length <= MAX_DESCRIPTION_LENGTH &&
           isValidHexColor(formData.color);
  }, [formData]);

  // ========================================
  // FORM INITIALIZATION
  // ========================================

  useEffect(() => {
    if (editingBudget && isOpen) {
      setFormData({
        name: editingBudget.name || '',
        description: editingBudget.description || '',
        color: editingBudget.color || DEFAULT_COLOR,
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        description: '',
        color: DEFAULT_COLOR,
      });
    }
    
    if (isOpen) {
      setErrors({});
    }
  }, [editingBudget, isOpen]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    const trimmedName = (formData.name || '').trim();

    if (!trimmedName) {
      newErrors.name = 'Budget name is required';
    } else if (trimmedName.length < MIN_NAME_LENGTH) {
      newErrors.name = `Name must be at least ${MIN_NAME_LENGTH} character`;
    } else if (trimmedName.length > MAX_NAME_LENGTH) {
      newErrors.name = `Name must be less than ${MAX_NAME_LENGTH} characters`;
    }

    if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    if (!isValidHexColor(formData.color)) {
      newErrors.color = 'Please select a valid color';
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
      const submitData: CreateBudgetForm = {
        name: (formData.name || '').trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
      };

      await onSubmit(submitData);
    } catch (error: any) {
      console.error('Budget form submission error:', error);
      setErrors({
        general: error?.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, isSubmitting, onSubmit]);

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
      title={isEditMode ? 'Edit Budget' : 'Create Budget'}
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

        {/* Budget Name */}
        <CompactField 
          label="Budget Name" 
          required 
          error={errors.name}
          helpText="Choose a descriptive name for your budget"
        >
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              setErrors(prev => ({ ...prev, name: undefined }));
            }}
            maxLength={MAX_NAME_LENGTH}
            disabled={isFormLoading}
            placeholder="e.g., Monthly Expenses, Vacation Fund"
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

        {/* Budget Description */}
        <CompactField 
          label="Description" 
          error={errors.description}
          helpText="Optional notes about your budget goals or purpose"
        >
          <textarea
            value={formData.description}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, description: e.target.value }));
              setErrors(prev => ({ ...prev, description: undefined }));
            }}
            maxLength={MAX_DESCRIPTION_LENGTH}
            rows={3}
            disabled={isFormLoading}
            placeholder="Optional description for your budget..."
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

        {/* Color Picker */}
        <ColorPicker
          selectedColor={formData.color}
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
                {isEditMode ? 'Update Budget' : 'Create Budget'}
              </>
            )}
          </Button>
            
        </div>
      </form>
    </Modal>
  );
};

export default BudgetFormModal;