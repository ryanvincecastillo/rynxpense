import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Check,
  Clock,
  Repeat,
  TrendingUp,
  TrendingDown,
  Filter,
  X,
} from 'lucide-react';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';

// Types
import { Transaction, BudgetCategoriesResponse } from '../../../types';
import { PaginationMeta } from '../../../types/budget';

// UI Components
import {
  Button,
  Card,
  Select,
  Badge,
} from '../../ui';

// Interfaces
interface TransactionFilters {
  isPosted?: boolean;
  isRecurring?: boolean;
  categoryId?: string;
  search: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface BudgetTransactionsTabProps {
  transactions: Transaction[];
  categoriesData: BudgetCategoriesResponse | undefined;
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onTransactionAction: (action: string, transaction?: Transaction, data?: any) => void;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
  pagination?: PaginationMeta;
}

// Utility functions
const formatTransactionDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
};

const formatDateKey = (date: Date): string => {
  return format(startOfDay(date), 'yyyy-MM-dd');
};

const groupTransactionsByDate = (transactions: Transaction[]) => {
  const groups: { [key: string]: Transaction[] } = {};
  
  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.date);
    const dateKey = formatDateKey(transactionDate);
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
  });
  
  return groups;
};

// Empty State Component
const EmptyState: React.FC<{
  type: 'INCOME' | 'EXPENSE';
  onAdd: () => void;
}> = ({ type, onAdd }) => {
  const isIncome = type === 'INCOME';
  const IconComponent = isIncome ? TrendingUp : TrendingDown;
  
  return (
    <div className="text-center py-8 px-4">
      <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
        isIncome ? 'bg-green-100' : 'bg-red-100'
      }`}>
        <IconComponent className={`h-6 w-6 ${isIncome ? 'text-green-600' : 'text-red-600'}`} />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">
        No {isIncome ? 'Income' : 'Expense'} Transactions
      </h3>
      <p className="text-xs text-gray-600 mb-4">
        Start tracking your {isIncome ? 'income sources' : 'expenses'}
      </p>
      <Button
        size="sm"
        onClick={onAdd}
        className={`text-white ${
          isIncome ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        <Plus className="h-3 w-3 mr-1" />
        Add {isIncome ? 'Income' : 'Expense'} Transaction
      </Button>
    </div>
  );
};

// Date Group Header Component
const DateGroupHeader: React.FC<{ date: string }> = ({ date }) => {
  const dateObj = new Date(date);
  const formattedDate = formatTransactionDate(dateObj);
  
  return (
    <div className="flex items-center space-x-2 py-1 mb-1">
      <div className="h-px bg-gray-200 flex-1" />
      <span className="text-xs font-medium text-gray-500 px-1">
        {formattedDate}
      </span>
      <div className="h-px bg-gray-200 flex-1" />
    </div>
  );
};

// Transaction Item Component
const TransactionItem: React.FC<{
  transaction: Transaction;
  category: any;
  formatCurrency: (amount: number) => string;
  onTransactionAction: (action: string, transaction?: Transaction) => void;
}> = ({ transaction, category, formatCurrency, onTransactionAction }) => {
  const isIncome = category?.type === 'INCOME';
  
  return (
    <div 
      className="border rounded-lg p-3 hover:shadow-sm transition-all group cursor-pointer mb-1"
      style={{ 
        backgroundColor: `${category?.color || '#6B7280'}08`,
        borderColor: `${category?.color || '#6B7280'}30`
      }}
      onClick={() => onTransactionAction('edit', transaction)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Description */}
          <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 truncate pr-1">
            {transaction.description}
          </h4>
          
          {/* Category */}
          {category && (
            <div className="flex items-center space-x-1 mb-2 min-w-0">
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0" 
                style={{ backgroundColor: category.color || '#6B7280' }}
              />
              <span className="text-xs text-gray-500 truncate">{category.name}</span>
            </div>
          )}

          {/* Status and Recurring */}
          <div className="flex items-center space-x-2">
            {transaction.isRecurring && (
              <div className="flex items-center space-x-1">
                <Repeat className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">Recurring</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Amount and Status */}
        <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
          <p className={`text-xs sm:text-sm font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(transaction.amount))}
          </p>
          <p className={`text-xs text-gray-500 ${
            transaction.isPosted ? '' : 'text-yellow-600'
          }`}>
            {transaction.isPosted ? 'Posted' : 'Pending'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Transaction List Component
const TransactionList: React.FC<{
  groupedTransactions: { [key: string]: Transaction[] };
  allCategories: any[];
  formatCurrency: (amount: number) => string;
  onTransactionAction: (action: string, transaction?: Transaction, data?: any) => void;
  type: 'INCOME' | 'EXPENSE';
}> = ({ groupedTransactions, allCategories, formatCurrency, onTransactionAction, type }) => {
  const transactionCount = Object.values(groupedTransactions).flat().length;
  
  if (transactionCount === 0) {
    return (
      <EmptyState 
        type={type} 
        onAdd={() => onTransactionAction('create', undefined, { type })} 
      />
    );
  }

  return (
    <>
      {Object.keys(groupedTransactions)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .map((dateKey) => (
          <div key={dateKey} className="min-w-0">
            <DateGroupHeader date={dateKey} />
            {groupedTransactions[dateKey].map((transaction) => {
              const category = allCategories.find(cat => cat.id === transaction.categoryId);
              return (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  category={category}
                  formatCurrency={formatCurrency}
                  onTransactionAction={onTransactionAction}
                />
              );
            })}
          </div>
        ))}
    </>
  );
};

// Main Component
export const BudgetTransactionsTab: React.FC<BudgetTransactionsTabProps> = ({
  transactions,
  categoriesData,
  filters,
  onFiltersChange,
  onTransactionAction,
  formatCurrency,
  isLoading,
  pagination,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  
  // Get all categories for filter dropdown
  const allCategories = useMemo(() => {
    if (!categoriesData) return [];
    return [...(categoriesData.income || []), ...(categoriesData.expense || [])];
  }, [categoriesData]);

  // Separate and filter transactions by type
  const { incomeTransactions, expenseTransactions, totals } = useMemo(() => {
    const filtered = transactions.filter(transaction => {
      // Search filter
      if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Posted status filter
      if (filters.isPosted !== undefined && transaction.isPosted !== filters.isPosted) {
        return false;
      }
      
      // Recurring filter
      if (filters.isRecurring !== undefined && (transaction.isRecurring || false) !== filters.isRecurring) {
        return false;
      }
      
      // Category filter
      if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
        return false;
      }
      
      return true;
    });

    // Separate by category type, not amount sign
    const income = filtered
      .filter(t => {
        const category = allCategories.find(cat => cat.id === t.categoryId);
        return category?.type === 'INCOME';
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const expense = filtered
      .filter(t => {
        const category = allCategories.find(cat => cat.id === t.categoryId);
        return category?.type === 'EXPENSE';
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totals = {
      income: income.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      expense: expense.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      posted: filtered.filter(t => t.isPosted).length,
      pending: filtered.filter(t => !t.isPosted).length,
    };

    return { 
      incomeTransactions: income, 
      expenseTransactions: expense, 
      totals 
    };
  }, [transactions, filters, allCategories]);

  // Handle filter changes
  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-48 sm:w-64 animate-pulse" />
          <div className="flex items-center space-x-3">
            <div className="h-10 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {[1, 2].map((col) => (
            <div key={col} className="space-y-3">
              <div className="h-4 sm:h-6 bg-gray-200 rounded w-32 sm:w-48 animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-16 sm:h-20 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Group transactions by date
  const groupedIncomeTransactions = groupTransactionsByDate(incomeTransactions);
  const groupedExpenseTransactions = groupTransactionsByDate(expenseTransactions);

  // Check if any filters are active
  const hasActiveFilters = !!(
    filters.isPosted !== undefined || 
    filters.isRecurring !== undefined || 
    filters.categoryId || 
    filters.search
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Transactions</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {incomeTransactions.length + expenseTransactions.length} total • {totals.posted} posted • {totals.pending} pending
          </p>
        </div>

        {/* Minimalist Controls */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-48"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </button>

          {/* Add Transaction */}
          <Button onClick={() => onTransactionAction('create')} className="hidden sm:block">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Filter Options</h3>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onFiltersChange({
                    search: '',
                    isPosted: undefined,
                    isRecurring: undefined,
                    categoryId: undefined,
                  });
                }}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
                <span>Clear all</span>
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              value={filters.isRecurring === undefined ? '' : filters.isRecurring.toString()}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange('isRecurring', value === '' ? undefined : value === 'true');
              }}
              options={[
                { value: '', label: 'All Types' },
                { value: 'true', label: 'Recurring' },
                { value: 'false', label: 'One-time' },
              ]}
            />

            <Select
              value={filters.isPosted === undefined ? '' : filters.isPosted.toString()}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange('isPosted', value === '' ? undefined : value === 'true');
              }}
              options={[
                { value: '', label: 'All Status' },
                { value: 'true', label: 'Posted' },
                { value: 'false', label: 'Pending' },
              ]}
            />

            {allCategories.length > 0 && (
              <Select
                value={filters.categoryId || ''}
                onChange={(value) => handleFilterChange('categoryId', value || undefined)}
                options={[
                  { value: '', label: 'All Categories' },
                  ...allCategories.map(cat => ({
                    value: cat.id,
                    label: cat.name,
                  })),
                ]}
              />
            )}
          </div>
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {/* Income Transactions Column */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Income Transactions</h4>
                <p className="text-xs text-gray-500">
                  {incomeTransactions.length} transactions • {formatCurrency(totals.income)}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onTransactionAction('create', undefined, { type: 'INCOME' })}
              className="text-green-600 hover:text-green-700 p-0.5 sm:p-1 rounded hover:bg-green-50 transition-colors"
              title="Add Income Transaction"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>

          <div className="space-y-1 sm:space-y-2 max-h-80 sm:max-h-96 overflow-y-auto min-w-0">
            <TransactionList
              groupedTransactions={groupedIncomeTransactions}
              allCategories={allCategories}
              formatCurrency={formatCurrency}
              onTransactionAction={onTransactionAction}
              type="INCOME"
            />
          </div>
        </div>

        {/* Expense Transactions Column */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Expenses</h4>
                <p className="text-xs text-gray-500">
                  {expenseTransactions.length} transactions • {formatCurrency(totals.expense)}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onTransactionAction('create', undefined, { type: 'EXPENSE' })}
              className="text-red-600 hover:text-red-700 p-0.5 sm:p-1 rounded hover:bg-red-50 transition-colors"
              title="Add Expense Transaction"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>

          <div className="space-y-1 sm:space-y-2 max-h-80 sm:max-h-96 overflow-y-auto min-w-0">
            <TransactionList
              groupedTransactions={groupedExpenseTransactions}
              allCategories={allCategories}
              formatCurrency={formatCurrency}
              onTransactionAction={onTransactionAction}
              type="EXPENSE"
            />
          </div>
        </div>
      </div>
    </div>
  );
};