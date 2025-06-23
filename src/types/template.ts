// src/types/template.ts
export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  categories: TemplateCategory[];
  sampleTransactions: TemplateTransaction[];
}

export interface TemplateCategory {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  plannedAmount: number;
  color: string;
  icon: string;
  description?: string;
}

export interface TemplateTransaction {
  categoryName: string;
  description: string;
  amount: number;
  date: string; // relative to today, e.g., "-5" for 5 days ago
  isPosted: boolean;
}

export interface CreateBudgetWithTemplateForm {
  name: string;
  description: string;
  color: string;
  applyTemplate: boolean;
  templateId?: string;
}

// Extended form for creating categories with template data
export interface CreateCategoryWithTemplateForm {
  budgetId: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  plannedAmount: number;
  color?: string;
  description?: string;
  icon?: string;
}

// Pre-built templates
export const BUDGET_TEMPLATES: BudgetTemplate[] = [
  {
    id: 'personal-budget',
    name: 'Personal Budget',
    description: 'Perfect for individuals managing personal finances with common income and expense categories.',
    icon: '👤',
    color: '#3B82F6',
    categories: [
      // Income Categories
      {
        name: 'Salary',
        type: 'INCOME',
        plannedAmount: 50000,
        color: '#10B981',
        icon: '💼',
        description: 'Primary employment income'
      },
      {
        name: 'Freelance',
        type: 'INCOME',
        plannedAmount: 15000,
        color: '#059669',
        icon: '💻',
        description: 'Side projects and freelance work'
      },
      {
        name: 'Investments',
        type: 'INCOME',
        plannedAmount: 5000,
        color: '#065F46',
        icon: '📈',
        description: 'Investment returns and dividends'
      },
      // Expense Categories
      {
        name: 'Rent',
        type: 'EXPENSE',
        plannedAmount: 15000,
        color: '#DC2626',
        icon: '🏠',
        description: 'Monthly housing costs'
      },
      {
        name: 'Groceries',
        type: 'EXPENSE',
        plannedAmount: 8000,
        color: '#EA580C',
        icon: '🛒',
        description: 'Food and household supplies'
      },
      {
        name: 'Transportation',
        type: 'EXPENSE',
        plannedAmount: 5000,
        color: '#D97706',
        icon: '🚗',
        description: 'Gas, parking, public transport'
      },
      {
        name: 'Utilities',
        type: 'EXPENSE',
        plannedAmount: 3000,
        color: '#B45309',
        icon: '⚡',
        description: 'Electricity, water, internet'
      },
      {
        name: 'Entertainment',
        type: 'EXPENSE',
        plannedAmount: 4000,
        color: '#7C2D12',
        icon: '🎬',
        description: 'Movies, dining out, hobbies'
      },
      {
        name: 'Savings',
        type: 'EXPENSE',
        plannedAmount: 10000,
        color: '#059669',
        icon: '💰',
        description: 'Emergency fund and investments'
      }
    ],
    sampleTransactions: [
      // Income
      { categoryName: 'Salary', description: 'Monthly Salary', amount: 50000, date: '-1', isPosted: true },
      { categoryName: 'Freelance', description: 'Website Design Project', amount: 15000, date: '-3', isPosted: true },
      { categoryName: 'Investments', description: 'Stock Dividends', amount: 5000, date: '-7', isPosted: true },
      
      // Expenses
      { categoryName: 'Rent', description: 'Monthly Rent Payment', amount: -15000, date: '-1', isPosted: true },
      { categoryName: 'Groceries', description: 'Weekly Grocery Shopping', amount: -2000, date: '-2', isPosted: true },
      { categoryName: 'Transportation', description: 'Gas Fill-up', amount: -1500, date: '-3', isPosted: true },
      { categoryName: 'Utilities', description: 'Electricity Bill', amount: -1800, date: '-5', isPosted: true },
      { categoryName: 'Entertainment', description: 'Movie Night', amount: -800, date: '-6', isPosted: true },
      { categoryName: 'Savings', description: 'Emergency Fund Transfer', amount: -10000, date: '-1', isPosted: true },
      
      // Pending
      { categoryName: 'Groceries', description: 'Weekend Shopping', amount: -1800, date: '1', isPosted: false },
      { categoryName: 'Utilities', description: 'Internet Bill Due', amount: -1200, date: '2', isPosted: false },
    ]
  },
  
  {
    id: 'student-budget',
    name: 'Student Budget',
    description: 'Designed for students with limited income, focusing on essential expenses and education costs.',
    icon: '🎓',
    color: '#8B5CF6',
    categories: [
      // Income
      {
        name: 'Part-time Job',
        type: 'INCOME',
        plannedAmount: 12000,
        color: '#10B981',
        icon: '💼',
        description: 'Part-time employment'
      },
      {
        name: 'Allowance',
        type: 'INCOME',
        plannedAmount: 8000,
        color: '#059669',
        icon: '👨‍👩‍👧‍👦',
        description: 'Family support'
      },
      {
        name: 'Scholarship',
        type: 'INCOME',
        plannedAmount: 10000,
        color: '#065F46',
        icon: '🎓',
        description: 'Educational grants'
      },
      // Expenses
      {
        name: 'Tuition',
        type: 'EXPENSE',
        plannedAmount: 15000,
        color: '#DC2626',
        icon: '🏫',
        description: 'School fees and tuition'
      },
      {
        name: 'Books',
        type: 'EXPENSE',
        plannedAmount: 3000,
        color: '#EA580C',
        icon: '📚',
        description: 'Textbooks and supplies'
      },
      {
        name: 'Food',
        type: 'EXPENSE',
        plannedAmount: 5000,
        color: '#D97706',
        icon: '🍕',
        description: 'Meals and snacks'
      },
      {
        name: 'Transportation',
        type: 'EXPENSE',
        plannedAmount: 2000,
        color: '#B45309',
        icon: '🚌',
        description: 'Public transport'
      },
      {
        name: 'Entertainment',
        type: 'EXPENSE',
        plannedAmount: 2000,
        color: '#7C2D12',
        icon: '🎮',
        description: 'Social activities'
      },
      {
        name: 'Emergency Fund',
        type: 'EXPENSE',
        plannedAmount: 3000,
        color: '#059669',
        icon: '🚨',
        description: 'Small emergency savings'
      }
    ],
    sampleTransactions: [
      // Income
      { categoryName: 'Part-time Job', description: 'Campus Job Payment', amount: 12000, date: '-1', isPosted: true },
      { categoryName: 'Allowance', description: 'Monthly Allowance', amount: 8000, date: '-1', isPosted: true },
      { categoryName: 'Scholarship', description: 'Academic Scholarship', amount: 10000, date: '-15', isPosted: true },
      
      // Expenses
      { categoryName: 'Tuition', description: 'Semester Fee', amount: -15000, date: '-30', isPosted: true },
      { categoryName: 'Books', description: 'Programming Textbook', amount: -2500, date: '-25', isPosted: true },
      { categoryName: 'Food', description: 'Campus Cafeteria', amount: -300, date: '-1', isPosted: true },
      { categoryName: 'Transportation', description: 'Bus Card Top-up', amount: -500, date: '-3', isPosted: true },
      { categoryName: 'Entertainment', description: 'Movie with Friends', amount: -400, date: '-5', isPosted: true },
      { categoryName: 'Emergency Fund', description: 'Savings Deposit', amount: -3000, date: '-1', isPosted: true },
      
      // Pending
      { categoryName: 'Food', description: 'Weekend Dinner', amount: -800, date: '1', isPosted: false },
      { categoryName: 'Books', description: 'Lab Manual', amount: -500, date: '3', isPosted: false },
    ]
  },

  {
    id: 'family-budget',
    name: 'Family Budget',
    description: 'Comprehensive budget for families with multiple income sources and household expenses.',
    icon: '👨‍👩‍👧‍👦',
    color: '#059669',
    categories: [
      // Income
      {
        name: 'Primary Income',
        type: 'INCOME',
        plannedAmount: 60000,
        color: '#10B981',
        icon: '💼',
        description: 'Main breadwinner salary'
      },
      {
        name: 'Secondary Income',
        type: 'INCOME',
        plannedAmount: 40000,
        color: '#059669',
        icon: '👩‍💼',
        description: 'Spouse employment'
      },
      {
        name: 'Child Benefits',
        type: 'INCOME',
        plannedAmount: 5000,
        color: '#065F46',
        icon: '👶',
        description: 'Government child support'
      },
      // Expenses
      {
        name: 'Mortgage',
        type: 'EXPENSE',
        plannedAmount: 25000,
        color: '#DC2626',
        icon: '🏡',
        description: 'Home loan payment'
      },
      {
        name: 'Groceries',
        type: 'EXPENSE',
        plannedAmount: 15000,
        color: '#EA580C',
        icon: '🛒',
        description: 'Family food shopping'
      },
      {
        name: 'Childcare',
        type: 'EXPENSE',
        plannedAmount: 12000,
        color: '#D97706',
        icon: '👶',
        description: 'Daycare and babysitting'
      },
      {
        name: 'Insurance',
        type: 'EXPENSE',
        plannedAmount: 8000,
        color: '#B45309',
        icon: '🛡️',
        description: 'Health and life insurance'
      },
      {
        name: 'Education',
        type: 'EXPENSE',
        plannedAmount: 10000,
        color: '#7C2D12',
        icon: '🎓',
        description: "Children's education"
      },
      {
        name: 'Family Savings',
        type: 'EXPENSE',
        plannedAmount: 20000,
        color: '#059669',
        icon: '👨‍👩‍👧‍👦',
        description: 'Family emergency fund'
      }
    ],
    sampleTransactions: [
      // Income
      { categoryName: 'Primary Income', description: 'Monthly Salary - Main', amount: 60000, date: '-1', isPosted: true },
      { categoryName: 'Secondary Income', description: 'Monthly Salary - Spouse', amount: 40000, date: '-1', isPosted: true },
      { categoryName: 'Child Benefits', description: 'Government Allowance', amount: 5000, date: '-15', isPosted: true },
      
      // Expenses
      { categoryName: 'Mortgage', description: 'Monthly Home Payment', amount: -25000, date: '-1', isPosted: true },
      { categoryName: 'Groceries', description: 'Weekly Family Shopping', amount: -3500, date: '-2', isPosted: true },
      { categoryName: 'Childcare', description: 'Daycare Monthly Fee', amount: -12000, date: '-1', isPosted: true },
      { categoryName: 'Insurance', description: 'Family Health Insurance', amount: -8000, date: '-1', isPosted: true },
      { categoryName: 'Education', description: 'School Supplies', amount: -2500, date: '-10', isPosted: true },
      { categoryName: 'Family Savings', description: 'Emergency Fund Transfer', amount: -20000, date: '-1', isPosted: true },
      
      // Pending
      { categoryName: 'Groceries', description: 'Weekend Shopping', amount: -2800, date: '1', isPosted: false },
      { categoryName: 'Education', description: 'School Trip Payment', amount: -1500, date: '5', isPosted: false },
    ]
  },

  {
    id: 'business-budget',
    name: 'Small Business Budget',
    description: 'Professional budget template for small businesses with revenue streams and operational expenses.',
    icon: '🏢',
    color: '#F59E0B',
    categories: [
      // Income
      {
        name: 'Product Sales',
        type: 'INCOME',
        plannedAmount: 150000,
        color: '#10B981',
        icon: '📦',
        description: 'Product revenue'
      },
      {
        name: 'Service Revenue',
        type: 'INCOME',
        plannedAmount: 80000,
        color: '#059669',
        icon: '🔧',
        description: 'Service-based income'
      },
      {
        name: 'Consulting',
        type: 'INCOME',
        plannedAmount: 25000,
        color: '#065F46',
        icon: '💡',
        description: 'Consulting fees'
      },
      // Expenses
      {
        name: 'Office Rent',
        type: 'EXPENSE',
        plannedAmount: 25000,
        color: '#DC2626',
        icon: '🏢',
        description: 'Business premises'
      },
      {
        name: 'Staff Salaries',
        type: 'EXPENSE',
        plannedAmount: 120000,
        color: '#EA580C',
        icon: '👥',
        description: 'Employee compensation'
      },
      {
        name: 'Marketing',
        type: 'EXPENSE',
        plannedAmount: 15000,
        color: '#D97706',
        icon: '📢',
        description: 'Advertising and promotion'
      },
      {
        name: 'Utilities',
        type: 'EXPENSE',
        plannedAmount: 5000,
        color: '#B45309',
        icon: '⚡',
        description: 'Office utilities'
      },
      {
        name: 'Equipment',
        type: 'EXPENSE',
        plannedAmount: 10000,
        color: '#7C2D12',
        icon: '💻',
        description: 'Technology and tools'
      },
      {
        name: 'Business Savings',
        type: 'EXPENSE',
        plannedAmount: 20000,
        color: '#059669',
        icon: '🏦',
        description: 'Business emergency fund'
      }
    ],
    sampleTransactions: [
      // Income
      { categoryName: 'Product Sales', description: 'Monthly Product Sales', amount: 150000, date: '-1', isPosted: true },
      { categoryName: 'Service Revenue', description: 'Maintenance Contracts', amount: 80000, date: '-2', isPosted: true },
      { categoryName: 'Consulting', description: 'Strategy Consulting Project', amount: 25000, date: '-5', isPosted: true },
      
      // Expenses
      { categoryName: 'Office Rent', description: 'Monthly Office Lease', amount: -25000, date: '-1', isPosted: true },
      { categoryName: 'Staff Salaries', description: 'Monthly Payroll', amount: -120000, date: '-1', isPosted: true },
      { categoryName: 'Marketing', description: 'Digital Ad Campaign', amount: -8000, date: '-3', isPosted: true },
      { categoryName: 'Utilities', description: 'Office Electricity', amount: -2500, date: '-2', isPosted: true },
      { categoryName: 'Equipment', description: 'New Development Tools', amount: -5000, date: '-10', isPosted: true },
      { categoryName: 'Business Savings', description: 'Monthly Business Savings', amount: -20000, date: '-1', isPosted: true },
      
      // Pending
      { categoryName: 'Consulting', description: 'Pending Project Payment', amount: 15000, date: '3', isPosted: false },
      { categoryName: 'Marketing', description: 'Social Media Ads', amount: -3000, date: '1', isPosted: false },
    ]
  }
];

// Helper function to get template by ID
export const getTemplateById = (id: string): BudgetTemplate | undefined => {
  return BUDGET_TEMPLATES.find(template => template.id === id);
};

// Helper function to calculate relative dates
export const calculateTransactionDate = (relativeDays: string): string => {
  const today = new Date();
  const days = parseInt(relativeDays, 10);
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + days);
  return targetDate.toISOString().split('T')[0];
};