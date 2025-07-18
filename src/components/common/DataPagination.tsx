
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const DataPagination: React.FC<DataPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Show at most 5 numbered pages
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of the page range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // If at the start, show more pages after current
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, 4);
      }
      
      // If at the end, show more pages before current
      if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('ellipsis-start');
      }
      
      // Add page numbers between start and end
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            aria-disabled={currentPage === 1}
          />
        </PaginationItem>

        {getPageNumbers().map((page, index) => (
          <PaginationItem key={`page-${index}`}>
            {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
              <span className="px-4 py-2">...</span>
            ) : (
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                className={typeof page === 'number' ? "cursor-pointer" : ""}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            aria-disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default DataPagination;
