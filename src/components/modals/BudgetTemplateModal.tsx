// src/components/modals/BudgetTemplateModal.tsx
import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  TrendingUp, 
  TrendingDown,
  X,
  Loader2,
  Users,
  GraduationCap,
  User,
  Building2
} from 'lucide-react';
import { Button } from '../ui/Navigation/Button';
import { BUDGET_TEMPLATES, BudgetTemplate, CreateBudgetWithTemplateForm } from '../../types/template';
import Modal from '../ui/Modal/Modal';

interface BudgetTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBudget: (data: CreateBudgetWithTemplateForm) => void;
  isLoading?: boolean;
}

interface TemplateStepProps {
  selectedTemplateId: string | null;
  onTemplateSelect: (templateId: string | null) => void;
  onNext: () => void;
}

interface BudgetFormStepProps {
  selectedTemplateId: string | null;
  onSubmit: (data: CreateBudgetWithTemplateForm) => void;
  onBack: () => void;
  isLoading: boolean;
}

// Template Selection Step Component
const TemplateSelectionStep: React.FC<TemplateStepProps> = ({
  selectedTemplateId,
  onTemplateSelect,
  onNext
}) => {
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      '👤': <User className="w-6 h-6" />,
      '🎓': <GraduationCap className="w-6 h-6" />,
      '👨‍👩‍👧‍👦': <Users className="w-6 h-6" />,
      '🏢': <Building2 className="w-6 h-6" />
    };
    return iconMap[iconName] || <User className="w-6 h-6" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTemplatePreview = (template: BudgetTemplate) => {
    const incomeCategories = template.categories.filter(c => c.type === 'INCOME');
    const expenseCategories = template.categories.filter(c => c.type === 'EXPENSE');
    const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
    const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
    
    return {
      incomeCount: incomeCategories.length,
      expenseCount: expenseCategories.length,
      transactionCount: template.sampleTransactions.length,
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Budget Templates
        </h2>
        <p className="text-gray-600">
          Choose a pre-built template to get started quickly with categories and sample transactions
        </p>
      </div>

      {/* Template Cards */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {BUDGET_TEMPLATES.map((template) => {
          const preview = getTemplatePreview(template);
          const isSelected = selectedTemplateId === template.id;
          
          return (
            <div
              key={template.id}
              onClick={() => onTemplateSelect(template.id)}
              className={`
                relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="bg-blue-500 text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-4">
                {/* Template Icon */}
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: template.color }}
                >
                  {getIconComponent(template.icon)}
                </div>
                
                {/* Template Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Template Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs font-medium">INCOME</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(preview.totalIncome)}
                      </p>
                      <p className="text-xs text-gray-500">{preview.incomeCount} categories</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-red-600 mb-1">
                        <TrendingDown className="w-3 h-3" />
                        <span className="text-xs font-medium">EXPENSES</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(preview.totalExpenses)}
                      </p>
                      <p className="text-xs text-gray-500">{preview.expenseCount} categories</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-xs font-medium">NET</span>
                      </div>
                      <p className={`text-sm font-semibold ${preview.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(preview.netAmount)}
                      </p>
                      <p className="text-xs text-gray-500">{preview.transactionCount} transactions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          variant="secondary"
          onClick={() => onTemplateSelect(null)}
          className="px-6"
        >
          Skip Templates
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedTemplateId}
          className="px-6"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Budget Form Step Component
const BudgetFormStep: React.FC<BudgetFormStepProps> = ({
  selectedTemplateId,
  onSubmit,
  onBack,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const selectedTemplate = selectedTemplateId 
    ? BUDGET_TEMPLATES.find(t => t.id === selectedTemplateId)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
      applyTemplate: !!selectedTemplateId,
      templateId: selectedTemplateId || undefined
    });
  };

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create Your Budget
        </h2>
        {selectedTemplate && (
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Using template: <strong>{selectedTemplate.name}</strong></span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Budget Name */}
        <div>
          <label htmlFor="budget-name" className="block text-sm font-medium text-gray-700 mb-2">
            Budget Name *
          </label>
          <input
            id="budget-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Monthly Budget, Vacation Fund..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="budget-description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="budget-description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of this budget (optional)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Budget Color
          </label>
          <div className="grid grid-cols-8 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, color }))}
                className={`
                  w-8 h-8 rounded-full border-2 transition-all duration-200
                  ${formData.color === color 
                    ? 'border-gray-900 scale-110 shadow-lg' 
                    : 'border-gray-300 hover:border-gray-500'
                  }
                `}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Template Preview */}
        {selectedTemplate && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">What will be created:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Income Categories:</span>
                <span className="font-medium">
                  {selectedTemplate.categories.filter(c => c.type === 'INCOME').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expense Categories:</span>
                <span className="font-medium">
                  {selectedTemplate.categories.filter(c => c.type === 'EXPENSE').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sample Transactions:</span>
                <span className="font-medium">{selectedTemplate.sampleTransactions.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={!formData.name.trim() || isLoading}
            className="px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Budget
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Main Modal Component
export const BudgetTemplateModal: React.FC<BudgetTemplateModalProps> = ({
  isOpen,
  onClose,
  onCreateBudget,
  isLoading = false
}) => {
  const [step, setStep] = useState<'template' | 'form'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setStep('template');
      setSelectedTemplateId(null);
    }
  }, [isOpen]);

  const handleTemplateSelect = (templateId: string | null) => {
    setSelectedTemplateId(templateId);
    
    // If user selects "Skip Templates", go directly to form
    if (templateId === null) {
      setStep('form');
    }
  };

  const handleNext = () => {
    setStep('form');
  };

  const handleBack = () => {
    setStep('template');
  };

  const handleSubmit = (data: CreateBudgetWithTemplateForm) => {
    onCreateBudget(data);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className="max-w-2xl"
    >
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Content */}
        <div className="p-6">
          {step === 'template' ? (
            <TemplateSelectionStep
              selectedTemplateId={selectedTemplateId}
              onTemplateSelect={handleTemplateSelect}
              onNext={handleNext}
            />
          ) : (
            <BudgetFormStep
              selectedTemplateId={selectedTemplateId}
              onSubmit={handleSubmit}
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};