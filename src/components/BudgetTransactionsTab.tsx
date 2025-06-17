import React from 'react';
import { Plus, Search, Edit3, Trash2, Check, Clock, Repeat, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { BudgetCategoriesResponse, Transaction } from '../types';
import { Badge, Button, Card, EmptyState, Input, Select } from './ui';

interface TransactionFilters {
  isPosted?: boolean;
  isRecurring?: boolean;
  search: string;
}

interface BudgetTransactionsTabProps {
  transactions: Transaction[];
  categoriesData: BudgetCategoriesResponse | undefined;
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onTransactionAction: (action: string, transaction?: Transaction, data?: any) => void;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
}

const BudgetTransactionsTab: React.FC<BudgetTransactionsTabProps> = ({
  transactions,
  categoriesData,
  filters,
  onFiltersChange,
  onTransactionAction,
  formatCurrency,
  isLoading,
}) => {
  // Helper function for ordinal suffix
  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Filter transactions
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(transaction => {
      if (filters.isPosted !== undefined && transaction.isPosted !== filters.isPosted) return false;
      if (filters.isRecurring !== undefined && transaction.isRecurring !== filters.isRecurring) return false;
      if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filters]);

  // Transaction Card Component
  const TransactionCard: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-4">
        <div className={`w-3 h-3 rounded-full ${transaction.isPosted ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <div>
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">{transaction.description}</p>
            {transaction.isRecurring && (
              <span title="Recurring transaction">
                <Repeat className="h-4 w-4 text-blue-500" />
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{transaction.category?.name}</span>
            <span>•</span>
            <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
            {transaction.isRecurring && (
              <>
                <span>•</span>
                <Badge variant="secondary" size="sm">
                  {transaction.frequency?.toLowerCase()}
                  {transaction.dayOfMonth && ` (${transaction.dayOfMonth}${getOrdinalSuffix(transaction.dayOfMonth)})`}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <span className={`font-semibold ${
            transaction.category?.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.category?.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </span>
          <div className="text-xs text-gray-500">
            <Badge variant={transaction.isPosted ? 'success' : 'warning'} size="sm">
              {transaction.isPosted ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Posted
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </>
              )}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onTransactionAction('edit', transaction)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit transaction"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onTransactionAction('delete', transaction)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete transaction"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <Card>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Transactions Management</h2>
        <Button onClick={() => onTransactionAction('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            />
          </div>
          
          <Select
            placeholder="All Statuses"
            value={filters.isPosted?.toString() || ''}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              isPosted: e.target.value ? e.target.value === 'true' : undefined 
            })}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'true', label: 'Posted Only' },
              { value: 'false', label: 'Pending Only' },
            ]}
          />

          <Select
            placeholder="All Types"
            value={filters.isRecurring?.toString() || ''}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              isRecurring: e.target.value ? e.target.value === 'true' : undefined 
            })}
            options={[
              { value: '', label: 'All Types' },
              { value: 'true', label: 'Recurring Only' },
              { value: 'false', label: 'One-time Only' },
            ]}
          />

          {(filters.search || filters.isPosted !== undefined || filters.isRecurring !== undefined) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onFiltersChange({ isPosted: undefined, isRecurring: undefined, search: '' })}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Card>
          <EmptyState
            icon={Plus}
            title="No Transactions Found"
            description={
              transactions.length === 0 
                ? "Start tracking your finances by adding transactions."
                : "No transactions match your current filters."
            }
            action={
              <Button onClick={() => onTransactionAction('create')}>
                <Plus className="h-4 w-4 mr-2" />
                {transactions.length === 0 ? "Add Your First Transaction" : "Add Transaction"}
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
          
          {/* Show pagination info */}
          {filteredTransactions.length < transactions.length && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default BudgetTransactionsTab;