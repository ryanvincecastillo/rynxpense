import React, { useState, useEffect } from 'react';
import { FormModal, Input, Select } from '../ui';
import { CreateCategoryForm, BudgetCategory } from '../../types';
import { CATEGORY_COLORS, DEFAULT_COLORS } from '../../constants/colors';
import { CurrencyInput } from '../forms/CurrencyInput';
import { ColorPicker } from '../forms/ColorPicker';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryForm) => void;
  editingCategory?: BudgetCategory | null;
  isLoading?: boolean;
  budgetId: string;
}

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
  const colorOptions = formData.type === 'INCOME' ? CATEGORY_COLORS.income : CATEGORY_COLORS.expense;

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
      const defaultColor = formData.type === 'INCOME' ? DEFAULT_COLORS.incomeCategory : DEFAULT_COLORS.expenseCategory;
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

      <CurrencyInput
        label="Planned Amount"
        value={formData.plannedAmount}
        onChange={(value: number) => handleInputChange('plannedAmount', value)}
        error={errors.plannedAmount}
        placeholder="0.00"
      />

     <ColorPicker
        label="Color"
        value={formData.color ?? ''}
        onChange={(color: string) => handleInputChange('color', color)}
        colors={colorOptions.slice()}
        error={errors.color}
      />
    </FormModal>
  );
};