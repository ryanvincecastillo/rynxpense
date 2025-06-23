import { BudgetTemplate, calculateTransactionDate, CreateBudgetWithTemplateForm, getTemplateById } from "../types/template";
import { budgetAPI, categoryAPI, transactionAPI } from "./api";


export interface ApplyTemplateResult {
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

class BudgetTemplateService {
  /**
   * Creates a budget with template applied
   */
  async createBudgetWithTemplate(formData: CreateBudgetWithTemplateForm): Promise<ApplyTemplateResult> {
    try {
      // Step 1: Create the base budget
      const budgetResponse : any = await budgetAPI.create({
        name: formData.name,
        description: formData.description,
        color: formData.color,
      });

      if (!budgetResponse.success) {
        throw new Error(budgetResponse.message || 'Failed to create budget');
      }

      const budget = budgetResponse.data;

      // Step 2: If no template selected, return budget only
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

      // Step 3: Apply template
      const template = getTemplateById(formData.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const result = await this.applyTemplateToExistingBudget(budget.id, template);
      
      return {
        budget,
        ...result
      };

    } catch (error: any) {
      console.error('Error creating budget with template:', error);
      throw new Error(error.message || 'Failed to create budget with template');
    }
  }

  /**
   * Applies a template to an existing budget
   */
  async applyTemplateToExistingBudget(budgetId: string, template: BudgetTemplate): Promise<Omit<ApplyTemplateResult, 'budget'>> {
    try {
      const categories: any[] = [];
      const transactions: any[] = [];

      // Step 1: Create categories from template
      for (const templateCategory of template.categories) {
        try {
          const categoryResponse : any= await categoryAPI.create({
            budgetId,
            name: templateCategory.name,
            type: templateCategory.type,
            plannedAmount: templateCategory.plannedAmount,
            color: templateCategory.color,
          });

          if (categoryResponse.success) {
            categories.push(categoryResponse.data);
          } else {
            console.warn(`Failed to create category: ${templateCategory.name}`, categoryResponse.message);
          }
        } catch (error) {
          console.warn(`Error creating category: ${templateCategory.name}`, error);
        }
      }

      // Step 2: Create transactions from template
      for (const templateTransaction of template.sampleTransactions) {
        try {
          // Find the corresponding category
          const category = categories.find(cat => cat.name === templateTransaction.categoryName);
          if (!category) {
            console.warn(`Category not found for transaction: ${templateTransaction.categoryName}`);
            continue;
          }

          // Calculate the transaction date
          const transactionDate = calculateTransactionDate(templateTransaction.date);

          const transactionResponse : any= await transactionAPI.create({
            budgetId,
            categoryId: category.id,
            amount: templateTransaction.amount,
            description: templateTransaction.description,
            date: transactionDate,
            isPosted: templateTransaction.isPosted,
          });

          if (transactionResponse.success) {
            transactions.push(transactionResponse.data);
          } else {
            console.warn(`Failed to create transaction: ${templateTransaction.description}`, transactionResponse.message);
          }
        } catch (error) {
          console.warn(`Error creating transaction: ${templateTransaction.description}`, error);
        }
      }

      // Step 3: Update category actuals based on transactions
      try {
        await categoryAPI.updateActuals();
      } catch (error) {
        console.warn('Failed to update category actuals:', error);
      }

      // Step 4: Calculate summary
      const incomeCategories = categories.filter(cat => cat.type === 'INCOME');
      const expenseCategories = categories.filter(cat => cat.type === 'EXPENSE');
      
      const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
      const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);

      const summary = {
        totalCategories: categories.length,
        totalTransactions: transactions.length,
        totalIncome,
        totalExpenses,
      };

      return {
        categories,
        transactions,
        summary
      };

    } catch (error: any) {
      console.error('Error applying template to budget:', error);
      throw new Error(error.message || 'Failed to apply template to budget');
    }
  }

  /**
   * Validates if a template can be applied to a budget
   */
  async validateTemplateApplication(budgetId: string, templateId: string): Promise<{
    canApply: boolean;
    warnings: string[];
    conflicts: string[];
  }> {
    try {
      const template = getTemplateById(templateId);
      if (!template) {
        return {
          canApply: false,
          warnings: [],
          conflicts: ['Template not found']
        };
      }

      // Get existing budget categories
      const categoriesResponse : any = await categoryAPI.getByBudget(budgetId);
      const existingCategories = categoriesResponse.success ? 
        [...(categoriesResponse.data.income || []), ...(categoriesResponse.data.expense || [])] : [];

      const warnings: string[] = [];
      const conflicts: string[] = [];

      // Check for category name conflicts
      const existingCategoryNames = existingCategories.map(cat => cat.name.toLowerCase());
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
      const transactionsResponse : any = await transactionAPI.getAll({ budgetId, limit: 1 });
      if (transactionsResponse.success && transactionsResponse.data && transactionsResponse.data.length > 0) {
        warnings.push('This budget already has transactions');
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
  }

  /**
   * Preview what would be created from a template
   */
  getTemplatePreview(templateId: string): {
    template: BudgetTemplate | null;
    summary: {
      incomeCategories: number;
      expenseCategories: number;
      totalTransactions: number;
      totalIncome: number;
      totalExpenses: number;
      netAmount: number;
    } | null;
  } {
    const template = getTemplateById(templateId);
    
    if (!template) {
      return { template: null, summary: null };
    }

    const incomeCategories = template.categories.filter(cat => cat.type === 'INCOME');
    const expenseCategories = template.categories.filter(cat => cat.type === 'EXPENSE');
    
    const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
    const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);

    return {
      template,
      summary: {
        incomeCategories: incomeCategories.length,
        expenseCategories: expenseCategories.length,
        totalTransactions: template.sampleTransactions.length,
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
      }
    };
  }
}

// Export singleton instance
export const budgetTemplateService = new BudgetTemplateService();