import React from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Trash2, Archive, Eye, Copy, TrendingUp, TrendingDown } from 'lucide-react';
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
  const { summary } = budget;
  
  // If no summary data (fallback for non-enhanced API)
  if (!summary) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: budget.color }}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate">{budget.name}</h3>
                {budget.isArchived && (
                  <Badge variant="secondary" size="sm" className="mt-1">
                    Archived
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
              <button
                onClick={() => onEdit(budget)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit budget"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDuplicate(budget)}
                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                title="Duplicate budget"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => onArchive(budget)}
                className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                title={budget.isArchived ? "Unarchive budget" : "Archive budget"}
              >
                <Archive className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(budget)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete budget"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Fixed height container for description */}
          <div className="h-12 mb-4">
            {budget.description && (
              <p className="text-gray-600 text-sm line-clamp-2">{budget.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Categories</p>
              <p className="font-medium">{budget._count?.categories || 0}</p>
            </div>
            <div>
              <p className="text-gray-500">Transactions</p>
              <p className="font-medium">{budget._count?.transactions || 0}</p>
            </div>
          </div>
        </div>

        {/* Footer - always at bottom */}
        <div className="mt-auto pt-4 pb-4 px-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Created {new Date(budget.createdAt).toLocaleDateString()}
            </span>
            <Link to={`/budgets/${budget.id}`}>
              <Button size="sm" variant="ghost">
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  const getProgressColor = (progress: number, isExpense = false) => {
    if (isExpense) {
      if (progress > 100) return 'text-red-600 bg-red-100';
      if (progress >= 90) return 'text-yellow-600 bg-yellow-100';
      return 'text-green-600 bg-green-100';
    } else {
      if (progress >= 90) return 'text-green-600 bg-green-100';
      if (progress >= 70) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    }
  };

  const getNetAmountDisplay = () => {
    const isPositive = summary.netActual >= 0;
    return {
      amount: summary.netActual,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      icon: isPositive ? TrendingUp : TrendingDown,
      label: isPositive ? 'Surplus' : 'Deficit'
    };
  };

  const netDisplay = getNetAmountDisplay();
  const NetIcon = netDisplay.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div
              className="w-5 h-5 rounded-full ring-2 ring-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: budget.color }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight truncate">{budget.name}</h3>
              {budget.isArchived && (
                <Badge variant="secondary" size="sm" className="mt-1">
                  Archived
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
            <button
              onClick={() => onEdit(budget)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Edit budget"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDuplicate(budget)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
              title="Duplicate budget"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => onArchive(budget)}
              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
              title={budget.isArchived ? "Unarchive budget" : "Archive budget"}
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(budget)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Delete budget"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Fixed height container for description */}
        <div className="h-12">
          {budget.description && (
            <p className="text-gray-600 text-sm line-clamp-2">{budget.description}</p>
          )}
        </div>
      </div>

      {/* Financial Summary - flexible content */}
      <div className="px-6 pb-4 flex-1">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 h-full flex flex-col">
          <div className="grid grid-cols-2 gap-4 mb-4 flex-1">
            {/* Income Section */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Income</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold text-gray-900">{formatCurrency(summary.totalActualIncome)}</span>
                <span className="text-gray-500"> / {formatCurrency(summary.totalPlannedIncome)}</span>
              </p>
              <div className="relative bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="absolute top-0 left-0 bg-green-500 h-2 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${Math.min(summary.incomeProgress, 100)}%` }}
                />
                {summary.incomeProgress > 100 && (
                  <div className="absolute top-0 left-0 bg-green-400 h-2 rounded-full opacity-60" style={{ width: '100%' }} />
                )}
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(summary.incomeProgress)}`}>
                {summary.incomeProgress.toFixed(1)}%
              </span>
            </div>

            {/* Expenses Section */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Expenses</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold text-gray-900">{formatCurrency(summary.totalActualExpenses)}</span>
                <span className="text-gray-500"> / {formatCurrency(summary.totalPlannedExpenses)}</span>
              </p>
              <div className="relative bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ease-out ${
                    summary.expenseProgress > 100 ? 'bg-red-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(summary.expenseProgress, 100)}%` }}
                />
                {summary.expenseProgress > 100 && (
                  <div className="absolute top-0 left-0 bg-red-400 h-2 rounded-full opacity-60" style={{ width: '100%' }} />
                )}
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(summary.expenseProgress, true)}`}>
                {summary.expenseProgress.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Net Amount - always at bottom of summary */}
          <div className="border-t border-gray-200 pt-3 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <NetIcon className={`h-5 w-5 ${netDisplay.color}`} />
                <span className="text-sm font-semibold text-gray-700">{netDisplay.label}</span>
              </div>
              <span className={`text-xl font-bold ${netDisplay.color}`}>
                {formatCurrency(Math.abs(netDisplay.amount))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - always at bottom */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Created {new Date(budget.createdAt).toLocaleDateString()}
          </span>
          <Link to={`/budgets/${budget.id}`}>
            <Button size="sm" variant="ghost">
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};