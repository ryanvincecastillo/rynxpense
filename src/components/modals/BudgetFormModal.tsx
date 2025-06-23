import React, { useState, useEffect, useCallback } from 'react';
import { X, Palette, Check, AlertCircle, Copy, Save } from 'lucide-react';

// UI Components - using correct paths for your project
import { 
  Modal,
  Button, 
  Input, 
  Textarea,
  Alert
} from '../ui';

// Types - using correct path
import { CreateBudgetForm, Budget } from '../../types';

// Utils - using correct path and existing validation function
import { isValidHexColor } from '../../utils';

// Constants
const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F59E0B', // Yellow
];

const DEFAULT_COLOR = '#3B82F6';

// Simple color generation function (since generateRandomColor might not exist)
const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

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

// Simple Label component (if it doesn't exist)
const Label: React.FC<{ htmlFor?: string; className?: string; children: React.ReactNode }> = ({
  htmlFor,
  className = '',
  children
}) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
);

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingBudget,
  isLoading = false,
}) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    color: DEFAULT_COLOR,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomColor, setShowCustomColor] = useState(false);

  // Initialize form when modal opens or editing budget changes
  useEffect(() => {
    if (isOpen) {
      if (editingBudget) {
        setFormData({
          name: editingBudget.name,
          description: editingBudget.description || '',
          color: editingBudget.color || DEFAULT_COLOR,
        });
        // Check if the editing budget uses a custom color
        setShowCustomColor(!PRESET_COLORS.includes(editingBudget.color || ''));
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

  // Validation function
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Budget name must be 100 characters or less';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Budget name must be at least 2 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
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

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, description: value }));
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: undefined }));
    }
  }, [errors.description]);

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

  // Form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
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
  }, [formData, validateForm, isSubmitting, onSubmit]);

  // Generate random color
  const handleGenerateRandomColor = useCallback(() => {
    const randomColor = generateRandomColor();
    handleColorChange(randomColor);
    setShowCustomColor(true);
  }, [handleColorChange]);

  // Reset form
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
      title={editingBudget ? 'Edit Budget' : 'Create Budget'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <Alert>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-red-600">{errors.general}</p>
            </div>
          </Alert>
        )}

        {/* Budget Name */}
        <div className="space-y-2">
          <Label htmlFor="budget-name">
            Budget Name *
          </Label>
          <Input
            id="budget-name"
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="e.g., Monthly Expenses, Vacation Fund"
            disabled={isFormLoading}
            className={errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            maxLength={100}
            autoFocus
          />
          {errors.name && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.name}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {formData.name.length}/100 characters
          </p>
        </div>

        {/* Budget Description */}
        <div className="space-y-2">
          <Label htmlFor="budget-description">
            Description
          </Label>
          <Textarea
            id="budget-description"
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Optional description for your budget..."
            disabled={isFormLoading}
            className={errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
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

        {/* Color Selection */}
        <div className="space-y-3">
          <Label>
            Budget Color *
          </Label>
          
          {/* Preset Colors */}
          <div className="grid grid-cols-6 gap-2">
            {PRESET_COLORS.map((color) => (
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
                  placeholder="#3B82F6"
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
                {formData.name || 'Budget Name'}
              </p>
              <p className="text-xs text-gray-600">Preview</p>
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
            {editingBudget 
              ? (isFormLoading ? 'Updating...' : 'Update Budget')
              : (isFormLoading ? 'Creating...' : 'Create Budget')
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetFormModal;