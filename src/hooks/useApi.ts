// src/hooks/useApi.ts - Enhanced version for better UX
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetAPI, budgetCollaboratorAPI, categoryAPI, transactionAPI } from '../services/api';
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
  DuplicateBudgetOptions,
  AddCollaboratorRequest,
  UpdateCollaboratorRoleRequest,
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
  collaborators: (budgetId: string) => ['budgets', budgetId, 'collaborators'] as const,
};

// Budget hooks
export const useBudgets = (params?: BudgetQueryParams) => {
  return useQuery({
    queryKey: ['budgets', params], // Simplified key structure
    queryFn: () => budgetAPI.getAll(params),
    select: (response) => response.data,
    staleTime: 0, // ✅ Always fetch fresh data
    gcTime: 1 * 60 * 1000, // Keep in cache for 1 minute when unused
    refetchOnWindowFocus: false,
    refetchOnMount: true, // ✅ Always refetch when component mounts
    refetchOnReconnect: true,
    retry: 2, // Retry failed requests
    retryDelay: 1000, // Wait 1 second between retries
  });
};

export const useBudget = (id: string) => {
  return useQuery({
    queryKey: queryKeys.budget(id),
    queryFn: () => budgetAPI.getById(id),
    select: (response) => response.data.data,
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData,
  });
};

export const useBudgetSummary = (id: string) => {
  return useQuery({
    queryKey: queryKeys.budgetSummary(id),
    queryFn: () => budgetAPI.getSummary(id),
    select: (response) => response.data.data,
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetForm) => budgetAPI.create(data),
    onSuccess: () => {
      // ✅ SIMPLE AND RELIABLE: Just invalidate and let React Query handle the rest
      queryClient.invalidateQueries({ 
        queryKey: ['budgets'],
        exact: false, // Match all variations of budget queries
        refetchType: 'active' // Only refetch currently active queries
      });
      
      // Also invalidate any cached budget list data
      queryClient.resetQueries({
        queryKey: ['budgets'],
        exact: false
      });
    },
    onError: (error) => {
      console.error('Budget creation error:', error);
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Budget> }) =>
      budgetAPI.update(id, data),
    onSuccess: (response, { id }) => {
      // Update specific budget cache immediately
      const updatedBudget = response.data.data;
      queryClient.setQueryData(['budgets', id], {
        success: true,
        message: 'Success',
        data: { data: updatedBudget }
      });
      
      // Invalidate all budget-related queries
      queryClient.invalidateQueries({ 
        queryKey: ['budgets'],
        exact: false,
        refetchType: 'active'
      });
    },
    onError: (error) => {
      console.error('Budget update error:', error);
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => budgetAPI.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove specific budget from cache
      queryClient.removeQueries({ queryKey: ['budgets', deletedId] });
      
      // Invalidate all budget lists to refetch without deleted item
      queryClient.invalidateQueries({ 
        queryKey: ['budgets'],
        exact: false,
        refetchType: 'active'
      });
    },
    onError: (error) => {
      console.error('Budget delete error:', error);
    },
  });
};


export const useDuplicateBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      budgetId, 
      options = {} 
    }: { 
      budgetId: string; 
      options?: DuplicateBudgetOptions 
    }) => {
      const response = await budgetAPI.duplicate(budgetId, options);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all budget queries to show the new duplicated budget
      queryClient.invalidateQueries({ 
        queryKey: ['budgets'],
        exact: false,
        refetchType: 'active'
      });
    },
    onError: (error) => {
      console.error('Budget duplicate error:', error);
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
    placeholderData: (previousData) => previousData,
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: queryKeys.category(id),
    queryFn: () => categoryAPI.getById(id),
    select: (response) => response.data.data,
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useBudgetCategories = (budgetId: string) => {
  return useQuery({
    queryKey: queryKeys.budgetCategories(budgetId),
    queryFn: () => categoryAPI.getByBudget(budgetId),
    select: (response) => response.data.data,
    enabled: !!budgetId,
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryForm) => categoryAPI.create(data),
    onSuccess: (response) => {
      const newCategory = response.data.data;
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.budgetCategories(newCategory.budgetId) 
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetCategory> }) =>
      categoryAPI.update(id, data),
    onSuccess: (response, { id }) => {
      const updatedCategory = response.data.data;
      
      // Update category cache
      queryClient.setQueryData(queryKeys.category(id), (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, data: { data: updatedCategory } };
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.budgetCategories(updatedCategory.budgetId) 
      });
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
    select: (response) => response.data,
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
};

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: queryKeys.transaction(id),
    queryFn: () => transactionAPI.getById(id),
    select: (response) => response.data.data,
    enabled: !!id,
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useTransactionSummary = (budgetId: string) => {
  return useQuery({
    queryKey: queryKeys.transactionSummary(budgetId),
    queryFn: () => transactionAPI.getBudgetSummary(budgetId),
    select: (response) => response.data.data,
    enabled: !!budgetId,
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionForm) => transactionAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) =>
      transactionAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.transaction(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
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

// ===== BUDGET COLLABORATOR HOOKS =====

// Get budget collaborators
export const useBudgetCollaborators = (budgetId: string) => {
  return useQuery({
    queryKey: queryKeys.collaborators(budgetId),
    queryFn: () => budgetCollaboratorAPI.getCollaborators(budgetId),
    select: (response) => response.data.data,
    enabled: !!budgetId,
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

// Add collaborator
export const useAddCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, data }: { budgetId: string; data: AddCollaboratorRequest }) =>
      budgetCollaboratorAPI.addCollaborator(budgetId, data),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collaborators(budgetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.budget(budgetId) });
    },
  });
};

// Update collaborator role
export const useUpdateCollaboratorRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      budgetId, 
      collaboratorId, 
      data 
    }: { 
      budgetId: string; 
      collaboratorId: string; 
      data: UpdateCollaboratorRoleRequest 
    }) =>
      budgetCollaboratorAPI.updateCollaboratorRole(budgetId, collaboratorId, data),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collaborators(budgetId) });
    },
  });
};

// Remove collaborator
export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, collaboratorId }: { budgetId: string; collaboratorId: string }) =>
      budgetCollaboratorAPI.removeCollaborator(budgetId, collaboratorId),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collaborators(budgetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.budget(budgetId) });
    },
  });
};

// Leave budget (for collaborators)
export const useLeaveBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (budgetId: string) => budgetCollaboratorAPI.leaveBudget(budgetId),
    onSuccess: (_, budgetId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      queryClient.invalidateQueries({ queryKey: queryKeys.budget(budgetId) });
    },
  });
};