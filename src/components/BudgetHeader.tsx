import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Download, 
  Share2,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { Badge, Button } from './ui';
import { format } from 'date-fns';
import { Budget } from '../types';

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Navigation */}
      <div className="px-4 lg:px-6 py-3 border-b border-gray-50">
        <Link 
          to="/budgets" 
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Budgets
        </Link>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          {/* Budget Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Color Indicator */}
            <div 
              className="w-10 h-10 rounded-lg border-2 border-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: budget.color }}
            />
            
            {/* Details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight truncate">
                    {budget.name}
                  </h1>
                  
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(budget.createdAt), 'MMM dd, yyyy')}
                    </span>
                    {budget.isArchived && (
                      <Badge variant="secondary" size="sm" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                        Archived
                      </Badge>
                    )}
                  </div>
                  
                  {budget.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {budget.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => onQuickAction('share')}
                className="text-gray-600 hover:text-gray-900"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => onQuickAction('export')}
                className="text-gray-600 hover:text-gray-900"
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button 
                onClick={onEdit}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit3 className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            </div>

            {/* Mobile Actions Menu */}
            <div className="md:hidden">
              {children}
            </div>

            {/* Desktop Actions Menu (if provided) */}
            <div className="hidden md:block">
              {children}
            </div>
          </div>
        </div>

        {/* Mobile Actions Row */}
        <div className="md:hidden mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onQuickAction('share')}
              className="flex-1 justify-center"
            >
              <Share2 className="h-4 w-4 mr-1.5" />
              Share
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onQuickAction('export')}
              className="flex-1 justify-center"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Export
            </Button>

            <Button 
              onClick={onEdit}
              size="sm"
              className="flex-1 justify-center bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit3 className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetHeader;