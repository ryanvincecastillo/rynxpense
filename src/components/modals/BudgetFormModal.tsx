import React, { useState, useEffect } from 'react';
import { FormModal, Input, Textarea } from '../ui';
import { CreateBudgetForm, Budget } from '../../types';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBudgetForm) => void;
  editingBudget?: Budget | null;
  isLoading?: boolean;
}

// Color options for budgets
const colorOptions = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingBudget,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateBudgetForm>({
    name: '',
    description: '',
    color: colorOptions[0],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when modal opens or editing budget changes
  useEffect(() => {
    if (isOpen) {
      if (editingBudget) {
        setFormData({
          name: editingBudget.name,
          description: editingBudget.description || '',
          color: editingBudget.color,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          color: colorOptions[0],
        });
      }
      setErrors({});
    }
  }, [isOpen, editingBudget]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Budget name is too long';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description is too long';
    }

    if (!formData.color || !/^#[0-9A-F]{6}$/i.test(formData.color)) {
      newErrors.color = 'Please select a valid color';
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

  const handleInputChange = (field: keyof CreateBudgetForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBudget ? 'Edit Budget' : 'Create Budget'}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitText={editingBudget ? 'Update Budget' : 'Create Budget'}
      size="md"
    >
      <Input
        label="Budget Name"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        error={errors.name}
        placeholder="Enter budget name"
        required
      />

      <Textarea
        label="Description (Optional)"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        error={errors.description}
        placeholder="Brief description of this budget"
        rows={3}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Color
        </label>
        <div className="grid grid-cols-5 gap-3">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleInputChange('color', color)}
              className={`w-12 h-12 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.color === color
                  ? 'border-gray-800 scale-110 shadow-lg'
                  : 'border-gray-300 hover:border-gray-500 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              title={`Select ${color} color`}
            />
          ))}
        </div>
        {errors.color && (
          <p className="text-sm text-red-600">{errors.color}</p>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: formData.color }}
          />
          <div>
            <p className="font-medium text-gray-900">
              {formData.name || 'Budget Name'}
            </p>
            {formData.description && (
              <p className="text-sm text-gray-600">{formData.description}</p>
            )}
          </div>
        </div>
      </div>
    </FormModal>
  );
};