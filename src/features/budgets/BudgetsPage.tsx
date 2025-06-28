// src/features/budgets/BudgetsPage.tsx
import React, { useState, useMemo, useCallback, useEffect, useTransition } from 'react';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Filter,
  SortAsc,
  Eye,
  EyeOff,
  Sparkles,
  ChevronDown,
  MoreVertical,
  TrendingUp,
  AlertCircle,
  Clock,
  Users,
  Archive,
  Wallet
} from 'lucide-react';

// Hooks
import { 
  useBudgets, 
  useCreateBudget, 
  useUpdateBudget, 
  useDeleteBudget, 
  useDuplicateBudget 
} from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { useFormatCurrency, useToast, useModal, useDebounce } from '../../hooks/common';
import { useCreateAIBudget } from '../../hooks/useAIBudget';

// UI Components
import { 
  Button, 
  EmptyState, 
  Alert,
  Input,
  Badge,
  LoadingSpinner
} from '../../components/ui';

// Modal Components
import { AIBudgetCreationModal, BudgetFormModal, LeaveBudgetModal, ShareBudgetModal } from '../../components/modals';
import { DuplicateBudgetModal } from '../../components/modals/DuplicateBudgetModal';
import { DeleteConfirmModal, ArchiveConfirmModal } from '../../components/ui';

// Feature Components
import { BudgetsList } from '../../components/features/budget';
import { ContentWithGhost, SearchGhost, HeaderLoading, GhostStats } from '../../components/ui/GhostLoading';

// Types
import { Budget, DuplicateBudgetOptions, CreateBudgetForm } from '../../types';
import { CreateBudgetWithTemplateForm } from '../../types/template';
import { useCreateBudgetWithTemplate } from '../../hooks/useBudgetTemplate';
import { AIBudgetRequest } from '../../services/aiBudgetService';

// Types and Interfaces
type SortOption = 'name' | 'created' | 'updated' | 'netActual' | 'totalTransactions';

interface BudgetFilters {
  search: string;
  includeArchived: boolean;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  showSharedOnly: boolean;
}

interface BudgetStats {
  total: number;
  active: number;
  archived: number;
  shared: number;
}

interface AIBudgetData {
  monthlyIncome: number;
  financialGoals: string;
  currentExpenses: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  budgetName?: string;
  dependents?: number;
  debtAmount?: number;
  savingsGoal?: number;
}

const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useFormatCurrency();
  const { toast } = useToast();
  const { isOpen, open: openModal, close: closeModal } = useModal();

  // State Management
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [modalType, setModalType] = useState<string | null>(null);
  const [filters, setFilters] = useState<BudgetFilters>({
    search: '',
    includeArchived: false,
    sortBy: 'updated',
    sortOrder: 'desc',
    showSharedOnly: false
  });

  // 🚀 PERFORMANCE IMPROVEMENTS
  // Use React's useTransition for non-urgent updates
  const [isPending, startTransition] = useTransition();
  
  // Keep track of previous data to prevent flicker
  const [displayBudgets, setDisplayBudgets] = useState<Budget[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Debounced search with optimized delay
  const debouncedSearch = useDebounce(filters.search, 200); // Reduced from 300ms to 200ms

  // API Hooks with your existing structure
  const { 
    data: budgetsData, 
    isLoading: budgetsLoading, 
    error: budgetsError,
    isFetching: budgetsFetching // Track background fetching
  } = useBudgets({
    search: debouncedSearch,
    includeArchived: filters.includeArchived,
    page: 1,
    limit: 50
  });

  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const duplicateBudgetMutation = useDuplicateBudget();
  const createBudgetWithTemplateMutation = useCreateBudgetWithTemplate();
  const createAIBudgetMutation = useCreateAIBudget();

  // Computed Values with your API structure
  const budgets = budgetsData?.data || [];
  
  // 🎯 FLICKER PREVENTION: Update display budgets smoothly
  useEffect(() => {
    if (budgets.length > 0) {
      // Use transition for smooth updates
      startTransition(() => {
        setDisplayBudgets(budgets);
        setIsInitialLoad(false);
      });
    } else if (!budgetsFetching && !isInitialLoad) {
      // Only clear if not fetching and not initial load
      startTransition(() => {
        setDisplayBudgets([]);
      });
    }
  }, [budgets, budgetsFetching, isInitialLoad]);

  // Client-side filtering and sorting with memoization
  const filteredAndSortedBudgets = useMemo(() => {
    let filtered = [...displayBudgets];

    // Apply shared filter
    if (filters.showSharedOnly) {
      filtered = filtered.filter(budget => budget.isShared);
    }

    // Sort budgets
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updated':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'netActual':
          aValue = a.summary?.netActual || 0;
          bValue = b.summary?.netActual || 0;
          break;
        case 'totalTransactions':
          aValue = a._count?.transactions || 0;
          bValue = b._count?.transactions || 0;
          break;
        default:
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [displayBudgets, filters.showSharedOnly, filters.sortBy, filters.sortOrder]);

  // Budget statistics with memoization
  const budgetStats: BudgetStats = useMemo(() => {
    return {
      total: displayBudgets.length,
      active: displayBudgets.filter(b => !b.isArchived).length,
      archived: displayBudgets.filter(b => b.isArchived).length,
      shared: displayBudgets.filter(b => b.isShared).length,
    };
  }, [displayBudgets]);

  // Event Handlers with optimized callbacks
  const handleFilterChange = useCallback((key: keyof BudgetFilters, value: any) => {
    // Use transition for filter changes to prevent UI blocking
    startTransition(() => {
      setFilters(prev => ({ ...prev, [key]: value }));
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    startTransition(() => {
      setFilters({
        search: '',
        includeArchived: false,
        sortBy: 'updated',
        sortOrder: 'desc',
        showSharedOnly: false
      });
    });
  }, []);

  const openCreateModal = useCallback((type: 'regular' | 'template' | 'ai') => {
    setModalType(type);
    openModal();
  }, [openModal]);

  const hasActiveFilters = useMemo(() => {
    return filters.search || 
           filters.includeArchived || 
           filters.showSharedOnly || 
           filters.sortBy !== 'updated' || 
           filters.sortOrder !== 'desc';
  }, [filters]);

  const handleCreateBudget = useCallback(async (data: CreateBudgetForm) => {
    try {
      await createBudgetMutation.mutateAsync(data);
      toast.success('Budget created successfully!');
      closeModal();
    } catch (error) {
      toast.error('Failed to create budget');
    }
  }, [createBudgetMutation, toast, closeModal]);


  const handleCreateAIBudget = useCallback(async (data: AIBudgetData) => {
    try {
      const aiRequest: AIBudgetRequest = {
        userInput: data.financialGoals || data.currentExpenses || 'Create a budget',
        monthlyIncome: data.monthlyIncome,
        currency: 'PHP',
        additionalContext: {
          familySize: data.dependents,
          goals: data.financialGoals ? [data.financialGoals] : []
        }
      };
      
      await createAIBudgetMutation.mutateAsync(aiRequest);
      toast.success('AI Budget created successfully!');
      closeModal();
    } catch (error) {
      toast.error('Failed to create AI budget');
    }
  }, [createAIBudgetMutation, toast, closeModal]);

  const handleUpdateBudget = useCallback(async (data: CreateBudgetForm) => {
    if (!selectedBudget) return;
  
  try {
      await updateBudgetMutation.mutateAsync({
        id: selectedBudget.id,
        data
      });
      toast.success('Budget updated successfully!');
      closeModal();
    } catch (error) {
      toast.error('Failed to update budget');
    }
  }, [selectedBudget, updateBudgetMutation, toast, closeModal]);

  // Budget Actions with optimistic updates
  const handleEditBudget = useCallback((budget: Budget) => {
    setSelectedBudget(budget);
    setModalType('edit');
    openModal();
  }, [openModal]);

  const handleDuplicateBudget = useCallback((budget: Budget) => {
    setSelectedBudget(budget);
    setModalType('duplicate');
    openModal();
  }, [openModal]);

  const handleConfirmDuplicate = useCallback(async (options: DuplicateBudgetOptions) => {
    if (!selectedBudget) return;
    
    try {
      await duplicateBudgetMutation.mutateAsync({
        budgetId: selectedBudget.id,
        ...options
      });
      toast.success('Budget duplicated successfully!');
      closeModal();
    } catch (error) {
      toast.error('Failed to duplicate budget');
    }
  }, [selectedBudget, duplicateBudgetMutation, toast, closeModal]);

  const handleArchiveBudget = useCallback((budget: Budget) => {
    setSelectedBudget(budget);
    setModalType('archive');
    openModal();
  }, [openModal]);

  const handleConfirmArchive = useCallback(async () => {
    if (!selectedBudget) return;
    
    try {
      await updateBudgetMutation.mutateAsync({
        id: selectedBudget.id,
        data: { isArchived: !selectedBudget.isArchived }
      });
      
      const action = selectedBudget.isArchived ? 'unarchived' : 'archived';
      toast.success(`Budget ${action} successfully!`);
      closeModal();
    } catch (error) {
      toast.error('Failed to update budget');
    }
  }, [selectedBudget, updateBudgetMutation, toast, closeModal]);

  const handleDeleteBudget = useCallback((budget: Budget) => {
    setSelectedBudget(budget);
    setModalType('delete');
    openModal();
  }, [openModal]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedBudget) return;
    
    try {
      await deleteBudgetMutation.mutateAsync(selectedBudget.id);
      toast.success('Budget deleted successfully!');
      closeModal();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  }, [selectedBudget, deleteBudgetMutation, toast, closeModal]);

  // 🚀 IMPROVED LOADING STATES
  // Show initial loading only on first load
  if (budgetsLoading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Loading your budgets...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (budgetsError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Alert className="max-w-md mx-auto mt-8">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h3 className="font-medium">Failed to load budgets</h3>
            <p className="text-sm mt-1">Please try refreshing the page</p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with subtle loading indicator */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-b border-gray-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Main Header Row */}
            <div className="flex items-center justify-between mb-6">
              {/* Left - Title and Welcome */}
              <div className="flex items-center space-x-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      My Budgets
                    </h1>
                    {/* 🎯 PROFESSIONAL LOADING INDICATOR */}
                    <HeaderLoading 
                      isVisible={budgetsFetching && !isInitialLoad}
                      text="Updating..."
                    />
                  </div>
                </div>
              </div>

              {/* Right - Quick Actions */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`${hasActiveFilters ? 'bg-blue-50 text-blue-700' : 'text-gray-600'} transition-colors`}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                        {Object.values(filters).filter(Boolean).length}
                      </Badge>
                    )}
                  </Button> */}
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openCreateModal('ai')}
                  className="bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 border-purple-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">AI Budget</span>
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openCreateModal('regular')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">New Budget</span>
                </Button>
              </div>
            </div>

            {/* Stats with Ghost Loading */}
            {budgetsLoading && isInitialLoad ? (
              <GhostStats className="mb-4" />
            ) : (
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  {budgetStats.total} Total
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  {budgetStats.active} Active
                </span>
                {budgetStats.shared > 0 && (
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    {budgetStats.shared} Shared
                  </span>
                )}
                {budgetStats.archived > 0 && (
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    {budgetStats.archived} Archived
                  </span>
                )}
              </div>
            )}

            {/* Search and Quick Filters */}
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
                  <input
                    type="text"
                    placeholder="Search budgets..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-300 transition-all duration-200"
                  />
                  {/* 🎯 PROFESSIONAL SEARCH LOADING */}
                  <SearchGhost isVisible={isPending && !!filters.search} />
                </div>
              </div>

              {/* Control Row */}
              <div className="flex items-center justify-between gap-2">
                {/* Left - Quick Filter Toggles */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('includeArchived', !filters.includeArchived)}
                    className={`${filters.includeArchived ? 'bg-yellow-100 text-yellow-900' : 'text-gray-600'} transition-colors`}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Archived</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('showSharedOnly', !filters.showSharedOnly)}
                    className={`${filters.showSharedOnly ? 'bg-purple-100 text-purple-900' : 'text-gray-600'} transition-colors`}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Shared</span>
                  </Button>
                </div>

                {/* Right - Sort and View Options */}
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </Button>
                  )}

                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-') as [SortOption, 'asc' | 'desc'];
                      handleFilterChange('sortBy', sortBy);
                      handleFilterChange('sortOrder', sortOrder);
                    }}
                    className="text-sm border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="updated-desc">Latest Updated</option>
                    <option value="created-desc">Newest First</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="netActual-desc">Highest Balance</option>
                    <option value="netActual-asc">Lowest Balance</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with smooth transitions */}
      <div className="max-w-7xl mx-auto py-6">
        {filteredAndSortedBudgets.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={filters.search ? 'No budgets found' : 'Create your first budget'}
            description={
              filters.search 
                ? `No budgets match "${filters.search}". Try adjusting your search.`
                : 'Start managing your finances by creating your first budget.'
            }
            action={
              !filters.search ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => openCreateModal('regular')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Budget
                  </Button>
                  <Button variant="secondary" onClick={() => openCreateModal('ai')}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Budget Assistant
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" onClick={handleClearFilters}>
                  Clear Search
                </Button>
              )
            }
          />
        ) : (
          /* 🎯 PROFESSIONAL GHOST LOADING */
          <ContentWithGhost
            isLoading={budgetsLoading || isPending}
            isInitialLoad={isInitialLoad}
            ghostCount={8}
          >
            <BudgetsList
              budgets={filteredAndSortedBudgets}
              onEdit={handleEditBudget}
              onDuplicate={handleDuplicateBudget}
              onArchive={handleArchiveBudget}
              onDelete={handleDeleteBudget}
              formatCurrency={formatCurrency}
            />
          </ContentWithGhost>
        )}
      </div>

      {/* Modals */}
      {isOpen && modalType === 'regular' && (
        <BudgetFormModal
          isOpen={true}
          onClose={closeModal}
          onSubmit={handleCreateBudget}
          isLoading={createBudgetMutation.isPending}
        />
      )}
      {isOpen && modalType === 'template' && (
        <BudgetFormModal
          isOpen={true}
          onClose={closeModal}
          onSubmit={handleCreateBudget}
          isLoading={createBudgetWithTemplateMutation.isPending}
        />
      )}

     {isOpen && modalType === 'ai' && (
        <AIBudgetCreationModal
          isOpen={true}
          onClose={closeModal}
          onCreateWithAI={handleCreateAIBudget}
          onCreateWithTemplate={(templateId: string) => console.log('Template:', templateId)}
          onCreateManual={() => openCreateModal('regular')}
          isAILoading={createAIBudgetMutation.isPending}
        />
      )}

      {isOpen && modalType === 'edit' && selectedBudget && (
        <BudgetFormModal
          isOpen={true}
          onClose={closeModal}
          onSubmit={handleUpdateBudget}
          editingBudget={selectedBudget}
          isLoading={updateBudgetMutation.isPending}
        />
      )}

      {isOpen && modalType === 'duplicate' && selectedBudget && (
        <DuplicateBudgetModal
          isOpen={true}
          onClose={closeModal}
          onDuplicate={handleConfirmDuplicate}
          budget={selectedBudget}
          isLoading={duplicateBudgetMutation.isPending}
        />
      )}

      {isOpen && modalType === 'archive' && selectedBudget && (
        <ArchiveConfirmModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={handleConfirmArchive}
          itemName={selectedBudget.name}
          itemType="budget"
          isArchived={selectedBudget.isArchived}
          isLoading={updateBudgetMutation.isPending}
        />
      )}

      {isOpen && modalType === 'delete' && selectedBudget && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={handleConfirmDelete}
          itemName={selectedBudget.name}
          itemType="budget"
          isLoading={deleteBudgetMutation.isPending}
        />
      )}
    </div>
  );
};

export default BudgetsPage;