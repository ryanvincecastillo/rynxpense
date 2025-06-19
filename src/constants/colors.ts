export const BUDGET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
] as const;

export const CATEGORY_COLORS = {
  income: ['#22C55E', '#10B981', '#059669', '#047857', '#065F46'],
  expense: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D']
} as const;

export const DEFAULT_COLORS = {
  budget: BUDGET_COLORS[0],
  incomeCategory: CATEGORY_COLORS.income[0],
  expenseCategory: CATEGORY_COLORS.expense[0]
} as const;