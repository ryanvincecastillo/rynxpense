// components/BudgetHeader.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Download, 
  Calendar,
  MoreHorizontal,
  Plus,
  Share,
  Settings,
  Minus,
  Share2,
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
  const [showMobileActions, setShowMobileActions] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Enhanced Back Button */}
      <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
        <Link to="/budgets" className="inline-flex group">
          <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/80 hover:bg-white border border-gray-200/80 hover:border-gray-300 transition-all duration-300 hover:shadow-sm">
            <ArrowLeft className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              Back to Budgets
            </span>
          </div>
        </Link>
      </div>

      {/* Main Header Content */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col space-y-4">
          {/* Budget Info Section */}
          <div className="flex items-start space-x-4">
            {/* Budget Color Indicator */}
            <div className="relative flex-shrink-0">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-sm border-2 border-white"
                style={{ backgroundColor: budget.color }}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            </div>

            {/* Budget Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight break-words">
                    {budget.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className="font-medium">
                        {budget.description || 'No description provided'}
                      </span>
                      <Calendar className="h-4 w-4" />
                      <span>Created {format(new Date(budget.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    {budget.isArchived && (
                      <Badge variant="secondary" size="sm" className="bg-yellow-100 text-yellow-500">
                        Archived
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center space-x-2 flex-shrink-0">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-gray-50 hover:bg-gray-100 border-gray-200"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-gray-50 hover:bg-gray-100 border-gray-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  {children}
                  <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Budget
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="space-y-3">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <Button 
                onClick={() => onQuickAction('addTransaction', 'INCOME')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 h-12 sm:h-10"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="font-medium">Record Income</span>
              </Button>
              
              <Button 
                onClick={() => onQuickAction('addTransaction', 'EXPENSE')}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 h-12 sm:h-10"
              >
                <Minus className="h-4 w-4 mr-2" />
                <span className="font-medium">Record Expense</span>
              </Button>

              {/* Mobile: Show condensed actions */}
              <Button 
                onClick={onEdit}
                variant="secondary"
                className="lg:hidden bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 h-12 sm:h-10"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                <span className="font-medium">Edit</span>
              </Button>

              <Button 
                variant="secondary"
                onClick={() => setShowMobileActions(!showMobileActions)}
                className="lg:hidden bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 h-12 sm:h-10"
              >
                <MoreHorizontal className="h-4 w-4 mr-2" />
                <span className="font-medium">More</span>
              </Button>

              {/* Desktop: Show additional quick actions */}
              <Button 
                variant="secondary"
                className="hidden sm:flex lg:flex bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 h-10"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="font-medium">Quick Add</span>
              </Button>

              <Button 
                variant="secondary"
                className="hidden sm:flex lg:flex bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 h-10"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span className="font-medium">Settings</span>
              </Button>
            </div>

            {/* Mobile Expandable Actions */}
            {showMobileActions && (
              <div className="lg:hidden bg-gray-50 rounded-xl p-4 border border-gray-200 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white hover:bg-gray-50 justify-start"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share Budget
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white hover:bg-gray-50 justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white hover:bg-gray-50 justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Quick Add
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white hover:bg-gray-50 justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
                {/* Mobile Actions Menu */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {children}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetHeader;