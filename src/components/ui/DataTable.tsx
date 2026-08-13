import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';

export interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: string;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchKey,
  pageSize = 5,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search key and search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchKey) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter((row) => {
      const val = row[searchKey];
      return val ? String(val).toLowerCase().includes(query) : false;
    });
  }, [data, searchQuery, searchKey]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const multiplier = sortDirection === 'asc' ? 1 : -1;
      return aVal > bVal ? multiplier : -multiplier;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;

    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {searchKey && (
        <div className="flex w-full md:max-w-xs">
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full"
          />
        </div>
      )}

      <div className="w-full overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-800/50 glass-panel">
        <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
          <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200/50 dark:border-slate-800/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`py-3 px-4 select-none ${col.sortable ? 'cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="text-slate-400 dark:text-slate-600">
                        {sortKey !== col.key ? (
                          <ChevronsUpDown className="h-3 w-3" />
                        ) : sortDirection === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5 text-violet-500" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-violet-500" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rIdx) => (
                <tr
                  key={row.id || rIdx}
                  className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="py-3 px-4 text-slate-800 dark:text-slate-200">
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-slate-400">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
