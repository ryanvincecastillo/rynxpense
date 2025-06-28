import React, { useMemo, useState } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Filter,
  X,
  Calendar,
  Repeat,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Archive,
  Columns,
  List,
  ChevronDown,
} from 'lucide-react';
import { 
  Transaction, 
  BudgetCategoriesResponse,
  BudgetCategory 
} from '../../../types';
import { Button } from '../../ui';

interface TransactionFilters {
  isPosted?: boolean;
  isRecurring?: boolean;
  categoryId?: string;
  categoryIds?: string[]; // Add multi-select categories
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
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Date Group Header Component
const DateGroupHeader: React.FC<{ date: string }> = ({ date }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="flex items-center space-x-2 px-1 py-2 text-xs font-medium text-gray-500 bg-gray-50 rounded-md mb-2">
      <Calendar className="h-3 w-3" />
      <span>{formatDate(date)}</span>
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<{ 
  type: 'INCOME' | 'EXPENSE'; 
  onAdd: () => void;
}> = ({ type, onAdd }) => (
  <div className="text-center py-8 text-gray-500">
    <div className="mb-3">
      {type === 'INCOME' ? (
        <TrendingUp className="h-8 w-8 mx-auto text-green-400" />
      ) : (
        <TrendingDown className="h-8 w-8 mx-auto text-red-400" />
      )}
    </div>
    <p className="text-sm mb-3">No {type.toLowerCase()} transactions yet</p>
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onAdd}
      className={type === 'INCOME' ? 'border-green-200 text-green-600 hover:bg-green-50' : 'border-red-200 text-red-600 hover:bg-red-50'}
    >
      <Plus className="h-3 w-3 mr-1" />
      Add {type === 'INCOME' ? 'Income' : 'Expense'}
    </Button>
  </div>
);

// Multi-Select Category Dropdown Component
const CategoryMultiSelect: React.FC<{
  allCategories: any[];
  selectedCategories: string[];
  onSelectionChange: (categoryIds: string[]) => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ allCategories, selectedCategories, onSelectionChange, isOpen, onToggle }) => {
  const incomeCategories = allCategories.filter(cat => cat.type === 'INCOME');
  const expenseCategories = allCategories.filter(cat => cat.type === 'EXPENSE');

  const handleCategoryToggle = (categoryId: string) => {
    const newSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    onSelectionChange(newSelection);
  };

  const getSelectedText = () => {
    if (selectedCategories.length === 0) return 'All categories';
    if (selectedCategories.length === 1) {
      const category = allCategories.find(cat => cat.id === selectedCategories[0]);
      return category?.name || 'Selected category';
    }
    return `${selectedCategories.length} categories selected`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="w-full pl-3 pr-10 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left"
      >
        <span className={selectedCategories.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
          {getSelectedText()}
        </span>
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2">
            {/* Select All / Clear All */}
            <div className="flex items-center justify-between px-2 py-1 mb-2 border-b border-gray-100">
              <button
                onClick={() => onSelectionChange(allCategories.map(cat => cat.id))}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Select All
              </button>
              <button
                onClick={() => onSelectionChange([])}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium"
              >
                Clear All
              </button>
            </div>

            {/* Income Categories */}
            {incomeCategories.length > 0 && (
              <div className="mb-3">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Income Categories
                </div>
                {incomeCategories.map(category => (
                  <label
                    key={category.id}
                    className="flex items-center px-2 py-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3 flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: category.color || '#10B981' }}
                      />
                      <span className="text-sm text-gray-900">{category.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Expense Categories */}
            {expenseCategories.length > 0 && (
              <div>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Expense Categories
                </div>
                {expenseCategories.map(category => (
                  <label
                    key={category.id}
                    className="flex items-center px-2 py-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3 flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: category.color || '#EF4444' }}
                      />
                      <span className="text-sm text-gray-900">{category.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {allCategories.length === 0 && (
              <div className="px-2 py-4 text-center text-sm text-gray-500">
                No categories available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Transaction Item Component with Action Menu
const TransactionItem: React.FC<{
  transaction: Transaction;
  category: BudgetCategory | undefined;
  formatCurrency: (amount: number) => string;
  onTransactionAction: (action: string, transaction: Transaction) => void;
}> = ({ transaction, category, formatCurrency, onTransactionAction }) => {
  const [showActions, setShowActions] = useState(false);
  const isIncome = category?.type === 'INCOME';
  
  return (
    <div 
      className="relative group border rounded-lg p-3 hover:shadow-sm transition-all cursor-pointer mb-1"
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
        <div className="text-right ml-2 sm:ml-4 flex-shrink-0 flex items-start space-x-1">
          <div>
            <p className={`text-xs sm:text-sm font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(transaction.amount))}
            </p>
            <p className={`text-xs text-gray-500 ${
              transaction.isPosted ? '' : 'text-yellow-600'
            }`}>
              {transaction.isPosted ? 'Posted' : 'Pending'}
            </p>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-0.5 sm:p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-32 sm:w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransactionAction('edit', transaction);
                    setShowActions(false);
                  }}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Edit2 className="h-3 w-3 mr-1 sm:mr-2" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransactionAction('duplicate', transaction);
                    setShowActions(false);
                  }}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Copy className="h-3 w-3 mr-1 sm:mr-2" />
                  Duplicate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransactionAction('toggleStatus', transaction);
                    setShowActions(false);
                  }}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Archive className="h-3 w-3 mr-1 sm:mr-2" />
                  {transaction.isPosted ? 'Mark Pending' : 'Mark Posted'}
                </button>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransactionAction('delete', transaction);
                    setShowActions(false);
                  }}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="h-3 w-3 mr-1 sm:mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Chronological List Component (for mobile list view)
const ChronologicalList: React.FC<{
  transactions: Transaction[];
  allCategories: any[];
  formatCurrency: (amount: number) => string;
  onTransactionAction: (action: string, transaction?: Transaction, data?: any) => void;
}> = ({ transactions, allCategories, formatCurrency, onTransactionAction }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="mb-3">
          <Calendar className="h-8 w-8 mx-auto text-gray-400" />
        </div>
        <p className="text-sm mb-3">No transactions yet</p>
        <button 
          onClick={() => onTransactionAction('create')}
          className="inline-flex items-center px-3 py-1 border border-gray-200 text-sm text-gray-600 bg-white rounded hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Transaction
        </button>
      </div>
    );
  }

  // Sort all transactions by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Utility function to group transactions by date
  const groupTransactionsByDate = (transactions: Transaction[]) => {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as { [key: string]: Transaction[] });
  };
  // Group by date
  const groupedTransactions = groupTransactionsByDate(sortedTransactions);

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
  const [mobileViewMode, setMobileViewMode] = useState<'columns' | 'list'>('columns');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Get all categories for filter dropdown
  const allCategories = useMemo(() => {
    if (!categoriesData) return [];
    return [...(categoriesData.income || []), ...(categoriesData.expense || [])];
  }, [categoriesData]);

  // Filter and group transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter(transaction => {
      // Search filter
      if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Category filter - support both single and multi-select
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        if (!filters.categoryIds.includes(transaction.categoryId)) {
          return false;
        }
      } else if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
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
      
      return true;
    });
  }, [transactions, filters]);

  // Separate and group transactions by date
  const { incomeTransactions, expenseTransactions } = useMemo(() => {
    const income: Transaction[] = [];
    const expense: Transaction[] = [];
    
    filteredTransactions.forEach(transaction => {
      const category = allCategories.find(cat => cat.id === transaction.categoryId);
      if (category?.type === 'INCOME') {
        income.push(transaction);
      } else {
        expense.push(transaction);
      }
    });
    
    return { incomeTransactions: income, expenseTransactions: expense };
  }, [filteredTransactions, allCategories]);

  // Group transactions by date
  const groupTransactionsByDate = (transactions: Transaction[]) => {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as { [key: string]: Transaction[] });
  };

  const groupedIncomeTransactions = groupTransactionsByDate(incomeTransactions);
  const groupedExpenseTransactions = groupTransactionsByDate(expenseTransactions);

  // Calculate totals
  const totals = useMemo(() => {
    const income = incomeTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const expense = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return { income, expense, net: income - expense };
  }, [incomeTransactions, expenseTransactions]);

  // Check if any filters are active
  const hasActiveFilters = !!(
    filters.search || 
    (filters.categoryIds && filters.categoryIds.length > 0) ||
    filters.categoryId || 
    filters.isPosted !== undefined || 
    filters.isRecurring !== undefined ||
    filters.dateRange
  );

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          {/* Mobile View Toggle */}
          <div className="flex sm:hidden items-center">
            <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMobileViewMode('columns')}
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mobileViewMode === 'columns'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Columns className="h-3 w-3 mr-1.5" />
                Split
              </button>
              <button
                onClick={() => setMobileViewMode('list')}
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mobileViewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-3 w-3 mr-1.5" />
                List
              </button>
            </div>
          </div>

          {/* Multi-Select Filters */}
          <div className="flex items-center space-x-2">
            {/* Status Multi-Select */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-all ${
                  hasActiveFilters
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {Object.values(filters).filter(v => v !== undefined && v !== '').length}
                  </span>
                )}
              </button>
            </div>

            {/* Add Transaction */}
            <button 
              onClick={() => onTransactionAction('create')} 
              className="hidden sm:inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      {/* Modern Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Filter Transactions</h3>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onFiltersChange({
                    search: '',
                    categoryId: undefined,
                    categoryIds: undefined,
                    isPosted: undefined,
                    isRecurring: undefined,
                    dateRange: undefined,
                  });
                }}
                className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 mr-1.5" />
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Status</label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={filters.isPosted === undefined}
                    onChange={() => onFiltersChange({ ...filters, isPosted: undefined })}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">All transactions</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={filters.isPosted === true}
                    onChange={() => onFiltersChange({ ...filters, isPosted: true })}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 flex items-center">
                    Posted
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={filters.isPosted === false}
                    onChange={() => onFiltersChange({ ...filters, isPosted: false })}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 flex items-center">
                    Pending
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Waiting
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Recurring Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Type</label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="recurring"
                    checked={filters.isRecurring === undefined}
                    onChange={() => onFiltersChange({ ...filters, isRecurring: undefined })}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">All types</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="recurring"
                    checked={filters.isRecurring === true}
                    onChange={() => onFiltersChange({ ...filters, isRecurring: true })}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 flex items-center">
                    <Repeat className="h-4 w-4 mr-2 text-blue-600" />
                    Recurring only
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="recurring"
                    checked={filters.isRecurring === false}
                    onChange={() => onFiltersChange({ ...filters, isRecurring: false })}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">One-time only</span>
                </label>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Categories</label>
              <CategoryMultiSelect
                allCategories={allCategories}
                selectedCategories={filters.categoryIds || []}
                onSelectionChange={(categoryIds) => 
                  onFiltersChange({ ...filters, categoryIds, categoryId: undefined })
                }
                isOpen={showCategoryDropdown}
                onToggle={() => setShowCategoryDropdown(!showCategoryDropdown)}
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                <div className="flex flex-wrap gap-2">
                  {filters.isPosted !== undefined && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {filters.isPosted ? 'Posted' : 'Pending'}
                      <button
                        onClick={() => onFiltersChange({ ...filters, isPosted: undefined })}
                        className="ml-1.5 h-3 w-3 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.isRecurring !== undefined && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {filters.isRecurring ? 'Recurring' : 'One-time'}
                      <button
                        onClick={() => onFiltersChange({ ...filters, isRecurring: undefined })}
                        className="ml-1.5 h-3 w-3 text-purple-600 hover:text-purple-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.categoryIds && filters.categoryIds.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {filters.categoryIds.length === 1 
                        ? allCategories.find(cat => cat.id === filters.categoryIds![0])?.name || 'Category'
                        : `${filters.categoryIds.length} categories`
                      }
                      <button
                        onClick={() => onFiltersChange({ ...filters, categoryIds: undefined })}
                        className="ml-1.5 h-3 w-3 text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.categoryId && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {allCategories.find(cat => cat.id === filters.categoryId)?.name || 'Category'}
                      <button
                        onClick={() => onFiltersChange({ ...filters, categoryId: undefined })}
                        className="ml-1.5 h-3 w-3 text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}



      {/* Main Content */}
      {mobileViewMode === 'list' ? (
        // Mobile List View - Single chronological list
        <div className="sm:hidden space-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <h4 className="text-sm font-semibold text-gray-900">All Transactions</h4>
              <span className="text-xs text-gray-500">
                {filteredTransactions.length} transactions
              </span>
            </div>
            <button 
              onClick={() => onTransactionAction('create')}
              className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
              title="Add Transaction"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 420px)' }}>
            <ChronologicalList
              transactions={filteredTransactions}
              allCategories={allCategories}
              formatCurrency={formatCurrency}
              onTransactionAction={onTransactionAction}
            />
          </div>
        </div>
      ) : null}

      {/* Column View - Default for desktop, optional for mobile */}
      <div className={`grid grid-cols-2 gap-3 sm:gap-6 ${mobileViewMode === 'list' ? 'hidden sm:grid' : ''}`}>
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

          <div className="space-y-1 sm:space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 420px)' }}>
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

          <div className="space-y-1 sm:space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 420px)' }}>
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

      {/* Mobile Add Button */}
      <div className="sm:hidden fixed bottom-6 right-6">
        <button 
          onClick={() => onTransactionAction('create')}
          className="w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};