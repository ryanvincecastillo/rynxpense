import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  Trash2, 
  Archive, 
  Copy, 
  TrendingUp, 
  TrendingDown, 
  MoreVertical,
  Calendar,
  DollarSign,
  Target,
  Activity
} from 'lucide-react';
import { Button, Card, Badge } from '../../ui';
import { Budget } from '../../../types';
import { format } from 'date-fns';

interface BudgetCardProps {
  budget: any; // Budget with summary data
  onEdit: (budget: Budget) => void;
  onDuplicate: (budget: Budget) => void;
  onArchive: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  formatCurrency: (amount: number) => string;
  viewMode?: 'grid' | 'list';
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  formatCurrency,
  viewMode = 'grid'
}) => {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const { summary } = budget;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.budget-actions')) {
      return;
    }
    navigate(`/budgets/${budget.id}`);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    setShowActions(false);
  };

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

  // List View Layout
  if (viewMode === 'list') {
    return (
      <div 
        className="cursor-pointer hover:shadow-md transition-all duration-200 group"
        onClick={handleCardClick}
      >
        <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Color Indicator */}
            <div 
              className="w-10 h-10 rounded-lg flex-shrink-0 border-2 border-white shadow-sm"
              style={{ backgroundColor: budget.color }}
            />
            
            {/* Budget Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {budget.name}
                </h3>
                {budget.isArchived && (
                  <Badge variant="secondary" size="sm">
                    <Archive className="h-3 w-3 mr-1" />
                    Archived
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Created {format(new Date(budget.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="hidden sm:flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Income</p>
                <p className="text-sm font-semibold text-green-600">
                  {formatCurrency(summary.totalActualIncome)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expenses</p>
                <p className="text-sm font-semibold text-red-600">
                  {formatCurrency(summary.totalActualExpenses)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Balance</p>
                <p className={`text-sm font-semibold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(variance)}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="budget-actions relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={(e) => handleActionClick(e, () => onEdit(budget))}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Budget
                </button>
                <button
                  onClick={(e) => handleActionClick(e, () => onDuplicate(budget))}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <button
                  onClick={(e) => handleActionClick(e, () => onArchive(budget))}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Archive className="h-4 w-4" />
                  {budget.isArchived ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  onClick={(e) => handleActionClick(e, () => onDelete(budget))}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        </Card>
      </div>
    );
  }

  // Grid View Layout (Enhanced Card)
  return (
    <div 
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      onClick={handleCardClick}
    >
      <div className="bg-white rounded-xl border border-gray-100/50 shadow-sm hover:shadow-md transition-all duration-300 h-full">
        {/* Subtle gradient overlay */}
        <div 
          className="absolute inset-0 opacity-2 transition-opacity group-hover:opacity-5 rounded-xl"
          style={{ 
            background: `linear-gradient(135deg, ${budget.color}10, transparent)` 
          }}
        />
        
        {/* Header */}
        <div className="relative p-4 pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div 
                className="w-10 h-10 rounded-lg flex-shrink-0 shadow-sm"
                style={{ backgroundColor: budget.color }}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 leading-tight truncate text-base">
                  {budget.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(budget.createdAt), 'MMM dd')}
                  </span>
                  {budget.isArchived && (
                    <Badge variant="secondary" size="sm" className="text-xs">
                      Archived
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="budget-actions relative">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 h-8 w-8 bg-white/80 hover:bg-white border-gray-200/50"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>

              {showActions && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                  <button
                    onClick={(e) => handleActionClick(e, () => onEdit(budget))}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleActionClick(e, () => onDuplicate(budget))}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Duplicate
                  </button>
                  <button
                    onClick={(e) => handleActionClick(e, () => onArchive(budget))}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    {budget.isArchived ? 'Unarchive' : 'Archive'}
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={(e) => handleActionClick(e, () => onDelete(budget))}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative px-4 pb-4">
          {summary ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50/70 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 bg-green-50 rounded flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Income</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(summary.totalActualIncome)}
                  </p>
                </div>
                
                <div className="bg-gray-50/70 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 bg-red-50 rounded flex items-center justify-center">
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expenses</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(summary.totalActualExpenses)}
                  </p>
                </div>
              </div>

              {/* Net Balance */}
              <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Net Balance</span>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    variance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {variance >= 0 ? 
                      <TrendingUp className="h-3.5 w-3.5" /> : 
                      <TrendingDown className="h-3.5 w-3.5" />
                    }
                    {formatCurrency(Math.abs(variance))}
                  </div>
                </div>
                
                {progress > 0 && (
                  <div className="mt-2">
                    {/* Simple Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          progress > 100 ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Expense Progress</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Simple card for budgets without summary
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {budget.description || 'No description provided'}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Click to view details</span>
                <Activity className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;