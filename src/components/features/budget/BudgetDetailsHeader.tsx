import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  PiggyBank,
} from 'lucide-react';
import { format } from 'date-fns';

// UI Components
import { Badge } from '../../ui';

// Types
import { Budget } from '../../../types';

// Hooks
import { useBudgetSummary } from '../../../hooks/useApi';

// Utils
import { cn } from '../../../utils/helpers';

interface BudgetDetailsHeaderProps {
  budget: Budget;
  onEdit: () => void;
  onQuickAction: (action: string, type?: string) => void;
  formatCurrency: (amount: number) => string;
  children?: React.ReactNode;
}

export const BudgetDetailsHeader: React.FC<BudgetDetailsHeaderProps> = ({
  budget,
  onEdit,
  onQuickAction,
  formatCurrency,
  children,
}) => {
  const { budgetId } = useParams<{ budgetId: string }>();
  
  // Fetch budget summary data separately
  const { data: summary, isLoading: summaryLoading } = useBudgetSummary(budgetId!);

  // Helper function to convert hex to rgba (matching BudgetsList)
  const hexToRgba = (hex: string, alpha: number) => {
    // Remove # if present
    const cleanHex = hex.replace('#', '');
    
    // Handle 3-digit hex codes
    let fullHex = cleanHex;
    if (cleanHex.length === 3) {
      fullHex = cleanHex.split('').map(char => char + char).join('');
    }
    
    // Parse RGB values
    const r = parseInt(fullHex.slice(0, 2), 16);
    const g = parseInt(fullHex.slice(2, 4), 16);
    const b = parseInt(fullHex.slice(4, 6), 16);
    
    // Return rgba string
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Extract budget summary data from the API response
  const plannedIncome = summary?.totalPlannedIncome || 0;
  const actualIncome = summary?.totalActualIncome || 0;
  const plannedExpenses = summary?.totalPlannedExpenses || 0;
  const actualExpenses = summary?.totalActualExpenses || 0;
  const netActual = summary?.netActual || 0;
  const netPlanned = summary?.netPlanned || 0;

  // Determine status color for net amount
  const getNetStatusColor = (amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div 
      className="rounded-lg border transition-all duration-200 mb-6 hover:shadow-md"
      style={{
        backgroundColor: budget.color ? hexToRgba(budget.color, 0.15) : hexToRgba('#3B82F6', 0.15),
        borderColor: budget.color ? hexToRgba(budget.color, 0.4) : hexToRgba('#3B82F6', 0.4),
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg border-0 p-4">
          {/* Top Section - Navigation and Budget Info */}
          <div className="flex items-center justify-between mb-4">
            {/* Left section - Navigation and Budget info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Link 
                to="/budgets" 
                className="p-1.5 hover:bg-white/50 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                title="Back to Budgets"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Color indicator */}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
                  style={{ backgroundColor: budget.color || '#3B82F6' }}
                />
                
                {/* Budget name and basic info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                      {budget.name}
                    </h1>
                    {budget.isArchived && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                        Archived
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 text-xs text-gray-600 space-y-0.5 sm:space-y-0">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Created {format(new Date(budget.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {budget.description && (
                      <span className="truncate hidden sm:block">{budget.description}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right section - Actions */}
            <div className="flex items-center space-x-2 ml-3">
              {children}
            </div>
          </div>

          {/* Financial Details Section - Compact */}
          <div className="border-t border-gray-200/40 pt-3">
            {summaryLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded w-20 h-8 bg-gray-200"></div>
                  <div className="rounded w-20 h-8 bg-gray-200"></div>
                  <div className="rounded w-20 h-8 bg-gray-200"></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {/* Actual Income (Emphasized) */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center gap-1.5 mb-1 justify-center lg:justify-start">
                    <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-xs text-gray-500 leading-none">Actual Income</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-600 text-sm lg:text-base">
                    {formatCurrency(actualIncome)}
                  </p>
                  {/* <p className="text-xs text-gray-500 lg:hidden mb-1">Actual Income</p> */}
                  <p className="text-xs text-gray-400">
                    Planned: {formatCurrency(plannedIncome)}
                  </p>
                </div>

                {/* Actual Expenses (Emphasized) */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center gap-1.5 mb-1 justify-center lg:justify-start">
                    <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center">
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-xs text-gray-500 leading-none">Actual Expenses</p>
                    </div>
                  </div>
                  <p className="font-bold text-red-600 text-sm lg:text-base">
                    {formatCurrency(actualExpenses)}
                  </p>
                  {/* <p className="text-xs text-gray-500 lg:hidden mb-1">Actual Expenses</p> */}
                  <p className="text-xs text-gray-400">
                    Planned: {formatCurrency(plannedExpenses)}
                  </p>
                </div>

                {/* Net Amount - Most Emphasized */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center gap-1.5 mb-1 justify-center lg:justify-start">
                    <div className={cn(
                      'w-6 h-6 rounded-md flex items-center justify-center',
                      netActual > 0 ? 'bg-green-100' : netActual < 0 ? 'bg-red-100' : 'bg-gray-100'
                    )}>
                      <PiggyBank className={cn(
                        'h-3 w-3',
                        netActual > 0 ? 'text-green-600' : netActual < 0 ? 'text-red-600' : 'text-gray-600'
                      )} />
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-xs text-gray-500 leading-none">Net Amount</p>
                    </div>
                  </div>
                  <div>
                    <p className={cn('font-bold text-base lg:text-lg', getNetStatusColor(netActual))}>
                      {formatCurrency(netActual)}
                    </p>
                    {/* <p className="text-xs text-gray-500 lg:hidden mb-1">Net Amount</p> */}
                    <p className="text-xs text-gray-400">
                      vs {formatCurrency(netPlanned)} planned
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};