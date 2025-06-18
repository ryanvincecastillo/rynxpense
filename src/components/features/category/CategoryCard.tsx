import React from 'react';
import { Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card, Badge, ProgressBar } from '../../ui';
import { BudgetCategory } from '../../../types';

interface CategoryCardProps {
  category: BudgetCategory;
  onEdit: (category: BudgetCategory) => void;
  onDelete: (category: BudgetCategory) => void;
  onToggleActive: (category: BudgetCategory) => void;
  formatCurrency: (amount: number) => string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onToggleActive,
  formatCurrency
}) => {
  const getCategoryPerformance = (category: BudgetCategory) => {
    if (category.plannedAmount === 0) return 0;
    return (category.actualAmount / category.plannedAmount) * 100;
  };

  const performance = getCategoryPerformance(category);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            <Badge 
              variant={category.type === 'INCOME' ? 'success' : 'error'} 
              size="sm"
            >
              {category.type}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onToggleActive(category)}
            className={`p-1 transition-colors ${
              category.isActive 
                ? 'text-gray-400 hover:text-yellow-600' 
                : 'text-yellow-600 hover:text-gray-600'
            }`}
            title={category.isActive ? "Deactivate category" : "Activate category"}
          >
            {category.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onEdit(category)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit category"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Actual</span>
          <span className={`font-semibold ${
            category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(category.actualAmount)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Planned</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(category.plannedAmount)}
          </span>
        </div>
        
        {category.plannedAmount > 0 && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">
                {category.type === 'INCOME' ? 'Progress' : 'Usage'}
              </span>
              <span className="text-xs text-gray-600">{performance.toFixed(1)}%</span>
            </div>
            <ProgressBar
              value={category.actualAmount}
              max={category.plannedAmount}
              color={
                category.type === 'INCOME' 
                  ? "green" 
                  : performance > 100 ? "red" : performance > 80 ? "yellow" : "blue"
              }
              size="sm"
            />
          </div>
        )}

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{category._count?.transactions || 0} transactions</span>
            <span className={`font-medium ${category.isActive ? 'text-green-600' : 'text-gray-400'}`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};