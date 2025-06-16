import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  Plus,
  ArrowRight,
  Calendar,
  Target,
  Activity,
  Wallet,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { 
  PieChart as RechartsPieChart, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  Pie
} from 'recharts';
import { 
  useBudgets, 
  useBudgetSummary,
  useBudgetCategories,
  useTransactions
} from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { Card, LoadingSpinner, EmptyState, Badge, Button, Select } from '../../components/ui';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'thisMonth' | 'lastMonth' | 'last3Months'>('thisMonth');

  // API hooks
  const { data: budgetsResponse, isLoading: budgetsLoading } = useBudgets({ limit: 10 });
  const budgets = budgetsResponse?.data || [];
  
  // Use first budget if none selected
  const activeBudgetId = selectedBudgetId || budgets[0]?.id || '';
  
  const { data: summary, isLoading: summaryLoading } = useBudgetSummary(activeBudgetId);
  const { data: categoriesData, isLoading: categoriesLoading } = useBudgetCategories(activeBudgetId);
  
  // Get recent transactions for activity feed
  const { data: transactionsResponse } = useTransactions({
    budgetId: activeBudgetId,
    limit: 10,
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const recentTransactions = transactionsResponse?.data || [];

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: user?.currency || 'PHP',
    }).format(amount);
  };

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
        percentage: categoriesData.summary ? 
          ((cat.actualAmount / (categoriesData.summary.totalActualIncome + categoriesData.summary.totalActualExpenses)) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  }, [categoriesData]);

  // Budget performance data
  const budgetPerformanceData = useMemo(() => {
    if (!categoriesData) return [];
    
    const incomeData = categoriesData.income?.map((cat: { name: string; plannedAmount: any; actualAmount: any; }) => ({
      name: cat.name.length > 10 ? cat.name.substring(0, 10) + '...' : cat.name,
      planned: cat.plannedAmount,
      actual: cat.actualAmount,
      type: 'income'
    })) || [];
    
    const expenseData = categoriesData.expense?.map((cat: { name: string; plannedAmount: any; actualAmount: any; }) => ({
      name: cat.name.length > 10 ? cat.name.substring(0, 10) + '...' : cat.name,
      planned: cat.plannedAmount,
      actual: cat.actualAmount,
      type: 'expense'
    })) || [];
    
    return [...incomeData, ...expenseData].slice(0, 10);
  }, [categoriesData]);

  // Trend data (mock data for demonstration - you can implement real trend tracking)
  const trendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      months.push({
        month: format(date, 'MMM'),
        income: Math.random() * 50000 + 30000,
        expenses: Math.random() * 40000 + 25000,
      });
    }
    return months;
  }, []);

  if (budgetsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <PieChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to RYNXPENSE! 👋</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start your financial journey by creating your first budget. Track income, expenses, and achieve your financial goals.
          </p>
          <Link to="/budgets">
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Budget
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your financial overview for {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select
            value={activeBudgetId}
            onChange={(e) => setSelectedBudgetId(e.target.value)}
            options={budgets.map((budget: { id: any; name: any; }) => ({ value: budget.id, label: budget.name }))}
            className="min-w-[200px]"
          />
          <Badge variant="info" className="whitespace-nowrap">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(), 'MMM dd, yyyy')}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      {summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Income</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(summary.totalActualIncome)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  vs {formatCurrency(summary.totalPlannedIncome)} planned
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Total Expenses</p>
                <p className="text-2xl font-bold text-red-800">
                  {formatCurrency(summary.totalActualExpenses)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  vs {formatCurrency(summary.totalPlannedExpenses)} planned
                </p>
              </div>
              <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Net Income</p>
                <p className={`text-2xl font-bold ${
                  summary.netActual >= 0 ? 'text-blue-800' : 'text-red-800'
                }`}>
                  {formatCurrency(summary.netActual)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  vs {formatCurrency(summary.netPlanned)} planned
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Budget Progress</p>
                <p className="text-2xl font-bold text-purple-800">
                  {summary.totalPlannedExpenses > 0 
                    ? Math.round((summary.totalActualExpenses / summary.totalPlannedExpenses) * 100)
                    : 0
                  }%
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {summary.categoryCount} categories
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution Pie Chart */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Spending Distribution</h3>
            <Badge variant="secondary">{categoryChartData.length} categories</Badge>
          </div>
          
          {categoryChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
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
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={PieChart}
              title="No Data Available"
              description="Add some transactions to see your spending distribution."
            />
          )}
        </Card>

        {/* Budget Performance Bar Chart */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Budget vs Actual</h3>
            <Badge variant="info">Top 10 categories</Badge>
          </div>
          
          {budgetPerformanceData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), '']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Legend />
                  <Bar dataKey="planned" fill="#94a3b8" name="Planned" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="actual" fill="#3b82f6" name="Actual" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No Budget Data"
              description="Create categories with planned amounts to see budget performance."
            />
          )}
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">6-Month Trend</h3>
          <Badge variant="success">Income vs Expenses</Badge>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value), '']}
                labelStyle={{ color: '#374151' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorIncome)"
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorExpenses)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Bottom Row - Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link 
              to="/transactions"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No Recent Activity"
              description="Your recent transactions will appear here."
              action={
                <Link to="/transactions">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentTransactions.slice(0, 6).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${transaction.isPosted ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {transaction.category?.name} • {format(new Date(transaction.date), 'MMM dd')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold text-sm ${
                      transaction.category?.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.category?.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <div className="text-xs text-gray-500">
                      {transaction.isPosted ? 'Posted' : 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/budgets"
              className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group text-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                <PieChart className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-medium text-gray-900">Manage Budgets</p>
              <p className="text-sm text-gray-500 mt-1">Create and edit budgets</p>
            </Link>

            <Link 
              to="/transactions"
              className="p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all group text-center"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium text-gray-900">Add Transaction</p>
              <p className="text-sm text-gray-500 mt-1">Record income or expense</p>
            </Link>

            <Link 
              to="/categories"
              className="p-6 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all group text-center"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <p className="font-medium text-gray-900">Manage Categories</p>
              <p className="text-sm text-gray-500 mt-1">Organize your spending</p>
            </Link>

            <Link 
              to="/settings"
              className="p-6 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all group text-center"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-200 transition-colors">
                <CreditCard className="h-6 w-6 text-gray-600" />
              </div>
              <p className="font-medium text-gray-900">Settings</p>
              <p className="text-sm text-gray-500 mt-1">Configure preferences</p>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;