// src/services/aiBudgetService.ts
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

  constructor() {
    this.groqApiKey = process.env.REACT_APP_GROQ_API_KEY || '';
    if (!this.groqApiKey) {
      console.warn('⚠️ Groq API key not found. AI features will be disabled.');
    }
  }

  /**
   * Check if AI features are available
   */
  isAvailable(): boolean {
    return !!this.groqApiKey;
  }

  /**
   * Create a budget using AI analysis of user input
   */
  async createAIBudget(request: AIBudgetRequest): Promise<CreateAIBudgetResult> {
    if (!this.isAvailable()) {
      throw new Error('AI budget creation is not available. Please check your API configuration.');
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
      throw new Error(error.message || 'Failed to create AI budget');
    }
  }

  /**
   * Analyze user input using Groq AI
   */
  private async analyzeUserInput(request: AIBudgetRequest): Promise<AIBudgetResponse> {
    const prompt = this.buildPrompt(request);

    try {
      const response = await fetch(this.groqApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a professional financial advisor specializing in budget creation. Create comprehensive, realistic budgets based on user input. Always respond with valid JSON only, no additional text.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Groq API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const aiContent = data.choices[0]?.message?.content;
      
      if (!aiContent) {
        throw new Error('No response from AI');
      }

      // Parse the AI response
      try {
        const parsedResponse = JSON.parse(aiContent);
        return this.validateAndNormalizeResponse(parsedResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', aiContent);
        throw new Error('Invalid AI response format');
      }

    } catch (error: any) {
      console.error('Groq AI request failed:', error);
      
      // Fallback to template-based budget if AI fails
      if (error.message.includes('API') || error.message.includes('fetch')) {
        console.log('🔄 Falling back to template-based budget creation...');
        return this.createFallbackBudget(request);
      }
      
      throw error;
    }
  }

  /**
   * Build the prompt for AI analysis
   */
  private buildPrompt(request: AIBudgetRequest): string {
    const { userInput, monthlyIncome, currency = 'PHP', additionalContext } = request;

    return `
Create a comprehensive budget based on this user input: "${userInput}"

Additional context:
- Monthly Income: ${monthlyIncome ? `${currency} ${monthlyIncome.toLocaleString()}` : 'Not specified'}
- Currency: ${currency}
- Occupation: ${additionalContext?.occupation || 'Not specified'}
- Location: ${additionalContext?.location || 'Not specified'}
- Family Size: ${additionalContext?.familySize || 'Not specified'}
- Goals: ${additionalContext?.goals?.join(', ') || 'Not specified'}

Create a realistic budget with the following structure (respond with ONLY valid JSON):

{
  "budget": {
    "name": "Budget name (max 50 chars)",
    "description": "Brief description (max 200 chars)",
    "color": "#HEX_COLOR (use colors like #3B82F6, #10B981, #F59E0B, #EF4444)"
  },
  "categories": [
    {
      "name": "Category name",
      "type": "INCOME" or "EXPENSE",
      "plannedAmount": number,
      "color": "#HEX_COLOR",
      "description": "Optional description"
    }
  ],
  "transactions": [
    {
      "categoryName": "Must match category name exactly",
      "amount": number,
      "description": "Transaction description",
      "date": "YYYY-MM-DD (current month)",
      "isPosted": true or false
    }
  ],
  "aiAdvice": {
    "summary": "Brief budget overview",
    "tips": ["Practical tip 1", "Practical tip 2", "Practical tip 3"],
    "warnings": ["Warning if needed"],
    "recommendations": ["Specific recommendation 1", "Specific recommendation 2"]
  },
  "confidence": 0.85
}

Rules:
1. Create 6-12 realistic categories based on user needs
2. Include both income and expense categories
3. Amounts should be in ${currency} and realistic for the context
4. Include 3-8 sample transactions per category
5. Use Philippine peso amounts if PHP currency
6. Make transactions realistic and varied
7. Confidence should be 0.7-0.95 based on input clarity
8. Colors should be distinct and professional
9. All JSON must be valid with no syntax errors
    `;
  }

  /**
   * Validate and normalize the AI response
   */
  private validateAndNormalizeResponse(response: any): AIBudgetResponse {
    // Validate required structure
    if (!response.budget || !response.categories || !response.transactions || !response.aiAdvice) {
      throw new Error('Invalid AI response structure');
    }

    // Normalize budget data
    const budget = {
      name: String(response.budget.name || 'AI Generated Budget').slice(0, 50),
      description: String(response.budget.description || 'Budget created with AI assistance').slice(0, 200),
      color: this.validateColor(response.budget.color) || '#3B82F6',
    };

    // Normalize categories
    const categories = (response.categories || []).map((cat: any, index: number) => ({
      name: String(cat.name || `Category ${index + 1}`).slice(0, 30),
      type: ['INCOME', 'EXPENSE'].includes(cat.type) ? cat.type : 'EXPENSE',
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

  /**
   * Create fallback budget when AI is unavailable
   */
  private createFallbackBudget(request: AIBudgetRequest): AIBudgetResponse {
    const { userInput, monthlyIncome = 50000 } = request;
    
    return {
      budget: {
        name: 'Personal Budget',
        description: 'Budget created based on your requirements',
        color: '#3B82F6',
      },
      categories: [
        { name: 'Monthly Salary', type: 'INCOME' as const, plannedAmount: monthlyIncome, color: '#10B981' },
        { name: 'Food & Groceries', type: 'EXPENSE' as const, plannedAmount: monthlyIncome * 0.25, color: '#F59E0B' },
        { name: 'Transportation', type: 'EXPENSE' as const, plannedAmount: monthlyIncome * 0.15, color: '#3B82F6' },
        { name: 'Utilities', type: 'EXPENSE' as const, plannedAmount: monthlyIncome * 0.10, color: '#8B5CF6' },
        { name: 'Savings', type: 'EXPENSE' as const, plannedAmount: monthlyIncome * 0.20, color: '#10B981' },
        { name: 'Entertainment', type: 'EXPENSE' as const, plannedAmount: monthlyIncome * 0.10, color: '#F97316' },
      ],
      transactions: [
        { categoryName: 'Monthly Salary', amount: monthlyIncome, description: 'Monthly salary', date: new Date().toISOString().split('T')[0], isPosted: true },
        { categoryName: 'Food & Groceries', amount: 1500, description: 'Grocery shopping', date: new Date().toISOString().split('T')[0], isPosted: true },
      ],
      aiAdvice: {
        summary: 'A basic budget template has been created based on general financial guidelines.',
        tips: ['Track your expenses regularly', 'Prioritize emergency savings', 'Review and adjust monthly'],
        recommendations: ['Consider using AI features when available for personalized advice'],
      },
      confidence: 0.6,
    };
  }

  /**
   * Validate hex color
   */
  private validateColor(color: string): string | null {
    if (typeof color === 'string' && /^#[0-9A-F]{6}$/i.test(color)) {
      return color;
    }
    return null;
  }

  /**
   * Get default color for category type
   */
  private getDefaultCategoryColor(type: string): string {
    return type === 'INCOME' ? '#10B981' : '#EF4444';
  }

  /**
   * Validate date string
   */
  private validateDate(date: string): string | null {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (typeof date === 'string' && dateRegex.test(date)) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return date;
      }
    }
    return null;
  }
}

// Export singleton instance
export const aiBudgetService = new AIBudgetService();