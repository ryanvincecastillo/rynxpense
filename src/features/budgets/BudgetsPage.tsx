import React, { useState, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Filter,
  SortAsc,
  Eye,
  EyeOff,
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

// UI Components
import { 
  Button, 
  EmptyState, 
  Alert,
  Input,
  Badge
} from '../../components/ui';

// Modal Components
import { BudgetFormModal } from '../../components/modals';
import { DuplicateBudgetModal } from '../../components/modals/DuplicateBudgetModal';
import { DeleteConfirmModal, ArchiveConfirmModal } from '../../components/ui';

// Feature Components
import { BudgetsList } from '../../components/features/budget';

// Types
import { Budget, DuplicateBudgetOptions, CreateBudgetForm } from '../../types';


// Types and Interfaces
type SortOption = 'name' | 'created' | 'updated';
type ViewMode = 'grid' | 'list';

interface BudgetFilters {
  search: string;
  includeArchived: boolean;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
}

interface BudgetStats {
  total: number;
  active: number;
  archived: number;
}

// Simple Tooltip component (since you don't have one)
const Tooltip: React.FC<{ 
  content: string; 
  children: React.ReactNode; 
}> = ({ content, children }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute z-50 px-2 py-1 text-xs text-white bg-black rounded bottom-full mb-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
        </div>
      )}
    </div>
  );
};

// Custom Hook for Budget Filtering and Sorting
const useBudgetFilters = (budgets: Budget[], filters: BudgetFilters) => {
  return useMemo(() => {
    // Filter budgets
    let filtered = budgets.filter(budget => {
      const matchesSearch = budget.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           budget.description?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesArchiveStatus = filters.includeArchived || !budget.isArchived;
      return matchesSearch && matchesArchiveStatus;
    });

    // Sort budgets
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Separate active and archived
    const activeBudgets = filtered.filter(budget => !budget.isArchived);
    const archivedBudgets = filtered.filter(budget => budget.isArchived);

    // Calculate stats
    const stats: BudgetStats = {
      total: budgets.length,
      active: budgets.filter(b => !b.isArchived).length,
      archived: budgets.filter(b => b.isArchived).length,
    };

    return {
      activeBudgets,
      archivedBudgets,
      stats,
      filteredCount: filtered.length,
    };
  }, [budgets, filters]);
};

const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useFormatCurrency();
  const { showError, showSuccess } = useToast();

  // Modal States
  const createModal = useModal();
  const deleteModal = useModal();
  const archiveModal = useModal();
  const duplicateModal = useModal();

  // Component State
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [budgetToArchive, setBudgetToArchive] = useState<Budget | null>(null);
  const [budgetToDuplicate, setBudgetToDuplicate] = useState<Budget | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Filter State
  const [filters, setFilters] = useState<BudgetFilters>({
    search: '',
    includeArchived: false,
    sortBy: 'created',
    sortOrder: 'desc',
  });

  // Debounced search to improve performance
  const debouncedSearchTerm = useDebounce(filters.search, 300);
  const debouncedFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearchTerm,
  }), [filters, debouncedSearchTerm]);

  // API Hooks
  const { 
    data: budgetsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useBudgets({ includeArchived: filters.includeArchived });
  
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const duplicateBudgetMutation = useDuplicateBudget();

  const budgets: Budget[] = budgetsResponse?.data || [];
  const { activeBudgets, archivedBudgets, stats, filteredCount } = useBudgetFilters(budgets, debouncedFilters);

  // Event Handlers
  const handleCreateBudget = useCallback(async (data: CreateBudgetForm) => {
    try {
      await createBudgetMutation.mutateAsync(data);
      showSuccess('Budget created successfully');
      createModal.close();
      setEditingBudget(null);
    } catch (error) {
      showError('Failed to create budget');
    }
  }, [createBudgetMutation, showSuccess, showError, createModal]);

  const handleEditBudget = useCallback((budget: Budget) => {
    setEditingBudget(budget);
    createModal.open();
  }, [createModal]);

  const handleUpdateBudget = useCallback(async (data: CreateBudgetForm) => {
    if (!editingBudget) return;
    
    try {
      await updateBudgetMutation.mutateAsync({
        id: editingBudget.id,
        data,
      });
      showSuccess('Budget updated successfully');
      createModal.close();
      setEditingBudget(null);
    } catch (error) {
      showError('Failed to update budget');
    }
  }, [editingBudget, updateBudgetMutation, showSuccess, showError, createModal]);

  const handleSubmitBudget = useCallback(async (data: CreateBudgetForm) => {
    if (editingBudget) {
      await handleUpdateBudget(data);
    } else {
      await handleCreateBudget(data);
    }
  }, [editingBudget, handleCreateBudget, handleUpdateBudget]);

  const handleShowDeleteModal = useCallback((budget: Budget) => {
    setBudgetToDelete(budget);
    deleteModal.open();
  }, [deleteModal]);

  const handleDeleteBudget = useCallback(async () => {
    if (!budgetToDelete) return;
    
    try {
      await deleteBudgetMutation.mutateAsync(budgetToDelete.id);
      showSuccess('Budget deleted successfully');
      deleteModal.close();
      setBudgetToDelete(null);
    } catch (error) {
      showError('Failed to delete budget');
    }
  }, [budgetToDelete, deleteBudgetMutation, showSuccess, showError, deleteModal]);

  const handleShowArchiveModal = useCallback((budget: Budget) => {
    setBudgetToArchive(budget);
    archiveModal.open();
  }, [archiveModal]);

  const handleArchiveBudget = useCallback(async () => {
    if (!budgetToArchive) return;
    
    const action = budgetToArchive.isArchived ? 'restore' : 'archive';
    
    try {
      await updateBudgetMutation.mutateAsync({
        id: budgetToArchive.id,
        data: { isArchived: !budgetToArchive.isArchived },
      });
      showSuccess(`Budget ${action}d successfully`);
      archiveModal.close();
      setBudgetToArchive(null);
    } catch (error) {
      showError(`Failed to ${action} budget`);
    }
  }, [budgetToArchive, updateBudgetMutation, showSuccess, showError, archiveModal]);

  const handleShowDuplicateModal = useCallback((budget: Budget) => {
    setBudgetToDuplicate(budget);
    duplicateModal.open();
  }, [duplicateModal]);

  const handleDuplicateBudget = useCallback(async (options: DuplicateBudgetOptions) => {
    if (!budgetToDuplicate) return;
    
    try {
      await duplicateBudgetMutation.mutateAsync({
        budgetId: budgetToDuplicate.id,
        options,
      });
      showSuccess('Budget duplicated successfully');
      duplicateModal.close();
      setBudgetToDuplicate(null);
    } catch (error) {
      showError('Failed to duplicate budget');
    }
  }, [budgetToDuplicate, duplicateBudgetMutation, showSuccess, showError, duplicateModal]);

  const closeModal = useCallback(() => {
    createModal.close();
    setEditingBudget(null);
  }, [createModal]);

  const closeDuplicateModal = useCallback(() => {
    duplicateModal.close();
    setBudgetToDuplicate(null);
  }, [duplicateModal]);

  // Filter handlers
  const handleFilterChange = useCallback((key: keyof BudgetFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleSortOrder = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
              </div>
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
            </div>

            {/* Controls Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Alert>
            <div className="flex items-center justify-between">
              <p className="text-red-600">Failed to load budgets. Please try again.</p>
              <Button onClick={() => refetch()} size="sm" className="ml-4">
                Retry
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  // Empty State
  if (!isLoading && budgets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <EmptyState
            icon={Plus}
            title="No budgets yet"
            description="Create your first budget to start tracking your expenses and managing your finances."
            action={
              <Button onClick={() => createModal.open()} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Budget
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Budgets
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Manage and track your budgets
              </p>
            </div>
            <Button 
              onClick={() => createModal.open()} 
              size="sm"
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search budgets..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Sort */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created">Sort by Created</option>
                <option value="name">Sort by Name</option>
                <option value="updated">Sort by Updated</option>
              </select>

              {/* Sort Order */}
              <Tooltip content={`Sort ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleSortOrder}
                  className="px-3"
                >
                  <SortAsc className={`h-4 w-4 ${filters.sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                </Button>
              </Tooltip>

              {/* Archive Toggle */}
              <Tooltip content={filters.includeArchived ? 'Hide Archived' : 'Show Archived'}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleFilterChange('includeArchived', !filters.includeArchived)}
                  className={`px-3 ${filters.includeArchived ? 'bg-gray-200' : ''}`}
                >
                  {filters.includeArchived ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </Tooltip>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-0 border-l border-gray-300"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Info */}
          {filters.search && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>
                Showing {filteredCount} of {budgets.length} budgets
                {filters.search && ` for "${filters.search}"`}
              </span>
              {filteredCount === 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-2 text-blue-600 hover:text-blue-700"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}

          {/* Budgets Grid/List */}
          <div className="space-y-8">
            {/* Active Budgets */}
            {activeBudgets.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Active Budgets
                  </h2>
                  <Badge variant="secondary">{activeBudgets.length}</Badge>
                </div>
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "space-y-3"
                }>
                  {activeBudgets.map((budget) => (
                    <BudgetsList
                      key={budget.id}
                      budget={budget}
                      onEdit={handleEditBudget}
                      onDuplicate={handleShowDuplicateModal}
                      onArchive={handleShowArchiveModal}
                      onDelete={handleShowDeleteModal}
                      formatCurrency={formatCurrency}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Archived Budgets */}
            {filters.includeArchived && archivedBudgets.length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Archived Budgets
                  </h2>
                  <Badge variant="secondary">{archivedBudgets.length}</Badge>
                </div>
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "space-y-3"
                }>
                  {archivedBudgets.map((budget) => (
                    <BudgetsList
                      key={budget.id}
                      budget={budget}
                      onEdit={handleEditBudget}
                      onDuplicate={handleShowDuplicateModal}
                      onArchive={handleShowArchiveModal}
                      onDelete={handleShowDeleteModal}
                      formatCurrency={formatCurrency}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredCount === 0 && filters.search && (
              <div className="text-center py-8">
                <p className="text-gray-500">No budgets found matching your search.</p>
                <Button
                  variant="ghost"
                  onClick={() => handleFilterChange('search', '')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BudgetFormModal
        isOpen={createModal.isOpen}
        onClose={closeModal}
        onSubmit={handleSubmitBudget}
        editingBudget={editingBudget}
        isLoading={createBudgetMutation.isPending || updateBudgetMutation.isPending}
      />

      <DuplicateBudgetModal
        isOpen={duplicateModal.isOpen}
        onClose={closeDuplicateModal}
        budget={budgetToDuplicate}
        onDuplicate={handleDuplicateBudget}
        isLoading={duplicateBudgetMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.close();
          setBudgetToDelete(null);
        }}
        onConfirm={handleDeleteBudget}
        itemName={budgetToDelete?.name || ''}
        itemType="budget"
        isLoading={deleteBudgetMutation.isPending}
        warningText="All categories and transactions in this budget will also be deleted."
      />

      <ArchiveConfirmModal
        isOpen={archiveModal.isOpen}
        onClose={() => {
          archiveModal.close();
          setBudgetToArchive(null);
        }}
        onConfirm={handleArchiveBudget}
        itemName={budgetToArchive?.name || ''}
        itemType="budget"
        isArchived={budgetToArchive?.isArchived || false}
        isLoading={updateBudgetMutation.isPending}
      />
    </div>
  );
};

export default BudgetsPage;