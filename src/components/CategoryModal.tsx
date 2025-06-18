import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Palette, 
  X,
  CheckCircle,
  Target
} from 'lucide-react';

// Form data type
interface CategoryFormData {
  name: string;
  type: 'INCOME' | 'EXPENSE' | '';
  plannedAmount: number;
  color: string;
}

// Compact color palettes - fewer colors, smaller selection
const colorPalettes = {
  INCOME: [
    '#22C55E', // Success Green
    '#10B981', // Emerald  
    '#059669', // Teal Green
    '#3B82F6', // Blue
    '#0EA5E9', // Sky Blue
    '#06B6D4'  // Cyan
  ],
  EXPENSE: [
    '#EF4444', // Red
    '#DC2626', // Dark Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899'  // Pink
  ]
};

// Mock UI components with enhanced styling
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  size?: 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className={`bg-white rounded-2xl shadow-2xl ${
        size === 'lg' ? 'max-w-2xl w-full' : 'max-w-md w-full'
      } max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
          >
            <X className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  value: any;
  onChange: (value: any) => void;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, value, onChange, icon, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-400 ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
        }`}
        {...props} 
      />
    </div>
    {error && (
      <div className="flex items-center space-x-2 text-red-600 animate-in slide-in-from-top-1 duration-200">
        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
        <p className="text-sm font-medium">{error}</p>
      </div>
    )}
  </div>
);

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  error?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Select: React.FC<SelectProps> = ({ label, error, options, value, onChange, icon, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <select 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-400 appearance-none bg-no-repeat bg-right ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
        }`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.5em 1.5em',
        }}
        {...props}
      >
        <option value="">Choose an option...</option>
        {options?.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
    {error && (
      <div className="flex items-center space-x-2 text-red-600 animate-in slide-in-from-top-1 duration-200">
        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
        <p className="text-sm font-medium">{error}</p>
      </div>
    )}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading, icon, ...props }) => (
  <button
    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
      variant === 'secondary' 
        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 active:scale-95' 
        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
    } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
    disabled={isLoading}
    {...props}
  >
    {icon && <span>{icon}</span>}
    <span>{isLoading ? 'Processing...' : children}</span>
  </button>
);

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  editingCategory?: any;
  budgetId: string;
  isLoading?: boolean;
  preselectedType?: 'INCOME' | 'EXPENSE'; // Add this new prop
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCategory,
  budgetId,
  isLoading = false,
  preselectedType, // Add this parameter
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    type: '',
    plannedAmount: 0,
    color: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when editing or when modal opens with preselected type
  useEffect(() => {
    if (editingCategory && isOpen) {
      // Editing existing category
      setFormData({
        name: editingCategory.name,
        type: editingCategory.type,
        plannedAmount: editingCategory.plannedAmount,
        color: editingCategory.color,
      });
      setErrors({});
    } else if (!editingCategory && isOpen) {
      // Creating new category
      setFormData({
        name: '',
        type: preselectedType || '', // Set preselected type if provided
        plannedAmount: 0,
        color: '',
      });
      setErrors({});
    }
  }, [editingCategory, isOpen, preselectedType]);

  // Set default color when type changes (including preselected type)
  useEffect(() => {
    if (formData.type && !formData.color) {
      const defaultColor = colorPalettes[formData.type as 'INCOME' | 'EXPENSE'][0];
      setFormData(prev => ({ ...prev, color: defaultColor }));
    }
  }, [formData.type, formData.color]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Simple validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name too long (max 100 characters)';
    }
    
    if (!formData.type) {
      newErrors.type = 'Category type is required';
    }
    
    if (formData.plannedAmount < 0) {
      newErrors.plannedAmount = 'Planned amount must be positive';
    }
    
    if (formData.color && !/^#[0-9A-F]{6}$/i.test(formData.color)) {
      newErrors.color = 'Invalid color format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitClick = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: '',
      plannedAmount: 0,
      color: '',
    });
    setErrors({});
    onClose();
  };

  const updateField = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Get current color palette
  const currentColors = formData.type ? colorPalettes[formData.type as 'INCOME' | 'EXPENSE'] : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingCategory ? 'Edit Category' : 'Create New Category'}
      size="md"
    >
      <div className="space-y-5">
        {/* Type Selection - Enhanced with auto-selection feedback */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">Category Type</label>
            {preselectedType && !editingCategory && (
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-600 font-medium">Auto-selected</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateField('type', 'INCOME')}
              disabled={editingCategory && editingCategory.type !== 'INCOME'} // Disable if editing different type
              className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                formData.type === 'INCOME'
                  ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg scale-105'
                  : editingCategory && editingCategory.type !== 'INCOME'
                  ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 bg-gray-50 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.type === 'INCOME' ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <TrendingUp className={`h-5 w-5 ${
                    formData.type === 'INCOME' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <span className={`text-sm font-semibold ${
                  formData.type === 'INCOME' ? 'text-green-700' : 'text-gray-600'
                }`}>
                  Income
                </span>
                {preselectedType === 'INCOME' && !editingCategory && (
                  <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Pre-selected
                  </div>
                )}
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => updateField('type', 'EXPENSE')}
              disabled={editingCategory && editingCategory.type !== 'EXPENSE'} // Disable if editing different type
              className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                formData.type === 'EXPENSE'
                  ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-50 shadow-lg scale-105'
                  : editingCategory && editingCategory.type !== 'EXPENSE'
                  ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 bg-gray-50 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.type === 'EXPENSE' ? 'bg-red-500' : 'bg-gray-300'
                }`}>
                  <TrendingDown className={`h-5 w-5 ${
                    formData.type === 'EXPENSE' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <span className={`text-sm font-semibold ${
                  formData.type === 'EXPENSE' ? 'text-red-700' : 'text-gray-600'
                }`}>
                  Expense
                </span>
                {preselectedType === 'EXPENSE' && !editingCategory && (
                  <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    Pre-selected
                  </div>
                )}
              </div>
            </button>
          </div>
          {errors.type && (
            <div className="flex items-center space-x-2 text-red-600 animate-in slide-in-from-top-1 duration-200">
              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
              <p className="text-sm font-medium">{errors.type}</p>
            </div>
          )}
        </div>

        {/* Category Name */}
        <Input
          label="Category Name"
          placeholder="e.g., Salary, Groceries, Utilities"
          error={errors.name}
          value={formData.name}
          onChange={(value) => updateField('name', value)}
          icon={<Palette className="h-4 w-4" />}
        />

        {/* Planned Amount */}
        <Input
          label="Planned Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.plannedAmount}
          value={formData.plannedAmount}
          onChange={(value) => updateField('plannedAmount', parseFloat(value) || 0)}
          icon={<span className="text-sm font-bold">₱</span>}
        />

        {/* Enhanced Color Selection */}
        {formData.type && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">
                Choose Color
              </label>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Palette className="h-3 w-3" />
                <span>{formData.type === 'INCOME' ? 'Income' : 'Expense'} Palette</span>
              </div>
            </div>
            
            {/* Color Grid - Beautiful and interactive */}
            <div className="grid grid-cols-6 gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
              {currentColors.map((color, index) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateField('color', color)}
                  className={`relative w-10 h-10 rounded-xl border-3 transition-all duration-300 hover:scale-110 hover:rotate-6 transform ${
                    formData.color === color
                      ? 'border-white shadow-2xl scale-110 rotate-6'
                      : 'border-white/50 shadow-lg hover:shadow-xl'
                  }`}
                  style={{ 
                    backgroundColor: color,
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {formData.color === color && (
                    <div className="absolute inset-0 rounded-xl bg-white/20 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white drop-shadow-lg animate-in zoom-in duration-200" />
                    </div>
                  )}
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Beautiful Preview Card */}
        {formData.name && formData.color && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div
                      className="w-6 h-6 rounded-full shadow-lg ring-4 ring-white"
                      style={{ backgroundColor: formData.color }}
                    />
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{formData.name}</h4>
                    <div className="flex items-center space-x-3 text-sm">
                      {formData.type === 'INCOME' ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-semibold">Income Category</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-red-600">
                          <TrendingDown className="h-4 w-4" />
                          <span className="font-semibold">Expense Category</span>
                        </div>
                      )}
                      <span className="text-gray-400">•</span>
                      <span className="font-bold text-gray-700">{formatCurrency(formData.plannedAmount || 0)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-xl">
                  <Target className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: '0%', animation: 'grow 2s ease-out infinite alternate' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Beautiful Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            icon={<X className="h-4 w-4" />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitClick} 
            isLoading={isLoading}
            icon={formData.type === 'INCOME' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          >
            {editingCategory ? 'Update Category' : 'Create Category'}
          </Button>
        </div>

        {/* Add custom CSS for animations */}
        <style>{`
          @keyframes grow {
            from { width: 0%; }
            to { width: 75%; }
          }
          .animate-in {
            animation-fill-mode: both;
          }
          .fade-in {
            animation: fadeIn 0.3s ease-out;
          }
          .slide-in-from-bottom-4 {
            animation: slideInFromBottom 0.3s ease-out;
          }
          .slide-in-from-top-1 {
            animation: slideInFromTop 0.2s ease-out;
          }
          .zoom-in {
            animation: zoomIn 0.2s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInFromBottom {
            from { transform: translateY(16px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideInFromTop {
            from { transform: translateY(-4px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes zoomIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </Modal>
  );
};

export default CategoryModal;