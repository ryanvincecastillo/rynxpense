// src/components/features/budget/BudgetTemplatePreview.tsx
import React from 'react';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { getTemplateById } from '../../../types/template';

interface BudgetTemplatePreviewProps {
  templateId: string;
  className?: string;
}

export const BudgetTemplatePreview: React.FC<BudgetTemplatePreviewProps> = ({
  templateId,
  className = ''
}) => {
  const template = getTemplateById(templateId);

  if (!template) {
    return null;
  }

  const incomeCategories = template.categories.filter(c => c.type === 'INCOME');
  const expenseCategories = template.categories.filter(c => c.type === 'EXPENSE');
  
  const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
  const netAmount = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
          style={{ backgroundColor: template.color }}
        >
          {template.icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{template.name}</h3>
          <p className="text-sm text-gray-600">Template Preview</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">INCOME</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-red-600 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-medium">EXPENSES</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
            <ArrowRight className="w-4 h-4" />
            <span className="text-xs font-medium">NET</span>
          </div>
          <p className={`text-lg font-semibold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netAmount)}
          </p>
        </div>
      </div>

      {/* Categories Preview */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Income Categories ({incomeCategories.length})
          </h4>
          <div className="space-y-2">
            {incomeCategories.slice(0, 3).map((category, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-gray-700">{category.name}</span>
                </div>
                <span className="font-medium text-green-600">
                  {formatCurrency(category.plannedAmount)}
                </span>
              </div>
            ))}
            {incomeCategories.length > 3 && (
              <p className="text-xs text-gray-500 pl-7">
                +{incomeCategories.length - 3} more categories
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Expense Categories ({expenseCategories.length})
          </h4>
          <div className="space-y-2">
            {expenseCategories.slice(0, 3).map((category, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-gray-700">{category.name}</span>
                </div>
                <span className="font-medium text-red-600">
                  {formatCurrency(category.plannedAmount)}
                </span>
              </div>
            ))}
            {expenseCategories.length > 3 && (
              <p className="text-xs text-gray-500 pl-7">
                +{expenseCategories.length - 3} more categories
              </p>
            )}
          </div>
        </div>

        <div className="border-t pt-3">
          <p className="text-xs text-gray-500">
            This template includes {template.sampleTransactions.length} sample transactions to help you get started.
          </p>
        </div>
      </div>
    </div>
  );
};