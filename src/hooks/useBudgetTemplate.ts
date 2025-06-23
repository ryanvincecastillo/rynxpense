// src/hooks/useBudgetTemplate.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './common';
import { CreateBudgetWithTemplateForm, BudgetTemplate, calculateTransactionDate } from '../types/template';
import { budgetAPI, categoryAPI, transactionAPI } from '../services/api';
import { queryKeys } from './useApi';

interface CreateBudgetWithTemplateResult {
  budget: any;
  categories: any[];
  transactions: any[];
  summary: {
    totalCategories: number;
    totalTransactions: number;
    totalIncome: number;
    totalExpenses: number;
  };
}

export const useCreateBudgetWithTemplate = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation<CreateBudgetWithTemplateResult, Error, CreateBudgetWithTemplateForm>({
    mutationFn: async (formData: CreateBudgetWithTemplateForm) => {
      try {
        // Step 1: Create the base budget using existing API service
        const budgetResponse = await budgetAPI.create({
          name: formData.name,
          description: formData.description,
          color: formData.color,
        });

        if (!budgetResponse.data.success) {
          throw new Error(budgetResponse.data.message || 'Failed to create budget');
        }

        const budget = budgetResponse.data.data;

        // If no template is applied, return early
        if (!formData.applyTemplate || !formData.templateId) {
          return {
            budget,
            categories: [],
            transactions: [],
            summary: {
              totalCategories: 0,
              totalTransactions: 0,
              totalIncome: 0,
              totalExpenses: 0,
            }
          };
        }

        // Step 2: Get template data
        const { getTemplateById } = await import('../types/template');
        const template = getTemplateById(formData.templateId);
        
        if (!template) {
          throw new Error('Template not found');
        }

        // Step 3: Create categories from template using existing API service
        const createdCategories = [];
        const categoryMap = new Map<string, string>(); // Maps template category name to created category ID

        for (const templateCategory of template.categories) {
          try {
            const categoryResponse = await categoryAPI.create({
              budgetId: budget.id,
              name: templateCategory.name,
              type: templateCategory.type,
              plannedAmount: templateCategory.plannedAmount,
              color: templateCategory.color,
              // Note: API doesn't support icon/description fields yet, so we skip them
            });

            if (categoryResponse.data.success) {
              const categoryData = categoryResponse.data.data;
              createdCategories.push(categoryData);
              categoryMap.set(templateCategory.name, categoryData.id);
            }
          } catch (error) {
            console.error(`Failed to create category ${templateCategory.name}:`, error);
            // Continue with other categories even if one fails
          }
        }

        // Step 4: Create transactions from template using existing API service
        const createdTransactions = [];

        for (const templateTransaction of template.sampleTransactions) {
          const categoryId = categoryMap.get(templateTransaction.categoryName);
          
          if (categoryId) {
            try {
              const transactionDate = calculateTransactionDate(templateTransaction.date);
              
              // IMPORTANT: Convert negative amounts to positive
              // The API expects positive amounts for all transactions
              // Income/Expense is determined by category type, not amount sign
              const absoluteAmount = Math.abs(templateTransaction.amount);
              
              console.log(`Creating transaction: ${templateTransaction.description}, Original: ${templateTransaction.amount}, Converted: ${absoluteAmount}`);
              
              const transactionResponse = await transactionAPI.create({
                budgetId: budget.id,
                categoryId: categoryId,
                description: templateTransaction.description,
                amount: absoluteAmount, // Always use positive amount
                date: transactionDate,
                isPosted: templateTransaction.isPosted,
                // Note: Template transactions are not recurring by default
              });

              if (transactionResponse.data.success) {
                const transactionData = transactionResponse.data.data;
                createdTransactions.push(transactionData);
                console.log(`✅ Transaction created successfully: ${transactionData.description}`);
              } else {
                console.error(`❌ Transaction creation failed: ${templateTransaction.description}`, transactionResponse.data.message);
              }
            } catch (error) {
              console.error(`Failed to create transaction ${templateTransaction.description}:`, error);
              // Continue with other transactions even if one fails
            }
          } else {
            console.warn(`❌ Category not found for transaction: ${templateTransaction.categoryName}`);
          }
        }

        // Step 5: Calculate summary
        const incomeCategories = createdCategories.filter(cat => cat.type === 'INCOME');
        const expenseCategories = createdCategories.filter(cat => cat.type === 'EXPENSE');
        
        const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
        const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);

        return {
          budget,
          categories: createdCategories,
          transactions: createdTransactions,
          summary: {
            totalCategories: createdCategories.length,
            totalTransactions: createdTransactions.length,
            totalIncome,
            totalExpenses,
          }
        };

      } catch (error: any) {
        console.error('Error creating budget with template:', error);
        throw new Error(error.message || 'Failed to create budget with template');
      }
    },
    
    onSuccess: (result, variables) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', result.budget.id] });
      queryClient.invalidateQueries({ queryKey: ['categories', result.budget.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      // Show appropriate success message
      if (variables.applyTemplate && variables.templateId) {
        showSuccess(
          `Budget created with template! Added ${result.summary.totalCategories} categories and ${result.summary.totalTransactions} sample transactions.`
        );
      } else {
        showSuccess('Budget created successfully!');
      }
    },
    
    onError: (error: any) => {
      console.error('Create budget with template error:', error);
      showError(error.message || 'Failed to create budget with template. Please try again.');
    }
  });
};

// Helper function to validate template application
export const validateTemplateApplication = async (
  budgetId: string, 
  templateId: string
): Promise<{
  canApply: boolean;
  warnings: string[];
  conflicts: string[];
}> => {
  try {
    // Check existing categories
    const categoriesResponse = await fetch(`/api/budgets/${budgetId}/categories`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!categoriesResponse.ok) {
      throw new Error('Failed to fetch existing categories');
    }

    const categoriesData = await categoriesResponse.json();
    const existingCategories = categoriesData.success ? 
      [...(categoriesData.data.income || []), ...(categoriesData.data.expense || [])] : [];

    const warnings: string[] = [];
    const conflicts: string[] = [];

    // Get template data
    const { getTemplateById } = await import('../types/template');
    const template = getTemplateById(templateId);
    
    if (!template) {
      return {
        canApply: false,
        warnings: [],
        conflicts: ['Template not found']
      };
    }

    // Check for category name conflicts
    const existingCategoryNames = existingCategories.map((cat: any) => cat.name.toLowerCase());
    const templateCategoryNames = template.categories.map(cat => cat.name.toLowerCase());
    
    const duplicateNames = templateCategoryNames.filter(name => 
      existingCategoryNames.includes(name)
    );

    if (duplicateNames.length > 0) {
      conflicts.push(`Categories with these names already exist: ${duplicateNames.join(', ')}`);
    }

    // Add warnings for existing data
    if (existingCategories.length > 0) {
      warnings.push(`This budget already has ${existingCategories.length} categories`);
    }

    // Check transactions
    const transactionsResponse = await fetch(`/api/budgets/${budgetId}/transactions?limit=1`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (transactionsResponse.ok) {
      const transactionsData = await transactionsResponse.json();
      if (transactionsData.success && transactionsData.data && transactionsData.data.length > 0) {
        warnings.push('This budget already has transactions');
      }
    }

    return {
      canApply: conflicts.length === 0,
      warnings,
      conflicts
    };

  } catch (error: any) {
    console.error('Error validating template application:', error);
    return {
      canApply: false,
      warnings: [],
      conflicts: ['Failed to validate template application']
    };
  }
};