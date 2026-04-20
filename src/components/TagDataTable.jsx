import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Stack,
  IconButton,
  Popover,
  TextField,
} from "@mui/material";

import { motion } from "framer-motion";
import { useState } from "react";
import React from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Select, MenuItem } from "@mui/material";
import { formatTagCellValue } from "../utils/tagFormatter";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { TAG_ALL_COLUMNS, TAG_TYPE_COLUMNS } from "../constants/tagColumns";
export default function DMIEventsTable({
  rows = [],
  columns = [],
  visibleKeys = [],
  formatter = formatTagCellValue,
  onColumnSearch,
  onSort,
}) {
  const COMMON_KEYS = [
    "event_time",
    "kavach_id",
    "nms_id",
    "message_sequence",
    "version",
    "tag_count",
  ];

  const visibleColumns = columns.filter(
    (col) => visibleKeys.includes(col.key) && COMMON_KEYS.includes(col.key),
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeCol, setActiveCol] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [sortState, setSortState] = useState({});
  const [, forceUpdate] = useState(0);
  const [openRows, setOpenRows] = useState({});

  function TagInnerTable({ tags = [], visibleKeys }) {
    if (!tags.length) return null;

    const TYPE_MAP = {
      9: "NORMAL",
      10: "LC",
      11: "ADJACENT",
      12: "JUNCTION",
    };

    const tagTypeRaw = tags[0]?.tag_type;
    const tagType = TYPE_MAP[Number(tagTypeRaw)] || "UNKNOWN";

    const allowedKeys = (TAG_TYPE_COLUMNS[tagType] || []).filter((k) =>
      visibleKeys.includes(k),
    );

    const columns = allowedKeys.map((key) => {
      const col = TAG_ALL_COLUMNS.find((c) => c.key === key);
      return {
        key,
        label: col?.label || key,
      };
    });

    return (
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table
          size="small"
          sx={{
            minWidth: 1000,
            borderCollapse: "collapse",
            "& td, & th": {
              border: "none !important",
            },
            "& .MuiTableCell-root": {
              borderBottom: "none !important",
            },
          }}
        >
          {/* HEADER */}
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{
                    color: "#4dabf7",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                    padding: "4px 8px",
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* BODY */}
          <TableBody>
            {tags.map((tag, i) => (
              <TableRow
                key={i}
                sx={{
                  background: "transparent",
                  "& td": {
                    border: "none !important",
                    padding: "4px 8px",
                  },
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{ color: "#fff", whiteSpace: "nowrap" }}
                  >
                    {formatter(tag, col.key)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer
      component={Box}
      sx={{
        bgcolor: "rgba(18, 18, 18, 0.4)",
        overflowX: "auto",
        "&::-webkit-scrollbar": { height: "8px" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "rgba(255,255,255,0.1)",
          borderRadius: "10px",
        },
      }}
    >
      <Table size="small" stickyHeader>
        {/* ================= HEADER ================= */}
        <TableHead>
          <TableRow>
            {visibleColumns.map((col, colIndex) => (
              <TableCell
                key={col.key}
                sx={{
                  bgcolor: "#1a1a1a",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.4)",
                  borderBottom: "2px solid rgba(255,255,255,0.05)",
                  py: 2,
                  whiteSpace: "nowrap",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {/* SAME SPACE AS ROW ICON */}
                  {colIndex === 0 && (
                    <Box sx={{ width: 32, display: "flex" }} />
                  )}

                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      lineHeight: 1,
                    }}
                  >
                    {col.label.toUpperCase()}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={() => {
                      let next;

                      if (!sortState[col.key]) next = "asc";
                      else if (sortState[col.key] === "asc") next = "desc";
                      else next = null;

                      setSortState((prev) => ({ ...prev, [col.key]: next }));
                      onSort?.(col.key, next);
                    }}
                    sx={{
                      p: 0.2,
                      color: sortState[col.key]
                        ? "#5b8ffe"
                        : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {sortState[col.key] === "desc" ? (
                      <ArrowDownwardIcon sx={{ fontSize: 13 }} />
                    ) : (
                      <ArrowUpwardIcon sx={{ fontSize: 13 }} />
                    )}
                  </IconButton>

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
                      "&:hover": { color: "#5b8ffe" },
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
              <React.Fragment key={i}>
                {/* ================= MAIN ROW ================= */}
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
                      color: "rgba(255,255,255,0.8)",
                    },
                  }}
                >
                  {/*  NORMAL PACKET DATA */}
                  {visibleColumns.map((col, colIndex) => (
                    <TableCell key={col.key}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        {/*  MOVE ARROW INTO FIRST COLUMN */}
                        {colIndex === 0 && (
                          <IconButton
                            size="small"
                            sx={{
                              color: "#c5c7c8",
                              p: 0.3,
                              width: 32,
                              height: 32,
                            }}
                            onClick={() =>
                              setOpenRows((prev) => ({
                                ...prev,
                                [i]: !prev[i],
                              }))
                            }
                          >
                            {openRows[i] ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        )}

                        <Typography sx={{ fontSize: "0.9rem" }}>
                          {formatter(row, col.key)}
                        </Typography>
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>

                {/* ================= EXPANDED TAGS ================= */}
                {openRows[i] && (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 1}>
                      <Box sx={{ px: 1, py: 1, bgcolor: "#0d1117" }}>
                        {(() => {
                          const TYPE_MAP = {
                            9: "NORMAL",
                            10: "LC",
                            11: "ADJACENT",
                            12: "JUNCTION",
                          };

                          const grouped = row.tags.reduce((acc, tag) => {
                            const type =
                              TYPE_MAP[Number(tag.tag_type)] || "UNKNOWN";
                            if (!acc[type]) acc[type] = [];
                            acc[type].push(tag);
                            return acc;
                          }, {});

                          return Object.entries(grouped).map(
                            ([type, tags], idx) => (
                              <Box key={idx} sx={{ mb: 2 }}>
                                <Typography
                                  sx={{
                                    fontWeight: 800,
                                    mb: 1,
                                    mt: idx !== 0 ? 2 : 0,
                                    color: "#e3e6e8",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {type} TAG
                                </Typography>

                                <TagInnerTable tags={tags} visibleKeys={visibleKeys} />
                              </Box>
                            ),
                          );
                        })()}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={visibleColumns.length + 1}
                align="center"
                sx={{ py: 10 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.2)",
                    letterSpacing: 2,
                    fontWeight: 700,
                  }}
                >
                  NO TAG DATA DETECTED
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
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ p: 1.5, minWidth: 180 }}>
          <Typography
            sx={{
              fontSize: "0.85rem",
              color: "#74c0fc",
              mb: 1,
            }}
          >
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
                "& fieldset": { borderColor: "#444" },
              },
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
