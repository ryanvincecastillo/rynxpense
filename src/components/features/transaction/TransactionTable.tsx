import React from 'react';
import { Edit3, Trash2, Check, Clock, Repeat } from 'lucide-react';
import { Table, Badge } from '../../ui';
import { Transaction } from '../../../types';
import { format } from 'date-fns';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  formatCurrency: (amount: number) => string;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading,
  onEdit,
  onDelete,
  formatCurrency
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

  // Enhanced table columns with recurring indicator
  const columns = [
    {
      key: 'date' as keyof Transaction,
      label: 'Date',
      render: (date: string) => format(new Date(date), 'MMM dd, yyyy'),
    },
    {
      key: 'description' as keyof Transaction,
      label: 'Description',
      render: (description: string, transaction: Transaction) => (
        <div>
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">{description}</p>
            {/* Recurring indicator */}
            {transaction.isRecurring && (
              <span title="Recurring transaction">
                <Repeat className="h-4 w-4 text-blue-500" />
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{transaction.category?.name}</span>
            {/* Show recurring info */}
            {transaction.isRecurring && (
              <Badge variant="secondary" size="sm">
                {transaction.frequency?.toLowerCase()} 
                {transaction.dayOfMonth && ` (${transaction.dayOfMonth}${getOrdinalSuffix(transaction.dayOfMonth)})`}
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'amount' as keyof Transaction,
      label: 'Amount',
      render: (amount: number, transaction: Transaction) => (
        <div className="text-right">
          <p className={`font-semibold ${
            transaction.category?.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.category?.type === 'INCOME' ? '+' : '-'}{formatCurrency(amount)}
          </p>
        </div>
      ),
    },
    {
      key: 'isPosted' as keyof Transaction,
      label: 'Status',
      render: (isPosted: boolean) => (
        <Badge variant={isPosted ? 'success' : 'warning'} size="sm">
          {isPosted ? (
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
      ),
    },
    {
      key: 'actions' as keyof Transaction,
      label: 'Actions',
      render: (_: any, transaction: Transaction) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit transaction"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(transaction)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete transaction"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Table
      data={transactions}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No transactions found matching your filters."
    />
  );
};