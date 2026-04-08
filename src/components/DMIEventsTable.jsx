import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Box,
  Stack, IconButton, Popover, TextField
} from "@mui/material";

import { motion } from "framer-motion";
import { useState } from "react";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FilterListIcon from "@mui/icons-material/FilterList";

import { formatDMICellValue } from "../utils/dmiFormatter";

export default function DMIEventsTable({
  rows = [],
  columns = [],
  visibleKeys = [],
  formatter = formatDMICellValue,
  onColumnSearch,
  onSort
}) {
  const visibleColumns = columns.filter(col =>
    visibleKeys.includes(col.key)
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeCol, setActiveCol] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [sortState, setSortState] = useState({});

  return (
    <TableContainer
      component={Box}
      sx={{
        bgcolor: "rgba(18, 18, 18, 0.4)",
        overflowX: "auto",
        "&::-webkit-scrollbar": { height: "8px" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "rgba(255,255,255,0.1)",
          borderRadius: "10px"
        }
      }}
    >
      <Table size="small" stickyHeader>

        {/* ================= HEADER ================= */}
        <TableHead>
          <TableRow>
            {visibleColumns.map(col => (
              <TableCell
                key={col.key}
                sx={{
                  bgcolor: "#1a1a1a",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.4)",
                  borderBottom: "2px solid rgba(255,255,255,0.05)",
                  py: 2,
                  whiteSpace: "nowrap"
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 800 }}>
                    {col.label.toUpperCase()}
                  </Typography>

                  {/* SORT */}
                  <IconButton
                    size="small"
                    onClick={() => {
                      let next;

                      if (!sortState[col.key]) next = "asc";
                      else if (sortState[col.key] === "asc") next = "desc";
                      else next = null;

                      setSortState(prev => ({ ...prev, [col.key]: next }));
                      onSort?.(col.key, next);
                    }}
                    sx={{
                      p: 0.2,
                      color: sortState[col.key]
                        ? "#5b8ffe"
                        : "rgba(255,255,255,0.6)"
                    }}
                  >
                    {sortState[col.key] === "desc"
                      ? <ArrowDownwardIcon sx={{ fontSize: 13 }} />
                      : <ArrowUpwardIcon sx={{ fontSize: 13 }} />}
                  </IconButton>

                  {/* FILTER */}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setAnchorEl(e.currentTarget);
                      setActiveCol(col.key);
                      setSearchVal("");
                    }}
                    sx={{
                      p: 0.2,
                      color: "rgba(255,255,255,0.6)",
                      "&:hover": { color: "#5b8ffe" }
                    }}
                  >
                    <FilterListIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Stack>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* ================= BODY ================= */}
        <TableBody>
          {rows.length ? (
            rows.map((row, i) => (
              <TableRow
                key={i}
                component={motion.tr}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                sx={{
                  "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                  "& td": {
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.8)"
                  }
                }}
              >
                {visibleColumns.map(col => (
                  <TableCell
                    key={col.key}
                    sx={{ py: 1.6, whiteSpace: "nowrap" }}
                  >
                    <Typography sx={{ fontSize: "0.95rem" }}>
                      {formatter(row, col.key)}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={visibleColumns.length}
                align="center"
                sx={{ py: 10 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.2)",
                    letterSpacing: 2,
                    fontWeight: 700
                  }}
                >
                  NO DMI EVENTS DETECTED
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ================= FILTER POPOVER ================= */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{
          sx: {
            bgcolor: "#1e2227",
            border: "1px solid #333",
            borderRadius: 2
          }
        }}
      >
        <Box sx={{ p: 1.5, minWidth: 180 }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#888", mb: 1 }}>
            Filter: {activeCol}
          </Typography>

          <TextField
            autoFocus
            size="small"
            fullWidth
            placeholder="Search..."
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              onColumnSearch?.(activeCol, e.target.value);
            }}
            sx={{
              input: { color: "#fff", fontSize: "0.85rem" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#444" }
              }
            }}
          />

          <Stack direction="row" justifyContent="flex-end" mt={1}>
            <IconButton
              size="small"
              onClick={() => {
                onColumnSearch?.(activeCol, "");
                setSearchVal("");
                setAnchorEl(null);
              }}
              sx={{ color: "#aaa" }}
            >
              Clear
            </IconButton>
          </Stack>
        </Box>
      </Popover>
    </TableContainer>
  );
}