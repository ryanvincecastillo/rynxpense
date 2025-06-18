import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, X, Target } from 'lucide-react';

// Form data type
interface CategoryFormData {
  name: string;
  type: 'INCOME' | 'EXPENSE' | '';
  plannedAmount: number;
  color: string;
}

// Compact color palettes for mobile
const colorPalettes = {
  INCOME: ['#22C55E', '#10B981', '#3B82F6', '#059669', '#0EA5E9', '#06B6D4'],
  EXPENSE: ['#EF4444', '#DC2626', '#F97316', '#F59E0B', '#8B5CF6', '#EC4899']
};

// Enhanced Modal Component - Mobile Optimized
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      {/* Mobile: Bottom sheet style, Desktop: Center modal */}
      <div className="bg-white w-full max-w-md sm:rounded-2xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-2 sm:slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Compact Input Component
interface InputProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, value, onChange, error, type = "text", placeholder, icon }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input 
        type={type}
        value={value || ''}
        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        placeholder={placeholder}
        className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      />
    </div>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  size?: 'sm' | 'md';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading, size = 'md', ...props }) => (
  <button
    className={`font-medium rounded-lg transition-all flex items-center justify-center ${
      size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-sm'
    } ${
      variant === 'secondary' 
        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
    } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
    disabled={isLoading}
    {...props}
  >
    {isLoading ? 'Saving...' : children}
  </button>
);

// Main Category Modal Component
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  editingCategory?: any;
  isLoading?: boolean;
  preselectedType?: 'INCOME' | 'EXPENSE';
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCategory,
  isLoading = false,
  preselectedType
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    type: '',
    plannedAmount: 0,
    color: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        // Editing existing category
        setFormData({
          name: editingCategory.name,
          type: editingCategory.type,
          plannedAmount: editingCategory.plannedAmount,
          color: editingCategory.color,
        });
      } else {
        // Creating new category with preselected type
        const defaultType = preselectedType || '';
        const defaultColor = defaultType ? colorPalettes[defaultType][0] : '';
        
        setFormData({
          name: '',
          type: defaultType,
          plannedAmount: 0,
          color: defaultColor,
        });
      }
      setErrors({});
    }
  }, [isOpen, editingCategory, preselectedType]);

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Category type is required';
    }
    
    if (formData.plannedAmount < 0) {
      newErrors.plannedAmount = 'Amount must be positive';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', type: '', plannedAmount: 0, color: '' });
    setErrors({});
    onClose();
  };

  const updateField = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      // Auto-set color when type changes
      ...(field === 'type' && value ? { color: colorPalettes[value as 'INCOME' | 'EXPENSE'][0] } : {})
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const currentColors = formData.type ? colorPalettes[formData.type as 'INCOME' | 'EXPENSE'] : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingCategory ? 'Edit Category' : 'Create Category'}
    >
      <div className="space-y-4">
        {/* Type Selection - Compact for mobile */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Category Type *
            {preselectedType && !editingCategory && (
              <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                Pre-selected
              </span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateField('type', 'INCOME')}
              disabled={editingCategory && editingCategory.type !== 'INCOME'}
              className={`p-3 border-2 rounded-lg transition-all ${
                formData.type === 'INCOME'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : editingCategory && editingCategory.type !== 'INCOME'
                  ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <TrendingUp className={`h-5 w-5 ${
                  formData.type === 'INCOME' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <span className="text-sm font-medium">Income</span>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => updateField('type', 'EXPENSE')}
              disabled={editingCategory && editingCategory.type !== 'EXPENSE'}
              className={`p-3 border-2 rounded-lg transition-all ${
                formData.type === 'EXPENSE'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : editingCategory && editingCategory.type !== 'EXPENSE'
                  ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <TrendingDown className={`h-5 w-5 ${
                  formData.type === 'EXPENSE' ? 'text-red-600' : 'text-gray-400'
                }`} />
                <span className="text-sm font-medium">Expense</span>
              </div>
            </button>
          </div>
          {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
        </div>

        {/* Category Name */}
        <Input
          label="Category Name *"
          value={formData.name}
          onChange={(value) => updateField('name', value)}
          error={errors.name}
          placeholder="e.g., Salary, Groceries, Utilities"
        />

        {/* Planned Amount */}
        <Input
          label="Planned Amount"
          type="number"
          value={formData.plannedAmount}
          onChange={(value) => updateField('plannedAmount', value)}
          error={errors.plannedAmount}
          placeholder="0.00"
          icon={<Target className="h-4 w-4" />}
        />

        {/* Color Selection - Compact grid */}
        {currentColors.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {currentColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateField('color', color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? 'border-gray-600 scale-110'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        {formData.name && formData.type && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Preview:</p>
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: formData.color }}
              />
              <span className="text-sm font-medium">{formData.name}</span>
              <span className="text-xs text-gray-500">
                ({formData.type.toLowerCase()})
              </span>
              {formData.plannedAmount > 0 && (
                <span className="text-xs text-gray-600 ml-auto">
                  {formatCurrency(formData.plannedAmount)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-gray-100">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            isLoading={isLoading}
            className="flex-1"
          >
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryModal;