import React, { useState, useCallback, memo } from 'react';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  PiggyBank,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// UI Components
import { 
  Card, 
  Badge
} from '../../ui';

// Feature Components
import { BudgetActionsMenu } from './BudgetActionsMenu';

// Types
import { Budget } from '../../../types';

// Utils
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../../utils/helpers';

interface BudgetsListProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDuplicate: (budget: Budget) => void;
  onArchive: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  formatCurrency: (amount: number) => string;
  viewMode: 'grid' | 'list';
  className?: string;
}

export const BudgetsList: React.FC<BudgetsListProps> = memo(({
  budget,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  formatCurrency,
  viewMode,
  className,
}) => {
  // State for actions menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const isActionsMenuOpen = openMenuId === budget.id;

  // Handlers
  const handleEdit = useCallback(() => {
    onEdit(budget);
  }, [budget, onEdit]);

  const handleDuplicate = useCallback(() => {
    onDuplicate(budget);
  }, [budget, onDuplicate]);

  const handleArchive = useCallback(() => {
    onArchive(budget);
  }, [budget, onArchive]);

  const handleDelete = useCallback(() => {
    onDelete(budget);
  }, [budget, onDelete]);

  const handleToggleActionsMenu = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpenMenuId(prev => prev === budget.id ? null : budget.id);
  }, [budget.id]);

  const handleMenuAction = useCallback((action: string) => {
    switch (action) {
      case 'edit':
        handleEdit();
        break;
      case 'duplicate':
        handleDuplicate();
        break;
      case 'archive':
        handleArchive();
        break;
      case 'delete':
        handleDelete();
        break;
    }
    setOpenMenuId(null);
  }, [handleEdit, handleDuplicate, handleArchive, handleDelete]);

  // Extract budget summary data
  const summary = budget.summary;
  const plannedIncome = summary?.totalPlannedIncome || 0;
  const actualIncome = summary?.totalActualIncome || 0;
  const plannedExpenses = summary?.totalPlannedExpenses || 0;
  const actualExpenses = summary?.totalActualExpenses || 0;
  const netActual = summary?.netActual || 0;
  const netPlanned = summary?.netPlanned || 0;

  // Calculate progress percentages
  const incomeProgress = plannedIncome > 0 ? (actualIncome / plannedIncome) * 100 : 0;
  const expenseProgress = plannedExpenses > 0 ? (actualExpenses / plannedExpenses) * 100 : 0;

  // Helper function to convert hex to rgba
  const hexToRgba = useCallback((hex: string, alpha: number) => {
    const cleanHex = hex.replace('#', '');
    let fullHex = cleanHex;
    if (cleanHex.length === 3) {
      fullHex = cleanHex.split('').map(char => char + char).join('');
    }
    
    const r = parseInt(fullHex.slice(0, 2), 16);
    const g = parseInt(fullHex.slice(2, 4), 16);
    const b = parseInt(fullHex.slice(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  // Determine status color for net amount
  const getNetStatusColor = (amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Grid View
  if (viewMode === 'grid') {
    return (
      <Link to={`/budgets/${budget.id}`} className="block">
        <div
          className="relative h-full transition-all duration-200 hover:shadow-lg group bg-white rounded-xl shadow-sm border p-6 flex flex-col"
          style={{
            backgroundColor: hexToRgba(budget.color, 0.15),
            borderColor: hexToRgba(budget.color, 0.4),
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.backgroundColor = hexToRgba(budget.color, 0.2);
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.backgroundColor = hexToRgba(budget.color, 0.15);
          }}
        >
          {/* Header - Fixed Height */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-base mb-2">
                {budget.name}
              </h3>
              {/* Fixed height container for description */}
              <div className="h-10 overflow-hidden">
                {budget.description && (
                  <p 
                    className="text-sm text-gray-600 leading-5"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {budget.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Actions Menu */}
            <div
              className="flex-shrink-0 ml-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <BudgetActionsMenu
                budget={budget}
                isOpen={isActionsMenuOpen}
                onToggle={handleToggleActionsMenu}
                onAction={handleMenuAction}
              />
            </div>
          </div>

          {/* Budget Details Grid - Flexible Content */}
          <div className="flex-1 space-y-4">
            {/* Income vs Expense Progress Bars */}
            <div className="space-y-3">
              {/* Income Progress */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-gray-600">Income</span>
                  </div>
                  <span className="text-gray-500">{Math.round(incomeProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200/60 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-green-500 transition-all duration-300"
                    style={{ width: `${Math.min(incomeProgress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Expense Progress */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-red-600" />
                    <span className="text-gray-600">Expenses</span>
                  </div>
                  <span className="text-gray-500">{Math.round(expenseProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200/60 rounded-full h-1.5">
                  <div
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      expenseProgress >= 100 ? 'bg-red-500' :
                      expenseProgress >= 80 ? 'bg-yellow-500' : 'bg-red-400'
                    )}
                    style={{ width: `${Math.min(expenseProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="space-y-3">
              {/* Income Section */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500 mb-0.5">Planned Income</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(plannedIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Actual Income</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(actualIncome)}
                  </p>
                </div>
              </div>

              {/* Expense Section */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500 mb-0.5">Planned Expenses</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(plannedExpenses)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Actual Expenses</p>
                  <p className="font-medium text-red-600">
                    {formatCurrency(actualExpenses)}
                  </p>
                </div>
              </div>

              {/* Net Amount - Highlighted */}
              <div className="pt-2 border-t border-gray-200/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <PiggyBank className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">Net Amount</span>
                  </div>
                  <div className="text-right">
                    <p className={cn('font-semibold text-sm', getNetStatusColor(netActual))}>
                      {formatCurrency(netActual)}
                    </p>
                    {netPlanned !== netActual && (
                      <p className="text-xs text-gray-400">
                        vs {formatCurrency(netPlanned)} planned
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Meta Info - Always at bottom */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200/40 mt-auto">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {budget.createdAt ? 
                    `Created ${formatDistanceToNow(new Date(budget.createdAt), { addSuffix: true })}` : 
                    'Budget'
                  }
                </span>
              </div>
              {budget.isArchived && (
                <Badge variant="secondary" className="text-xs">
                  Archived
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // List View - Horizontal layout
  return (
    <Link to={`/budgets/${budget.id}`} className="block">
      <div
        className="rounded-lg border transition-all duration-200 hover:shadow-md p-4"
        style={{
          backgroundColor: hexToRgba(budget.color, 0.15),
          borderColor: hexToRgba(budget.color, 0.4),
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.backgroundColor = hexToRgba(budget.color, 0.2);
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.backgroundColor = hexToRgba(budget.color, 0.15);
        }}
      >
        <div className="flex items-start justify-between">
          {/* Left Section - Budget Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-base mb-2">
                  {budget.name}
                </h3>
                {/* Fixed height for description in list view too */}
                <div className="h-5 overflow-hidden">
                  {budget.description && (
                    <p 
                      className="text-sm text-gray-600"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {budget.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Actions Menu */}
              <div
                className="flex-shrink-0 ml-4"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <BudgetActionsMenu
                  budget={budget}
                  isOpen={isActionsMenuOpen}
                  onToggle={handleToggleActionsMenu}
                  onAction={handleMenuAction}
                />
              </div>
            </div>

            {/* Financial Details in Horizontal Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-3">
              {/* Planned Income */}
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-1 mb-1 justify-center lg:justify-start">
                  <Wallet className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-500">Planned Income</span>
                </div>
                <p className="font-medium text-gray-900 text-sm">
                  {formatCurrency(plannedIncome)}
                </p>
              </div>

              {/* Actual Income */}
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-1 mb-1 justify-center lg:justify-start">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-500">Actual Income</span>
                </div>
                <p className="font-medium text-green-600 text-sm">
                  {formatCurrency(actualIncome)}
                </p>
              </div>

              {/* Planned Expenses */}
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-1 mb-1 justify-center lg:justify-start">
                  <CreditCard className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-500">Planned Expenses</span>
                </div>
                <p className="font-medium text-gray-900 text-sm">
                  {formatCurrency(plannedExpenses)}
                </p>
              </div>

              {/* Actual Expenses */}
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-1 mb-1 justify-center lg:justify-start">
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-gray-500">Actual Expenses</span>
                </div>
                <p className="font-medium text-red-600 text-sm">
                  {formatCurrency(actualExpenses)}
                </p>
              </div>

              {/* Net Amount */}
              <div className="text-center lg:text-left col-span-2 lg:col-span-1">
                <div className="flex items-center gap-1 mb-1 justify-center lg:justify-start">
                  <PiggyBank className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-500">Net Amount</span>
                </div>
                <p className={cn('font-semibold text-sm', getNetStatusColor(netActual))}>
                  {formatCurrency(netActual)}
                </p>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              {/* Income Progress */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Income Progress</span>
                  <span className="text-gray-500">{Math.round(incomeProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200/60 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-green-500 transition-all duration-300"
                    style={{ width: `${Math.min(incomeProgress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Expense Progress */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Expense Progress</span>
                  <span className="text-gray-500">{Math.round(expenseProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200/60 rounded-full h-1.5">
                  <div
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      expenseProgress >= 100 ? 'bg-red-500' :
                      expenseProgress >= 80 ? 'bg-yellow-500' : 'bg-red-400'
                    )}
                    style={{ width: `${Math.min(expenseProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200/40">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {budget.createdAt ? 
                    `Created ${formatDistanceToNow(new Date(budget.createdAt), { addSuffix: true })}` : 
                    'Budget'
                  }
                </span>
              </div>
              {budget.isArchived && (
                <Badge variant="secondary" className="text-xs">
                  Archived
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

BudgetsList.displayName = 'BudgetsList';