import React from 'react';
import { Table, Card, EmptyState, LoadingSpinner } from '../ui';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyState?: {
    icon?: React.ComponentType<any>;
    title: string;
    description?: string;
    action?: React.ReactNode;
  };
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyState,
  onRowClick,
  className = ''
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <Card className={className}>
        <EmptyState {...emptyState} />
      </Card>
    );
  }

  return (
    <Table
      data={data}
      columns={columns}
      isLoading={isLoading}
      onRowClick={onRowClick}
      className={className}
    />
  );
}