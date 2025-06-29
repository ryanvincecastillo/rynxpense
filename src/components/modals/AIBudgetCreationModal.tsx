// AIBudgetCreationModal.tsx - Complete Implementation with Enhanced Template Selection
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowLeft,
  Check,
  Loader2,
  Brain,
  Plus,
  LayoutTemplate,
  Shield,
  Activity,
  Heart,
  MessageSquare,
  ChevronRight,
  Eye
} from 'lucide-react';

import { Modal } from '../ui/Modal';
import { Badge, Button } from '../ui';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type CreationMethod = 'ai-simple' | 'ai-advanced' | 'template' | 'manual';

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

interface SimpleAIData {
  description: string;
  monthlyIncome?: number;
}

interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  targetAudience: string;
  categories: any[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_AI_DATA: AIBudgetData = {
  monthlyIncome: 0,
  financialGoals: '',
  currentExpenses: '',
  riskTolerance: 'moderate',
  budgetName: '',
  dependents: 0,
  debtAmount: 0,
  savingsGoal: 0,
};

const DEFAULT_SIMPLE_AI_DATA: SimpleAIData = {
  description: '',
  monthlyIncome: undefined,
};

const BUDGET_TEMPLATES: BudgetTemplate[] = [
  {
    id: 'student',
    name: 'Student Budget',
    description: 'Perfect for college students managing tuition, textbooks, and living expenses',
    icon: '🎓',
    targetAudience: 'College students',
    categories: [],
  },
  {
    id: 'family',
    name: 'Family Budget',
    description: 'Comprehensive budget for families with children, including education and healthcare',
    icon: '👨‍👩‍👧‍👦',
    targetAudience: 'Families with children',
    categories: [],
  },
  {
    id: 'professional',
    name: 'Young Professional',
    description: 'Ideal for working professionals building their career and savings',
    icon: '💼',
    targetAudience: 'Working professionals',
    categories: [],
  },
  {
    id: 'retirement',
    name: 'Retirement Planning',
    description: 'Focus on retirement savings and conservative spending',
    icon: '🏖️',
    targetAudience: 'Pre-retirees',
    categories: [],
  },
];

const RISK_TOLERANCE_OPTIONS = [
  {
    value: 'conservative' as const,
    label: 'Conservative',
    description: 'Prioritize saving and low-risk investments',
    icon: Shield,
    color: 'green',
  },
  {
    value: 'moderate' as const,
    label: 'Moderate',
    description: 'Balance between saving and lifestyle spending',
    icon: Activity,
    color: 'blue',
  },
  {
    value: 'aggressive' as const,
    label: 'Aggressive',
    description: 'Higher risk tolerance for potential growth',
    icon: Heart,
    color: 'red',
  },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface CompactFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  helpText?: string;
}

const CompactField: React.FC<CompactFieldProps> = ({
  label,
  required = false,
  error,
  children,
  helpText,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : helpText ? (
        <p className="text-xs text-gray-500">{helpText}</p>
      ) : null}
    </div>
  );
};

interface MethodCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  features: string[];
  onClick: () => void;
  disabled?: boolean;
}

const MethodCard: React.FC<MethodCardProps> = ({
  title,
  description,
  icon,
  gradient,
  features,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-4 rounded-lg border-2 text-left transition-all
        ${gradient}
        hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        border-gray-200 hover:border-gray-300
      `}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
      
      <div className="flex flex-wrap gap-1">
        {features.map((feature, index) => (
          <Badge key={index} className="bg-white/30 text-gray-700 text-xs">
            {feature}
          </Badge>
        ))}
      </div>
    </button>
  );
};

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
}) => {
  const methods = [
    {
      id: 'ai-simple' as const,
      title: '🤖 Quick AI Setup',
      description: 'Describe your situation and let AI create your budget',
      icon: <MessageSquare className="w-6 h-6 text-purple-600" />,
      gradient: 'bg-gradient-to-br from-purple-50 to-indigo-50',
      features: ['Natural Language', 'Instant Results', 'Smart Categories'],
    },
    {
      id: 'ai-advanced' as const,
      title: '🧠 Detailed AI Budget',
      description: 'Answer detailed questions for a comprehensive AI budget',
      icon: <Brain className="w-6 h-6 text-blue-600" />,
      gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      features: ['Comprehensive', 'Personalized', 'Risk Assessment'],
    },
    {
      id: 'template' as const,
      title: '📋 Budget Templates',
      description: 'Start with proven budget templates for your situation',
      icon: <LayoutTemplate className="w-6 h-6 text-green-600" />,
      gradient: 'bg-gradient-to-br from-green-50 to-emerald-50',
      features: ['Pre-made', 'Tested', 'Quick Start'],
    },
    {
      id: 'manual' as const,
      title: '⚙️ Manual Creation',
      description: 'Build your budget from scratch with full control',
      icon: <Plus className="w-6 h-6 text-gray-600" />,
      gradient: 'bg-gradient-to-br from-gray-50 to-slate-50',
      features: ['Full Control', 'Custom Categories', 'Flexible'],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          How would you like to create your budget?
        </h3>
        <p className="text-gray-600 text-sm">
          Choose the method that works best for you
        </p>
      </div>
      
      <div className="space-y-3">
        {methods.map((method) => (
          <MethodCard
            key={method.id}
            title={method.title}
            description={method.description}
            icon={method.icon}
            gradient={method.gradient}
            features={method.features}
            onClick={() => onSelectMethod(method.id)}
            disabled={isLoading}
          />
        ))}
      </div>
    </div>
  );
};

interface SimpleAIStepProps {
  data: SimpleAIData;
  onChange: (updates: Partial<SimpleAIData>) => void;
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
  const isValid = data.description.trim().length > 10;

  const inspirationPrompts = [
    "I'm a student earning ₱15k/month from part-time work, want to save for books and emergency fund",
    "Fresh graduate earning ₱35k/month, want to save for apartment deposit and build emergency fund",
    "Family of 4 with ₱80k household income, need to budget for kids' education and family trips",
    "Young professional earning ₱50k/month, want to pay off debt and start investing"
  ];

  const handlePromptSelect = (prompt: string) => {
    onChange({ description: prompt });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Quick AI Setup</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Tell us about your financial situation in your own words
        </p>
      </div>

      <CompactField 
        label="Describe your financial situation" 
        required
        helpText="The more details you provide, the better your budget will be"
      >
        <textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          disabled={isLoading}
          placeholder="Example: I'm a software engineer earning ₱50000/month. I want to save for an emergency fund and pay off my credit card debt. I spend most on food, transportation, and entertainment."
          className="
            block w-full px-3 py-3 text-base
            border-2 rounded-lg shadow-sm
            placeholder-gray-400 resize-none
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
            disabled:bg-gray-50 disabled:text-gray-500
            border-gray-300
          "
        />
      </CompactField>

      {/* Inspiration Prompts */}
      {!data.description && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
            Quick Examples
          </label>
          <div className="grid gap-2">
            {inspirationPrompts.map((prompt, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handlePromptSelect(prompt)}
                disabled={isLoading}
                className="
                  text-left p-2 text-xs text-gray-600 bg-gray-50 
                  rounded-md border hover:bg-blue-50 hover:text-blue-700 
                  hover:border-blue-200 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button
          type="button"
          variant="primary"
          onClick={onSubmit}
          disabled={isLoading || !isValid}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Budget...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Create with AI
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

interface AIInputStepProps {
  data: AIBudgetData;
  onChange: (updates: Partial<AIBudgetData>) => void;
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
  const isValid = data.monthlyIncome > 0 && data.financialGoals.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Brain className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Detailed AI Budget</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Provide detailed information for a comprehensive budget
        </p>
      </div>

      <CompactField label="Monthly Income" required>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 font-medium">₱</span>
          </div>
          <input
            type="number"
            inputMode="decimal"
            value={data.monthlyIncome || ''}
            onChange={(e) => onChange({ monthlyIncome: parseFloat(e.target.value) || 0 })}
            disabled={isLoading}
            placeholder="50000"
            className="
              block w-full pl-8 pr-4 py-3 text-base
              border-2 rounded-lg shadow-sm
              placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500
              border-gray-300
            "
          />
        </div>
      </CompactField>

      <CompactField label="Financial Goals" required>
        <textarea
          value={data.financialGoals}
          onChange={(e) => onChange({ financialGoals: e.target.value })}
          rows={3}
          disabled={isLoading}
          placeholder="Save for emergency fund, pay off debt, buy a house..."
          className="
            block w-full px-3 py-3 text-base
            border-2 rounded-lg shadow-sm
            placeholder-gray-400 resize-none
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            border-gray-300
          "
        />
      </CompactField>

      <CompactField label="Current Expenses">
        <textarea
          value={data.currentExpenses}
          onChange={(e) => onChange({ currentExpenses: e.target.value })}
          rows={3}
          disabled={isLoading}
          placeholder="Rent ₱15000, Food ₱8000, Transportation ₱3000..."
          className="
            block w-full px-3 py-3 text-base
            border-2 rounded-lg shadow-sm
            placeholder-gray-400 resize-none
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            border-gray-300
          "
        />
      </CompactField>

      <CompactField label="Risk Tolerance">
        <div className="space-y-2">
          {RISK_TOLERANCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ riskTolerance: option.value })}
              disabled={isLoading}
              className={`
                w-full p-3 rounded-lg border-2 text-left transition-all
                ${data.riskTolerance === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-start gap-3">
                <option.icon className={`w-5 h-5 text-${option.color}-600 flex-shrink-0 mt-0.5`} />
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
                {data.riskTolerance === option.value && (
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      </CompactField>

      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button
          type="button"
          variant="primary"
          onClick={onSubmit}
          disabled={isLoading || !isValid}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Budget...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Create Advanced Budget
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

interface TemplateSelectionStepProps {
  onSelectTemplate: (templateId: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const TemplateSelectionStep: React.FC<TemplateSelectionStepProps> = ({
  onSelectTemplate,
  onBack,
  isLoading
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleCreateWithTemplate = () => {
    if (selectedTemplateId) {
      onSelectTemplate(selectedTemplateId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <LayoutTemplate className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">Choose a Template</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Start with a proven budget template for your situation
        </p>
      </div>

      {/* Template List */}
      <div className="space-y-3">
        {BUDGET_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateSelect(template.id)}
            disabled={isLoading}
            className={`
              w-full p-4 rounded-lg border-2 text-left transition-all
              ${selectedTemplateId === template.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="text-2xl flex-shrink-0">{template.icon}</div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                <Badge className="mt-2 bg-green-100 text-green-700 text-xs">
                  {template.targetAudience}
                </Badge>
              </div>
              
              {/* Selection Indicator */}
              {selectedTemplateId === template.id ? (
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        {/* Back Button */}
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        {/* Create Button - Only show when template is selected */}
        {selectedTemplateId && (
          <Button
            type="button"
            variant="primary"
            onClick={handleCreateWithTemplate}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Budget...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create with Template
              </>
            )}
          </Button>
        )}
      </div>

      {/* Selection Helper */}
      {!selectedTemplateId && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-500">
            Select a template above to continue
          </p>
        </div>
      )}
    </div>
  );
};

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
    const convertedData: AIBudgetData = {
      monthlyIncome: simpleAIData.monthlyIncome || 0,
      financialGoals: simpleAIData.description,
      currentExpenses: '',
      riskTolerance: 'moderate',
    };
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

  const getStepTitle = () => {
    switch (currentStep) {
      case 'method': return 'Create New Budget with AI';
      case 'ai-simple': return 'Quick AI Setup';
      case 'ai-advanced': return 'Detailed AI Budget';
      case 'template': return 'Budget Templates';
      default: return 'Create New Budget with AI';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getStepTitle()}
      size="md"
      className="sm:max-w-md mx-4 sm:mx-auto"
    >
      <div className="relative">
        {/* Content */}
        <div className="space-y-4">
          {renderCurrentStep()}
        </div>

        {/* Loading Overlay */}
        {(isAILoading || isTemplateLoading) && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {isAILoading ? 'AI is creating your budget...' : 'Setting up template...'}
                </h3>
                <p className="text-gray-600 text-sm">
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

export default AIBudgetCreationModal;