import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useLocation } from "react-router-dom";
import { Box, Card, CardContent, Typography, LinearProgress, Stack, useTheme, useMediaQuery, alpha, } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import MovingIcon from "@mui/icons-material/Moving";
import { useOutletContext } from "react-router-dom";
import RowsPerPageControl from "../components/RowsPerPageControl";
import { formatCellValue } from "../utils/locoFormatters";
import LocoMovementTable from "../components/LocoMovementTable";
import PaginationControls from "../components/PaginationControls";
import ColumnFilterDialog from "../components/ColumnFilterDialog";

import useTableFilter from "../hooks/useFilterTable";
import { useAppContext } from "../context/AppContext";

import {
  ONBOARD_COLUMNS,
  ACCESS_COLUMNS,
} from "../constants/locoColumns";

const LocoMovement = forwardRef(({ tableType }, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { selectedFile } = useOutletContext();
  const location = useLocation();
  const [dashboardFilter, setDashboardFilter] = useState(location.state?.dashboardFilter || null);

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(false);
  const [allRows, setAllRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [fileBuffer, setFileBuffer] = useState(null);

  /* ================= CONTEXT ================= */
  const { fromDate, toDate, isDateRangeValid } = useAppContext();
  const { filteredRows, setFilter, clearFilters } = useTableFilter(rows);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setRowsPerPage(isMobile ? 6 : 10);
  }, [isMobile]);

  const columns = tableType === "access" ? ACCESS_COLUMNS : ONBOARD_COLUMNS;
  const [visibleKeys, setVisibleKeys] = useState(columns.map(c => c.key));

  const FIELD_MAP = {
    loco_id: "source_loco_id",

    // BASIC
    date: "date",
    time: "time",
    packet_type: "packet_type",

    // FRAME
    frame_number: "frame_number",

    // LOCATION
    absolute_location: "absolute_loco_location",

    // TRAIN
    train_length: "train_length_m",
    speed: "train_speed_kmph",

    // MOVEMENT
    loco_direction: "movement_direction",
    loco_mode: "loco_mode",
    emergency_status: "emergency_status",

    // RFID
    rfid: "last_rfid_tag_id",

    // TIN
    tin: "tin",

    // BRAKE
    brake_mode: "brake_applied_status",

    // SIGNAL
    signal_type: "sig_type",
    current_signal_aspect: "cur_signal_aspect",
    next_signal_aspect: "next_signal_aspect",

    // EXTRA IMPORTANT (NEW)
    loco_random_number: "loco_random_number",
    signal_override: "signal_override_status",
    source_loco_version: "source_loco_version",

    // HEALTH / FAULT
    faults: "loco_health_status",
  };

  useEffect(() => {
    if (!selectedFile) return;
    selectedFile.arrayBuffer().then(buf => {
      setFileBuffer(buf);
    });
  }, [selectedFile]);

  /* ================= RESET ON TABLE SWITCH ================= */
  // Auto-refresh when file changes
  useEffect(() => {
    if (fileBuffer && location.state?.autoGenerate && selectedFile) {
      // Reset and regenerate with new file
      setRows([]);
      setAllRows([]);
      clearFilters();
      setPage(1);

      // Small delay to ensure file buffer is ready
      setTimeout(() => {
        generate();
      }, 300);
    }
  }, [fileBuffer]); // Dependency: when fileBuffer updates, trigger refresh
  useEffect(() => {
    if (!selectedFile || rows.length === 0) return;
    // console.log(" New packets - refreshing loco movement...");
    setPage(1);
    generate();
  }, [selectedFile]);
  useEffect(() => {
    if (!allRows.length) return;

    let filtered =
      tableType === "access"
        ? allRows.filter(r => Number(r.packet_type) === 13)
        : allRows.filter(r => Number(r.packet_type) === 10);

    if (dashboardFilter) {
      const { field, value } = dashboardFilter;
      const values = Array.isArray(value) ? value.map(String) : [String(value)];
      filtered = filtered.filter(r => values.includes(String(r[field])));
    }

    setRows(filtered);
    if (!dashboardFilter) {
      clearFilters();
    }
    setPage(1);
  }, [tableType, allRows]);

  /* ================= DATA FETCH ================= */
  const generate = async () => {
    if (!fromDate || !toDate) {
      alert("Please select From and To date");
      return;
    }

    if (!isDateRangeValid) {
      alert("Invalid date range");
      return;
    }

    setLoading(true);
    setRows([]);
    clearFilters();
    // setDashboardFilter(null);

    try {
      const normalizeDate = (v) => v && v.length === 16 ? `${v}:00` : v;
      const encodedFrom = encodeURIComponent(normalizeDate(fromDate));
      const encodedTo = encodeURIComponent(normalizeDate(toDate));
      const API_BASE = import.meta.env.VITE_API_BASE_URL;

      let buffer = fileBuffer;
      if (!buffer) {
        buffer = await selectedFile.arrayBuffer();
        setFileBuffer(buffer);
      }

      const res = await fetch(
        `${API_BASE}/api/loco-movement/by-date?from=${encodedFrom}&to=${encodedTo}`,
        {
          method: "POST",
          body: buffer,
          headers: { "Content-Type": "application/octet-stream" },
        }
      );

      const json = await res.json();
      if (json.success === false) {
        throw new Error(json.error || "Backend error");
      }

      const mappedRows = json.data.map((r, idx) => {
        const dt = new Date(r.event_time);
        return {
          id: idx + 1,
          date: dt.toISOString().slice(0, 10),
          time: dt.toTimeString().slice(0, 8),
          ...r,
        };
      });
      let finalRows = mappedRows;

      if (dashboardFilter) {
        const { field, value } = dashboardFilter;
        finalRows = mappedRows.filter(r => String(r[field]) === String(value));
      }

      setAllRows(mappedRows);
      setRows(finalRows);
      setPage(1);
      return mappedRows;
    } catch (err) {
      console.error("Loco Movement fetch error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setRows([]);
    setPage(1);
    clearFilters();
  };

  useImperativeHandle(ref, () => ({
    generate,
    clear,
    setFilter,
    clearFilters,
    getFilteredRows: () => filteredRows,
    getAllRows: () => allRows,
    getVisibleColumns: () => columns.filter(c => visibleKeys.includes(c.key)),
    openColumnDialog: () => setColumnDialogOpen(true),
    searchByLoco: (value) => setFilter("source_loco_id", value),
    applyAdvancedFilters: (filters) => {
      if (!filters) return;

      clearFilters();

      /* ================= LOCO FILTER ================= */
      if (filters.locos?.length) {
        setFilter("source_loco_id", (val) =>
          filters.locos.includes(String(val))
        );
      }

      /* ================= DYNAMIC EVENTS ================= */
      if (filters.eventType === "dynamic" && filters.dynamicEvents?.length) {

        setFilter("dynamic_or_filter", (val, row) => {

          const idx = allRows.findIndex(r => r.id === row.id);
          if (idx <= 0) return true;

          const prev = allRows[idx - 1];

          return filters.dynamicEvents.some(field => {

            const backendField = FIELD_MAP[field] || field;

            const currVal = row[backendField];
            const prevVal = prev[backendField];

            if (currVal === undefined || prevVal === undefined) return false;

            return String(currVal) !== String(prevVal);

          });

        });

      }

      /* ================= STATIC EVENTS ================= */
      if (filters.eventType === "static" && filters.staticEvents) {

        const VALUE_MAP = {
          loco_direction: {
            "Nominal": "1",
            "Reverse": "2"
          },
          emergency_general_sos: {
            "No SOS": "0",
            "SOS": "1"
          },
          emergency_loco_sos: {
            "No SOS": "0",
            "SOS": "1"
          }
        };

        Object.entries(filters.staticEvents).forEach(([field, values]) => {
          if (!values.length) return;

          const backendField = FIELD_MAP[field] || field;

          if (backendField === "loco_health_status") {
            setFilter(backendField, (val, row) => {
              const formatted = String(formatCellValue(row, backendField) ?? "").toLowerCase();

              return values.some(v =>
                formatted.includes(String(v).toLowerCase())
              );
            });
            return;
          }

          const mappedValues = values.map(v =>
            VALUE_MAP[field]?.[v] ?? v
          );

          setFilter(backendField, (val, row) => {
            const raw = String(row[backendField] ?? "").toLowerCase();
            const formatted = String(formatCellValue(row, backendField) ?? "").toLowerCase();

            const match = mappedValues.some(v =>
              raw.includes(String(v).toLowerCase()) ||
              formatted.includes(String(v).toLowerCase())
            );

            // IMPORTANT: fallback (prevents full table wipe)
            return match || mappedValues.length === 0;
          });
        });
      }

      /* ================= COMMUNICATION ================= */
      if (filters.bothComm) {
        setFilter("packet_type", (val, row) => {

          const hasLoco = allRows.some(r =>
            r.source_loco_id === row.source_loco_id &&
            r.packet_type === 10 &&
            r.event_time === row.event_time
          );

          const hasStation = allRows.some(r =>
            r.source_loco_id === row.source_loco_id &&
            r.packet_type === 13 &&
            r.event_time === row.event_time
          );

          return hasLoco && hasStation;
        });

      }
    },
  }));

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  //   useEffect(() => {
  //   if (!dashboardFilter || !rows.length) return;

  //   const { field, value } = dashboardFilter;

  //   setFilter(field, value);

  //   // IMPORTANT: remove dashboard filter after applying once
  //   setDashboardFilter(null);

  // }, [rows.length]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ color: "#fff" }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <MovingIcon sx={{ color: "#4dabf7", fontSize: "1rem" }} />
          <Typography fontWeight={800} fontSize="1.2rem" sx={{ letterSpacing: 1, color: "#eee" }}>
            LOCO MOVEMENT
          </Typography>
        </Stack>

        {filteredRows.length > 0 && (
          <RowsPerPageControl
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            setPage={setPage}
          />
        )}
      </Box>

      <AnimatePresence mode="wait">
        {loading ? (
          <Box key="loader" sx={{ width: '100%', mb: 1 }}>
            <LinearProgress
              sx={{
                height: 3,
                borderRadius: 5,
                bgcolor: alpha("#4dabf7", 0.1),
                "& .MuiLinearProgress-bar": {
                  background: `linear-gradient(90deg, #0b4dbb, #4dabf7)`
                }
              }}
            />
          </Box>
        ) : (
          <motion.div
            key="table-content"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card
              variant="outlined"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.02)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: 3,
                backdropFilter: "blur(10px)"
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <LocoMovementTable
                  rows={paginatedRows}
                  columns={columns}
                  visibleKeys={visibleKeys}
                  onColumnSearch={(key, value) => {
                    if (value) setFilter(key, value);
                    else setFilter(key, ""); // clear only that column's filter
                  }}
                  onSort={(key, direction) => {

                    // RESET → ORIGINAL DATA
                    if (!direction) {
                      let original =
                        tableType === "access"
                          ? allRows.filter(r => Number(r.packet_type) === 13)
                          : allRows.filter(r => Number(r.packet_type) === 10);

                      if (dashboardFilter) {
                        const { field, value } = dashboardFilter;
                        const values = Array.isArray(value) ? value.map(String) : [String(value)];
                        original = original.filter(r => values.includes(String(r[field])));
                      }

                      setRows(original);
                      return;
                    }

                    // SORT
                    const sorted = [...rows].sort((a, b) => {
                      const av = a[key] ?? "";
                      const bv = b[key] ?? "";
                      return direction === "asc"
                        ? String(av).localeCompare(String(bv), undefined, { numeric: true })
                        : String(bv).localeCompare(String(av), undefined, { numeric: true });
                    });

                    setRows(sorted);
                  }}
                />
                {filteredRows.length === 0 && !loading && (
                  <Box sx={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,0.3)" }}>
                      NO MOVEMENT DATA FOUND
                    </Typography>
                  </Box>
                )}

              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredRows.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 1,
            p: 1,
            bgcolor: "rgba(255,255,255,0.02)",
            borderRadius: 2
          }}
        >
          <PaginationControls
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            size="small"
          />
        </Box>
      )}

      <ColumnFilterDialog
        open={columnDialogOpen}
        column="Columns"
        values={columns.map(c => c.label)}
        selectedValues={visibleKeys.map(
          key => columns.find(c => c.key === key)?.label
        )}
        onClose={() => setColumnDialogOpen(false)}
        onApply={(labels) => {
          setVisibleKeys(
            columns
              .filter(c => labels.includes(c.label))
              .map(c => c.key)
          );
          setColumnDialogOpen(false);
        }}
      />
    </Box>
  );
});

export default LocoMovement;