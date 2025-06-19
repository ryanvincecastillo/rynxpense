import { useMemo } from 'react';
import { BudgetCategory, BudgetCategoriesResponse } from '../types';

interface CategoryFilters {
  type: 'INCOME' | 'EXPENSE' | '';
  showInactive: boolean;
  search: string;
}

export const useCategoryFilters = (
  categoriesData: BudgetCategoriesResponse | undefined,
  filters: CategoryFilters
) => {
  const filteredCategories = useMemo(() => {
    if (!categoriesData) return { income: [], expense: [] };

    const filterCategory = (categories: BudgetCategory[]) => {
      return categories.filter(cat => {
        // Active/Inactive filter
        if (!filters.showInactive && !cat.isActive) return false;
        
        // Type filter (this is redundant since income/expense are already separated)
        if (filters.type && cat.type !== filters.type) return false;
        
        // Search filter
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          return (
            cat.name.toLowerCase().includes(searchTerm) ||
            cat.description?.toLowerCase().includes(searchTerm)
          );
        }
        
        return true;
      });
    };

    return {
      income: filterCategory(categoriesData.income || []),
      expense: filterCategory(categoriesData.expense || []),
    };
  }, [categoriesData, filters]);

  const summaryStats = useMemo(() => {
    if (!categoriesData) return null;

    const allCategories = [...(categoriesData.income || []), ...(categoriesData.expense || [])];
    const activeCategories = allCategories.filter(cat => cat.isActive);
    const totalPlanned = allCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
    const totalActual = allCategories.reduce((sum, cat) => sum + cat.actualAmount, 0);

    return {
      total: allCategories.length,
      active: activeCategories.length,
      totalPlanned,
      totalActual,
      variance: totalActual - totalPlanned,
      incomeCategories: filteredCategories.income.length,
      expenseCategories: filteredCategories.expense.length,
    };
  }, [categoriesData, filteredCategories]);

  return {
    filteredCategories,
    summaryStats,
  };
};