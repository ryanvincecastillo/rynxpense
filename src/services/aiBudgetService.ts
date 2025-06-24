// src/services/aiBudgetService.ts - Fixed with correct Groq models
import { budgetTemplateService } from './budgetTemplateService';
import { budgetAPI, categoryAPI, transactionAPI } from './api';

// Types for AI Budget Creation
export interface AIBudgetRequest {
  userInput: string;
  monthlyIncome?: number;
  currency?: string;
  additionalContext?: {
    occupation?: string;
    location?: string;
    familySize?: number;
    goals?: string[];
  };
}

export interface AIBudgetResponse {
  budget: {
    name: string;
    description: string;
    color: string;
  };
  categories: Array<{
    name: string;
    type: 'INCOME' | 'EXPENSE';
    plannedAmount: number;
    color: string;
    description?: string;
  }>;
  transactions: Array<{
    categoryName: string;
    amount: number;
    description: string;
    date: string;
    isPosted: boolean;
  }>;
  aiAdvice: {
    summary: string;
    tips: string[];
    warnings?: string[];
    recommendations: string[];
  };
  confidence: number;
}

export interface CreateAIBudgetResult {
  budget: any;
  categories: any[];
  transactions: any[];
  aiAdvice: AIBudgetResponse['aiAdvice'];
  confidence: number;
  summary: {
    totalCategories: number;
    totalTransactions: number;
    totalIncome: number;
    totalExpenses: number;
    estimatedSavings: number;
  };
}

class AIBudgetService {
  private readonly groqApiKey: string;
  private readonly groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly enableFallback: boolean;
  
  // Updated model list with working Groq models
  private readonly availableModels = [
    'llama-3.1-8b-instant',      // Primary - Fast and reliable
    'llama-3.2-3b-preview',      // Secondary - Good balance
    'mixtral-8x7b-32768',        // Tertiary - Large context
    'gemma2-9b-it',              // Fallback - Google model
    'llama-3.2-1b-preview'       // Last resort - Fastest
  ];

  constructor() {
    this.groqApiKey = process.env.REACT_APP_GROQ_API_KEY || '';
    this.enableFallback = process.env.NODE_ENV === 'development';
    
    if (!this.groqApiKey) {
      console.warn('⚠️ Groq API key not found. AI features will be disabled.');
      if (this.enableFallback) {
        console.log('🔄 Fallback mode enabled for development.');
      }
    } else {
      console.log('✅ Groq API key loaded successfully.');
      console.log('🤖 Available models:', this.availableModels);
    }
  }

  /**
   * Check if AI features are available
   */
  isAvailable(): boolean {
    return !!this.groqApiKey || this.enableFallback;
  }

  /**
   * Get configuration status for debugging
   */
  getStatus() {
    return {
      hasApiKey: !!this.groqApiKey,
      apiKeyPreview: this.groqApiKey ? this.groqApiKey.substring(0, 10) + '...' : 'Not set',
      fallbackEnabled: this.enableFallback,
      isAvailable: this.isAvailable(),
      environment: process.env.NODE_ENV,
      availableModels: this.availableModels,
      primaryModel: this.availableModels[0]
    };
  }

  /**
   * Test model availability
   */
  async testModels() {
    if (!this.groqApiKey) {
      throw new Error('API key required for model testing');
    }

    console.group('🧪 Testing Groq Models');
    const results = [];

    for (const model of this.availableModels) {
      try {
        console.log(`Testing ${model}...`);
        
        const response = await fetch(this.groqApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'Say SUCCESS' }],
            max_tokens: 10
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${model} - Working`);
          results.push({ model, status: 'working', response: data });
        } else {
          console.log(`❌ ${model} - Error ${response.status}`);
          results.push({ model, status: 'error', error: response.status });
        }
      } catch (error : any) {
        console.log(`❌ ${model} - Failed:`, error);
        results.push({ model, status: 'failed', error: error.message });
      }
    }

    console.groupEnd();
    return results;
  }

  /**
   * Create a budget using AI analysis of user input
   */
  async createAIBudget(request: AIBudgetRequest): Promise<CreateAIBudgetResult> {
    console.log('🤖 Starting AI budget creation...');
    console.log('📊 Service Status:', this.getStatus());
    
    // Check if we should use fallback
    if (!this.groqApiKey && this.enableFallback) {
      console.log('🔄 Using fallback budget creation (no API key in development)');
      return this.createFallbackBudget(request);
    }
    
    if (!this.isAvailable()) {
      throw new Error('AI budget creation is not available. Please add REACT_APP_GROQ_API_KEY to your .env file and restart the server.');
    }

    try {
      console.log('🤖 Starting AI budget analysis...');
      
      // Step 1: Get AI analysis and budget structure
      const aiResponse = await this.analyzeUserInput(request);
      
      console.log('✅ AI analysis completed:', aiResponse);

      // Step 2: Create the budget
      const budgetResponse = await budgetAPI.create(aiResponse.budget);
      
      if (!budgetResponse.data.success) {
        throw new Error(budgetResponse.data.message || 'Failed to create budget');
      }

      const budget = budgetResponse.data.data;
      console.log('✅ Budget created:', budget.name);

      // Step 3: Create categories
      const categories: any[] = [];
      for (const categoryData of aiResponse.categories) {
        try {
          const categoryResponse = await categoryAPI.create({
            budgetId: budget.id,
            name: categoryData.name,
            type: categoryData.type,
            plannedAmount: categoryData.plannedAmount,
            color: categoryData.color,
          });

          if (categoryResponse.data.success) {
            categories.push(categoryResponse.data.data);
            console.log(`✅ Category created: ${categoryData.name}`);
          } else {
            console.warn(`⚠️ Failed to create category: ${categoryData.name}`);
          }
        } catch (error) {
          console.warn(`⚠️ Error creating category: ${categoryData.name}`, error);
        }
      }

      // Step 4: Create sample transactions
      const transactions: any[] = [];
      for (const transactionData of aiResponse.transactions) {
        try {
          // Find the corresponding category
          const category = categories.find(cat => cat.name === transactionData.categoryName);
          if (!category) {
            console.warn(`⚠️ Category not found for transaction: ${transactionData.categoryName}`);
            continue;
          }

          const transactionResponse = await transactionAPI.create({
            budgetId: budget.id,
            categoryId: category.id,
            amount: transactionData.amount,
            description: transactionData.description,
            date: transactionData.date,
            isPosted: transactionData.isPosted,
          });

          if (transactionResponse.data.success) {
            transactions.push(transactionResponse.data.data);
            console.log(`✅ Transaction created: ${transactionData.description}`);
          }
        } catch (error) {
          console.warn(`⚠️ Error creating transaction: ${transactionData.description}`, error);
        }
      }

      // Step 5: Update category actuals
      try {
        await categoryAPI.updateActuals();
      } catch (error) {
        console.warn('⚠️ Failed to update category actuals:', error);
      }

      // Step 6: Calculate summary
      const totalIncome = categories
        .filter(cat => cat.type === 'INCOME')
        .reduce((sum, cat) => sum + cat.plannedAmount, 0);
      
      const totalExpenses = categories
        .filter(cat => cat.type === 'EXPENSE')
        .reduce((sum, cat) => sum + cat.plannedAmount, 0);

      const summary = {
        totalCategories: categories.length,
        totalTransactions: transactions.length,
        totalIncome,
        totalExpenses,
        estimatedSavings: totalIncome - totalExpenses,
      };

      console.log('🎉 AI Budget creation completed successfully!');

      return {
        budget,
        categories,
        transactions,
        confidence: aiResponse.confidence,
        aiAdvice: aiResponse.aiAdvice,
        summary,
      };

    } catch (error: any) {
      console.error('❌ AI Budget creation failed:', error);
      
      // Try fallback if enabled and not an API key issue
      if (this.enableFallback && !error.message.includes('API key')) {
        console.log('🔄 Attempting fallback budget creation...');
        return this.createFallbackBudget(request);
      }
      
      throw new Error(error.message || 'Failed to create AI budget');
    }
  }

  /**
   * Analyze user input using Groq AI with model fallback
   */
  private async analyzeUserInput(request: AIBudgetRequest): Promise<AIBudgetResponse> {
    const prompt = this.buildPrompt(request);
    
    console.log('📡 Trying AI models in order...');

    // Try each model until one works
    for (let i = 0; i < this.availableModels.length; i++) {
      const model = this.availableModels[i];
      
      try {
        console.log(`🔄 Attempting with model: ${model}`);
        
        const response = await fetch(this.groqApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: `You are a professional financial advisor specializing in budget creation for Filipino families. Create comprehensive, realistic budgets based on user input. Always respond with valid JSON only, no additional text. Use Philippine peso amounts and consider local living costs.`,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.3,
            max_tokens: model === 'mixtral-8x7b-32768' ? 8000 : 4000,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.warn(`❌ ${model} failed:`, errorData.error?.message);
          
          // If this is the last model, throw the error
          if (i === this.availableModels.length - 1) {
            throw new Error(`All AI models failed. Last error: ${errorData.error?.message || 'Unknown error'}`);
          }
          
          // Otherwise, try the next model
          continue;
        }

        const data = await response.json();
        const aiContent = data.choices[0]?.message?.content;
        
        if (!aiContent) {
          console.warn(`❌ ${model} returned empty response`);
          continue;
        }

        console.log(`✅ ${model} succeeded!`);

        // Parse the AI response
        try {
          const parsedResponse = JSON.parse(aiContent);
          return this.validateAndNormalizeResponse(parsedResponse);
        } catch (parseError) {
          console.warn(`❌ ${model} returned invalid JSON:`, aiContent.substring(0, 200) + '...');
          
          // If this is the last model, throw the error
          if (i === this.availableModels.length - 1) {
            throw new Error('All AI models returned invalid JSON responses');
          }
          
          // Otherwise, try the next model
          continue;
        }

      } catch (error: any) {
        console.warn(`❌ ${model} request failed:`, error.message);
        
        // If this is the last model, throw the error
        if (i === this.availableModels.length - 1) {
          throw new Error(`All AI models failed. Last error: ${error.message}`);
        }
        
        // Otherwise, try the next model
        continue;
      }
    }

    // This should never be reached, but just in case
    throw new Error('Unexpected error: No AI models were attempted');
  }

  /**
   * Build the prompt for AI analysis
   */
  private buildPrompt(request: AIBudgetRequest): string {
    const { userInput, monthlyIncome, currency = 'PHP', additionalContext } = request;

    return `
Create a comprehensive budget for a Filipino family based on this user input: "${userInput}"

Additional context:
- Monthly Income: ${monthlyIncome ? `${currency} ${monthlyIncome.toLocaleString()}` : 'Not specified'}
- Currency: ${currency}
- Family Size: ${additionalContext?.familySize || 1}
- Location: ${additionalContext?.location || 'Philippines'}
- Goals: ${additionalContext?.goals?.join(', ') || 'General financial management'}

Please create a realistic budget considering Philippine living costs with:
1. Appropriate income and expense categories for Filipino families
2. Realistic peso amounts based on the income level
3. Include emergency fund and savings goals (minimum 3-6 months expenses)
4. Consider local expenses like utilities, transportation, food costs
5. Factor in the user's specific goals and expenses mentioned

Return ONLY valid JSON in this exact format (no additional text):
{
  "budget": {
    "name": "Family Budget 2024",
    "description": "AI-generated budget based on your financial goals",
    "color": "#3B82F6"
  },
  "categories": [
    {
      "name": "Monthly Salary",
      "type": "INCOME",
      "plannedAmount": 50000,
      "color": "#10B981",
      "description": "Primary income source"
    },
    {
      "name": "Food & Groceries",
      "type": "EXPENSE", 
      "plannedAmount": 12000,
      "color": "#F59E0B",
      "description": "Monthly food and grocery expenses"
    }
  ],
  "transactions": [
    {
      "categoryName": "Monthly Salary",
      "amount": 50000,
      "description": "Monthly salary payment",
      "date": "${new Date().toISOString().split('T')[0]}",
      "isPosted": true
    }
  ],
  "aiAdvice": {
    "summary": "This budget follows the 50/30/20 rule adapted for Filipino families",
    "tips": ["Track your expenses daily", "Build emergency fund first"],
    "recommendations": ["Set up automatic savings", "Review budget monthly"]
  },
  "confidence": 0.85
}

Important: Ensure all amounts are realistic for Philippine living standards and the specified income level.`;
  }

  /**
   * Create fallback budget when AI is unavailable
   */
  private async createFallbackBudget(request: AIBudgetRequest): Promise<CreateAIBudgetResult> {
    console.log('🔄 Creating smart fallback budget...');
    
    const { userInput, monthlyIncome = 50000 } = request;
    
    // Create a smart fallback based on income and Philippine standards
    const budgetData = {
      budget: {
        name: `${monthlyIncome >= 100000 ? 'Premium' : monthlyIncome >= 50000 ? 'Standard' : 'Basic'} Budget`,
        description: `Budget created based on ₱${monthlyIncome.toLocaleString()} monthly income`,
        color: '#3B82F6',
      },
      categories: [
        { name: 'Monthly Salary', type: 'INCOME' as const, plannedAmount: monthlyIncome, color: '#10B981' },
        { name: 'Food & Groceries', type: 'EXPENSE' as const, plannedAmount: Math.round(monthlyIncome * 0.25), color: '#F59E0B' },
        { name: 'Transportation', type: 'EXPENSE' as const, plannedAmount: Math.round(monthlyIncome * 0.15), color: '#3B82F6' },
        { name: 'Utilities & Bills', type: 'EXPENSE' as const, plannedAmount: Math.round(monthlyIncome * 0.12), color: '#8B5CF6' },
        { name: 'Emergency Fund', type: 'EXPENSE' as const, plannedAmount: Math.round(monthlyIncome * 0.10), color: '#EF4444' },
        { name: 'Savings & Investment', type: 'EXPENSE' as const, plannedAmount: Math.round(monthlyIncome * 0.15), color: '#10B981' },
        { name: 'Entertainment & Leisure', type: 'EXPENSE' as const, plannedAmount: Math.round(monthlyIncome * 0.08), color: '#F97316' },
        { name: 'Personal Care', type: 'EXPENSE' as const, plannedAmount: Math.round(monthlyIncome * 0.05), color: '#EC4899' },
        { name: 'Miscellaneous', type: 'EXPENSE' as const, plannedAmount: Math.round(monthlyIncome * 0.10), color: '#6B7280' },
      ],
      transactions: [
        { categoryName: 'Monthly Salary', amount: monthlyIncome, description: 'Monthly salary payment', date: new Date().toISOString().split('T')[0], isPosted: true },
        { categoryName: 'Food & Groceries', amount: 2500, description: 'Weekly grocery shopping', date: new Date().toISOString().split('T')[0], isPosted: true },
      ],
      aiAdvice: {
        summary: `This is a balanced budget template based on your ₱${monthlyIncome.toLocaleString()} monthly income, following financial best practices for Filipino families.`,
        tips: [
          'This is a fallback budget - add your Groq API key for AI-powered budgets',
          'Adjust categories based on your actual expenses',
          'Track your spending for the first month to fine-tune amounts',
          'Build emergency fund equivalent to 3-6 months of expenses'
        ],
        recommendations: [
          `Build an emergency fund of ₱${(monthlyIncome * 3).toLocaleString()} (3 months of income)`,
          'Review and adjust budget categories monthly',
          'Set up automatic savings transfers',
          'Consider health insurance and life insurance'
        ]
      },
      confidence: 0.7,
    };

    // Create the budget using the same flow as AI
    try {
      // Step 1: Create the budget
      const budgetResponse = await budgetAPI.create(budgetData.budget);
      
      if (!budgetResponse.data.success) {
        throw new Error(budgetResponse.data.message || 'Failed to create budget');
      }

      const budget = budgetResponse.data.data;
      console.log('✅ Fallback budget created:', budget.name);

      // Step 2: Create categories
      const categories: any[] = [];
      for (const categoryData of budgetData.categories) {
        try {
          const categoryResponse = await categoryAPI.create({
            budgetId: budget.id,
            name: categoryData.name,
            type: categoryData.type,
            plannedAmount: categoryData.plannedAmount,
            color: categoryData.color,
          });

          if (categoryResponse.data.success) {
            categories.push(categoryResponse.data.data);
            console.log(`✅ Category created: ${categoryData.name}`);
          }
        } catch (error) {
          console.warn(`⚠️ Error creating category: ${categoryData.name}`, error);
        }
      }

      // Step 3: Create sample transactions
      const transactions: any[] = [];
      for (const transactionData of budgetData.transactions) {
        try {
          const category = categories.find(cat => cat.name === transactionData.categoryName);
          if (!category) continue;

          const transactionResponse = await transactionAPI.create({
            budgetId: budget.id,
            categoryId: category.id,
            amount: transactionData.amount,
            description: transactionData.description,
            date: transactionData.date,
            isPosted: transactionData.isPosted,
          });

          if (transactionResponse.data.success) {
            transactions.push(transactionResponse.data.data);
          }
        } catch (error) {
          console.warn(`⚠️ Error creating transaction: ${transactionData.description}`, error);
        }
      }

      // Calculate summary
      const totalIncome = categories
        .filter(cat => cat.type === 'INCOME')
        .reduce((sum, cat) => sum + cat.plannedAmount, 0);
      
      const totalExpenses = categories
        .filter(cat => cat.type === 'EXPENSE')
        .reduce((sum, cat) => sum + cat.plannedAmount, 0);

      const summary = {
        totalCategories: categories.length,
        totalTransactions: transactions.length,
        totalIncome,
        totalExpenses,
        estimatedSavings: totalIncome - totalExpenses,
      };

      console.log('🎉 Fallback budget creation completed successfully!');

      return {
        budget,
        categories,
        transactions,
        confidence: budgetData.confidence,
        aiAdvice: budgetData.aiAdvice,
        summary,
      };

    } catch (error: any) {
      console.error('❌ Fallback budget creation failed:', error);
      throw new Error(error.message || 'Failed to create fallback budget');
    }
  }

  /**
   * Validate and normalize AI response
   */
  private validateAndNormalizeResponse(response: any): AIBudgetResponse {
    // Validate required fields
    if (!response.budget || !response.categories || !response.aiAdvice) {
      throw new Error('Invalid AI response structure');
    }

    // Normalize budget
    const budget = {
      name: String(response.budget.name || 'AI Generated Budget'),
      description: String(response.budget.description || 'Budget created by AI assistant'),
      color: this.validateColor(response.budget.color) || '#3B82F6',
    };

    // Normalize categories
    const categories = (response.categories || []).map((cat: any) => ({
      name: String(cat.name || 'Unnamed Category'),
      type: cat.type === 'INCOME' ? 'INCOME' as const : 'EXPENSE' as const,
      plannedAmount: Math.abs(Number(cat.plannedAmount) || 0),
      color: this.validateColor(cat.color) || this.getDefaultCategoryColor(cat.type),
      description: cat.description ? String(cat.description).slice(0, 100) : undefined,
    }));

    // Normalize transactions
    const transactions = (response.transactions || []).map((trans: any) => ({
      categoryName: String(trans.categoryName || ''),
      amount: Math.abs(Number(trans.amount) || 0),
      description: String(trans.description || 'Transaction').slice(0, 100),
      date: this.validateDate(trans.date) || new Date().toISOString().split('T')[0],
      isPosted: Boolean(trans.isPosted),
    }));

    // Normalize AI advice
    const aiAdvice = {
      summary: String(response.aiAdvice.summary || 'Budget created successfully'),
      tips: Array.isArray(response.aiAdvice.tips) ? response.aiAdvice.tips.slice(0, 5) : [],
      warnings: Array.isArray(response.aiAdvice.warnings) ? response.aiAdvice.warnings.slice(0, 3) : [],
      recommendations: Array.isArray(response.aiAdvice.recommendations) ? response.aiAdvice.recommendations.slice(0, 5) : [],
    };

    return {
      budget,
      categories,
      transactions,
      aiAdvice,
      confidence: Math.min(Math.max(Number(response.confidence) || 0.8, 0.1), 1.0),
    };
  }

  private validateColor(color: string): string | null {
    if (typeof color !== 'string') return null;
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexPattern.test(color) ? color : null;
  }

  private getDefaultCategoryColor(type: string): string {
    return type === 'INCOME' ? '#10B981' : '#F59E0B';
  }

  private validateDate(date: string): string | null {
    if (typeof date !== 'string') return null;
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : date;
  }
}

// Export singleton instance
export const aiBudgetService = new AIBudgetService();

// Export for debugging
if (process.env.NODE_ENV === 'development') {
  (window as any).aiBudgetService = aiBudgetService;
  (window as any).debugAI = () => {
    console.log('🔍 AI Service Status:', aiBudgetService.getStatus());
  };
  (window as any).testAIModels = () => {
    return aiBudgetService.testModels();
  };
}