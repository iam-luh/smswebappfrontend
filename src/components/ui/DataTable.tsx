
import React, { useState } from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: {
    pageSize?: number;
  };
}

function DataTable<T>({ 
  data, 
  columns, 
  pagination = { pageSize: 10 } 
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'ascending' | 'descending';
  }>({
    key: null,
    direction: 'ascending'
  });

  const pageSize = pagination.pageSize || 10;
  const totalPages = Math.ceil(data.length / pageSize);

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted data
  const getSortedData = () => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a: T, b: T) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  // Get paginated data
  const getPaginatedData = () => {
    const sortedData = getSortedData();
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index}
                  onClick={() => column.sortable ? requestSort(column.accessor as string) : null}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${column.sortable ? "cursor-pointer select-none" : ""}`}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortConfig.key === column.accessor && (
                      <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {getPaginatedData().map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {column.render 
                      ? column.render(row)
                      : (row[column.accessor as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
