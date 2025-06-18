import React, { useState, useEffect } from 'react';
import { FormModal, Input, Select } from '../ui';
import { CreateCategoryForm, BudgetCategory } from '../../types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryForm) => void;
  editingCategory?: BudgetCategory | null;
  isLoading?: boolean;
  budgetId: string;
}

// Color options for categories
const incomeColors = ['#22C55E', '#10B981', '#059669', '#047857', '#065F46'];
const expenseColors = ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'];

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCategory,
  isLoading = false,
  budgetId,
}) => {
  const [formData, setFormData] = useState<CreateCategoryForm>({
    budgetId,
    name: '',
    type: 'EXPENSE',
    plannedAmount: 0,
    color: '#EF4444',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when modal opens or editing category changes
  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        setFormData({
          budgetId,
          name: editingCategory.name,
          type: editingCategory.type,
          plannedAmount: editingCategory.plannedAmount,
          color: editingCategory.color,
        });
      } else {
        setFormData({
          budgetId,
          name: '',
          type: 'EXPENSE',
          plannedAmount: 0,
          color: '#EF4444',
        });
      }
      setErrors({});
    }
  }, [isOpen, editingCategory, budgetId]);

  // Update default color when type changes
  useEffect(() => {
    if (!editingCategory) {
      const defaultColor = formData.type === 'INCOME' ? incomeColors[0] : expenseColors[0];
      setFormData(prev => ({ ...prev, color: defaultColor }));
    }
  }, [formData.type, editingCategory]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Category type is required';
    }

    if (formData.plannedAmount < 0) {
      newErrors.plannedAmount = 'Planned amount must be positive';
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

  const handleInputChange = (field: keyof CreateCategoryForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const colorOptions = formData.type === 'INCOME' ? incomeColors : expenseColors;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCategory ? 'Edit Category' : 'Create Category'}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitText={editingCategory ? 'Update Category' : 'Create Category'}
      size="md"
    >
      <Input
        label="Category Name"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        error={errors.name}
        placeholder="Enter category name"
      />

      <Select
        label="Category Type"
        value={formData.type}
        onChange={(e) => handleInputChange('type', e.target.value as 'INCOME' | 'EXPENSE')}
        options={[
          { value: 'INCOME', label: 'Income' },
          { value: 'EXPENSE', label: 'Expense' },
        ]}
        error={errors.type}
      />

      <Input
        label="Planned Amount"
        type="number"
        value={formData.plannedAmount}
        onChange={(e) => handleInputChange('plannedAmount', parseFloat(e.target.value) || 0)}
        error={errors.plannedAmount}
        placeholder="0.00"
        min="0"
        step="0.01"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Color
        </label>
        <div className="flex space-x-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleInputChange('color', color)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                formData.color === color
                  ? 'border-gray-800 scale-110'
                  : 'border-gray-300 hover:border-gray-500'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </FormModal>
  );
};