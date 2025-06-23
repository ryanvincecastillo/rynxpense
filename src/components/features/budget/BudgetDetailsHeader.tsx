import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';

// UI Components
import { Badge } from '../../ui';

// Types
import { Budget } from '../../../types';

// Utils
import { cn } from '../../../utils/helpers';

interface BudgetDetailsHeaderProps {
  budget: Budget;
  onEdit: () => void;
  onQuickAction: (action: string, type?: string) => void;
  formatCurrency: (amount: number) => string;
  children?: React.ReactNode;
}

export const BudgetDetailsHeader: React.FC<BudgetDetailsHeaderProps> = ({
  budget,
  onEdit,
  onQuickAction,
  formatCurrency,
  children,
}) => {
  // Helper function to convert hex to rgba (matching BudgetsList)
  const hexToRgba = (hex: string, alpha: number) => {
    // Remove # if present
    const cleanHex = hex.replace('#', '');
    
    // Handle 3-digit hex codes
    let fullHex = cleanHex;
    if (cleanHex.length === 3) {
      fullHex = cleanHex.split('').map(char => char + char).join('');
    }
    
    // Parse RGB values
    const r = parseInt(fullHex.slice(0, 2), 16);
    const g = parseInt(fullHex.slice(2, 4), 16);
    const b = parseInt(fullHex.slice(4, 6), 16);
    
    // Return rgba string
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div 
      className="rounded-lg border transition-all duration-200 mx-4 sm:mx-6 lg:mx-8 mt-6 mb-8 hover:shadow-md"
      style={{
        backgroundColor: budget.color ? hexToRgba(budget.color, 0.15) : hexToRgba('#3B82F6', 0.15),
        borderColor: budget.color ? hexToRgba(budget.color, 0.4) : hexToRgba('#3B82F6', 0.4),
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg border-0 p-6">
          <div className="flex items-center justify-between">
            {/* Left section - Navigation and Budget info */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <Link 
                to="/budgets" 
                className="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                title="Back to Budgets"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Color indicator (matching BudgetsList) */}
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
                  style={{ backgroundColor: budget.color || '#3B82F6' }}
                />
                
                {/* Budget name and description */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                      {budget.name}
                    </h1>
                    {budget.isArchived && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                        Archived
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600 space-y-1 sm:space-y-0">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Created {format(new Date(budget.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {budget.description && (
                      <span className="truncate">{budget.description}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right section - Actions */}
            <div className="flex items-center space-x-3 ml-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};