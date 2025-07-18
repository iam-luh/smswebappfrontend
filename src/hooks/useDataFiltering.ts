
import { useState, useMemo } from "react";

interface FilterOptions {
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

export function useDataFiltering<T>(
  data: T[],
  filterFn: (item: T, options: FilterOptions) => boolean
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredData = useMemo(() => {
    return data.filter(item => 
      filterFn(item, { searchQuery, startDate, endDate })
    );
  }, [data, searchQuery, startDate, endDate, filterFn]);

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
  };

  return {
    filteredData,
    searchQuery,
    setSearchQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clearFilters,
  };
}
