import { useMemo } from 'react';
import { Transaction } from '../types';

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

export const useTransactionFilters = (
  transactions: Transaction[], 
  filters: TransactionFilters
) => {
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Status filter
      if (filters.isPosted !== undefined && transaction.isPosted !== filters.isPosted) {
        return false;
      }
      
      // Recurring filter
      if (filters.isRecurring !== undefined && transaction.isRecurring !== filters.isRecurring) {
        return false;
      }
      
      // Category filter
      if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
        return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesDescription = transaction.description.toLowerCase().includes(searchTerm);
        // You could also search by amount, category name, etc.
        return matchesDescription;
      }
      
      // Date range filter
      if (filters.dateRange) {
        const transactionDate = new Date(transaction.date);
        const { start, end } = filters.dateRange;
        return transactionDate >= start && transactionDate <= end;
      }
      
      return true;
    });
  }, [transactions, filters]);

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

  return {
    filteredTransactions,
    summaryStats,
  };
};