import React from 'react';
import { TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';
import { BudgetSummary } from '../types';
import { Card, ProgressBar } from './ui';

interface BudgetSummaryCardsProps {
  summary: BudgetSummary | undefined;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
  categoriesData?: any; // Optional categories data for enhanced display
}

const BudgetSummaryCards: React.FC<BudgetSummaryCardsProps> = ({
  summary,
  formatCurrency,
  isLoading,
  categoriesData,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  // Calculate progress percentages
  const incomeProgress = summary.totalPlannedIncome > 0 
    ? (summary.totalActualIncome / summary.totalPlannedIncome) * 100 
    : 0;
  const expenseProgress = summary.totalPlannedExpenses > 0 
    ? (summary.totalActualExpenses / summary.totalPlannedExpenses) * 100 
    : 0;

  // Get category counts from categoriesData if available
  const incomeCategoryCount = categoriesData?.income?.length || 0;
  const expenseCategoryCount = categoriesData?.expense?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Enhanced Income Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Total Income</h3>
              <p className="text-sm text-green-600">
                {incomeCategoryCount} categories
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-700">Actual</span>
            <span className="font-bold text-xl text-green-800">
              {formatCurrency(summary.totalActualIncome)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-700">Planned</span>
            <span className="text-green-800">
              {formatCurrency(summary.totalPlannedIncome)}
            </span>
          </div>
          {summary.totalPlannedIncome > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-600">Progress</span>
                <span className="text-xs font-medium text-green-600">
                  {incomeProgress.toFixed(1)}%
                </span>
              </div>
              <ProgressBar
                value={summary.totalActualIncome}
                max={summary.totalPlannedIncome}
                color="green"
                size="sm"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Enhanced Expense Card */}
      <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-700" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Total Expenses</h3>
              <p className="text-sm text-red-600">
                {expenseCategoryCount} categories
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-red-700">Actual</span>
            <span className="font-bold text-xl text-red-800">
              {formatCurrency(summary.totalActualExpenses)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-red-700">Planned</span>
            <span className="text-red-800">
              {formatCurrency(summary.totalPlannedExpenses)}
            </span>
          </div>
          {summary.totalPlannedExpenses > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-red-600">Usage</span>
                <span className="text-xs font-medium text-red-600">
                  {expenseProgress.toFixed(1)}%
                </span>
              </div>
              <ProgressBar
                value={summary.totalActualExpenses}
                max={summary.totalPlannedExpenses}
                color={expenseProgress > 100 ? "red" : expenseProgress > 90 ? "yellow" : "blue"}
                size="sm"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Enhanced Net Amount Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800">Net Amount</h3>
              <p className="text-sm text-blue-600">
                Income - Expenses
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700">Actual</span>
            <span className={`font-bold text-xl ${
              summary.netActual >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(summary.netActual)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700">Planned</span>
            <span className={`${
              summary.netPlanned >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(summary.netPlanned)}
            </span>
          </div>
          <div className="text-center pt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              summary.netActual >= 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {summary.netActual >= 0 ? '✓ Surplus' : '⚠ Deficit'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BudgetSummaryCards;