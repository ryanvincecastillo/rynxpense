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
import { BUDGET_TEMPLATES, BudgetTemplate, CreateBudgetWithTemplateForm } from '../../types/template';
import Modal from '../ui/Modal/Modal';
import { Button } from '../ui';

interface BudgetTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBudget: (data: CreateBudgetWithTemplateForm) => void;
  isLoading?: boolean;
}

interface TemplateStepProps {
  selectedTemplateId: string | null;
  onTemplateSelect: (templateId: string | null) => void;
  onCreateBudget: (templateId: string) => void;
  isLoading: boolean;
}

// Template Selection Step Component
const TemplateSelectionStep: React.FC<TemplateStepProps> = ({
  selectedTemplateId,
  onTemplateSelect,
  onCreateBudget,
  isLoading
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

  const handleContinue = () => {
    if (selectedTemplateId) {
      onCreateBudget(selectedTemplateId);
    }
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
              {/* Selected Indicator */}
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
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
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
          onClick={handleContinue}
          disabled={!selectedTemplateId || isLoading}
          className="w-full sm:w-auto sm:flex-1 order-1 sm:order-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Continue Create Budget
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Main Modal Component - SIMPLIFIED (removed form step)
export const BudgetTemplateModal: React.FC<BudgetTemplateModalProps> = ({
  isOpen,
  onClose,
  onCreateBudget,
  isLoading = false
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedTemplateId(null);
    }
  }, [isOpen]);

  const handleTemplateSelect = (templateId: string | null) => {
    setSelectedTemplateId(templateId);
  };

  const handleCreateWithTemplate = (templateId: string) => {
    const template = BUDGET_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    // Create budget directly with template
    onCreateBudget({
      name: template.name,
      description: template.description,
      color: template.color,
      applyTemplate: true,
      templateId: templateId
    });
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
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content - Only Template Selection */}
        <div className="p-6">
          <TemplateSelectionStep
            selectedTemplateId={selectedTemplateId}
            onTemplateSelect={handleTemplateSelect}
            onCreateBudget={handleCreateWithTemplate}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
};