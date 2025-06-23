import React, { useMemo } from 'react';
import {
  PieChart,
  Cell,
  ResponsiveContainer,
  Pie,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Plus, DollarSign, Minus } from 'lucide-react';
import { BudgetCategoriesResponse } from '../../../types';
import { Card, EmptyState } from '../../ui';
import { useBudgetSummary } from '../../../hooks/useApi';
import { useParams } from 'react-router-dom';
import { BudgetSummaryCards } from './BudgetSummaryCards';

interface BudgetOverviewTabProps {
  categoriesData: BudgetCategoriesResponse | undefined;
  formatCurrency: (amount: number) => string;
  onQuickAction: (action: string, type?: string) => void;
}

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
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [categoriesData]);

  const quickActions = [
    {
      id: 'addIncome',
      title: 'Add Income Category',
      description: 'Create income source',
      icon: TrendingUp,
      action: () => onQuickAction('addIncome'),
      colorClasses: 'border-green-200 hover:border-green-300 hover:bg-green-50 group-hover:bg-green-200',
      iconColorClasses: 'bg-green-100 text-green-600',
    },
    {
      id: 'addExpense',
      title: 'Add Expense Category',
      description: 'Create expense type',
      icon: TrendingDown,
      action: () => onQuickAction('addExpense'),
      colorClasses: 'border-red-200 hover:border-red-300 hover:bg-red-50 group-hover:bg-red-200',
      iconColorClasses: 'bg-red-100 text-red-600',
    },
    {
      id: 'recordIncome',
      title: 'Record Income',
      description: 'Add income transaction',
      icon: Plus,
      action: () => onQuickAction('addTransaction', 'INCOME'),
      colorClasses: 'border-green-200 hover:border-green-300 hover:bg-green-50 group-hover:bg-green-200',
      iconColorClasses: 'bg-green-100 text-green-600',
    },
    {
      id: 'recordExpense',
      title: 'Record Expense',
      description: 'Add expense transaction',
      icon: Minus,
      action: () => onQuickAction('addTransaction', 'EXPENSE'),
      colorClasses: 'border-red-200 hover:border-red-300 hover:bg-red-50 group-hover:bg-red-200',
      iconColorClasses: 'bg-red-100 text-red-600',
    },
  ];

  return (
    <div className="space-y-8">
           <BudgetSummaryCards 
              summary={summary} 
              formatCurrency={formatCurrency}
              isLoading={summaryLoading}
              categoriesData={categoriesData} // Pass categories data for enhanced display
            />
            
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
            <span className="text-sm text-gray-500">
              {categoryChartData.length} categories with transactions
            </span>
          </div>
          
          {categoryChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), 'Amount']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <EmptyState
                icon={DollarSign}
                title="No Category Data"
                description="Add transactions to see category distribution."
              />
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button 
                  key={action.id}
                  onClick={action.action}
                  className={`p-6 border rounded-xl transition-all group text-center ${action.colorClasses}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors ${action.iconColorClasses}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
