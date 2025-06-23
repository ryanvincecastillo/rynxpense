import React, { useState, useCallback, memo,  } from 'react';
import { 
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// UI Components - using only what exists in your project
import { 
  Card, 
  Badge
} from '../../ui';

// Feature Components
import { BudgetActionsMenu } from './BudgetActionsMenu';

// Types
import { Budget } from '../../../types';

// Utils
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../../utils/helpers';

interface BudgetsListProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDuplicate: (budget: Budget) => void;
  onArchive: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  formatCurrency: (amount: number) => string;
  viewMode: 'grid' | 'list';
  className?: string;
}

export const BudgetsList: React.FC<BudgetsListProps> = memo(({
  budget,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  formatCurrency,
  viewMode,
  className,
}) => {
  // State for actions menu - use budget ID to track which menu is open
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const isActionsMenuOpen = openMenuId === budget.id;

  // Handlers that close the dropdown after action
  const handleEdit = useCallback(() => {
    onEdit(budget);
  }, [budget, onEdit]);

  const handleDuplicate = useCallback(() => {
    onDuplicate(budget);
  }, [budget, onDuplicate]);

  const handleArchive = useCallback(() => {
    onArchive(budget);
  }, [budget, onArchive]);

  const handleDelete = useCallback(() => {
    onDelete(budget);
  }, [budget, onDelete]);

  // Handle action menu toggle
  const handleToggleActionsMenu = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpenMenuId(prev => prev === budget.id ? null : budget.id);
  }, [budget.id]);

  // Handle action menu actions
  const handleMenuAction = useCallback((action: string) => {
    switch (action) {
      case 'edit':
        handleEdit();
        break;
      case 'duplicate':
        handleDuplicate();
        break;
      case 'archive':
        handleArchive();
        break;
      case 'delete':
        handleDelete();
        break;
      default:
        console.warn('Unknown action:', action);
    }
    setOpenMenuId(null); // Close the menu
  }, [handleEdit, handleDuplicate, handleArchive, handleDelete]);

  // Calculate totals from budget summary
  const totalBudget = budget.summary?.totalPlannedIncome || 0;
  const totalSpent = budget.summary?.totalActualExpenses || 0;
  const remaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Determine status color
  const getStatusColor = () => {
    if (spentPercentage >= 100) return 'text-red-600';
    if (spentPercentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Helper function to convert hex to rgba - improved version
  const hexToRgba = useCallback((hex: string, alpha: number) => {
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
  }, []);

  // List View - Horizontal row layout
  if (viewMode === 'list') {
    return (
      <Link to={`/budgets/${budget.id}`} className="block">
        <div
          className="rounded-lg border transition-all duration-200 hover:shadow-md"
          style={{
            backgroundColor: hexToRgba(budget.color, 0.15),
            borderColor: hexToRgba(budget.color, 0.4),
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.backgroundColor = hexToRgba(budget.color, 0.2);
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.backgroundColor = hexToRgba(budget.color, 0.15);
          }}
        >
          <Card 
            className={cn(
              'p-4 hover:shadow-md transition-all duration-200 cursor-pointer group border-0 bg-transparent',
              className
            )}
          >
            <div className="flex items-center justify-between">
              {/* Left section - Budget info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Color indicator */}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
                  style={{ backgroundColor: budget.color }}
                />
                
                {/* Budget name and description */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {budget.name}
                    </h3>
                    {budget.isArchived && (
                      <Badge variant="secondary" className="text-xs">
                        Archived
                      </Badge>
                    )}
                  </div>
                  {budget.description && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {budget.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Middle section - Financial info */}
              <div className="hidden sm:flex items-center gap-6 mx-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(totalBudget)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Spent</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Remaining</p>
                  <p className={cn('font-semibold', getStatusColor())}>
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="hidden md:flex items-center gap-3 mx-4">
                <div className="w-20">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(spentPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200/60 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        spentPercentage >= 100 ? 'bg-red-500' :
                        spentPercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                      )}
                      style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right section - Meta info and actions */}
              <div className="flex items-center gap-4">
                {/* Categories count */}
                <div className="hidden lg:block text-center">
                  <p className="text-xs text-gray-500">Categories</p>
                  <p className="font-semibold text-gray-900">
                    {budget._count?.categories || 0}
                  </p>
                </div>

                {/* Created date */}
                <div className="hidden xl:block text-xs text-gray-500">
                  {budget.createdAt ? 
                    formatDistanceToNow(new Date(budget.createdAt), { addSuffix: true }) : 
                    'No date'
                  }
                </div>

                {/* Actions Menu */}
                <div 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <BudgetActionsMenu
                    budget={budget}
                    isOpen={isActionsMenuOpen}
                    onToggle={handleToggleActionsMenu}
                    onAction={handleMenuAction}
                  />
                </div>
              </div>
            </div>

            {/* Mobile-only summary */}
            <div className="sm:hidden mt-3 pt-3 border-t border-gray-200/40">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="font-semibold text-sm">{formatCurrency(totalBudget)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Spent</p>
                  <p className="font-semibold text-sm">{formatCurrency(totalSpent)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Remaining</p>
                  <p className={cn('font-semibold text-sm', getStatusColor())}>
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </div>
              
              {/* Mobile progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(spentPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200/60 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      spentPercentage >= 100 ? 'bg-red-500' :
                      spentPercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                    )}
                    style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Link>
    );
  }

  // Grid View
  return (
    <Link to={`/budgets/${budget.id}`} className="block">
      <div
        className="rounded-lg border transition-all duration-200 hover:shadow-lg"
        style={{
          backgroundColor: hexToRgba(budget.color, 0.15),
          borderColor: hexToRgba(budget.color, 0.4),
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.backgroundColor = hexToRgba(budget.color, 0.2);
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.backgroundColor = hexToRgba(budget.color, 0.15);
        }}
      >
        <Card 
          className={cn(
            'p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group border-0 bg-transparent',
            className
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
                style={{ backgroundColor: budget.color }}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                  {budget.name}
                </h3>
                {budget.description && (
                  <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
                    {budget.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Actions Menu - REPLACED SimpleDropdown with BudgetActionsMenu */}
            <div 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <BudgetActionsMenu
                budget={budget}
                isOpen={isActionsMenuOpen}
                onToggle={handleToggleActionsMenu}
                onAction={handleMenuAction}
              />
            </div>
          </div>

          {/* Budget Summary */}
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                <span>Progress</span>
                <span>{Math.round(spentPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200/60 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    spentPercentage >= 100 ? 'bg-red-500' :
                    spentPercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                  )}
                  style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <p className="text-gray-500">Total Budget</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(totalBudget)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Remaining</p>
                <p className={cn('font-semibold', getStatusColor())}>
                  {formatCurrency(remaining)}
                </p>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200/40">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {budget.createdAt ? 
                    `Created ${formatDistanceToNow(new Date(budget.createdAt), { addSuffix: true })}` : 
                    'Budget'
                  }
                </span>
              </div>
              {budget.isArchived && (
                <Badge variant="secondary" className="text-xs">
                  Archived
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>
    </Link>
  );
});

BudgetsList.displayName = 'BudgetsList';