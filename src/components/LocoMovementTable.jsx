import { useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Typography,
  Box,
  Chip,
  alpha,
  Popover,
  TextField,
  IconButton,
  Stack,
} from "@mui/material";
import {
  decodeDirection,
  decodeLocoMode,
  formatCellValue,
  decodeTIN,
  decodeLocoHealth,
} from "../utils/locoFormatters";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FilterListIcon from "@mui/icons-material/FilterList";
import { formatRFID } from "../utils/locoFormatters";
export default function LocoMovementTable({
  rows = [],
  columns = [],
  visibleKeys = [],
  onSort, // (key, direction) => void
  onColumnSearch, // (key, value) => void
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeCol, setActiveCol] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [sortState, setSortState] = useState({}); // { colKey: "asc"|"desc" }
  const visibleColumns = columns.filter((col) => visibleKeys.includes(col.key));

  const renderDirection = (dir) => {
    const d = decodeDirection(dir);
    return (
      <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#4dabf7" }}>
        {d}
      </Typography>
    );
  };

  const getModeChip = (mode) => {
    const modeText = decodeLocoMode(mode);
    return (
      <Chip
        label={modeText}
        size="small"
        sx={{
          height: 30,
          fontSize: "0.9rem",
          fontWeight: 800,
          textTransform: "uppercase",
          borderRadius: "6px",
          bgcolor: alpha("#4dabf7", 0.1),
          color: "#4dabf7",
          border: `1px solid ${alpha("#4dabf7", 0.3)}`,
          "& .MuiChip-label": { px: 1 },
        }}
      />
    );
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "transparent" }}>
      <TableContainer
        sx={{
          width: "100%",
          overflowX: "auto",
          maxHeight: "70vh",
          "&::-webkit-scrollbar": { height: 8, width: 8 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 4,
          },
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            width: "100%",
            tableLayout: "auto",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <TableHead>
            <TableRow>
              {visibleColumns.map((col) => {
                const isApproaching = col.label
                  .toLowerCase()
                  .includes("approaching");
                const sort = sortState[col.key];
                return (
                  <TableCell
                    key={col.key}
                    sx={{
                      px: 1.5,
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: 900,
                      color: "rgba(255,255,255,0.7)",
                      bgcolor: "#12161c",
                      whiteSpace: isApproaching ? "normal" : "nowrap",
                      letterSpacing: 0.5,
                      borderBottom: "2px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography
                        sx={{
                          fontSize: "1rem",
                          fontWeight: 900,
                          color: "rgba(255,255,255,0.7)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isApproaching
                          ? "APPROACHING STATION"
                          : col.label.toUpperCase()}
                      </Typography>

                      {/* SORT BUTTON */}
                      <IconButton
                        size="small"
                        onClick={() => {
                          let next;

                          if (!sort) next = "asc";
                          else if (sort === "asc") next = "desc";
                          else next = null;

                          setSortState((prev) => ({
                            ...prev,
                            [col.key]: next,
                          }));

                          onSort?.(col.key, next);
                        }}
                        sx={{
                          p: 0.2,
                          color: sort ? "#5b8ffe" : "rgba(255, 255, 255, 0.78)",
                        }}
                      >
                        {sort === "desc" ? (
                          <ArrowDownwardIcon sx={{ fontSize: 13 }} />
                        ) : (
                          <ArrowUpwardIcon sx={{ fontSize: 13 }} />
                        )}
                      </IconButton>

                      {/* FILTER BUTTON */}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setActiveCol(col.key);
                          setSearchVal("");
                        }}
                        sx={{
                          p: 0.2,
                          color: "rgba(255, 253, 253, 0.77)",
                          "&:hover": { color: "#5b8ffe" },
                        }}
                      >
                        <FilterListIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length
              ? rows.map((row, i) => (
                  <TableRow
                    key={row.id || i}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(77, 171, 247, 0.04)",
                      },
                      transition: "background-color 0.2s ease",
                      "& td": {
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      },
                    }}
                  >
                    {visibleColumns.map((col) => (
                      <TableCell
                        key={col.key}
                        sx={{
                          px: 1.5,
                          py: 2,
                          color: "rgba(255,255,255,0.85)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col.key === "loco_health_status" ? (
                          <Typography
                            sx={{ fontSize: "1rem", color: "#1de9b6" }}
                          >
                            {decodeLocoHealth(row[col.key], row.frame_number)}
                          </Typography>
                        ) : col.key === "tin" ? (
                          <Typography
                            sx={{
                              fontSize: "1rem",
                              fontWeight: 600,
                              fontFamily: "JetBrains Mono, monospace",
                            }}
                          >
                            {decodeTIN(row[col.key])}
                          </Typography>
                        ) : col.key === "movement_direction" ? (
                          renderDirection(row[col.key])
                        ) : col.key === "loco_mode" ? (
                          getModeChip(row[col.key])
                        ) : col.key === "date" ? (
                          <Box>
                            <Typography
                              sx={{
                                fontSize: "1rem",
                                fontWeight: 700,
                                color: "#fff",
                              }}
                            >
                              {row.date}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.9rem",
                                color: "rgba(255,255,255,0.4)",
                              }}
                            >
                              {row.time}
                            </Typography>
                          </Box>
                        ) : col.key === "rfid_count" ? (
                          <Typography
                            sx={{
                              fontSize: "0.9rem",
                              fontWeight: 700,
                              color: "#4dabf7",
                            }}
                          >
                            {row[col.key]}
                          </Typography>
                        ) : col.key === "current_rfid" ? (
                          <Typography
                            sx={{ fontSize: "0.9rem", fontWeight: 600 }}
                          >
                            {formatRFID(row[col.key])}
                          </Typography>
                        ) : col.key === "expected_rfids" ? (
                          <Typography
                            sx={{ fontSize: "0.9rem", color: "#ffd54f" }}
                          >
                            {row.expected_rfids
                              ? row.expected_rfids
                                  .split(",")
                                  .map((v) => v.trim())
                                  .map((tag, i, arr) => {
                                    const numTag = Number(tag);
                                    const isCurrent =
                                      Number(row.current_rfid) === numTag;

                                    const isRouteChanged =
                                      row.route_changed === true;

                                    const isMissing = isRouteChanged
                                      ? false
                                      : row.missing_rfids?.includes(numTag);

                                    return (
                                      <span key={i}>
                                        <span
                                          style={{
                                            color: (() => {
                                              if (isRouteChanged) {
                                                return isCurrent
                                                  ? "#25dcaf"
                                                  : "#ffd54f";
                                              }

                                              if (isCurrent) return "#25dcaf";
                                              if (isMissing) return "#ff0000";

                                              return "#ffd54f";
                                            })(),

                                            fontWeight: (() => {
                                              if (isRouteChanged) {
                                                return isCurrent ? 800 : 400;
                                              }

                                              if (isCurrent) return 800;
                                              if (isMissing) return 700;

                                              return 400;
                                            })(),
                                          }}
                                        >
                                          {formatRFID(numTag)}
                                        </span>
                                        {i !== arr.length - 1 && ", "}
                                      </span>
                                    );
                                  })
                              : "-"}
                          </Typography>
                        ) : col.key === "condition" ? (
                          <Typography
                            sx={{
                              fontSize: "0.9rem",
                              fontWeight: 700,
                              color:
                                row[col.key] === "RFID Mismatch"
                                  ? "#ff0000"
                                  : row[col.key] === "Route Changed"
                                    ? "#c25454"
                                    : "#25dcaf",
                            }}
                          >
                            {row[col.key]}
                          </Typography>
                        ) : (
                          <Typography
                            sx={{ fontSize: "1rem", fontWeight: 500 }}
                          >
                            {formatCellValue(row, col.key)}
                          </Typography>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{
          sx: { bgcolor: "#1e2227", border: "1px solid #333", borderRadius: 2 },
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
            onKeyDown={(e) => {
              if (e.key === "Escape") setAnchorEl(null);
            }}
            sx={{
              input: { color: "#fff", fontSize: "0.85rem" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#444" },
              },
            }}
          />
          <Stack direction="row" justifyContent="flex-end" mt={1}>
            {onColumnSearch && (
              <IconButton
                size="small"
                onClick={() => {
                  setSearchVal("");
                  onColumnSearch?.(activeCol, "");
                }}
                sx={{
                  p: 0.2,
                  color: "rgba(255, 253, 253, 0.77)",
                  "&:hover": { color: "#5b8ffe" },
                }}
              >
                <FilterListIcon sx={{ fontSize: 13 }} />
              </IconButton>
            )}
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
}
