// components/TransactionsTab.tsx
import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Check,
  Clock,
  Repeat,
  Download,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  X,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

// Types
import { Transaction, BudgetCategoriesResponse } from '../types';
import { PaginationMeta } from '../types/budget';

// UI Components
import {
  Button,
  Card,
  EmptyState,
  Input,
  Select,
  Badge,
} from './ui';

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

interface TransactionsTabProps {
  transactions: Transaction[];
  categoriesData: BudgetCategoriesResponse | undefined;
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onTransactionAction: (action: string, transaction?: Transaction, data?: any) => void;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
  pagination?: PaginationMeta;
}

// Helper Functions
const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const formatTransactionDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
};

const getStatusColor = (isPosted: boolean): string => {
  return isPosted ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100';
};

const getTransactionTypeColor = (amount: number): string => {
  return amount >= 0 ? 'text-green-600' : 'text-red-600';
};

// Transaction Card Component
const TransactionCard: React.FC<{
  transaction: Transaction;
  categoriesData: BudgetCategoriesResponse | undefined;
  onAction: (action: string, transaction: Transaction) => void;
  formatCurrency: (amount: number) => string;
}> = ({ transaction, categoriesData, onAction, formatCurrency }) => {
  const transactionDate = new Date(transaction.date);
  const category = categoriesData 
    ? [...(categoriesData.income || []), ...(categoriesData.expense || [])]
        .find(cat => cat.id === transaction.categoryId)
    : null;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-center justify-between p-4">
        {/* Left Side - Transaction Info */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Status Indicator */}
          <div className={`w-3 h-3 rounded-full ${
            transaction.isPosted ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          
          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {transaction.description}
              </h4>
              {transaction.isRecurring && (
                <Badge variant="secondary" size="sm" className="flex items-center space-x-1">
                  <Repeat className="h-3 w-3" />
                  <span>Recurring</span>
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatTransactionDate(transactionDate)}</span>
              </span>
              
              {category && (
                <span className="flex items-center space-x-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </span>
              )}
              
              <Badge 
                variant={transaction.isPosted ? 'success' : 'warning'} 
                size="sm"
                className="flex items-center space-x-1"
              >
                {transaction.isPosted ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                <span>{transaction.isPosted ? 'Posted' : 'Pending'}</span>
              </Badge>
            </div>

            {/* Recurring Details */}
            {transaction.isRecurring && transaction.frequency && (
              <div className="mt-2 text-xs text-gray-500">
                Repeats {transaction.frequency.toLowerCase()}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Amount and Actions */}
        <div className="flex items-center space-x-4">
          {/* Amount */}
          <div className="text-right">
            <p className={`font-semibold text-lg ${getTransactionTypeColor(transaction.amount)}`}>
              {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
            </p>
            <p className="text-xs text-gray-500">
              {transaction.amount >= 0 ? 'Income' : 'Expense'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onAction('togglePosted', transaction)}
              className={`p-1.5 rounded-md transition-colors ${
                transaction.isPosted
                  ? 'text-yellow-600 hover:bg-yellow-50'
                  : 'text-green-600 hover:bg-green-50'
              }`}
              title={transaction.isPosted ? 'Mark as pending' : 'Mark as posted'}
            >
              {transaction.isPosted ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </button>
            
            <button
              onClick={() => onAction('edit', transaction)}
              className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Edit transaction"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => onAction('delete', transaction)}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete transaction"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Main Component
const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  categoriesData,
  filters,
  onFiltersChange,
  onTransactionAction,
  formatCurrency,
  isLoading,
  pagination,
}) => {
  const [bulkActions, setBulkActions] = useState<{
    selectedIds: string[];
    showMenu: boolean;
  }>({
    selectedIds: [],
    showMenu: false,
  });

  // Get all categories for filter dropdown
  const allCategories = useMemo(() => {
    if (!categoriesData) return [];
    return [...(categoriesData.income || []), ...(categoriesData.expense || [])];
  }, [categoriesData]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      if (filters.isPosted !== undefined && transaction.isPosted !== filters.isPosted) return false;
      if (filters.isRecurring !== undefined && transaction.isRecurring !== filters.isRecurring) return false;
      if (filters.categoryId && transaction.categoryId !== filters.categoryId) return false;
      if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filters]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const postedCount = filteredTransactions.filter(t => t.isPosted).length;
    const pendingCount = filteredTransactions.filter(t => !t.isPosted).length;
    const recurringCount = filteredTransactions.filter(t => t.isRecurring).length;

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      postedCount,
      pendingCount,
      recurringCount,
      total: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    
    filteredTransactions.forEach(transaction => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });

    // Sort groups by date (newest first)
    const sortedGroups = Object.entries(groups).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    return sortedGroups;
  }, [filteredTransactions]);

  // Handle filter changes
  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    // Implementation for bulk actions
    console.log('Bulk action:', action, 'for transactions:', bulkActions.selectedIds);
    setBulkActions({ selectedIds: [], showMenu: false });
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
            <Card key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Button 
            variant="secondary" 
            className="flex-1 sm:flex-none"
            onClick={() => {/* Handle export */}}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => onTransactionAction('create')} 
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e: { target: { value: any; }; }) => handleFilterChange('search', e.target.value)}
            leftIcon={Search}
            className="w-full"
          />
        </div>
        
        <Select
          value={filters.categoryId || ''}
          onChange={(e: { target: { value: any; }; }) => handleFilterChange('categoryId', e.target.value || undefined)}
          options={[
            { value: '', label: 'All Categories' },
            ...allCategories.map(cat => ({
              value: cat.id,
              label: `${cat.name} (${cat.type})`,
            })),
          ]}
          className="w-full lg:w-48"
        />
        
        <Select
          value={filters.isPosted === undefined ? '' : filters.isPosted.toString()}
          onChange={(e: { target: { value: any; }; }) => {
            const value = e.target.value;
            handleFilterChange('isPosted', value === '' ? undefined : value === 'true');
          }}
          options={[
            { value: '', label: 'All Status' },
            { value: 'true', label: 'Posted Only' },
            { value: 'false', label: 'Pending Only' },
          ]}
          className="w-full lg:w-32"
        />
        
        <Select
          value={filters.isRecurring === undefined ? '' : filters.isRecurring.toString()}
          onChange={(e: { target: { value: any; }; }) => {
            const value = e.target.value;
            handleFilterChange('isRecurring', value === '' ? undefined : value === 'true');
          }}
          options={[
            { value: '', label: 'All Types' },
            { value: 'true', label: 'Recurring' },
            { value: 'false', label: 'One-time' },
          ]}
          className="w-full lg:w-32"
        />
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Card>
          <EmptyState
            icon={filters.search ? Search : Plus}
            title={filters.search ? "No transactions found" : "No transactions yet"}
            description={
              filters.search
                ? "Try adjusting your search or filters to find transactions."
                : "Start by adding your first income or expense transaction."
            }
            action={
              !filters.search ? (
                <Button onClick={() => onTransactionAction('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Transaction
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedTransactions.map(([dateKey, dayTransactions]) => (
            <div key={dateKey}>
              {/* Date Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatTransactionDate(new Date(dateKey))}
                </h3>
                <div className="text-sm text-gray-500">
                  {dayTransactions.length} transaction{dayTransactions.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {/* Transactions for this date */}
              <div className="space-y-3">
                {dayTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    categoriesData={categoriesData}
                    onAction={onTransactionAction}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6">
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} transactions
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => {/* Handle previous page */}}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => {/* Handle next page */}}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsTab;