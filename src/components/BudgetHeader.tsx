// components/BudgetHeader.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar
} from 'lucide-react';
import { Badge } from './ui';
import { format } from 'date-fns';
import { Budget } from '../types';
import { Button } from './ui';



interface BudgetHeaderProps {
  budget: Budget;
  onEdit: () => void;
  onQuickAction: (action: string, type?: string) => void;
  formatCurrency: (amount: number) => string;
  children?: React.ReactNode;
}

const BudgetHeader: React.FC<BudgetHeaderProps> = ({
  budget,
  onEdit,
  onQuickAction,
  formatCurrency,
  children,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link to="/budgets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Budgets
          </Button>
        </Link>
        <div className="flex items-center space-x-3">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: budget.color }}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{budget.name}</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Created {format(new Date(budget.createdAt), 'MMM dd, yyyy')}</span>
              {budget.isArchived && (
                <Badge variant="secondary" size="sm">Archived</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Quick Action Buttons */}
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => onQuickAction('addTransaction', 'INCOME')}
          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Add Income
        </Button>
        
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => onQuickAction('addTransaction', 'EXPENSE')}
          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
        >
          <TrendingDown className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
        
        <Button variant="secondary" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        {/* Actions Dropdown - passed as children */}
        {children}
        
        <Button onClick={onEdit}>
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Budget
        </Button>
      </div>
    </div>
  );
};

export default BudgetHeader;