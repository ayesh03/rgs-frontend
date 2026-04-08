import { useState, useMemo, useCallback } from "react";
import { formatCellValue } from "../utils/locoFormatters";
import { formatFaultCellValue } from "../utils/faultFormatter";
export default function useTableFilter(rows = []) {
  const [filters, setFilters] = useState({});

  const filteredRows = useMemo(() => {
    if (!rows.length) return [];

    return rows.filter((row) => {
      return Object.entries(filters).every(([key, filterValue]) => {

        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0))
          return true;

        const rawValue = row[key];

        if (typeof filterValue === "function") {
          return filterValue(rawValue, row);
        }


        // ALWAYS take both formatters
        const locoFormatted = formatCellValue(row, key);
        const faultFormatted = formatFaultCellValue(row, key);

        // merge all possible values
        const formattedValue = `${locoFormatted ?? ""} ${faultFormatted ?? ""}`;
        //  IMPORTANT: combine both for search
        const searchValue = `${rawValue ?? ""} ${formattedValue ?? ""}`;

        // Range filter
        if (typeof filterValue === "object" && !Array.isArray(filterValue)) {
          const { min, max } = filterValue;
          const val = parseFloat(rawValue);
          return (min === undefined || val >= min) &&
            (max === undefined || val <= max);
        }

        if (Array.isArray(filterValue)) {
          const values = filterValue.map(v => String(v).toLowerCase());

          const compareValues = [
            String(rawValue ?? "").toLowerCase(),
            String(locoFormatted ?? "").toLowerCase(),
            String(faultFormatted ?? "").toLowerCase(),
          ];

          if (compareValues.every(v => v === "")) return true;

          return compareValues.some(val =>
            values.some(v => val.includes(v))
          );
        }

        // Exact match (IMPORTANT FIX)
        if (typeof filterValue === "string" || typeof filterValue === "number") {
          return String(searchValue)
            .toLowerCase()
            .includes(String(filterValue ?? "").toLowerCase());
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