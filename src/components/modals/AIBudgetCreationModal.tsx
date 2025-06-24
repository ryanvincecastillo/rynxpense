// src/components/modals/AIBudgetCreationModal.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Brain,
  Zap,
  Target,
  Users,
  GraduationCap,
  User,
  Building2,
  Wand2,
  Plus,
  LayoutTemplate,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  Shield,
  Activity,
  Heart
} from 'lucide-react';

import { Button } from '../ui';
import Modal from '../ui/Modal/Modal';
import { BUDGET_TEMPLATES, BudgetTemplate } from '../../types/template';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type CreationMethod = 'ai' | 'template' | 'manual';
type AIStep = 'input' | 'processing' | 'result';

interface AIBudgetCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWithAI: (data: AIBudgetData) => void;
  onCreateWithTemplate: (templateId: string) => void;
  onCreateManual: () => void;
  isAILoading?: boolean;
  isTemplateLoading?: boolean;
}

interface AIBudgetData {
  monthlyIncome: number;
  financialGoals: string;
  currentExpenses: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  budgetName?: string;
  dependents?: number;
  debtAmount?: number;
  savingsGoal?: number;
}

interface RiskToleranceOption {
  value: 'conservative' | 'moderate' | 'aggressive';
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_AI_DATA: AIBudgetData = {
  monthlyIncome: 0,
  financialGoals: '',
  currentExpenses: '',
  riskTolerance: 'moderate',
  dependents: 0,
  debtAmount: 0,
  savingsGoal: 0
};

const RISK_TOLERANCE_OPTIONS: RiskToleranceOption[] = [
  {
    value: 'conservative',
    label: 'Conservative',
    description: 'Focus on saving and low-risk investments',
    icon: Shield,
    color: 'from-green-500 to-emerald-600'
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Balanced approach to saving and spending',
    icon: Activity,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    value: 'aggressive',
    label: 'Aggressive',
    description: 'Higher investments and calculated risks',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-600'
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getIconComponent = (iconName: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    '👤': <User className="w-6 h-6" />,
    '🎓': <GraduationCap className="w-6 h-6" />,
    '👨‍👩‍👧‍👦': <Users className="w-6 h-6" />,
    '🏢': <Building2 className="w-6 h-6" />
  };
  return iconMap[iconName] || <User className="w-6 h-6" />;
};

// ============================================================================
// FORM COMPONENTS
// ============================================================================

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  description?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  children, 
  error, 
  required = false,
  description 
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-900">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {description && (
      <p className="text-xs text-gray-600">{description}</p>
    )}
    {children}
    {error && (
      <p className="text-sm text-red-600" role="alert">{error}</p>
    )}
  </div>
);

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  prefix?: string;
  disabled?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  placeholder,
  min = 0,
  max,
  prefix,
  disabled = false
}) => (
  <div className="relative">
    {prefix && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-500 text-sm">{prefix}</span>
      </div>
    )}
    <input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className={`
        w-full px-4 py-3 border border-gray-300 rounded-lg 
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        transition-colors duration-200
        disabled:bg-gray-50 disabled:text-gray-500
        ${prefix ? 'pl-8' : ''}
        sm:text-base text-lg
      `}
      placeholder={placeholder}
      min={min}
      max={max}
      disabled={disabled}
    />
  </div>
);

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false
}) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={rows}
    className="
      w-full px-4 py-3 border border-gray-300 rounded-lg 
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      transition-colors duration-200 resize-none
      disabled:bg-gray-50 disabled:text-gray-500
      sm:text-base text-lg
    "
    placeholder={placeholder}
    disabled={disabled}
  />
);

// ============================================================================
// STEP COMPONENTS
// ============================================================================

interface MethodSelectionStepProps {
  onSelectMethod: (method: CreationMethod) => void;
  isLoading: boolean;
}

const MethodSelectionStep: React.FC<MethodSelectionStepProps> = ({ 
  onSelectMethod,
  isLoading 
}) => (
  <div className="space-y-6">
    <div className="text-center pb-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        How would you like to create your budget?
      </h3>
      <p className="text-gray-600 text-lg">
        Choose the method that works best for you
      </p>
    </div>

    <div className="grid gap-4 sm:gap-6">
      {/* AI Creation Option */}
      <button
        onClick={() => onSelectMethod('ai')}
        disabled={isLoading}
        className="
          group p-6 sm:p-8 border-2 border-gray-200 rounded-2xl 
          hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50
          transition-all duration-300 text-left
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-4 focus:ring-purple-100
        "
      >
        <div className="flex items-start space-x-4 sm:space-x-6">
          <div className="
            flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 
            bg-gradient-to-br from-purple-500 to-blue-600 
            rounded-2xl flex items-center justify-center
            group-hover:scale-105 transition-transform duration-200
          ">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          
          <div className="flex-grow min-w-0">
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-700">
              AI-Powered Budget
            </h4>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Let our AI create a personalized budget based on your income, goals, and financial situation.
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center text-purple-600 text-sm font-medium">
                <Brain className="w-4 h-4 mr-1" />
                Smart Analysis
              </div>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <Zap className="w-4 h-4 mr-1" />
                Quick Setup
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Template Option */}
      <button
        onClick={() => onSelectMethod('template')}
        disabled={isLoading}
        className="
          group p-6 sm:p-8 border-2 border-gray-200 rounded-2xl 
          hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50
          transition-all duration-300 text-left
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-4 focus:ring-blue-100
        "
      >
        <div className="flex items-start space-x-4 sm:space-x-6">
          <div className="
            flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 
            bg-gradient-to-br from-blue-500 to-cyan-600 
            rounded-2xl flex items-center justify-center
            group-hover:scale-105 transition-transform duration-200
          ">
            <LayoutTemplate className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          
          <div className="flex-grow min-w-0">
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-700">
              Pre-made Templates
            </h4>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Choose from professionally designed budget templates for different lifestyles and goals.
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <Users className="w-4 h-4 mr-1" />
                Proven Frameworks
              </div>
              <div className="flex items-center text-cyan-600 text-sm font-medium">
                <Target className="w-4 h-4 mr-1" />
                Goal-Oriented
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Manual Option */}
      <button
        onClick={() => onSelectMethod('manual')}
        disabled={isLoading}
        className="
          group p-6 sm:p-8 border-2 border-gray-200 rounded-2xl 
          hover:border-green-300 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50
          transition-all duration-300 text-left
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-4 focus:ring-green-100
        "
      >
        <div className="flex items-start space-x-4 sm:space-x-6">
          <div className="
            flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 
            bg-gradient-to-br from-green-500 to-emerald-600 
            rounded-2xl flex items-center justify-center
            group-hover:scale-105 transition-transform duration-200
          ">
            <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          
          <div className="flex-grow min-w-0">
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-700">
              Start from Scratch
            </h4>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Create a completely custom budget with full control over every category and allocation.
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center text-green-600 text-sm font-medium">
                <Calculator className="w-4 h-4 mr-1" />
                Full Customization
              </div>
              <div className="flex items-center text-emerald-600 text-sm font-medium">
                <Target className="w-4 h-4 mr-1" />
                Complete Control
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
);

interface AIInputStepProps {
  data: AIBudgetData;
  onChange: (data: Partial<AIBudgetData>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const AIInputStep: React.FC<AIInputStepProps> = ({ 
  data, 
  onChange, 
  onSubmit, 
  isLoading 
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.monthlyIncome || data.monthlyIncome <= 0) {
      newErrors.monthlyIncome = 'Please enter your monthly income';
    }

    if (!data.financialGoals.trim()) {
      newErrors.financialGoals = 'Please describe your financial goals';
    }

    if (!data.currentExpenses.trim()) {
      newErrors.currentExpenses = 'Please describe your current expenses';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      onSubmit();
    }
  }, [validateForm, onSubmit]);

  const isFormValid = useMemo(() => {
    return data.monthlyIncome > 0 && 
           data.financialGoals.trim() && 
           data.currentExpenses.trim();
  }, [data]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 sm:p-6 rounded-2xl">
        <div className="flex items-center space-x-3 mb-3">
          <Wand2 className="w-6 h-6 text-purple-600" />
          <h4 className="text-lg sm:text-xl font-bold text-gray-900">AI Budget Assistant</h4>
        </div>
        <p className="text-gray-600 leading-relaxed">
          I'll create a personalized budget based on your financial information. 
          All data stays private and secure.
        </p>
      </div>

      {/* Form */}
      <div className="grid gap-6 sm:gap-8">
        {/* Monthly Income */}
        <FormField 
          label="Monthly Income" 
          required
          error={errors.monthlyIncome}
          description="Include salary, freelance income, and other regular income sources"
        >
          <NumberInput
            value={data.monthlyIncome}
            onChange={(value) => onChange({ monthlyIncome: value })}
            placeholder="50000"
            prefix="₱"
            disabled={isLoading}
          />
        </FormField>

        {/* Financial Goals */}
        <FormField 
          label="Financial Goals" 
          required
          error={errors.financialGoals}
          description="Describe what you want to achieve (e.g., emergency fund, vacation, debt payoff)"
        >
          <TextArea
            value={data.financialGoals}
            onChange={(value) => onChange({ financialGoals: value })}
            placeholder="I want to build an emergency fund of ₱100,000, save for a vacation, and pay off my credit card debt..."
            rows={3}
            disabled={isLoading}
          />
        </FormField>

        {/* Current Expenses */}
        <FormField 
          label="Current Expenses" 
          required
          error={errors.currentExpenses}
          description="Describe your main monthly expenses and spending patterns"
        >
          <TextArea
            value={data.currentExpenses}
            onChange={(value) => onChange({ currentExpenses: value })}
            placeholder="Rent ₱20,000, groceries ₱8,000, utilities ₱3,000, transportation ₱5,000..."
            rows={3}
            disabled={isLoading}
          />
        </FormField>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormField label="Number of Dependents" description="Family members you financially support">
            <NumberInput
              value={data.dependents || 0}
              onChange={(value) => onChange({ dependents: value })}
              placeholder="0"
              min={0}
              max={20}
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Current Debt Amount" description="Total outstanding debt (optional)">
            <NumberInput
              value={data.debtAmount || 0}
              onChange={(value) => onChange({ debtAmount: value })}
              placeholder="0"
              prefix="₱"
              disabled={isLoading}
            />
          </FormField>
        </div>

        <FormField label="Monthly Savings Goal" description="How much you'd like to save each month">
          <NumberInput
            value={data.savingsGoal || 0}
            onChange={(value) => onChange({ savingsGoal: value })}
            placeholder="10000"
            prefix="₱"
            disabled={isLoading}
          />
        </FormField>

        {/* Risk Tolerance */}
        <FormField label="Financial Risk Tolerance" description="How do you prefer to manage your money?">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {RISK_TOLERANCE_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              const isSelected = data.riskTolerance === option.value;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ riskTolerance: option.value })}
                  disabled={isLoading}
                  className={`
                    p-4 border-2 rounded-xl transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isSelected 
                      ? 'border-purple-500 bg-purple-50 text-purple-700 ring-purple-500' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="text-center space-y-2">
                    <div className={`
                      w-10 h-10 mx-auto rounded-lg flex items-center justify-center
                      bg-gradient-to-br ${option.color}
                    `}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500 leading-tight">
                      {option.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </FormField>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className="
            px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 
            hover:from-purple-700 hover:to-blue-700 text-white rounded-xl
            transition-all duration-200 disabled:opacity-50
            text-base font-medium
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
          "
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Generate AI Budget</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

interface ProcessingStepProps {
  message?: string;
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({ 
  message = "Creating Your Personalized Budget" 
}) => (
  <div className="text-center py-16 sm:py-20">
    <div className="
      w-20 h-20 sm:w-24 sm:h-24 
      bg-gradient-to-r from-purple-500 to-blue-500 
      rounded-full flex items-center justify-center mx-auto mb-8
      animate-pulse
    ">
      <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-spin" />
    </div>
    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
      {message}
    </h4>
    <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
      AI is analyzing your financial information and creating a custom budget that fits your lifestyle and goals...
    </p>
    
    {/* Progress indicator */}
    <div className="mt-8 max-w-xs mx-auto">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
      </div>
    </div>
  </div>
);

interface TemplateSelectionStepProps {
  onSelectTemplate: (templateId: string) => void;
  isLoading: boolean;
}

const TemplateSelectionStep: React.FC<TemplateSelectionStepProps> = ({ 
  onSelectTemplate,
  isLoading 
}) => (
  <div className="space-y-6">
    <div className="text-center pb-4">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
        Choose a Budget Template
      </h3>
      <p className="text-gray-600 text-lg">
        Select a pre-built template that matches your lifestyle
      </p>
    </div>

    <div className="space-y-4 max-h-96 overflow-y-auto">
      {BUDGET_TEMPLATES.map((template) => {
        const incomeCategories = template.categories.filter(c => c.type === 'INCOME');
        const expenseCategories = template.categories.filter(c => c.type === 'EXPENSE');
        const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
        const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
        
        return (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            disabled={isLoading}
            className="
              w-full p-4 sm:p-6 border-2 border-gray-200 rounded-2xl 
              hover:border-blue-300 hover:bg-blue-50 
              transition-all duration-200 text-left group 
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            "
          >
            <div className="flex items-start space-x-4 sm:space-x-6">
              <div 
                className="
                  flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl 
                  flex items-center justify-center text-white 
                  group-hover:scale-105 transition-transform duration-200
                "
                style={{ backgroundColor: template.color }}
              >
                {getIconComponent(template.icon)}
              </div>
              
              <div className="flex-grow min-w-0">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700">
                  {template.name}
                </h4>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {template.description}
                </p>
                
                {/* Budget breakdown */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span className="font-medium">Income</span>
                    </div>
                    <span className="text-gray-900 font-semibold">
                      {formatCurrency(totalIncome)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-red-600">
                      <TrendingDown className="w-4 h-4 mr-1" />
                      <span className="font-medium">Expenses</span>
                    </div>
                    <span className="text-gray-900 font-semibold">
                      {formatCurrency(totalExpenses)}
                    </span>
                  </div>
                </div>
                
                {/* Categories preview */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {template.categories.slice(0, 4).map((category, index) => (
                      <div
                        key={index}
                        className="
                          px-2 py-1 bg-gray-100 text-gray-700 
                          rounded-md text-xs font-medium
                        "
                      >
                        {category.name}
                      </div>
                    ))}
                    {template.categories.length > 4 && (
                      <div className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
                        +{template.categories.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AIBudgetCreationModal: React.FC<AIBudgetCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateWithAI,
  onCreateWithTemplate,
  onCreateManual,
  isAILoading = false,
  isTemplateLoading = false
}) => {
  // State management
  const [method, setMethod] = useState<CreationMethod | null>(null);
  const [aiStep, setAIStep] = useState<AIStep>('input');
  const [aiData, setAIData] = useState<AIBudgetData>(DEFAULT_AI_DATA);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMethod(null);
      setAIStep('input');
      setAIData(DEFAULT_AI_DATA);
    }
  }, [isOpen]);

  // Handlers
  const handleClose = useCallback(() => {
    if (aiStep === 'processing' || isAILoading || isTemplateLoading) return;
    onClose();
  }, [aiStep, isAILoading, isTemplateLoading, onClose]);

  const handleBack = useCallback(() => {
    if (method && aiStep === 'input') {
      setMethod(null);
    }
  }, [method, aiStep]);

  const handleMethodSelect = useCallback((selectedMethod: CreationMethod) => {
    if (selectedMethod === 'manual') {
      onCreateManual();
      return;
    }
    setMethod(selectedMethod);
  }, [onCreateManual]);

  const handleAIDataChange = useCallback((updates: Partial<AIBudgetData>) => {
    setAIData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleAISubmit = useCallback(() => {
    setAIStep('processing');
    onCreateWithAI(aiData);
  }, [aiData, onCreateWithAI]);

  const handleTemplateSelect = useCallback((templateId: string) => {
    onCreateWithTemplate(templateId);
  }, [onCreateWithTemplate]);

  // Loading states
  const isProcessing = aiStep === 'processing' || isAILoading || isTemplateLoading;
  const canClose = !isProcessing;

  // Modal content based on current step
  const renderContent = () => {
    if (!method) {
      return (
        <MethodSelectionStep 
          onSelectMethod={handleMethodSelect}
          isLoading={isProcessing}
        />
      );
    }

    if (method === 'ai') {
      if (aiStep === 'input') {
        return (
          <AIInputStep
            data={aiData}
            onChange={handleAIDataChange}
            onSubmit={handleAISubmit}
            isLoading={isAILoading}
          />
        );
      }

      if (aiStep === 'processing') {
        return <ProcessingStep />;
      }
    }

    if (method === 'template') {
      return (
        <TemplateSelectionStep
          onSelectTemplate={handleTemplateSelect}
          isLoading={isTemplateLoading}
        />
      );
    }

    return null;
  };

  // Modal title based on current step
  const getModalTitle = () => {
    if (!method) return 'Create Your Budget';
    if (method === 'ai') {
      if (aiStep === 'input') return 'AI Budget Creator';
      if (aiStep === 'processing') return 'Creating Budget...';
    }
    if (method === 'template') return 'Budget Templates';
    return 'Create Budget';
  };

  const getModalSubtitle = () => {
    if (!method) return 'Choose how you\'d like to get started';
    if (method === 'ai') {
      if (aiStep === 'input') return 'Tell us about your finances for a personalized budget';
      if (aiStep === 'processing') return 'Please wait while we create your budget';
    }
    if (method === 'template') return 'Select a template that fits your lifestyle';
    return '';
  };

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      className="max-w-4xl mx-4 sm:mx-auto"
      showCloseButton={false}
    >
      <div className="relative bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="
          flex-shrink-0 flex items-center justify-between 
          p-4 sm:p-6 border-b border-gray-200 
          bg-gradient-to-r from-blue-50 to-purple-50
        ">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {/* Back button */}
            {method && (
              <button
                onClick={handleBack}
                disabled={isProcessing}
                className="
                  flex-shrink-0 p-2 hover:bg-white/50 rounded-lg 
                  transition-colors mr-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                "
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            
            {/* Icon and title */}
            <div className="flex-shrink-0 p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {getModalTitle()}
              </h2>
              {getModalSubtitle() && (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {getModalSubtitle()}
                </p>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={!canClose}
            className="
              flex-shrink-0 ml-4 p-2 text-gray-400 hover:text-gray-600 
              transition-colors rounded-lg hover:bg-white/50
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
            "
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </div>

        {/* Progress indicator for AI flow */}
        {method === 'ai' && (
          <div className="flex-shrink-0 px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2">
              <div className="flex space-x-2">
                <div className={`
                  w-2 h-2 rounded-full transition-colors duration-200
                  ${aiStep === 'input' ? 'bg-blue-500' : 'bg-gray-300'}
                `} />
                <div className={`
                  w-2 h-2 rounded-full transition-colors duration-200
                  ${aiStep === 'processing' ? 'bg-blue-500' : 'bg-gray-300'}
                `} />
                <div className={`
                  w-2 h-2 rounded-full transition-colors duration-200
                  ${aiStep === 'result' ? 'bg-blue-500' : 'bg-gray-300'}
                `} />
              </div>
              <span className="text-xs text-gray-600 ml-2">
                Step {aiStep === 'input' ? '1' : aiStep === 'processing' ? '2' : '3'} of 3
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AIBudgetCreationModal;