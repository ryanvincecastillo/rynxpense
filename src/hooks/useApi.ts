import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetAPI, categoryAPI, transactionAPI } from '../services/api';
import {
  Budget,
  BudgetCategory,
  Transaction,
  BudgetQueryParams,
  CategoryQueryParams,
  TransactionQueryParams,
  CreateBudgetForm,
  CreateCategoryForm,
  CreateTransactionForm,
  TransactionsResponse,
} from '../types';

// Query keys
export const queryKeys = {
  budgets: ['budgets'] as const,
  budget: (id: string) => ['budgets', id] as const,
  budgetSummary: (id: string) => ['budgets', id, 'summary'] as const,
  categories: ['categories'] as const,
  category: (id: string) => ['categories', id] as const,
  budgetCategories: (budgetId: string) => ['categories', 'budget', budgetId] as const,
  transactions: ['transactions'] as const,
  transaction: (id: string) => ['transactions', id] as const,
  transactionSummary: (budgetId: string) => ['transactions', 'summary', budgetId] as const,
};

// Budget hooks
export const useBudgets = (params?: BudgetQueryParams) => {
  return useQuery({
    queryKey: [...queryKeys.budgets, params],
    queryFn: () => budgetAPI.getAll(params),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBudget = (id: string) => {
  return useQuery({
    queryKey: queryKeys.budget(id),
    queryFn: () => budgetAPI.getById(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

export const useBudgetSummary = (id: string) => {
  return useQuery({
    queryKey: queryKeys.budgetSummary(id),
    queryFn: () => budgetAPI.getSummary(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetForm) => budgetAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Budget> }) =>
      budgetAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      queryClient.invalidateQueries({ queryKey: queryKeys.budget(id) });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => budgetAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
    },
  });
};

// Category hooks
export const useCategories = (params?: CategoryQueryParams) => {
  return useQuery({
    queryKey: [...queryKeys.categories, params],
    queryFn: () => categoryAPI.getAll(params),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: queryKeys.category(id),
    queryFn: () => categoryAPI.getById(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

export const useBudgetCategories = (budgetId: string) => {
  return useQuery({
    queryKey: queryKeys.budgetCategories(budgetId),
    queryFn: () => categoryAPI.getByBudget(budgetId),
    select: (response) => response.data.data,
    enabled: !!budgetId,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryForm) => categoryAPI.create(data),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetCategories(budgetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetSummary(budgetId) });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetCategory> }) =>
      categoryAPI.update(id, data),
    onSuccess: (response, { id }) => {
      const category = response.data.data;
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.category(id) });
      if (category.budgetId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.budgetCategories(category.budgetId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.budgetSummary(category.budgetId) });
      }
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
};

// Transaction hooks
export const useTransactions = (params?: TransactionQueryParams) => {
  return useQuery({
    queryKey: [...queryKeys.transactions, params],
    queryFn: () => transactionAPI.getAll(params),
    select: (response): TransactionsResponse => {
      // The API returns the data in the format we expect
      return response.data as TransactionsResponse;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: queryKeys.transaction(id),
    queryFn: () => transactionAPI.getById(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

export const useTransactionSummary = (budgetId: string) => {
  return useQuery({
    queryKey: queryKeys.transactionSummary(budgetId),
    queryFn: () => transactionAPI.getBudgetSummary(budgetId),
    select: (response) => response.data.data,
    enabled: !!budgetId,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionForm) => transactionAPI.create(data),
    onSuccess: (_, { budgetId, categoryId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetCategories(budgetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetSummary(budgetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.category(categoryId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionSummary(budgetId) });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) =>
      transactionAPI.update(id, data),
    onSuccess: (response, { id }) => {
      const transaction = response.data.data;
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.transaction(id) });
      if (transaction.budgetId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.budgetCategories(transaction.budgetId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.budgetSummary(transaction.budgetId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.transactionSummary(transaction.budgetId) });
      }
      if (transaction.categoryId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.category(transaction.categoryId) });
      }
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });
};

export const useBulkUpdateTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      transactionIds: string[];
      updates: {
        isPosted?: boolean;
        categoryId?: string;
      };
    }) => transactionAPI.bulkUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
};

// Utility hooks for optimistic updates
export const useOptimisticBudgetUpdate = () => {
  const queryClient = useQueryClient();

  return (budgetId: string, updater: (old: Budget) => Budget) => {
    queryClient.setQueryData(queryKeys.budget(budgetId), (old: any) => {
      if (old?.data) {
        return {
          ...old,
          data: updater(old.data),
        };
      }
      return old;
    });
  };
};

export const useOptimisticCategoryUpdate = () => {
  const queryClient = useQueryClient();

  return (categoryId: string, updater: (old: BudgetCategory) => BudgetCategory) => {
    queryClient.setQueryData(queryKeys.category(categoryId), (old: any) => {
      if (old?.data) {
        return {
          ...old,
          data: updater(old.data),
        };
      }
      return old;
    });
  };
};