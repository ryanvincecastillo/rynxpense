// utils/budgetHelpers.ts
import { BudgetCategory } from '../types';

export const getCategoryPerformance = (category: BudgetCategory): number => {
  if (category.plannedAmount === 0) return 0;
  return (category.actualAmount / category.plannedAmount) * 100;
};

export const getPerformanceColor = (performance: number, isIncome: boolean): string => {
  if (isIncome) {
    // For income, higher is better
    if (performance >= 100) return 'text-green-600 bg-green-100';
    if (performance >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  } else {
    // For expenses, staying under budget is better
    if (performance <= 80) return 'text-green-600 bg-green-100';
    if (performance <= 100) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }
};

export const formatTransactionStatus = (isPosted: boolean): {
  label: string;
  color: string;
  icon: string;
} => {
  return isPosted 
    ? { label: 'Posted', color: 'text-green-600 bg-green-100', icon: 'check' }
    : { label: 'Pending', color: 'text-yellow-600 bg-yellow-100', icon: 'clock' };
};

export const groupTransactionsByDate = (transactions: any[]) => {
  const groups: { [key: string]: any[] } = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
  });

  // Sort groups by date (newest first)
  return Object.entries(groups).sort(([a], [b]) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
};