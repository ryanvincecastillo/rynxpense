import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  TrendingUp, 
  TrendingDown, 
  Palette, 
  Target, 
  DollarSign,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  X,
  Sparkles,
  PieChart,
  Calculator
} from 'lucide-react';
import { Button, Input, Modal, Badge } from './ui';

// Form validation schema
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name too long'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Category type is required' }),
  plannedAmount: z.number().min(0, 'Planned amount must be positive').optional().default(0),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// Enhanced color palettes
const colorPalettes = {
  INCOME: {
    name: 'Income Colors',
    description: 'Calming greens and blues for income sources',
    colors: [
      { color: '#22C55E', name: 'Success Green', popular: true },
      { color: '#10B981', name: 'Emerald', popular: true },
      { color: '#059669', name: 'Teal Green' },
      { color: '#047857', name: 'Dark Teal' },
      { color: '#065F46', name: 'Forest Green' },
      { color: '#3B82F6', name: 'Blue', popular: true },
      { color: '#1D4ED8', name: 'Royal Blue' },
      { color: '#1E40AF', name: 'Navy Blue' },
    ]
  },
  EXPENSE: {
    name: 'Expense Colors',
    description: 'Warm tones for expense categories',
    colors: [
      { color: '#EF4444', name: 'Vibrant Red', popular: true },
      { color: '#DC2626', name: 'Classic Red', popular: true },
      { color: '#B91C1C', name: 'Deep Red' },
      { color: '#991B1B', name: 'Dark Red' },
      { color: '#F97316', name: 'Orange', popular: true },
      { color: '#EA580C', name: 'Dark Orange' },
      { color: '#8B5CF6', name: 'Purple' },
      { color: '#7C3AED', name: 'Deep Purple' },
    ]
  }
};

// Common category suggestions
const categorySuggestions = {
  INCOME: [
    { name: 'Salary', icon: '💼', description: 'Regular employment income' },
    { name: 'Freelance', icon: '💻', description: 'Project-based work' },
    { name: 'Business Income', icon: '🏢', description: 'Revenue from business' },
    { name: 'Investments', icon: '📈', description: 'Dividends and returns' },
    { name: 'Rental Income', icon: '🏠', description: 'Property rental' },
    { name: 'Side Hustle', icon: '🚀', description: 'Additional income sources' },
    { name: 'Bonus', icon: '🎁', description: 'Performance bonuses' },
    { name: 'Commission', icon: '💰', description: 'Sales commissions' },
  ],
  EXPENSE: [
    { name: 'Housing', icon: '🏡', description: 'Rent, mortgage, utilities' },
    { name: 'Food & Dining', icon: '🍽️', description: 'Groceries and restaurants' },
    { name: 'Transportation', icon: '🚗', description: 'Car, gas, public transport' },
    { name: 'Healthcare', icon: '🏥', description: 'Medical expenses' },
    { name: 'Entertainment', icon: '🎬', description: 'Movies, games, hobbies' },
    { name: 'Shopping', icon: '🛍️', description: 'Clothing and personal items' },
    { name: 'Education', icon: '📚', description: 'Courses and learning' },
    { name: 'Insurance', icon: '🛡️', description: 'Life, health, auto insurance' },
    { name: 'Savings', icon: '🐷', description: 'Emergency fund, investments' },
    { name: 'Utilities', icon: '⚡', description: 'Electricity, water, internet' },
    { name: 'Subscriptions', icon: '📱', description: 'Streaming, software, apps' },
    { name: 'Personal Care', icon: '💅', description: 'Haircuts, cosmetics' },
  ]
};

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  editingCategory?: any;
  budgetId: string;
  isLoading?: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCategory,
  budgetId,
  isLoading = false,
}) => {
  const [step, setStep] = useState<'type' | 'details' | 'suggestions'>('type');
  const [selectedType, setSelectedType] = useState<'INCOME' | 'EXPENSE' | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      plannedAmount: 0,
    },
  });

  const watchedType = watch('type');
  const watchedColor = watch('color');
  const watchedName = watch('name');
  const watchedAmount = watch('plannedAmount');

  // Initialize form when editing
  useEffect(() => {
    if (editingCategory && isOpen) {
      reset({
        name: editingCategory.name,
        type: editingCategory.type,
        plannedAmount: editingCategory.plannedAmount,
        color: editingCategory.color,
      });
      setSelectedType(editingCategory.type);
      setStep('details');
    } else if (!editingCategory && isOpen) {
      reset({
        plannedAmount: 0,
      });
      setSelectedType(null);
      setStep('type');
      setShowSuggestions(false);
    }
  }, [editingCategory, isOpen, reset]);

  // Update color when type changes
  useEffect(() => {
    if (watchedType && !watchedColor && !editingCategory) {
      const defaultColor = colorPalettes[watchedType].colors[0].color;
      setValue('color', defaultColor);
    }
  }, [watchedType, watchedColor, setValue, editingCategory]);

  // Handle type selection
  const handleTypeSelect = (type: 'INCOME' | 'EXPENSE') => {
    setSelectedType(type);
    setValue('type', type);
    setStep('details');
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: any) => {
    setValue('name', suggestion.name);
    setShowSuggestions(false);
  };

  // Get current color palette
  const currentPalette = watchedType ? colorPalettes[watchedType] : null;

  // Calculate monthly impact
  const monthlyImpact = watchedAmount || 0;
  const annualImpact = monthlyImpact * 12;

  const handleFormSubmit = (data: CategoryFormData) => {
    onSubmit(data);
  };

  const handleClose = () => {
    setStep('type');
    setSelectedType(null);
    setShowSuggestions(false);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingCategory ? 'Edit Category' : 'Create New Category'}
      size="lg"
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        {!editingCategory && (
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className={`flex items-center space-x-2 ${step === 'type' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'type' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Type</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${step === 'details' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Details</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Step 1: Type Selection */}
          {step === 'type' && !editingCategory && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What type of category are you creating?
                </h3>
                <p className="text-gray-600">
                  Choose whether this category tracks money coming in or going out
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Income Option */}
                <button
                  type="button"
                  onClick={() => handleTypeSelect('INCOME')}
                  className="group relative p-8 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Income Category</h4>
                      <p className="text-sm text-gray-600">Money coming in</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Salary and wages</p>
                    <p>• Business revenue</p>
                    <p>• Investment returns</p>
                    <p>• Side income</p>
                  </div>
                </button>

                {/* Expense Option */}
                <button
                  type="button"
                  onClick={() => handleTypeSelect('EXPENSE')}
                  className="group relative p-8 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-200 text-left"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Expense Category</h4>
                      <p className="text-sm text-gray-600">Money going out</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Housing and utilities</p>
                    <p>• Food and dining</p>
                    <p>• Transportation</p>
                    <p>• Entertainment</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  watchedType === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {watchedType === 'INCOME' ? 
                    <TrendingUp className={`h-5 w-5 ${watchedType === 'INCOME' ? 'text-green-600' : 'text-red-600'}`} /> :
                    <TrendingDown className={`h-5 w-5 ${watchedType === 'EXPENSE' ? 'text-red-600' : 'text-green-600'}`} />
                  }
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {watchedType === 'INCOME' ? 'Income' : 'Expense'} Category Details
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configure your category settings and budget
                  </p>
                </div>
              </div>

              {/* Category Name with Suggestions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Category Name *
                  </label>
                  {!editingCategory && (
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Lightbulb className="h-4 w-4" />
                      <span>Suggestions</span>
                    </button>
                  )}
                </div>
                
                <Input
                  placeholder="e.g., Salary, Groceries, Utilities"
                  error={errors.name?.message}
                  {...register('name')}
                />

                {/* Suggestions Panel */}
                {showSuggestions && watchedType && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Popular {watchedType === 'INCOME' ? 'Income' : 'Expense'} Categories
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {categorySuggestions[watchedType].map((suggestion) => (
                        <button
                          key={suggestion.name}
                          type="button"
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="flex items-center space-x-2 p-2 text-left text-sm rounded-lg hover:bg-white hover:shadow-sm transition-all"
                        >
                          <span className="text-lg">{suggestion.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{suggestion.name}</p>
                            <p className="text-xs text-gray-500 truncate">{suggestion.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Planned Amount */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Planned Monthly Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                    error={errors.plannedAmount?.message}
                    {...register('plannedAmount', { valueAsNumber: true })}
                  />
                </div>
                
                {/* Impact Preview */}
                {monthlyImpact > 0 && (
                  <div className={`p-3 rounded-lg ${
                    watchedType === 'INCOME' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calculator className={`h-4 w-4 ${watchedType === 'INCOME' ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-sm font-medium ${watchedType === 'INCOME' ? 'text-green-800' : 'text-red-800'}`}>
                        Budget Impact
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className={`${watchedType === 'INCOME' ? 'text-green-700' : 'text-red-700'}`}>Monthly</p>
                        <p className={`font-semibold ${watchedType === 'INCOME' ? 'text-green-800' : 'text-red-800'}`}>
                          ₱{monthlyImpact.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className={`${watchedType === 'INCOME' ? 'text-green-700' : 'text-red-700'}`}>Annual</p>
                        <p className={`font-semibold ${watchedType === 'INCOME' ? 'text-green-800' : 'text-red-800'}`}>
                          ₱{annualImpact.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Color Selection */}
              {currentPalette && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Palette className="h-5 w-5 text-gray-600" />
                    <label className="block text-sm font-medium text-gray-700">
                      Category Color
                    </label>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-900">{currentPalette.name}</h5>
                      <p className="text-xs text-gray-600">{currentPalette.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3">
                      {currentPalette.colors.map((colorOption) => (
                        <button
                          key={colorOption.color}
                          type="button"
                          onClick={() => setValue('color', colorOption.color)}
                          className={`group relative w-full aspect-square rounded-lg border-2 transition-all ${
                            watchedColor === colorOption.color
                              ? 'border-gray-400 scale-110 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: colorOption.color }}
                        >
                          {colorOption.popular && (
                            <div className="absolute -top-1 -right-1">
                              <Sparkles className="h-3 w-3 text-yellow-500" />
                            </div>
                          )}
                          {watchedColor === colorOption.color && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <CheckCircle className="h-6 w-6 text-white drop-shadow-lg" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity truncate">
                            {colorOption.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Card */}
              {watchedName && watchedColor && (
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <PieChart className="h-4 w-4" />
                    <span>Preview</span>
                  </h4>
                  <div className="p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: watchedColor }}
                      />
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{watchedName}</h5>
                        <Badge variant={watchedType === 'INCOME' ? 'success' : 'error'} size="sm">
                          {watchedType}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Planned Amount</span>
                        <span className="font-medium text-gray-900">
                          ₱{(monthlyImpact || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Current Amount</span>
                        <span className={`font-semibold ${watchedType === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                          ₱0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <div className="flex space-x-3">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              {step === 'details' && !editingCategory && (
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => setStep('type')}
                >
                  Back
                </Button>
              )}
            </div>
            
            {step === 'details' && (
              <Button
                type="submit"
                isLoading={isSubmitting || isLoading}
                disabled={!watchedName || !watchedType}
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CategoryModal;