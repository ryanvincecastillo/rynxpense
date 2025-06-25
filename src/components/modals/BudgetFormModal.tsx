import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, 
  Palette, 
  Check, 
  AlertCircle, 
  Shuffle, 
  Save,
  Loader2,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';

// UI Components
import { 
  Button, 
  Input, 
  Textarea,
  Alert
} from '../ui';
import Modal from '../ui/Modal/Modal';

// Types
import { CreateBudgetForm, Budget } from '../../types';

// Utils
import { isValidHexColor } from '../../utils';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

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
] as const;

const DEFAULT_COLOR = '#3B82F6';
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

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

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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

const ColorPicker: React.FC<{
  selectedColor: string;
  onColorChange: (color: string) => void;
  showCustomInput: boolean;
  onToggleCustomInput: () => void;
  disabled?: boolean;
}> = ({ 
  selectedColor, 
  onColorChange, 
  showCustomInput, 
  onToggleCustomInput, 
  disabled = false 
}) => {
  const [customColorInput, setCustomColorInput] = useState(selectedColor);

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
            variant="ghost"
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
          {PRESET_COLORS.map((color) => (
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
              placeholder="#3B82F6"
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

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    color: DEFAULT_COLOR,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomColor, setShowCustomColor] = useState(false);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const isFormLoading = isLoading || isSubmitting;
  const isEditMode = Boolean(editingBudget);

  const isFormValid = useMemo(() => {
    return formData.name.trim().length > 0 && 
           formData.name.trim().length <= MAX_NAME_LENGTH &&
           formData.description.length <= MAX_DESCRIPTION_LENGTH &&
           isValidHexColor(formData.color);
  }, [formData]);

  // ========================================
  // FORM INITIALIZATION
  // ========================================

  useEffect(() => {
    if (isOpen) {
      if (editingBudget) {
        const newFormData = {
          name: editingBudget.name,
          description: editingBudget.description || '',
          color: editingBudget.color || DEFAULT_COLOR,
        };
        setFormData(newFormData);
        setShowCustomColor(!PRESET_COLORS.some(c => c.value === newFormData.color));
      } else {
        setFormData({
          name: '',
          description: '',
          color: DEFAULT_COLOR,
        });
        setShowCustomColor(false);
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, editingBudget]);

  // ========================================
  // VALIDATION
  // ========================================

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    // Name validation
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Budget name is required';
    } else if (trimmedName.length > MAX_NAME_LENGTH) {
      newErrors.name = `Budget name must be ${MAX_NAME_LENGTH} characters or less`;
    }

    // Description validation
    if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

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
      const submitData: CreateBudgetForm = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
      };

      await onSubmit(submitData);
      // Modal will be closed by parent component on success
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

        {/* Budget Name Field */}
        <div className="space-y-1">
          <Label htmlFor="budget-name" required>
            Budget Name
          </Label>
          <Input
            id="budget-name"
            type="text"
            value={formData.name}
            onChange={handleInputChange('name')}
            placeholder="e.g., Monthly Expenses, Vacation Fund"
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
                Choose a descriptive name for your budget
              </div>
            )}
            <span className="text-xs text-gray-400 ml-2">
              {formData.name.length}/{MAX_NAME_LENGTH}
            </span>
          </div>
        </div>

        {/* Budget Description Field */}
        <div className="space-y-1">
          <Label htmlFor="budget-description">
            Description
          </Label>
          <Textarea
            id="budget-description"
            value={formData.description}
            onChange={handleInputChange('description')}
            placeholder="Optional description for your budget..."
            disabled={isFormLoading}
            className={`
              ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              text-base sm:text-sm min-h-[80px] resize-none
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
              <span className="text-xs text-gray-500">
                Add notes about your budget goals or purpose
              </span>
            )}
            <span className="text-xs text-gray-400 ml-2">
              {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-1">
          <Label>Budget Color</Label>
          <ColorPicker
            selectedColor={formData.color}
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
            className="w-full sm:w-auto order-1 sm:order-2 min-w-[120px]"
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