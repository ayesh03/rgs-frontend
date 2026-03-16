import { useState, useMemo, useCallback } from "react";

export default function useTableFilter(rows = []) {
  const [filters, setFilters] = useState({});

  const filteredRows = useMemo(() => {
    if (!rows.length) return [];

    return rows.filter((row) => {
      return Object.entries(filters).every(([key, filterValue]) => {

        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0))
          return true;

        const rowValue = row[key];

        // Range filter
        if (typeof filterValue === "object" && !Array.isArray(filterValue)) {
          const { min, max } = filterValue;
          const val = parseFloat(rowValue);
          return (min === undefined || val >= min) &&
            (max === undefined || val <= max);
        }

        // Array inclusion
        if (Array.isArray(filterValue)) {
          return filterValue.map(String).includes(String(rowValue));
        }

        // Exact match (IMPORTANT FIX)
        if (typeof filterValue === "string" || typeof filterValue === "number") {
          return String(rowValue) === String(filterValue);
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