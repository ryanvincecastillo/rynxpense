

// src/hooks/useBudgetTemplate.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetTemplateService } from '../services/budgetTemplateService';
import { useToast } from './common';
import { CreateBudgetWithTemplateForm } from '../types/template';

export const useCreateBudgetWithTemplate = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateBudgetWithTemplateForm) => 
      budgetTemplateService.createBudgetWithTemplate(data),
    
    onSuccess: (result) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', result.budget.id] });
      queryClient.invalidateQueries({ queryKey: ['categories', result.budget.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      // Show success message
      const templateApplied = result.categories.length > 0 || result.transactions.length > 0;
      
      if (templateApplied) {
        showSuccess(
          `Budget created successfully with ${result.summary.totalCategories} categories and ${result.summary.totalTransactions} sample transactions!`
        );
      } else {
        showSuccess('Budget created successfully! Your new budget is ready for customization.');
      }
    },
    
    onError: (error: any) => {
      showError(error, 'Failed to create budget. Please try again.');
    }
  });
};

export const useApplyTemplate = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ budgetId, templateId }: { budgetId: string; templateId: string }) => {
      const template = budgetTemplateService.getTemplatePreview(templateId).template;
      if (!template) {
        throw new Error('Template not found');
      }
      return budgetTemplateService.applyTemplateToExistingBudget(budgetId, template);
    },
    
    onSuccess: (result, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['budget', variables.budgetId] });
      queryClient.invalidateQueries({ queryKey: ['categories', variables.budgetId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      showSuccess(
        `Template applied successfully! Added ${result.summary.totalCategories} categories and ${result.summary.totalTransactions} transactions.`
      );
    },
    
    onError: (error: any) => {
      showError(error, 'Failed to apply template. Please try again.');
    }
  });
};

// src/utils/templateHelpers.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getTemplateStatistics = (templateId: string): {
  incomeCategories: number;
  expenseCategories: number;
  totalTransactions: number;
  postedTransactions: number;
  pendingTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
} | null => {
  const { template } = budgetTemplateService.getTemplatePreview(templateId);
  
  if (!template) return null;

  const incomeCategories = template.categories.filter(cat => cat.type === 'INCOME');
  const expenseCategories = template.categories.filter(cat => cat.type === 'EXPENSE');
  
  const postedTransactions = template.sampleTransactions.filter(t => t.isPosted);
  const pendingTransactions = template.sampleTransactions.filter(t => !t.isPosted);
  
  const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);

  return {
    incomeCategories: incomeCategories.length,
    expenseCategories: expenseCategories.length,
    totalTransactions: template.sampleTransactions.length,
    postedTransactions: postedTransactions.length,
    pendingTransactions: pendingTransactions.length,
    totalIncome,
    totalExpenses,
    netAmount: totalIncome - totalExpenses,
  };
};