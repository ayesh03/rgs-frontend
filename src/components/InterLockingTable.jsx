import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, alpha, Chip, useTheme, } from "@mui/material";
import { motion } from "framer-motion";
import { useState } from "react";
import HubIcon from '@mui/icons-material/Hub';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { INTERLOCKING_COLUMNS } from "../constants/interlockingColumns";
import { decodeSystemVersion } from "../utils/healthFormatter";
import {
  Stack,
  IconButton,
  Popover,
  TextField
} from "@mui/material";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FilterListIcon from "@mui/icons-material/FilterList";
export default function InterlockingTable({
  rows = [],
  visibleKeys = [],
  onSort,
  onColumnSearch
}) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeCol, setActiveCol] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [sortState, setSortState] = useState({});

  /* ===================== STATUS COLOR LOGIC ===================== */
  const getStatusStyle = (status) => {
    const s = status?.toString().toUpperCase() || "";
    const isPicked = ["PICKED UP", "PICKED", "ON", "1", "TRUE"].includes(s);

    return {
      label: isPicked ? "PICKED UP" : "DROPPED",
      color: isPicked ? "#00e676" : "#ff5252", // Neon Green : Neon Red
      glow: isPicked ? alpha("#00e676", 0.15) : alpha("#ff5252", 0.15),
      border: isPicked ? alpha("#00e676", 0.3) : alpha("#ff5252", 0.3),
    };
  };

  /* ===================== UI HELPERS ===================== */
  const hexFields = ["message_length", "message_sequence", "stationary_kavach_id"];

  return (
    <TableContainer
      sx={{
        bgcolor: "transparent",
        backgroundImage: "none",
        "&::-webkit-scrollbar": { height: "6px" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "rgba(255,255,255,0.1)",
          borderRadius: "10px"
        }
      }}
    >
      <Table size="small" stickyHeader sx={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
        {/* ================= HEADER ================= */}
        <TableHead>
          <TableRow>
            {visibleKeys.map((key) => {
              const col = INTERLOCKING_COLUMNS.find(c => c.key === key);
              const sort = sortState[key];

              return (
                <TableCell
                  key={key}
                  sx={{
                    bgcolor: "#0a0a0a",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.5)",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    letterSpacing: "0.8px",
                    py: 2,
                    textTransform: "uppercase"
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 800 }}>
                      {col?.label || key}
                    </Typography>

                    {/* SORT */}
                    <IconButton
                      size="small"
                      onClick={() => {
                        let next;
                        if (!sort) next = "asc";
                        else if (sort === "asc") next = "desc";
                        else next = null;

                        setSortState(prev => ({ ...prev, [key]: next }));
                        onSort?.(key, next);
                      }}
                      sx={{ p: 0.2, color: sort ? "#5b8ffe" : "rgba(255,255,255,0.6)" }}
                    >
                      {sort === "desc"
                        ? <ArrowDownwardIcon sx={{ fontSize: 13 }} />
                        : <ArrowUpwardIcon sx={{ fontSize: 13 }} />}
                    </IconButton>

                    {/* FILTER */}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setActiveCol(key);
                        setSearchVal("");
                      }}
                      sx={{ p: 0.2, color: "rgba(255, 253, 253, 0.77)", "&:hover": { color: "#5b8ffe" } }}
                    >
                      <FilterListIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                  </Stack>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>

        {/* ================= BODY ================= */}
        <TableBody>
          {rows.length === 0 ? (
  <TableRow>
    <TableCell colSpan={visibleKeys.length} align="center" sx={{ py: 6 }}>
      <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>
        NO DATA FOUND
      </Typography>
    </TableCell>
  </TableRow>
) : (
  rows.map((row, index) => (
            <TableRow
              key={index}
              component={motion.tr}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02, duration: 0.3 }}
              sx={{
                transition: 'background 0.2s',
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.04)",
                },
                "& td": {
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  color: "rgba(255,255,255,0.85)"
                },
              }}
            >
              {visibleKeys.map((key) => (
                <TableCell key={key} sx={{ py: 1.6 }}>
                  {key === "status" ? (
                    <Chip
                      label={getStatusStyle(row.status).label}
                      size="small"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 900,
                        height: 24,
                        bgcolor: getStatusStyle(row.status).glow,
                        color: getStatusStyle(row.status).color,
                        border: `1px solid ${getStatusStyle(row.status).border}`,
                        "& .MuiChip-label": { px: 1 }
                      }}
                    />
                  ) : key === "date" ? (
                    <Box>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                        {row.date || "-"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                        {row.time || "-"}
                      </Typography>
                    </Box>
                  ) : key === "system_version" ? (
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#4dabf7" }}>
                      {decodeSystemVersion(row[key])}
                    </Typography>
                  ) : key === "relay" ? (
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: theme.palette.primary.light }}>
                      {row[key]}
                    </Typography>
                  ) : hexFields.includes(key) ? (
                    <Typography sx={{
                      fontSize: "0.8rem",
                      fontFamily: "'Roboto Mono', monospace",
                      color: "rgba(255,255,255,0.5)"
                    }}>
                      0x{row[key]?.toString(16).toUpperCase().padStart(2, '0') || "00"}
                    </Typography>
                  ) : (
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      {row[key]}
                    </Typography>
                    
                  )}
                </TableCell>
              ))}
            </TableRow>
          )))}
        </TableBody>
      </Table>
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