// src/components/features/budget/BudgetTemplateSelector.tsx
import React, { useState } from 'react';
import { Check, ChevronRight, Users, GraduationCap, User, Building2 } from 'lucide-react';
import { BUDGET_TEMPLATES, BudgetTemplate } from '../../../types/template';

interface BudgetTemplateSelectorProps {
  selectedTemplateId?: string;
  onTemplateSelect: (templateId: string | null) => void;
  className?: string;
}

const TemplateCard: React.FC<{
  template: BudgetTemplate;
  isSelected: boolean;
  onClick: () => void;
}> = ({ template, isSelected, onClick }) => {
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      '👤': <User className="w-6 h-6" />,
      '🎓': <GraduationCap className="w-6 h-6" />,
      '👨‍👩‍👧‍👦': <Users className="w-6 h-6" />,
      '🏢': <Building2 className="w-6 h-6" />
    };
    return iconMap[iconName] || <User className="w-6 h-6" />;
  };

  return (
    <div
      onClick={onClick}
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
      
      <div className="flex items-start space-x-3">
        <div 
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: template.color }}
        >
          {getIconComponent(template.icon)}
        </div>
        
        <div className="flex-grow min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            {template.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-4 text-xs text-gray-500">
              <span>
                {template.categories.filter(c => c.type === 'INCOME').length} Income
              </span>
              <span>
                {template.categories.filter(c => c.type === 'EXPENSE').length} Expenses
              </span>
              <span>
                {template.sampleTransactions.length} Transactions
              </span>
            </div>
            
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const BudgetTemplateSelector: React.FC<BudgetTemplateSelectorProps> = ({
  selectedTemplateId,
  onTemplateSelect,
  className = ''
}) => {
  const [showCustomOption, setShowCustomOption] = useState(!selectedTemplateId);

  const handleTemplateClick = (templateId: string) => {
    onTemplateSelect(templateId);
    setShowCustomOption(false);
  };

  const handleCustomClick = () => {
    onTemplateSelect(null);
    setShowCustomOption(true);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose a Template
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select a pre-built template to get started quickly, or create a custom budget from scratch.
        </p>
      </div>

      <div className="space-y-3">
        {/* Template Options */}
        {BUDGET_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplateId === template.id}
            onClick={() => handleTemplateClick(template.id)}
          />
        ))}

        {/* Custom/Blank Option */}
        <div
          onClick={handleCustomClick}
          className={`
            relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md
            ${showCustomOption && !selectedTemplateId
              ? 'border-gray-500 bg-gray-50 shadow-md' 
              : 'border-gray-200 bg-white hover:border-gray-300'
            }
          `}
        >
          {showCustomOption && !selectedTemplateId && (
            <div className="absolute top-3 right-3">
              <div className="bg-gray-500 text-white rounded-full p-1">
                <Check className="w-4 h-4" />
              </div>
            </div>
          )}
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center text-white">
              <Building2 className="w-6 h-6" />
            </div>
            
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-900 mb-1">
                Start from Scratch
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Create a completely custom budget without any predefined categories or transactions.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-4 text-xs text-gray-500">
                  <span>No predefined data</span>
                  <span>Full customization</span>
                </div>
                
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

