// src/components/ui/GhostLoading.tsx
import React from 'react';
import { cn } from '../../utils/helpers';

interface GhostCardProps {
  className?: string;
}

/**
 * 🎯 PROFESSIONAL GHOST CARD
 * Modern, subtle loading skeleton that matches your budget card design
 */
export const GhostCard: React.FC<GhostCardProps> = ({ className }) => (
  <div className={cn(
    "bg-white rounded-xl border border-gray-100 p-6 shadow-sm",
    "animate-pulse",
    className
  )}>
    {/* Header Section */}
    <div className="flex items-start justify-between mb-6">
      <div className="space-y-3 flex-1">
        {/* Title */}
        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-3/4"></div>
        {/* Subtitle */}
        <div className="h-4 bg-gradient-to-r from-gray-150 to-gray-100 rounded-md w-1/2"></div>
      </div>
      {/* Actions Menu */}
      <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
    </div>

    {/* Status Badge */}
    <div className="mb-4">
      <div className="h-6 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full w-20"></div>
    </div>

    {/* Performance Section */}
    <div className="space-y-4 mb-6">
      {/* Net Amount */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-150 rounded w-24"></div>
        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-150 rounded-lg w-28"></div>
      </div>

      {/* Income Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded-full"></div>
            <div className="h-4 bg-gray-150 rounded w-16"></div>
          </div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-150 rounded w-20"></div>
            <div className="h-3 bg-gray-100 rounded w-16 ml-auto"></div>
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-200 to-green-100 rounded-full w-3/4"></div>
        </div>
      </div>

      {/* Expense Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 rounded-full"></div>
            <div className="h-4 bg-gray-150 rounded w-20"></div>
          </div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-150 rounded w-20"></div>
            <div className="h-3 bg-gray-100 rounded w-16 ml-auto"></div>
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-200 to-red-100 rounded-full w-2/3"></div>
        </div>
      </div>
    </div>

    {/* Footer Metadata */}
    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
          <div className="h-3 bg-gray-100 rounded w-8"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
          <div className="h-3 bg-gray-100 rounded w-8"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
          <div className="h-3 bg-gray-100 rounded w-8"></div>
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-20"></div>
    </div>
  </div>
);

/**
 * 🚀 GHOST BUDGETS GRID
 * Professional loading grid that matches your layout
 */
interface GhostBudgetsGridProps {
  count?: number;
  className?: string;
}

export const GhostBudgetsGrid: React.FC<GhostBudgetsGridProps> = ({ 
  count = 6, 
  className 
}) => (
  <div className={cn(
    "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6",
    className
  )}>
    {Array.from({ length: count }).map((_, index) => (
      <GhostCard 
        key={index}
        className="hover:shadow-md transition-shadow duration-200"
      />
    ))}
  </div>
);

/**
 * 🎯 CONTENT WITH GHOST LOADING
 * Wrapper that shows ghost loading or content with smooth transitions
 */
interface ContentWithGhostProps {
  isLoading: boolean;
  isInitialLoad: boolean;
  children: React.ReactNode;
  ghostCount?: number;
  className?: string;
}

export const ContentWithGhost: React.FC<ContentWithGhostProps> = ({
  isLoading,
  isInitialLoad,
  children,
  ghostCount = 6,
  className
}) => {
  // Show ghost loading on initial load
  if (isLoading && isInitialLoad) {
    return (
      <div className={className}>
        <GhostBudgetsGrid count={ghostCount} />
      </div>
    );
  }

  // Show content with subtle loading indication
  return (
    <div className={cn(
      "transition-opacity duration-300",
      isLoading && !isInitialLoad ? "opacity-60" : "opacity-100",
      className
    )}>
      {children}
    </div>
  );
};

/**
 * 🎯 SEARCH GHOST INDICATOR
 * Subtle loading indicator for search operations
 */
interface SearchGhostProps {
  isVisible: boolean;
  className?: string;
}

export const SearchGhost: React.FC<SearchGhostProps> = ({ 
  isVisible, 
  className 
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn("absolute right-3 top-1/2 transform -translate-y-1/2", className)}>
      <div className="flex items-center space-x-1">
        <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

/**
 * 🚀 MINI GHOST STATS
 * Loading state for stats section
 */
export const GhostStats: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex items-center gap-4 text-sm", className)}>
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="flex items-center gap-1 animate-pulse">
        <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
    ))}
  </div>
);

/**
 * 🎯 HEADER LOADING INDICATOR
 * Subtle indicator for header operations
 */
interface HeaderLoadingProps {
  isVisible: boolean;
  text?: string;
  className?: string;
}

export const HeaderLoading: React.FC<HeaderLoadingProps> = ({ 
  isVisible, 
  text = "Updating...",
  className 
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn("flex items-center gap-2 text-blue-600", className)}>
      <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};