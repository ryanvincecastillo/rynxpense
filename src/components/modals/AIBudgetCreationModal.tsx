// src/components/modals/AIBudgetCreationModal.tsx - Enhanced with Simple Prompt Option
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
  Heart,
  MessageSquare,
  Edit3,
  ChevronRight
} from 'lucide-react';

import { Button } from '../ui';
import Modal from '../ui/Modal/Modal';
import { BUDGET_TEMPLATES, BudgetTemplate } from '../../types/template';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type CreationMethod = 'ai-simple' | 'ai-advanced' | 'template' | 'manual';
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

// Simple prompt data interface
interface SimpleAIData {
  description: string;
  monthlyIncome?: number;
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

const DEFAULT_SIMPLE_AI_DATA: SimpleAIData = {
  description: '',
  monthlyIncome: undefined
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

// Convert simple AI data to advanced AI data format
const convertSimpleToAdvanced = (simpleData: SimpleAIData): AIBudgetData => {
  // Extract income from description if not provided separately
  let income = simpleData.monthlyIncome || 0;
  
  // Try to extract income from description using regex
  if (!income && simpleData.description) {
    const incomeMatch = simpleData.description.match(/(?:income|salary|earn|make).{0,20}?₱?(\d{1,3}(?:,?\d{3})*)/i);
    if (incomeMatch) {
      income = parseInt(incomeMatch[1].replace(/,/g, ''));
    }
  }

  return {
    monthlyIncome: income,
    financialGoals: simpleData.description,
    currentExpenses: simpleData.description,
    riskTolerance: 'moderate',
    dependents: 0,
    debtAmount: 0,
    savingsGoal: 0
  };
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

// Badge component - Simple implementation since it's used but not imported
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
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
      <p className="text-gray-600 max-w-md mx-auto">
        Choose the method that works best for you. Our AI can help create a personalized budget in seconds.
      </p>
    </div>

    <div className="grid gap-4 sm:gap-6">
      {/* Simple AI Prompt Option - NEW */}
      <button
        onClick={() => onSelectMethod('ai-simple')}
        disabled={isLoading}
        className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border-2 border-purple-200 hover:border-purple-300 rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                  ✨ AI Prompt (Recommended)
                </h4>
                <Badge className="mt-1 bg-purple-100 text-purple-700">
                  Simplest & Fastest
                </Badge>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-purple-400 group-hover:text-purple-600 transition-colors" />
          </div>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            Just describe your financial situation in your own words - our AI will understand and create a complete budget for you.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center text-purple-600 text-sm font-medium">
              <Brain className="w-4 h-4 mr-1" />
              Natural Language
            </div>
            <div className="flex items-center text-indigo-600 text-sm font-medium">
              <Zap className="w-4 h-4 mr-1" />
              Ultra Fast
            </div>
            <div className="flex items-center text-purple-600 text-sm font-medium">
              <Edit3 className="w-4 h-4 mr-1" />
              No Complex Forms
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white/60 rounded-lg">
            <p className="text-sm text-gray-600 italic">
              "I earn ₱50k monthly, want to save for vacation and pay off debt..."
            </p>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full -translate-y-16 translate-x-16" />
      </button>

      {/* Advanced AI Form Option */}
      <button
        onClick={() => onSelectMethod('ai-advanced')}
        disabled={isLoading}
        className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-2 border-blue-200 hover:border-blue-300 rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  🤖 Advanced AI Form
                </h4>
                <Badge className="mt-1 bg-blue-100 text-blue-700">
                  Detailed Analysis
                </Badge>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-blue-400 group-hover:text-blue-600 transition-colors" />
          </div>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            Fill out detailed financial information for more precise AI analysis and budget recommendations.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <Target className="w-4 h-4 mr-1" />
              Precise Analysis
            </div>
            <div className="flex items-center text-cyan-600 text-sm font-medium">
              <Calculator className="w-4 h-4 mr-1" />
              Risk Assessment
            </div>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              Goal Planning
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full -translate-y-16 translate-x-16" />
      </button>

      {/* Template Option */}
      <button
        onClick={() => onSelectMethod('template')}
        disabled={isLoading}
        className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-2 border-emerald-200 hover:border-emerald-300 rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <LayoutTemplate className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  📋 Use Template
                </h4>
                <Badge className="mt-1 bg-emerald-100 text-emerald-700">
                  Quick Start
                </Badge>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            Start with pre-made budget templates designed for different lifestyles and financial situations.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center text-emerald-600 text-sm font-medium">
              <Users className="w-4 h-4 mr-1" />
              Multiple Templates
            </div>
            <div className="flex items-center text-teal-600 text-sm font-medium">
              <Zap className="w-4 h-4 mr-1" />
              Instant Setup
            </div>
            <div className="flex items-center text-emerald-600 text-sm font-medium">
              <Plus className="w-4 h-4 mr-1" />
              Customizable
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-16 translate-x-16" />
      </button>

      {/* Manual Option */}
      <button
        onClick={() => onSelectMethod('manual')}
        disabled={isLoading}
        className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border-2 border-slate-200 hover:border-slate-300 rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl shadow-lg">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 group-hover:text-slate-700 transition-colors">
                  ⚙️ Manual Creation
                </h4>
                <Badge className="mt-1 bg-slate-100 text-slate-700">
                  Full Control
                </Badge>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            Create your budget from scratch with complete control over every category and amount.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center text-slate-600 text-sm font-medium">
              <Calculator className="w-4 h-4 mr-1" />
              Full Customization
            </div>
            <div className="flex items-center text-gray-600 text-sm font-medium">
              <Target className="w-4 h-4 mr-1" />
              Complete Control
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-200/20 to-gray-200/20 rounded-full -translate-y-16 translate-x-16" />
      </button>
    </div>
  </div>
);

// ============================================================================
// SIMPLE AI PROMPT STEP - NEW COMPONENT
// ============================================================================

interface SimpleAIStepProps {
  data: SimpleAIData;
  onChange: (data: Partial<SimpleAIData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const SimpleAIStep: React.FC<SimpleAIStepProps> = ({ 
  data, 
  onChange, 
  onSubmit, 
  onBack,
  isLoading 
}) => {
  const [error, setError] = useState<string>('');

  const validateForm = useCallback((): boolean => {
    if (!data.description.trim()) {
      setError('Please describe your financial situation');
      return false;
    }
    
    if (data.description.trim().length < 20) {
      setError('Please provide more details (at least 20 characters)');
      return false;
    }
    
    setError('');
    return true;
  }, [data.description]);

  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      onSubmit();
    }
  }, [validateForm, onSubmit]);

  const isFormValid = useMemo(() => {
    return data.description.trim().length >= 20;
  }, [data.description]);

  const examplePrompts = [
    "I earn ₱55,000 monthly. I want to save ₱10,000 for emergency fund, pay off ₱80,000 credit card debt, and save for a vacation. My expenses are rent ₱18,000, groceries ₱8,000, utilities ₱3,500, transportation ₱4,000.",
    "Monthly income ₱35,000. Single, living with parents. Want to move out in 6 months, need ₱50,000 for deposit. Currently spend ₱5,000 on food, ₱2,000 transport, ₱3,000 personal expenses.",
    "Family of 4, combined income ₱90,000. Kids' education ₱15,000, house mortgage ₱25,000, groceries ₱12,000. Want to save for kids' college fund and family vacation.",
    "Freelancer earning ₱40,000-60,000 monthly (varies). Need emergency fund, health insurance, equipment upgrades. Expenses: rent ₱12,000, utilities ₱2,500, internet ₱2,000."
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 sm:p-6 rounded-2xl">
        <div className="flex items-center space-x-3 mb-3">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          <h4 className="text-lg sm:text-xl font-bold text-gray-900">Tell Me About Your Finances</h4>
        </div>
        <p className="text-gray-600 leading-relaxed">
          Describe your financial situation in your own words. Include your income, expenses, goals, and anything else that's important to you. Our AI will create a personalized budget based on what you tell us.
        </p>
      </div>

      {/* Main Input */}
      <div className="space-y-4">
        <FormField 
          label="Describe Your Financial Situation" 
          required
          error={error}
          description="Be as detailed as possible - include income, major expenses, financial goals, debts, family situation, etc."
        >
          <TextArea
            value={data.description}
            onChange={(value) => {
              onChange({ description: value });
              if (error) setError('');
            }}
            placeholder="Example: I earn ₱50,000 monthly from my job. I want to save for an emergency fund and pay off my credit card debt of ₱30,000. My main expenses are rent ₱15,000, groceries ₱8,000, utilities ₱3,000, and transportation ₱4,000. I also want to save for a vacation next year..."
            rows={8}
            disabled={isLoading}
          />
        </FormField>

        {/* Optional income field for better extraction */}
        <FormField 
          label="Monthly Income (Optional)" 
          description="If not mentioned in your description above, you can specify it here"
        >
          <NumberInput
            value={data.monthlyIncome || 0}
            onChange={(value) => onChange({ monthlyIncome: value || undefined })}
            placeholder="50000"
            prefix="₱"
            disabled={isLoading}
          />
        </FormField>
      </div>

      {/* Character count */}
      <div className="text-right">
        <span className={`text-sm ${data.description.length >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
          {data.description.length} characters {data.description.length >= 20 ? '✓' : '(minimum 20)'}
        </span>
      </div>

      {/* Example prompts */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-700">Need inspiration? Try these examples:</h5>
        <div className="grid gap-3">
          {examplePrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onChange({ description: prompt })}
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              disabled={isLoading}
            >
              <p className="text-sm text-gray-700 leading-relaxed">{prompt}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Your Budget...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Create AI Budget</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// ADVANCED AI INPUT STEP (Existing)
// ============================================================================

interface AIInputStepProps {
  data: AIBudgetData;
  onChange: (data: Partial<AIBudgetData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const AIInputStep: React.FC<AIInputStepProps> = ({ 
  data, 
  onChange, 
  onSubmit, 
  onBack,
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
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-6 rounded-2xl">
        <div className="flex items-center space-x-3 mb-3">
          <Brain className="w-6 h-6 text-blue-600" />
          <h4 className="text-lg sm:text-xl font-bold text-gray-900">Advanced AI Budget Assistant</h4>
        </div>
        <p className="text-gray-600 leading-relaxed">
          Provide detailed information for a comprehensive AI analysis and personalized budget recommendations.
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

        {/* Risk Tolerance */}
        <FormField 
          label="Risk Tolerance" 
          description="How comfortable are you with financial risks and investments?"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {RISK_TOLERANCE_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => onChange({ riskTolerance: option.value })}
                  disabled={isLoading}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${data.riskTolerance === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${option.color}`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </button>
              );
            })}
          </div>
        </FormField>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormField label="Number of Dependents" description="Family members you financially support">
            <NumberInput
              value={data.dependents || 0}
              onChange={(value) => onChange({ dependents: value })}
              placeholder="0"
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Monthly Savings Goal" description="How much you'd like to save monthly">
            <NumberInput
              value={data.savingsGoal || 0}
              onChange={(value) => onChange({ savingsGoal: value })}
              placeholder="10000"
              prefix="₱"
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Current Debt Amount" description="Total outstanding debt (credit cards, loans, etc.)">
            <NumberInput
              value={data.debtAmount || 0}
              onChange={(value) => onChange({ debtAmount: value })}
              placeholder="50000"
              prefix="₱"
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Budget Name (Optional)" description="Custom name for your budget">
            <input
              type="text"
              value={data.budgetName || ''}
              onChange={(e) => onChange({ budgetName: e.target.value })}
              placeholder="My Personal Budget"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:bg-gray-50 disabled:text-gray-500"
              disabled={isLoading}
            />
          </FormField>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing & Creating...</span>
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              <span>Create AI Budget</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// TEMPLATE SELECTION STEP (Existing)
// ============================================================================

interface TemplateSelectionStepProps {
  onSelectTemplate: (templateId: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const TemplateSelectionStep: React.FC<TemplateSelectionStepProps> = ({ 
  onSelectTemplate, 
  onBack,
  isLoading 
}) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-3 mb-6">
      <Button
        variant="secondary"
        size="sm"
        onClick={onBack}
        disabled={isLoading}
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Button>
      <div>
        <h4 className="text-xl font-bold text-gray-900">Choose a Template</h4>
        <p className="text-gray-600">Select a budget template that matches your lifestyle</p>
      </div>
    </div>

    <div className="grid gap-4 sm:gap-6">
      {BUDGET_TEMPLATES.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelectTemplate(template.id)}
          disabled={isLoading}
          className="group relative overflow-hidden bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{template.icon}</div>
              <div>
                <h5 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {template.name}
                </h5>
                {/* <Badge className="mt-1 bg-gray-100 text-gray-700">
                  {template.category}
                </Badge> */}
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            {template.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {/* {template.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {feature}
              </span>
            ))}
            {template.features.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{template.features.length - 3} more
              </span>
            )} */}
          </div>
        </button>
      ))}
    </div>
  </div>
);

// ============================================================================
// MAIN MODAL COMPONENT
// ============================================================================

export const AIBudgetCreationModal: React.FC<AIBudgetCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateWithAI,
  onCreateWithTemplate,
  onCreateManual,
  isAILoading = false,
  isTemplateLoading = false,
}) => {
  // State Management
  const [currentStep, setCurrentStep] = useState<'method' | 'ai-simple' | 'ai-advanced' | 'template'>('method');
  const [aiData, setAIData] = useState<AIBudgetData>(DEFAULT_AI_DATA);
  const [simpleAIData, setSimpleAIData] = useState<SimpleAIData>(DEFAULT_SIMPLE_AI_DATA);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('method');
      setAIData(DEFAULT_AI_DATA);
      setSimpleAIData(DEFAULT_SIMPLE_AI_DATA);
    }
  }, [isOpen]);

  // Event Handlers
  const handleMethodSelect = useCallback((method: CreationMethod) => {
    switch (method) {
      case 'ai-simple':
        setCurrentStep('ai-simple');
        break;
      case 'ai-advanced':
        setCurrentStep('ai-advanced');
        break;
      case 'template':
        setCurrentStep('template');
        break;
      case 'manual':
        onCreateManual();
        break;
    }
  }, [onCreateManual]);

  const handleSimpleAISubmit = useCallback(() => {
    // Convert simple AI data to advanced format and submit
    const convertedData = convertSimpleToAdvanced(simpleAIData);
    onCreateWithAI(convertedData);
  }, [simpleAIData, onCreateWithAI]);

  const handleAdvancedAISubmit = useCallback(() => {
    onCreateWithAI(aiData);
  }, [aiData, onCreateWithAI]);

  const handleBack = useCallback(() => {
    setCurrentStep('method');
  }, []);

  const handleClose = useCallback(() => {
    if (!isAILoading && !isTemplateLoading) {
      onClose();
    }
  }, [isAILoading, isTemplateLoading, onClose]);

  // Render Current Step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'method':
        return (
          <MethodSelectionStep 
            onSelectMethod={handleMethodSelect}
            isLoading={isAILoading || isTemplateLoading}
          />
        );
      
      case 'ai-simple':
        return (
          <SimpleAIStep
            data={simpleAIData}
            onChange={(updates) => setSimpleAIData(prev => ({ ...prev, ...updates }))}
            onSubmit={handleSimpleAISubmit}
            onBack={handleBack}
            isLoading={isAILoading}
          />
        );
      
      case 'ai-advanced':
        return (
          <AIInputStep
            data={aiData}
            onChange={(updates) => setAIData(prev => ({ ...prev, ...updates }))}
            onSubmit={handleAdvancedAISubmit}
            onBack={handleBack}
            isLoading={isAILoading}
          />
        );
      
      case 'template':
        return (
          <TemplateSelectionStep
            onSelectTemplate={onCreateWithTemplate}
            onBack={handleBack}
            isLoading={isTemplateLoading}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      className="max-w-4xl"
    >
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Budget</h2>
              <p className="text-gray-600">
                {currentStep === 'method' && 'Choose how you want to create your budget'}
                {currentStep === 'ai-simple' && 'Describe your financial situation'}
                {currentStep === 'ai-advanced' && 'Provide detailed financial information'}
                {currentStep === 'template' && 'Select from pre-made templates'}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isAILoading || isTemplateLoading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Progress Indicator */}
        {currentStep !== 'method' && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <button 
                onClick={handleBack}
                className="hover:text-gray-900 transition-colors"
                disabled={isAILoading || isTemplateLoading}
              >
                Create Budget
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="font-medium text-gray-900">
                {currentStep === 'ai-simple' && 'AI Prompt'}
                {currentStep === 'ai-advanced' && 'Advanced AI Form'}
                {currentStep === 'template' && 'Template Selection'}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {renderCurrentStep()}
        </div>

        {/* Loading Overlay */}
        {(isAILoading || isTemplateLoading) && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {isAILoading ? 'AI is creating your budget...' : 'Setting up template...'}
                </h3>
                <p className="text-gray-600">
                  {isAILoading ? 'This usually takes 10-30 seconds' : 'Almost ready...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};