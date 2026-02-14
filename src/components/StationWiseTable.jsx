import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  alpha,
  Tooltip,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import SpeedIcon from "@mui/icons-material/Speed";

import ColumnFilterDialog from "./ColumnFilterDialog";


export default function StationWiseTable({ rows = [] }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterColumn, setFilterColumn] = useState("");
  const [filterValues, setFilterValues] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [activeFilters, setActiveFilters] = useState({}); // Track multiple column filters

  // Multi-column filtering logic
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      return Object.keys(activeFilters).every((column) => {
        const allowedValues = activeFilters[column];
        return allowedValues.includes(row[column]);
      });
    });
  }, [rows, activeFilters]);

  const openFilter = (column) => {
    const uniqueValues = [...new Set(rows.map((r) => r[column]))].sort();
    setFilterColumn(column);
    setFilterValues(uniqueValues);
    // Initialize dialog with current active filters for this column, or all if none
    setSelectedValues(activeFilters[column] || uniqueValues);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterColumn]: selectedValues,
    }));
    setFilterOpen(false);
  };

  const clearFilter = (column) => {
    const newFilters = { ...activeFilters };
    delete newFilters[column];
    setActiveFilters(newFilters);
  };

  const columns = [
    { id: "date", label: "Date" },
    { id: "time", label: "Time" },
    { id: "stnCode", label: "Station Code" },
    { id: "locoId", label: "Loco ID" },
    { id: "speed", label: "Speed (km/h)" },
    { id: "direction", label: "Direction" },
  ];

  return (
    <>
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: 600, 
          borderRadius: 3, 
          border: '1px solid #e0e6ed',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell 
                  key={col.id}
                  sx={{ 
                    bgcolor: '#f8f9fa', 
                    fontWeight: 800, 
                    color: 'text.secondary',
                    borderBottom: activeFilters[col.id] ? '2px solid #1976d2' : '1px solid #e0e0e0'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" fontWeight="800">
                      {col.label.toUpperCase()}
                    </Typography>
                    <Box>
                      {activeFilters[col.id] && (
                        <IconButton size="small" onClick={() => clearFilter(col.id)} sx={{ color: 'error.main' }}>
                          <FilterAltOffIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => openFilter(col.id)}
                        color={activeFilters[col.id] ? "primary" : "default"}
                      >
                        <FilterAltIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.map((row, i) => (
              <TableRow 
                key={i} 
                hover
                sx={{ '&:nth-of-type(even)': { bgcolor: alpha('#f8f9fa', 0.5) } }}
              >
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.time}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="700" color="primary.dark">
                    {row.stnCode}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontFamily: 'Monospace' }}>{row.locoId}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      fontWeight="800"
                      color={row.speed > 75 ? "error.main" : "success.main"}
                    >
                      {row.speed}
                    </Typography>
                    {row.speed > 0 && <SpeedIcon sx={{ fontSize: 14, opacity: 0.3 }} />}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="600">{row.direction}</Typography>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <Typography variant="body2" color="text.disabled">
                    No results match the active filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ColumnFilterDialog
        open={filterOpen}
        title={`Filter ${columns.find(c => c.id === filterColumn)?.label}`}
        values={filterValues}
        selectedValues={selectedValues}
        setSelectedValues={setSelectedValues}
        onClose={() => setFilterOpen(false)}
        onApply={applyFilter}
      />
    </>
  );
}