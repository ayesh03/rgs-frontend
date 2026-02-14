import { useState, useMemo, useCallback } from "react";

export default function useTableFilter(rows = []) {
  const [filters, setFilters] = useState({});

  const filteredRows = useMemo(() => {
    if (!rows.length) return [];
    
    return rows.filter((row) => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return true;

        const rowValue = row[key];

        // 1. Numeric Range Filtering (Special handling for Speed/Distance)
        // Expects filterValue to be { min: number, max: number }
        if (typeof filterValue === "object" && !Array.isArray(filterValue)) {
          const { min, max } = filterValue;
          const val = parseFloat(rowValue);
          return (min === undefined || val >= min) && (max === undefined || val <= max);
        }

        // 2. Array-based (Inclusion)
        if (Array.isArray(filterValue)) {
          return filterValue.includes(rowValue);
        }

        // 3. String-based (Search)
        if (typeof filterValue === "string") {
          return String(rowValue).toLowerCase().includes(filterValue.toLowerCase());
        }

        return true;
      });
    });
  }, [rows, filters]);

  const setFilter = useCallback((column, value) => {
    setFilters((prev) => ({ ...prev, [column]: value }));
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  return {
    filteredRows,
    filters,
    setFilter,
    clearFilters,
    activeFilterCount: Object.keys(filters).length,
  };
}