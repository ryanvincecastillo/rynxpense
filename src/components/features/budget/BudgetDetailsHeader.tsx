// src/components/features/budget/BudgetDetailsHeader.tsx
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Activity, 
  Target,
  Plus,
  Minus,
  TrendingUp,
  Archive,
  Crown,
  Eye,
  Wallet,
  Home,
  Car,
  ShoppingCart,
  Coffee,
  Heart,
  Briefcase,
  GraduationCap,
  Plane,
  TrendingDown
} from 'lucide-react';
import { Badge } from '../../ui';
import { Budget, BudgetSummary } from '../../../types';
import { useBudgetSummary } from '../../../hooks/useApi';

interface BudgetDetailsHeaderProps {
  budget: Budget;
  formatCurrency: (amount: number) => string;
  children?: React.ReactNode;
}

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
  const cleanHex = hex.replace('#', '');
  let fullHex = cleanHex;
  if (cleanHex.length === 3) {
    fullHex = cleanHex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(fullHex.slice(0, 2), 16);
  const g = parseInt(fullHex.slice(2, 4), 16);
  const b = parseInt(fullHex.slice(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Budget Icon component - same as other components
const getBudgetIcon = (budgetName: string, budgetColor: string) => {
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
};

export const BudgetDetailsHeader: React.FC<BudgetDetailsHeaderProps> = ({
  budget,
  formatCurrency,
  children
}) => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const { data: summary, isLoading: summaryLoading } = useBudgetSummary(budgetId!);

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    if (!summary) return null;

    const {
      totalPlannedIncome = 0,
      totalActualIncome = 0,
      totalPlannedExpenses = 0,
      totalActualExpenses = 0,
      netActual = 0,
      netPlanned = 0
    } = summary;

    const incomeProgress = totalPlannedIncome > 0 ? (totalActualIncome / totalPlannedIncome) * 100 : 0;
    const expenseProgress = totalPlannedExpenses > 0 ? (totalActualExpenses / totalPlannedExpenses) * 100 : 0;
    const variance = netActual - netPlanned;

    return {
      totalPlannedIncome,
      totalActualIncome,
      totalPlannedExpenses,
      totalActualExpenses,
      netActual,
      netPlanned,
      incomeProgress,
      expenseProgress,
      variance
    };
  }, [summary]);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-b border-gray-200/60 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 sm:py-4">
          {/* Main Header Row - Compact on Mobile */}
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            {/* Left - Back Button and Budget Info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Back Button */}
              <Link 
                to="/budgets" 
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-white hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                title="Back to Budgets"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </Link>

              {/* Budget Info */}
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                {/* Budget Icon with Color - Smaller on Mobile */}
                <div 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: budget.color }}
                >
                  {React.createElement(getBudgetIcon(budget.name, budget.color), {
                    className: "w-4 h-4 sm:w-5 sm:h-5 text-white"
                  })}
                </div>
                
                {/* Budget Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent truncate">
                      {budget.name}
                    </h1>
                    
                    {/* Status Badges - Hidden on small mobile */}
                    <div className="hidden sm:flex items-center gap-1">
                      {budget.isArchived && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                          <Archive className="w-3 h-3 mr-1" />
                          Archived
                        </Badge>
                      )}
                      
                      {budget.userRole === 'OWNER' && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Owner
                        </Badge>
                      )}
                      
                      {budget.isShared && (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Metadata - More compact on mobile */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className="hidden sm:inline">Created </span>
                      <span>{format(new Date(budget.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    {budget.isShared && (
                      <Badge className="sm:hidden bg-purple-100 text-purple-700 border-purple-200 text-xs px-1 py-0">
                        Shared
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center ml-2 sm:ml-3">
              {children}
            </div>
          </div>

          {/* Mobile Compact Financial Summary */}
          <div className="block sm:hidden">
            {summaryLoading ? (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                <div className="animate-pulse flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ) : financialMetrics && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Net</p>
                    <p className={`font-bold ${financialMetrics.netActual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(financialMetrics.netActual)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Income</p>
                    <p className="font-bold text-green-600">
                      {formatCurrency(financialMetrics.totalActualIncome)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Expenses</p>
                    <p className="font-bold text-red-600">
                      {formatCurrency(financialMetrics.totalActualExpenses)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Financial Summary Cards - Hidden on Mobile */}
          <div className="hidden sm:block">
            {summaryLoading ? (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 mb-4">
                <div className="animate-pulse flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ) : financialMetrics && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {/* Net Balance - Most Important */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:border-blue-200 transition-all duration-200 col-span-1 sm:col-span-3 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Net Balance</p>
                      <p className={`text-2xl font-bold mt-1 ${
                        financialMetrics.netActual >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(financialMetrics.netActual)}
                      </p>
                      {financialMetrics.variance !== 0 && (
                        <p className={`text-xs mt-1 ${
                          financialMetrics.variance > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {financialMetrics.variance > 0 ? '+' : ''}{formatCurrency(financialMetrics.variance)} vs planned
                        </p>
                      )}
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      financialMetrics.netActual >= 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {
                        financialMetrics.netActual >= 0 ? (
                          <TrendingUp className="w-6 h-6 text-green-600" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-red-600 transform" />
                        )
                      }
                    </div>
                  </div>
                </div>

                {/* Income Summary */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:border-green-200 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Income</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(financialMetrics.totalActualIncome)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Plus className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Progress</span>
                      <span>{Math.round(financialMetrics.incomeProgress)}%</span>
                    </div>
                    <div className="w-full bg-green-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500 transition-all duration-300"
                        style={{ width: `${Math.min(financialMetrics.incomeProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expenses Summary */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:border-red-200 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Expenses</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(financialMetrics.totalActualExpenses)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Minus className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Usage</span>
                      <span>{Math.round(financialMetrics.expenseProgress)}%</span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          financialMetrics.expenseProgress > 100 ? 'bg-red-600' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(financialMetrics.expenseProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Row - More Compact */}
          {/* <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-200/50">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{budget._count?.categories || 0} Categories</span>
                <span className="sm:hidden">{budget._count?.categories || 0}</span>
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{budget._count?.transactions || 0} Transactions</span>
                <span className="sm:hidden">{budget._count?.transactions || 0}</span>
              </span>
              {(budget._count?.collaborators ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{budget._count?.collaborators || 0} Members</span>
                  <span className="sm:hidden">{budget._count?.collaborators || 0}</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs hidden sm:inline">Live</span>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};