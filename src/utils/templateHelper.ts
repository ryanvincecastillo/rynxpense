import { budgetTemplateService } from "../services/budgetTemplateService";

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