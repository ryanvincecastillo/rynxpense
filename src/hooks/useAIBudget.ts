// src/hooks/useAIBudget.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './common';
import { aiBudgetService, AIBudgetRequest, CreateAIBudgetResult } from '../services/aiBudgetService';
import { queryKeys } from './useApi';

export interface UseAIBudgetOptions {
  onSuccess?: (result: CreateAIBudgetResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for creating budgets using AI
 */
export const useCreateAIBudget = (options?: UseAIBudgetOptions) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation<CreateAIBudgetResult, Error, AIBudgetRequest>({
    mutationFn: async (request: AIBudgetRequest) => {
      return aiBudgetService.createAIBudget(request);
    },
    onSuccess: (data, variables) => {
      // Invalidate budgets list to show new budget
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      
      // Show success message
      showSuccess(`AI Budget "${data.budget.name}" created successfully! 🤖✨`);
      
      // Call custom success handler
      options?.onSuccess?.(data);
    },
    onError: (error, variables) => {
      console.error('AI Budget creation failed:', error);
      
      // Show error message
      showError(error.message || 'Failed to create AI budget');
      
      // Call custom error handler
      options?.onError?.(error);
    },
  });
};

/**
 * Hook to check AI availability
 */
export const useAIAvailability = () => {
  return {
    isAvailable: aiBudgetService.isAvailable(),
    service: aiBudgetService,
  };
};

/**
 * Hook for AI budget analysis without creation
 */
export const useAIBudgetAnalysis = () => {
  return useMutation<any, Error, AIBudgetRequest>({
    mutationFn: async (request: AIBudgetRequest) => {
      // This would call a separate analysis method if we had one
      // For now, we'll use the full creation but return early
      throw new Error('Analysis-only mode not implemented yet');
    },
  });
};