// src/components/features/budget/BudgetsList.tsx
import React, { useState, useCallback, memo } from 'react';
import { 
  Calendar,
  Wallet,
  CreditCard,
  PiggyBank,
  MoreVertical,
  Users,
  Archive,
  Clock,
  ChevronRight,
  DollarSign,
  Target,
  Activity,
  Eye,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  Home,
  Car,
  ShoppingCart,
  Coffee,
  Heart,
  Briefcase,
  GraduationCap,
  Plane,
  Edit,
  Copy,
  Trash2,
  Share2,
  Download,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';

// UI Components
import { 
  Card, 
  Badge,
  Button
} from '../../ui';

// Feature Components
import { BudgetActionsMenu } from './BudgetActionsMenu';

// Types
import { Budget } from '../../../types';

// Utils
import { cn } from '../../../utils/helpers';

interface BudgetsListProps {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onDuplicate: (budget: Budget) => void;
  onArchive: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  formatCurrency: (amount: number) => string;
  className?: string;
}

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDuplicate: (budget: Budget) => void;
  onArchive: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  formatCurrency: (amount: number) => string;
}

// Progress Bar Component
const ProgressBar: React.FC<{
  value: number;
  max: number;
  variant?: 'income' | 'expense' | 'neutral';
  size?: 'sm' | 'md';
  showPercentage?: boolean;
}> = ({ value, max, variant = 'neutral', size = 'md', showPercentage = false }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOverBudget = value > max && max > 0;

  const colorClasses = {
    income: 'bg-green-500',
    expense: isOverBudget ? 'bg-red-500' : 'bg-blue-500',
    neutral: 'bg-gray-500'
  };

  const bgColorClasses = {
    income: 'bg-green-100',
    expense: 'bg-blue-100',
    neutral: 'bg-gray-100'
  };

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2'
  };

  return (
    <div className="space-y-1">
      <div className={cn('w-full rounded-full overflow-hidden', bgColorClasses[variant], heightClasses[size])}>
        <div
          className={cn('h-full transition-all duration-300 rounded-full', colorClasses[variant])}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>{percentage.toFixed(0)}%</span>
          {isOverBudget && (
            <span className="text-red-600 font-medium">Over budget</span>
          )}
        </div>
      )}
    </div>
  );
};

// Budget Status Badge Component
const BudgetStatusBadge: React.FC<{ budget: Budget }> = ({ budget }) => {
  const summary = budget.summary;
  if (!summary) return null;

  const netActual = summary.netActual || 0;
  const netPlanned = summary.netPlanned || 0;
  const variance = netActual - netPlanned;

  if (Math.abs(variance) < 100) {
    return (
      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        On Track
      </Badge>
    );
  }

  if (variance < 0) {
    return (
      <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Over Budget
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
      <TrendingUp className="w-3 h-3 mr-1" />
      Surplus
    </Badge>
  );
};

// Budget Performance Indicator
const BudgetPerformance: React.FC<{ 
  budget: Budget; 
  formatCurrency: (amount: number) => string;
  compact?: boolean;
}> = ({ budget, formatCurrency, compact = false }) => {
  const summary = budget.summary;
  if (!summary) {
    return (
      <div className={compact ? "text-xs text-gray-500" : "text-sm text-gray-500"}>
        No data available
      </div>
    );
  }

  const {
    totalPlannedIncome = 0,
    totalActualIncome = 0,
    totalPlannedExpenses = 0,
    totalActualExpenses = 0,
    netActual = 0
  } = summary;

  const incomeProgress = totalPlannedIncome > 0 ? (totalActualIncome / totalPlannedIncome) * 100 : 0;
  const expenseProgress = totalPlannedExpenses > 0 ? (totalActualExpenses / totalPlannedExpenses) * 100 : 0;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Net Balance</span>
          <span className={`font-medium ${netActual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netActual)}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Income</span>
            <span>{incomeProgress.toFixed(0)}%</span>
          </div>
          <ProgressBar value={totalActualIncome} max={totalPlannedIncome} variant="income" size="sm" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Expenses</span>
            <span>{expenseProgress.toFixed(0)}%</span>
          </div>
          <ProgressBar value={totalActualExpenses} max={totalPlannedExpenses} variant="expense" size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Net Balance */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Net Balance</span>
        <span className={`text-lg font-bold ${netActual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(netActual)}
        </span>
      </div>

      {/* Income Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Income</span>
          </div>
          <div className="text-right">
            <div className="font-medium text-gray-900">
              {formatCurrency(totalActualIncome)}
            </div>
            <div className="text-xs text-gray-500">
              of {formatCurrency(totalPlannedIncome)}
            </div>
          </div>
        </div>
        <ProgressBar 
          value={totalActualIncome} 
          max={totalPlannedIncome} 
          variant="income" 
          showPercentage 
        />
      </div>

      {/* Expense Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-red-600" />
            <span className="text-gray-700">Expenses</span>
          </div>
          <div className="text-right">
            <div className="font-medium text-gray-900">
              {formatCurrency(totalActualExpenses)}
            </div>
            <div className="text-xs text-gray-500">
              of {formatCurrency(totalPlannedExpenses)}
            </div>
          </div>
        </div>
        <ProgressBar 
          value={totalActualExpenses} 
          max={totalPlannedExpenses} 
          variant="expense" 
          showPercentage 
        />
      </div>
    </div>
  );
};

// Individual Budget Card Component
const BudgetCard: React.FC<BudgetCardProps> = memo(({
  budget,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  formatCurrency,
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const handleMenuAction = useCallback((action: string) => {
    setShowActionsMenu(false);
    
    switch (action) {
      case 'edit':
        onEdit(budget);
        break;
      case 'duplicate':
        onDuplicate(budget);
        break;
      case 'archive':
        onArchive(budget);
        break;
      case 'delete':
        onDelete(budget);
        break;
    }
  }, [budget, onEdit, onDuplicate, onArchive, onDelete]);

  const handleToggleMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActionsMenu(!showActionsMenu);
  }, [showActionsMenu]);

// Get budget icon based on name/type
const getBudgetIcon = useCallback((budgetName: string, budgetColor: string) => {
  const name = budgetName.toLowerCase();
  
  // Icon mapping based on budget name keywords
  if (name.includes('home') || name.includes('house') || name.includes('rent')) return Home;
  if (name.includes('travel') || name.includes('vacation') || name.includes('trip')) return Plane;
  if (name.includes('car') || name.includes('transport') || name.includes('vehicle')) return Car;
  if (name.includes('student') || name.includes('education') || name.includes('school')) return GraduationCap;
  if (name.includes('business') || name.includes('work') || name.includes('office')) return Briefcase;
  if (name.includes('personal') || name.includes('lifestyle') || name.includes('daily')) return Coffee;
  if (name.includes('family') || name.includes('couple') || name.includes('together')) return Heart;
  if (name.includes('shopping') || name.includes('grocery') || name.includes('food')) return ShoppingCart;
  
  // Default icon
  return Wallet;
}, []);

  // Grid View
  return (
    <Link to={`/budgets/${budget.id}`} className="block">
      <Card className={cn(
        "p-5 h-full hover:shadow-lg transition-all duration-200 hover:border-blue-200 group relative",
        budget.isArchived && "bg-gray-100 border-gray-300"  // Different background instead of opacity
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ backgroundColor: budget.color }}
            >
              {React.createElement(getBudgetIcon(budget.name, budget.color), {
                className: "w-4 h-4 text-white"
              })}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-lg">
                {budget.name}
              </h3>
              {budget.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {budget.description}
                </p>
              )}
            </div>
          </div>

          <div 
            className="relative"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleMenu}
              className="opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showActionsMenu && (
              <div 
                className="absolute top-full right-0 mt-1 z-50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className="w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction('edit');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-3" />
                      Edit Budget
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction('duplicate');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-3" />
                      Duplicate Budget
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction('share');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Share2 className="h-4 w-4 mr-3" />
                      Share Budget
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction('export');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-3" />
                      Export Budget
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction('archive');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Archive className="h-4 w-4 mr-3" />
                      {budget.isArchived ? 'Unarchive Budget' : 'Archive Budget'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction('delete');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-3" />
                      Delete Budget
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <BudgetStatusBadge budget={budget} />

          {budget.isArchived &&
            <Badge variant="warning" className="bg-gray-100 text-gray-600 border-gray-200">
              <Archive className="w-3 h-3 mr-1" />
              Archived
            </Badge>
          }
        </div>

        {/* Performance Section */}
        <div className="mb-4">
          <BudgetPerformance budget={budget} formatCurrency={formatCurrency} />
        </div>

        {/* Footer Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {budget._count?.transactions || 0}
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {budget._count?.categories || 0}
            </span>
            {budget.isShared && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {budget._count?.collaborators || 0}
              </span>
            )}
          </div>
          
          <div className="text-xs">
            {formatDistanceToNow(new Date(budget.updatedAt), { addSuffix: true })}
          </div>
        </div>
      </Card>
    </Link>
  );
});

// Main BudgetsList Component
export const BudgetsList: React.FC<BudgetsListProps> = ({
  budgets,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  formatCurrency,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
        {budgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
            onDelete={onDelete}
            formatCurrency={formatCurrency}
          />
        ))}
      </div>
    </div>
  );
};