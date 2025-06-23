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
  templateId?: string;
  applyTemplate: boolean;
}

// src/data/budgetTemplates.ts
export const BUDGET_TEMPLATES: BudgetTemplate[] = [
  {
    id: 'personal-monthly',
    name: 'Personal Monthly Budget',
    description: 'Complete personal budget with salary, utilities, and essential expenses',
    icon: '👤',
    color: '#3B82F6',
    categories: [
      // Income Categories
      {
        name: 'Salary',
        type: 'INCOME',
        plannedAmount: 50000,
        color: '#10B981',
        icon: '💰',
        description: 'Primary income from employment'
      },
      {
        name: 'Freelance',
        type: 'INCOME',
        plannedAmount: 15000,
        color: '#059669',
        icon: '💻',
        description: 'Additional income from freelance work'
      },
      {
        name: 'Investments',
        type: 'INCOME',
        plannedAmount: 5000,
        color: '#065F46',
        icon: '📈',
        description: 'Dividends and investment returns'
      },
      // Essential Expenses
      {
        name: 'Rent/Mortgage',
        type: 'EXPENSE',
        plannedAmount: 20000,
        color: '#DC2626',
        icon: '🏠',
        description: 'Monthly housing payment'
      },
      {
        name: 'Utilities',
        type: 'EXPENSE',
        plannedAmount: 3500,
        color: '#EA580C',
        icon: '⚡',
        description: 'Electricity, water, internet'
      },
      {
        name: 'Groceries',
        type: 'EXPENSE',
        plannedAmount: 8000,
        color: '#D97706',
        icon: '🛒',
        description: 'Food and household items'
      },
      {
        name: 'Transportation',
        type: 'EXPENSE',
        plannedAmount: 4000,
        color: '#7C2D12',
        icon: '🚗',
        description: 'Gas, public transport, maintenance'
      },
      // Lifestyle Expenses
      {
        name: 'Dining Out',
        type: 'EXPENSE',
        plannedAmount: 5000,
        color: '#BE185D',
        icon: '🍽️',
        description: 'Restaurants and food delivery'
      },
      {
        name: 'Entertainment',
        type: 'EXPENSE',
        plannedAmount: 3000,
        color: '#9333EA',
        icon: '🎬',
        description: 'Movies, games, subscriptions'
      },
      {
        name: 'Healthcare',
        type: 'EXPENSE',
        plannedAmount: 2500,
        color: '#DB2777',
        icon: '🏥',
        description: 'Medical expenses and insurance'
      },
      // Savings & Investments
      {
        name: 'Emergency Fund',
        type: 'EXPENSE',
        plannedAmount: 5000,
        color: '#059669',
        icon: '🛡️',
        description: 'Emergency savings fund'
      },
      {
        name: 'Investments',
        type: 'EXPENSE',
        plannedAmount: 7000,
        color: '#0D9488',
        icon: '📊',
        description: 'Stocks, bonds, retirement fund'
      }
    ],
    sampleTransactions: [
      // Income
      { categoryName: 'Salary', description: 'Monthly Salary Payment', amount: 50000, date: '-1', isPosted: true },
      { categoryName: 'Freelance', description: 'Website Development Project', amount: 8000, date: '-3', isPosted: true },
      { categoryName: 'Investments', description: 'Dividend Payment - REIT', amount: 2500, date: '-5', isPosted: true },
      
      // Essential Expenses
      { categoryName: 'Rent/Mortgage', description: 'Monthly Rent Payment', amount: -20000, date: '-1', isPosted: true },
      { categoryName: 'Utilities', description: 'Electricity Bill - Meralco', amount: -2800, date: '-2', isPosted: true },
      { categoryName: 'Utilities', description: 'Internet Bill - PLDT', amount: -1299, date: '-3', isPosted: true },
      { categoryName: 'Groceries', description: 'SM Supermarket', amount: -3200, date: '-1', isPosted: true },
      { categoryName: 'Groceries', description: 'Puregold - Weekly Shopping', amount: -2100, date: '-4', isPosted: true },
      { categoryName: 'Transportation', description: 'Gas Fill-up', amount: -2500, date: '-2', isPosted: true },
      { categoryName: 'Transportation', description: 'Grab - Airport Trip', amount: -450, date: '-6', isPosted: true },
      
      // Lifestyle
      { categoryName: 'Dining Out', description: 'Dinner at Greenbelt', amount: -1800, date: '-1', isPosted: true },
      { categoryName: 'Dining Out', description: 'Lunch Meeting', amount: -650, date: '-3', isPosted: true },
      { categoryName: 'Entertainment', description: 'Netflix Subscription', amount: -549, date: '-5', isPosted: true },
      { categoryName: 'Entertainment', description: 'Movie Night - Ayala Cinema', amount: -800, date: '-7', isPosted: true },
      { categoryName: 'Healthcare', description: 'Doctor Visit - Check-up', amount: -1500, date: '-10', isPosted: true },
      
      // Savings
      { categoryName: 'Emergency Fund', description: 'Monthly Emergency Savings', amount: -5000, date: '-1', isPosted: true },
      { categoryName: 'Investments', description: 'COL Financial - Monthly Investment', amount: -7000, date: '-1', isPosted: true },
      
      // Pending Transactions
      { categoryName: 'Groceries', description: 'Weekend Shopping', amount: -2500, date: '0', isPosted: false },
      { categoryName: 'Transportation', description: 'Car Maintenance', amount: -3000, date: '2', isPosted: false },
      { categoryName: 'Freelance', description: 'Mobile App Project - Pending', amount: 12000, date: '5', isPosted: false },
    ]
  },
  {
    id: 'student-budget',
    name: 'Student Budget',
    description: 'Budget template for students with allowance and school expenses',
    icon: '🎓',
    color: '#8B5CF6',
    categories: [
      // Income
      {
        name: 'Allowance',
        type: 'INCOME',
        plannedAmount: 15000,
        color: '#10B981',
        icon: '💵',
        description: 'Monthly allowance from parents'
      },
      {
        name: 'Part-time Job',
        type: 'INCOME',
        plannedAmount: 8000,
        color: '#059669',
        icon: '👨‍💼',
        description: 'Income from part-time work'
      },
      {
        name: 'Scholarship',
        type: 'INCOME',
        plannedAmount: 5000,
        color: '#065F46',
        icon: '🏆',
        description: 'Scholarship grants'
      },
      // Expenses
      {
        name: 'Tuition & Fees',
        type: 'EXPENSE',
        plannedAmount: 12000,
        color: '#DC2626',
        icon: '📚',
        description: 'School tuition and fees'
      },
      {
        name: 'Books & Supplies',
        type: 'EXPENSE',
        plannedAmount: 2500,
        color: '#EA580C',
        icon: '📖',
        description: 'Textbooks and school supplies'
      },
      {
        name: 'Food',
        type: 'EXPENSE',
        plannedAmount: 6000,
        color: '#D97706',
        icon: '🍕',
        description: 'Meals and snacks'
      },
      {
        name: 'Transportation',
        type: 'EXPENSE',
        plannedAmount: 2000,
        color: '#7C2D12',
        icon: '🚌',
        description: 'Commute to school'
      },
      {
        name: 'Entertainment',
        type: 'EXPENSE',
        plannedAmount: 3000,
        color: '#9333EA',
        icon: '🎮',
        description: 'Movies, games, social activities'
      },
      {
        name: 'Personal Care',
        type: 'EXPENSE',
        plannedAmount: 1500,
        color: '#BE185D',
        icon: '🧴',
        description: 'Toiletries and personal items'
      },
      {
        name: 'Savings',
        type: 'EXPENSE',
        plannedAmount: 2000,
        color: '#059669',
        icon: '🐷',
        description: 'Emergency fund and future expenses'
      }
    ],
    sampleTransactions: [
      // Income
      { categoryName: 'Allowance', description: 'Weekly Allowance', amount: 3750, date: '-1', isPosted: true },
      { categoryName: 'Part-time Job', description: 'Coffee Shop - Weekly Pay', amount: 2000, date: '-2', isPosted: true },
      { categoryName: 'Scholarship', description: 'Academic Scholarship', amount: 5000, date: '-30', isPosted: true },
      
      // Expenses
      { categoryName: 'Tuition & Fees', description: 'Monthly Tuition Payment', amount: -12000, date: '-1', isPosted: true },
      { categoryName: 'Books & Supplies', description: 'Programming Textbook', amount: -1200, date: '-5', isPosted: true },
      { categoryName: 'Books & Supplies', description: 'Notebooks and Pens', amount: -350, date: '-10', isPosted: true },
      { categoryName: 'Food', description: 'Cafeteria Lunch', amount: -150, date: '-1', isPosted: true },
      { categoryName: 'Food', description: 'Coffee and Snacks', amount: -80, date: '-1', isPosted: true },
      { categoryName: 'Transportation', description: 'Jeepney Fare - Week', amount: -350, date: '-1', isPosted: true },
      { categoryName: 'Entertainment', description: 'Movie with Friends', amount: -300, date: '-3', isPosted: true },
      { categoryName: 'Personal Care', description: 'Shampoo and Soap', amount: -250, date: '-7', isPosted: true },
      { categoryName: 'Savings', description: 'Monthly Savings', amount: -2000, date: '-1', isPosted: true },
      
      // Pending
      { categoryName: 'Food', description: 'Grocery Shopping', amount: -800, date: '0', isPosted: false },
      { categoryName: 'Entertainment', description: 'Concert Ticket', amount: -1500, date: '3', isPosted: false },
    ]
  },
  {
    id: 'family-budget',
    name: 'Family Budget',
    description: 'Comprehensive family budget with multiple income sources and family expenses',
    icon: '👨‍👩‍👧‍👦',
    color: '#F59E0B',
    categories: [
      // Income
      {
        name: 'Primary Income',
        type: 'INCOME',
        plannedAmount: 80000,
        color: '#10B981',
        icon: '💼',
        description: 'Main breadwinner salary'
      },
      {
        name: 'Secondary Income',
        type: 'INCOME',
        plannedAmount: 45000,
        color: '#059669',
        icon: '👩‍💼',
        description: 'Partner/spouse income'
      },
      {
        name: 'Side Business',
        type: 'INCOME',
        plannedAmount: 20000,
        color: '#065F46',
        icon: '🏪',
        description: 'Family business or side hustle'
      },
      // Housing & Utilities
      {
        name: 'Mortgage/Rent',
        type: 'EXPENSE',
        plannedAmount: 35000,
        color: '#DC2626',
        icon: '🏠',
        description: 'Monthly housing payment'
      },
      {
        name: 'Utilities',
        type: 'EXPENSE',
        plannedAmount: 5500,
        color: '#EA580C',
        icon: '⚡',
        description: 'Electricity, water, gas, internet'
      },
      // Family Expenses
      {
        name: 'Groceries',
        type: 'EXPENSE',
        plannedAmount: 15000,
        color: '#D97706',
        icon: '🛒',
        description: 'Family food and household items'
      },
      {
        name: 'Children Education',
        type: 'EXPENSE',
        plannedAmount: 25000,
        color: '#7C2D12',
        icon: '🎒',
        description: 'School fees, supplies, activities'
      },
      {
        name: 'Healthcare',
        type: 'EXPENSE',
        plannedAmount: 8000,
        color: '#BE185D',
        icon: '🏥',
        description: 'Family medical expenses'
      },
      {
        name: 'Transportation',
        type: 'EXPENSE',
        plannedAmount: 8000,
        color: '#7C2D12',
        icon: '🚗',
        description: 'Family vehicles and transport'
      },
      // Lifestyle
      {
        name: 'Family Activities',
        type: 'EXPENSE',
        plannedAmount: 10000,
        color: '#9333EA',
        icon: '🎡',
        description: 'Family outings and entertainment'
      },
      {
        name: 'Personal Care',
        type: 'EXPENSE',
        plannedAmount: 4000,
        color: '#DB2777',
        icon: '💅',
        description: 'Haircuts, personal items'
      },
      // Savings & Investments
      {
        name: 'Emergency Fund',
        type: 'EXPENSE',
        plannedAmount: 15000,
        color: '#059669',
        icon: '🛡️',
        description: 'Family emergency savings'
      },
      {
        name: 'Children Future',
        type: 'EXPENSE',
        plannedAmount: 12000,
        color: '#0D9488',
        icon: '🎓',
        description: 'College fund for children'
      },
      {
        name: 'Retirement',
        type: 'EXPENSE',
        plannedAmount: 18000,
        color: '#065F46',
        icon: '🏖️',
        description: 'Retirement savings'
      }
    ],
    sampleTransactions: [
      // Income
      { categoryName: 'Primary Income', description: 'Salary - Main Job', amount: 80000, date: '-1', isPosted: true },
      { categoryName: 'Secondary Income', description: 'Spouse Salary', amount: 45000, date: '-1', isPosted: true },
      { categoryName: 'Side Business', description: 'Online Store Sales', amount: 12000, date: '-3', isPosted: true },
      
      // Housing
      { categoryName: 'Mortgage/Rent', description: 'Monthly Mortgage Payment', amount: -35000, date: '-1', isPosted: true },
      { categoryName: 'Utilities', description: 'Electricity Bill', amount: -3200, date: '-2', isPosted: true },
      { categoryName: 'Utilities', description: 'Water Bill', amount: -800, date: '-3', isPosted: true },
      
      // Family Expenses
      { categoryName: 'Groceries', description: 'Weekly Grocery Shopping', amount: -4500, date: '-1', isPosted: true },
      { categoryName: 'Children Education', description: 'School Tuition - 2 Kids', amount: -20000, date: '-1', isPosted: true },
      { categoryName: 'Children Education', description: 'School Supplies', amount: -2200, date: '-5', isPosted: true },
      { categoryName: 'Healthcare', description: 'Family Doctor Visit', amount: -2500, date: '-7', isPosted: true },
      { categoryName: 'Transportation', description: 'Gas and Car Maintenance', amount: -3500, date: '-2', isPosted: true },
      
      // Lifestyle
      { categoryName: 'Family Activities', description: 'Weekend at the Park', amount: -1200, date: '-2', isPosted: true },
      { categoryName: 'Family Activities', description: 'Movie Night for 4', amount: -1600, date: '-5', isPosted: true },
      { categoryName: 'Personal Care', description: 'Family Haircuts', amount: -1500, date: '-10', isPosted: true },
      
      // Savings
      { categoryName: 'Emergency Fund', description: 'Monthly Emergency Savings', amount: -15000, date: '-1', isPosted: true },
      { categoryName: 'Children Future', description: 'College Fund Contribution', amount: -12000, date: '-1', isPosted: true },
      { categoryName: 'Retirement', description: 'Retirement Fund Contribution', amount: -18000, date: '-1', isPosted: true },
      
      // Pending
      { categoryName: 'Groceries', description: 'Mid-week Grocery Run', amount: -2500, date: '0', isPosted: false },
      { categoryName: 'Side Business', description: 'Pending Order Payment', amount: 8000, date: '2', isPosted: false },
    ]
  },
  {
    id: 'business-budget',
    name: 'Small Business Budget',
    description: 'Monthly budget for small business operations and expenses',
    icon: '🏢',
    color: '#059669',
    categories: [
      // Income
      {
        name: 'Product Sales',
        type: 'INCOME',
        plannedAmount: 150000,
        color: '#10B981',
        icon: '💰',
        description: 'Revenue from product sales'
      },
      {
        name: 'Service Revenue',
        type: 'INCOME',
        plannedAmount: 80000,
        color: '#059669',
        icon: '🔧',
        description: 'Income from services'
      },
      {
        name: 'Consulting',
        type: 'INCOME',
        plannedAmount: 40000,
        color: '#065F46',
        icon: '💡',
        description: 'Consulting and advisory fees'
      },
      // Operating Expenses
      {
        name: 'Office Rent',
        type: 'EXPENSE',
        plannedAmount: 25000,
        color: '#DC2626',
        icon: '🏢',
        description: 'Monthly office lease'
      },
      {
        name: 'Utilities',
        type: 'EXPENSE',
        plannedAmount: 4000,
        color: '#EA580C',
        icon: '⚡',
        description: 'Electricity, internet, phone'
      },
      {
        name: 'Staff Salaries',
        type: 'EXPENSE',
        plannedAmount: 120000,
        color: '#7C2D12',
        icon: '👥',
        description: 'Employee compensation'
      },
      {
        name: 'Marketing',
        type: 'EXPENSE',
        plannedAmount: 15000,
        color: '#9333EA',
        icon: '📢',
        description: 'Advertising and promotion'
      },
      {
        name: 'Supplies',
        type: 'EXPENSE',
        plannedAmount: 8000,
        color: '#D97706',
        icon: '📦',
        description: 'Office and operational supplies'
      },
      {
        name: 'Equipment',
        type: 'EXPENSE',
        plannedAmount: 10000,
        color: '#BE185D',
        icon: '💻',
        description: 'Equipment and technology'
      },
      {
        name: 'Professional Services',
        type: 'EXPENSE',
        plannedAmount: 12000,
        color: '#DB2777',
        icon: '⚖️',
        description: 'Legal, accounting, consulting'
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
      { categoryName: 'Utilities', description: 'Office Electricity', amount: -2500, date: '-2', isPosted: true },
      { categoryName: 'Staff Salaries', description: 'Monthly Payroll', amount: -120000, date: '-1', isPosted: true },
      { categoryName: 'Marketing', description: 'Facebook Ads Campaign', amount: -5000, date: '-3', isPosted: true },
      { categoryName: 'Marketing', description: 'Google Ads', amount: -3500, date: '-5', isPosted: true },
      { categoryName: 'Supplies', description: 'Office Supplies', amount: -2800, date: '-7', isPosted: true },
      { categoryName: 'Equipment', description: 'New Laptop for Staff', amount: -45000, date: '-10', isPosted: true },
      { categoryName: 'Professional Services', description: 'Monthly Accounting Fee', amount: -8000, date: '-1', isPosted: true },
      { categoryName: 'Business Savings', description: 'Monthly Business Savings', amount: -20000, date: '-1', isPosted: true },
      
      // Pending
      { categoryName: 'Consulting', description: 'Pending Project Payment', amount: 15000, date: '3', isPosted: false },
      { categoryName: 'Supplies', description: 'Order Processing', amount: -1500, date: '1', isPosted: false },
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