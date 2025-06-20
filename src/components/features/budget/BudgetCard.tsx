import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  Trash2, 
  Archive, 
  Copy, 
  TrendingUp, 
  TrendingDown, 
  MoreVertical,
  Target,
  Calendar,
  DollarSign 
} from 'lucide-react';
import { Button, Card, Badge } from '../../ui';
import { Budget } from '../../../types';

interface BudgetCardProps {
  budget: any; // Budget with summary data from enhanced API
  onEdit: (budget: Budget) => void;
  onDuplicate: (budget: Budget) => void;
  onArchive: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  formatCurrency: (amount: number) => string;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  formatCurrency
}) => {
  const navigate = useNavigate();
  const { summary } = budget;

  // Handle card click to navigate to budget details
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    if ((e.target as HTMLElement).closest('.budget-actions')) {
      return;
    }
    navigate(`/budgets/${budget.id}`);
  };

  // Handle action button clicks (prevent event propagation)
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  // Calculate progress and status for enhanced display
  const getProgressData = () => {
    if (!summary) {
      return { progress: 0, status: 'neutral', variance: 0 };
    }

    const totalPlanned = summary.totalPlannedIncome - summary.totalPlannedExpenses;
    const totalActual = summary.totalActualIncome - summary.totalActualExpenses;
    const variance = totalActual - totalPlanned;
    
    let progress = 0;
    if (summary.totalPlannedExpenses > 0) {
      progress = (summary.totalActualExpenses / summary.totalPlannedExpenses) * 100;
    }

    const status = variance >= 0 ? 'positive' : 'negative';
    
    return { progress: Math.min(progress, 100), status, variance };
  };

  const { progress, status, variance } = getProgressData();

  // Enhanced card for budgets with summary data
  if (summary) {
    return (
      <div 
        className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        onClick={handleCardClick}
      >
        <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg h-full">
        {/* Gradient background overlay */}
        <div 
          className="absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10"
          style={{ 
            background: `linear-gradient(135deg, ${budget.color}22, ${budget.color}11)` 
          }}
        />
        
        {/* Header Section */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div
                className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm ring-2 ring-white"
                style={{ backgroundColor: budget.color }}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                  {budget.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(budget.createdAt).toLocaleDateString()}
                  </span>
                  {budget.isArchived && (
                    <Badge variant="secondary" size="sm">
                      Archived
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Actions Menu */}
            <div className="budget-actions flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => handleActionClick(e, () => onEdit(budget))}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Edit budget"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => handleActionClick(e, () => onDuplicate(budget))}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                title="Duplicate budget"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => handleActionClick(e, () => onArchive(budget))}
                className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                title={budget.isArchived ? 'Unarchive budget' : 'Archive budget'}
              >
                <Archive className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => handleActionClick(e, () => onDelete(budget))}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Delete budget"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Income</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(summary.totalActualIncome)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expenses</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(summary.totalActualExpenses)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Net Balance */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Net Balance</span>
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                variance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {variance >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{formatCurrency(Math.abs(variance))}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(summary.totalActualIncome - summary.totalActualExpenses)}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                variance >= 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {variance >= 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Expense Progress</span>
              <span className="text-xs font-medium text-gray-600">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  progress > 90 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : progress > 70 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>
        </Card>

        {/* Hover indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </div>
    );
  }

  // Fallback card for budgets without summary data
  return (
    <div 
      className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg h-full">
      {/* Gradient background overlay */}
      <div 
        className="absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10"
        style={{ 
          background: `linear-gradient(135deg, ${budget.color}22, ${budget.color}11)` 
        }}
      />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm ring-2 ring-white"
              style={{ backgroundColor: budget.color }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                {budget.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(budget.createdAt).toLocaleDateString()}
                </span>
                {budget.isArchived && (
                  <Badge variant="secondary" size="sm">
                    Archived
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions Menu */}
          <div className="budget-actions flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => handleActionClick(e, () => onEdit(budget))}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Edit budget"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => handleActionClick(e, () => onDuplicate(budget))}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Duplicate budget"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => handleActionClick(e, () => onArchive(budget))}
              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200"
              title={budget.isArchived ? 'Unarchive budget' : 'Archive budget'}
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => handleActionClick(e, () => onDelete(budget))}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete budget"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Simplified content for budgets without summary */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Target className="h-5 w-5" />
            <span className="text-sm font-medium">Click to view details</span>
          </div>
        </div>

        {/* Hover indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </div>
    </Card>
    </div>
  );
};