// src/components/modals/AIBudgetCreationModal.tsx
// UnifiedBudgetCreationModal.tsx
// This modal combines AI Creation and Template functionality
import React, { useState, useCallback, useEffect } from 'react';
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
  LayoutTemplate
} from 'lucide-react';
import { Button } from '../ui';
import Modal from '../ui/Modal/Modal';
import { BUDGET_TEMPLATES, BudgetTemplate } from '../../types/template';

// Types
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
}

const defaultAIData: AIBudgetData = {
  monthlyIncome: 0,
  financialGoals: '',
  currentExpenses: '',
  riskTolerance: 'moderate'
};

export const AIBudgetCreationModal: React.FC<AIBudgetCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateWithAI,
  onCreateWithTemplate,
  onCreateManual,
  isAILoading = false,
  isTemplateLoading = false
}) => {
  const [method, setMethod] = useState<CreationMethod | null>(null);
  const [aiStep, setAIStep] = useState<AIStep>('input');
  const [aiData, setAIData] = useState<AIBudgetData>(defaultAIData);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMethod(null);
      setAIStep('input');
      setAIData(defaultAIData);
      setSelectedTemplateId(null);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (aiStep === 'processing' || isAILoading || isTemplateLoading) return;
    onClose();
  }, [aiStep, isAILoading, isTemplateLoading, onClose]);

  const handleBack = () => {
    if (method && aiStep === 'input') {
      setMethod(null);
    }
  };

  const handleAISubmit = () => {
    setAIStep('processing');
    onCreateWithAI(aiData);
  };

  const handleTemplateSelect = (templateId: string) => {
    onCreateWithTemplate(templateId);
  };

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

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      className="max-w-4xl"
    >
      <div className="relative bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            {method && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors mr-2"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {!method ? 'Create New Budget' : 
                 method === 'ai' ? 'AI Budget Creation' :
                 method === 'template' ? 'Choose Template' : 'Manual Budget'}
              </h2>
              <p className="text-sm text-gray-600">
                {!method ? 'Choose how you\'d like to create your budget' :
                 method === 'ai' ? 'Let AI create a personalized budget for you' :
                 method === 'template' ? 'Select from pre-built templates' : 'Start from scratch'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={aiStep === 'processing' || isAILoading || isTemplateLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {!method ? (
            // Method Selection Screen
            <div className="space-y-6">
              <div className="text-center pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How would you like to create your budget?
                </h3>
                <p className="text-gray-600">
                  Choose the method that works best for you
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* AI Creation Option */}
                <button
                  onClick={() => setMethod('ai')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 
                             hover:bg-purple-50 transition-all duration-200 text-left group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 
                                  rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 
                                  transition-transform duration-200">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">AI Powered</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Answer a few questions and let AI create a personalized budget with categories and goals.
                  </p>
                  <div className="flex items-center text-purple-600 text-sm font-medium">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Smart & Fast
                  </div>
                </button>

                {/* Template Option */}
                <button
                  onClick={() => setMethod('template')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 
                             hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 
                                  rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 
                                  transition-transform duration-200">
                    <LayoutTemplate className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Use Template</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Choose from pre-built templates for different lifestyles and financial situations.
                  </p>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <Zap className="w-4 h-4 mr-1" />
                    Quick Start
                  </div>
                </button>

                {/* Manual Option */}
                <button
                  onClick={() => {
                    onCreateManual();
                    onClose();
                  }}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 
                             hover:bg-green-50 transition-all duration-200 text-left group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 
                                  rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 
                                  transition-transform duration-200">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Start from Scratch</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Create a completely custom budget with full control over every detail.
                  </p>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <Target className="w-4 h-4 mr-1" />
                    Full Control
                  </div>
                </button>
              </div>
            </div>
          ) : method === 'ai' ? (
            // AI Creation Flow
            <div className="space-y-6">
              {aiStep === 'input' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Wand2 className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">AI Budget Assistant</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      I'll create a personalized budget based on your financial information. 
                      All data stays private and secure.
                    </p>
                  </div>

                  <div className="grid gap-6">
                    {/* Monthly Income */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Monthly Income (₱)
                      </label>
                      <input
                        type="number"
                        value={aiData.monthlyIncome || ''}
                        onChange={(e) => setAIData(prev => ({ 
                          ...prev, 
                          monthlyIncome: parseFloat(e.target.value) || 0 
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                                   focus:ring-purple-500 focus:border-purple-500"
                        placeholder="50000"
                      />
                    </div>

                    {/* Financial Goals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Financial Goals
                      </label>
                      <textarea
                        value={aiData.financialGoals}
                        onChange={(e) => setAIData(prev => ({ 
                          ...prev, 
                          financialGoals: e.target.value 
                        }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                                   focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., Save for emergency fund, pay off debt, buy a house..."
                      />
                    </div>

                    {/* Current Expenses */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Current Major Expenses
                      </label>
                      <textarea
                        value={aiData.currentExpenses}
                        onChange={(e) => setAIData(prev => ({ 
                          ...prev, 
                          currentExpenses: e.target.value 
                        }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                                   focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., Rent ₱15000, Food ₱8000, Transportation ₱5000..."
                      />
                    </div>

                    {/* Risk Tolerance */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Saving Approach
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'conservative', label: 'Conservative', desc: 'Safe & steady' },
                          { value: 'moderate', label: 'Balanced', desc: 'Moderate growth' },
                          { value: 'aggressive', label: 'Aggressive', desc: 'Higher risk/reward' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setAIData(prev => ({ 
                              ...prev, 
                              riskTolerance: option.value as any 
                            }))}
                            className={`p-3 border-2 rounded-lg text-center transition-all duration-200 ${
                              aiData.riskTolerance === option.value
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium text-sm">{option.label}</div>
                            <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleAISubmit}
                      disabled={!aiData.monthlyIncome || !aiData.financialGoals.trim()}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 
                                 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg 
                                 transition-all duration-200 disabled:opacity-50"
                    >
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Generate AI Budget</span>
                      </div>
                    </Button>
                  </div>
                </div>
              )}

              {aiStep === 'processing' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 
                                  rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Creating Your Personalized Budget
                  </h4>
                  <p className="text-gray-600">
                    AI is analyzing your financial information and creating a custom budget...
                  </p>
                </div>
              )}
            </div>
          ) : method === 'template' ? (
            // Template Selection
            <div className="space-y-6">
              <div className="text-center pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Choose a Budget Template
                </h3>
                <p className="text-gray-600">
                  Select a pre-built template that matches your lifestyle
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {BUDGET_TEMPLATES.map((template) => {
                  const incomeCategories = template.categories.filter(c => c.type === 'INCOME');
                  const expenseCategories = template.categories.filter(c => c.type === 'EXPENSE');
                  const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
                  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
                  
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      disabled={isTemplateLoading}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 
                                 hover:bg-blue-50 transition-all duration-200 text-left group disabled:opacity-50"
                    >
                      <div className="flex items-start space-x-4">
                        <div 
                          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center 
                                     justify-center text-white group-hover:scale-105 
                                     transition-transform duration-200"
                          style={{ backgroundColor: template.color }}
                        >
                          {getIconComponent(template.icon)}
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                            {template.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-4 text-xs text-gray-500">
                              <span>{incomeCategories.length} Income</span>
                              <span>{expenseCategories.length} Expenses</span>
                              <span>{template.sampleTransactions.length} Transactions</span>
                            </div>
                            
                            <div className="text-xs text-gray-600">
                              Net: {formatCurrency(totalIncome - totalExpenses)}
                            </div>
                          </div>
                        </div>

                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 
                                               transition-colors duration-200" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};