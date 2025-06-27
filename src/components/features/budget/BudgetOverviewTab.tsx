// src/components/features/budget/BudgetOverviewTab.tsx
import React, { useMemo } from 'react';
import {
  PieChart,
  Cell,
  ResponsiveContainer,
  Pie,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { BudgetCategoriesResponse } from '../../../types';
import { Card, EmptyState, Badge } from '../../ui';
import { useBudgetSummary } from '../../../hooks/useApi';
import { useParams } from 'react-router-dom';

interface BudgetOverviewTabProps {
  categoriesData: BudgetCategoriesResponse | undefined;
  formatCurrency: (amount: number) => string;
  onQuickAction: (action: string, type?: string) => void;
}

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: pld.color }}>
            {`${pld.dataKey}: ${formatCurrency(pld.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const BudgetOverviewTab: React.FC<BudgetOverviewTabProps> = ({
  categoriesData,
  formatCurrency,
  onQuickAction,
}) => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const { data: summary, isLoading: summaryLoading } = useBudgetSummary(budgetId!);
  
  // Prepare chart data
  const categoryChartData = useMemo(() => {
    if (!categoriesData) return [];
    
    const allCategories = [...(categoriesData.income || []), ...(categoriesData.expense || [])];
    return allCategories
      .filter(cat => cat.actualAmount > 0)
      .map(cat => ({
        name: cat.name,
        value: cat.actualAmount,
        color: cat.color,
        type: cat.type,
        planned: cat.plannedAmount,
        percentage: cat.plannedAmount > 0 ? (cat.actualAmount / cat.plannedAmount) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [categoriesData]);

  // Prepare comparison chart data
  const comparisonData = useMemo(() => {
    if (!summary) return [];
    
    return [
      {
        name: 'Income',
        planned: summary.totalPlannedIncome || 0,
        actual: summary.totalActualIncome || 0,
      },
      {
        name: 'Expenses',
        planned: summary.totalPlannedExpenses || 0,
        actual: summary.totalActualExpenses || 0,
      },
    ];
  }, [summary]);

  // Calculate insights
  const insights = useMemo(() => {
    if (!summary || !categoriesData) return [];

    const insights = [];

    // Budget performance
    const netVariance = (summary.netActual || 0) - (summary.netPlanned || 0);
    if (netVariance > 0) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Budget Surplus',
        description: `You're ${formatCurrency(netVariance)} ahead of your planned budget`,
        actionLabel: 'View Details',
        action: () => onQuickAction('viewDetails'),
      });
    } else if (netVariance < 0) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Over Budget',
        description: `You're ${formatCurrency(Math.abs(netVariance))} over your planned budget`,
        actionLabel: 'Adjust Budget',
        action: () => onQuickAction('adjustBudget'),
      });
    }

    // Category insights
    const allCategories = [...(categoriesData.income || []), ...(categoriesData.expense || [])];
    const overBudgetCategories = allCategories.filter(cat => 
      cat.plannedAmount > 0 && cat.actualAmount > cat.plannedAmount
    );

    if (overBudgetCategories.length > 0) {
      insights.push({
        type: 'info',
        icon: Target,
        title: `${overBudgetCategories.length} Categories Over Budget`,
        description: 'Some categories have exceeded their planned amounts',
        actionLabel: 'Review Categories',
        action: () => onQuickAction('reviewCategories'),
      });
    }

    // Quick actions based on data
    const hasNoTransactions = !summary.transactionCount || summary.transactionCount === 0;
    if (hasNoTransactions) {
      insights.push({
        type: 'info',
        icon: Zap,
        title: 'Get Started',
        description: 'Add your first transaction to start tracking',
        actionLabel: 'Add Transaction',
        action: () => onQuickAction('addTransaction'),
      });
    }

    return insights;
  }, [summary, categoriesData, formatCurrency, onQuickAction]);

  const quickActions = [
    {
      id: 'addIncome',
      title: 'Add Income',
      subtitle: 'Create income category',
      icon: TrendingUp,
      action: () => onQuickAction('addIncome'),
      colorClasses: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconClasses: 'bg-green-100 text-green-600',
    },
    {
      id: 'addExpense',
      title: 'Add Expense',
      subtitle: 'Create expense category',
      icon: TrendingDown,
      action: () => onQuickAction('addExpense'),
      colorClasses: 'bg-red-50 border-red-200 hover:bg-red-100',
      iconClasses: 'bg-red-100 text-red-600',
    },
    {
      id: 'recordIncome',
      title: 'Record Income',
      subtitle: 'Add income transaction',
      icon: Plus,
      action: () => onQuickAction('addTransaction', 'INCOME'),
      colorClasses: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconClasses: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'recordExpense',
      title: 'Record Expense',
      subtitle: 'Add expense transaction',
      icon: Minus,
      action: () => onQuickAction('addTransaction', 'EXPENSE'),
      colorClasses: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconClasses: 'bg-purple-100 text-purple-600',
    },
  ];

  if (summaryLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded-lg" />
          <div className="h-80 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Budget Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={index}
                  className="cursor-pointer"
                  onClick={insight.action}
                  role="button"
                  tabIndex={0}
                  onKeyPress={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      insight.action();
                    }
                  }}
                >
                  <Card
                    className={`p-4 transition-all duration-200 hover:shadow-md ${
                      insight.type === 'success' ? 'border-green-200 bg-green-50' :
                      insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        insight.type === 'success' ? 'bg-green-100' :
                        insight.type === 'warning' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          insight.type === 'success' ? 'text-green-600' :
                          insight.type === 'warning' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        <button
                          className={`text-xs font-medium mt-2 hover:underline ${
                            insight.type === 'success' ? 'text-green-600' :
                            insight.type === 'warning' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`}
                          type="button"
                        >
                          {insight.actionLabel} →
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
            <Badge variant="secondary" className="text-xs">
              {categoryChartData.length} categories
            </Badge>
          </div>
          
          {categoryChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No category data"
              description="Add categories and transactions to see distribution"
              action={
                <button
                  type="button"
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  onClick={() => onQuickAction('addCategory')}
                >
                  Add Category
                </button>
              }
            />
          )}
        </Card>

        {/* Planned vs Actual Comparison */}
        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Planned vs Actual</h3>
            <Badge variant="secondary" className="text-xs">
              Monthly View
            </Badge>
          </div>
          
          {comparisonData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                  <Bar dataKey="planned" fill="#e5e7eb" name="Planned" radius={4} />
                  <Bar dataKey="actual" fill="#3b82f6" name="Actual" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No comparison data"
              description="Add planned amounts to see comparison"
              action={
                <button
                  type="button"
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  onClick={() => onQuickAction('setBudget')}
                >
                  Set Budget
                </button>
              }
            />
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`${action.colorClasses} 
                  border rounded-lg p-3 lg:p-4 text-left transition-all duration-200 
                  hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  group`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`${action.iconClasses} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      {action.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 group-hover:text-gray-500">
                      {action.subtitle}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};