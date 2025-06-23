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
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const hasTransactions = transactions.length > 0;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage all budget transactions
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-2">
            <Select
              value={filters.isPosted === undefined ? '' : filters.isPosted.toString()}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange('isPosted', value === '' ? undefined : value === 'true');
              }}
              options={[
                { value: '', label: 'Select an option' },
                { value: 'true', label: 'Posted' },
                { value: 'false', label: 'Pending' },
              ]}
              className="w-32"
            />

            {allCategories.length > 0 && (
              <Select
                value={filters.categoryId || ''}
                onChange={(value) => handleFilterChange('categoryId', value || undefined)}
                options={[
                  { value: '', label: 'Select an option' },
                  ...allCategories.map(cat => ({
                    value: cat.id,
                    label: cat.name,
                  })),
                ]}
                className="w-32"
              />
            )}
          </div>

          <Button 
            onClick={() => onTransactionAction('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Income Transactions Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Income Transactions</h4>
                <p className="text-xs text-gray-500">
                  {incomeTransactions.length} transactions • {formatCurrency(totals.income)}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onTransactionAction('create', undefined, { type: 'INCOME' })}
              className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 transition-colors"
              title="Add Income Transaction"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {incomeTransactions.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  No Income Transactions
                </h3>
                <p className="text-xs text-gray-600 mb-4">
                  Start tracking your income sources
                </p>
                <Button
                  size="sm"
                  onClick={() => onTransactionAction('create', undefined, { type: 'INCOME' })}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Income
                </Button>
              </div>
            ) : (
              incomeTransactions.map((transaction) => {
                const transactionDate = new Date(transaction.date);
                const category = allCategories.find(cat => cat.id === transaction.categoryId);
                
                return (
                  <div 
                    key={transaction.id} 
                    className="border rounded-lg p-3 hover:shadow-sm transition-all group"
                    style={{ 
                      backgroundColor: `${category?.color || '#6B7280'}08`,
                      borderColor: `${category?.color || '#6B7280'}30`
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Date */}
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="text-xs text-gray-500">
                            {formatTransactionDate(transactionDate)}
                          </span>
                        </div>
                        
                        {/* Description */}
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {transaction.description}
                        </h4>
                        
                        {/* Category */}
                        {category && (
                          <div className="flex items-center space-x-1 mb-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: category.color || '#6B7280' }}
                            />
                            <span className="text-xs text-gray-600">{category.name}</span>
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
                      <div className="text-right ml-4">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                        <p className={`text-xs ${
                          transaction.isPosted ? 'text-gray-600' : 'text-yellow-600'
                        }`}>
                          {transaction.isPosted ? 'Posted' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Expense Transactions Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Expense Transactions</h4>
                <p className="text-xs text-gray-500">
                  {expenseTransactions.length} transactions • {formatCurrency(totals.expense)}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onTransactionAction('create', undefined, { type: 'EXPENSE' })}
              className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
              title="Add Expense Transaction"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {expenseTransactions.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  No Expense Transactions
                </h3>
                <p className="text-xs text-gray-600 mb-4">
                  Start tracking your expenses
                </p>
                <Button
                  size="sm"
                  onClick={() => onTransactionAction('create', undefined, { type: 'EXPENSE' })}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Expense
                </Button>
              </div>
            ) : (
              expenseTransactions.map((transaction) => {
                const transactionDate = new Date(transaction.date);
                const category = allCategories.find(cat => cat.id === transaction.categoryId);
                
                return (
                  <div 
                    key={transaction.id} 
                    className="border rounded-lg p-3 hover:shadow-sm transition-all group"
                    style={{ 
                      backgroundColor: `${category?.color || '#6B7280'}08`,
                      borderColor: `${category?.color || '#6B7280'}30`
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Date */}
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="text-xs text-gray-500">
                            {formatTransactionDate(transactionDate)}
                          </span>
                        </div>
                        
                        {/* Description */}
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {transaction.description}
                        </h4>
                        
                        {/* Category */}
                        {category && (
                          <div className="flex items-center space-x-1 mb-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: category.color || '#6B7280' }}
                            />
                            <span className="text-xs text-gray-600">{category.name}</span>
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
                      <div className="text-right ml-4">
                        <p className="font-semibold text-red-600">
                          {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                        <p className={`text-xs ${
                          transaction.isPosted ? 'text-gray-600' : 'text-yellow-600'
                        }`}>
                          {transaction.isPosted ? 'Posted' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};