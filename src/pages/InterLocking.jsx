import { Box, Card, CardContent, Typography, Stack, Select, MenuItem, LinearProgress, alpha, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useOutletContext } from "react-router-dom";
import RowsPerPageControl from "../components/RowsPerPageControl";
import useTableFilter from "../hooks/useFilterTable";
import PaginationControls from "../components/PaginationControls";
import NoResult from "../components/NoResult";
import InterlockingTable from "../components/InterLockingTable";
import ColumnFilterDialog from "../components/ColumnFilterDialog";
import { INTERLOCKING_COLUMNS } from "../constants/interlockingColumns";

const Interlocking = forwardRef((props, ref) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const [stations, setStations] = useState([]);
  const [station, setStation] = useState("");

  const [relay, setRelay] = useState("");
  const [relayOptions, setRelayOptions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [allRows, setAllRows] = useState([]);
  const [rows, setRows] = useState([]);

  const { filteredRows, setFilter, clearFilters } = useTableFilter(rows);

  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [page, setPage] = useState(1);

  const [hasGenerated, setHasGenerated] = useState(false);
  const { fromDate, toDate, isDateRangeValid } = useAppContext();
  const { selectedFile } = useOutletContext();

  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const DEFAULT_VISIBLE = [
    "date",
    "frameNo",
    "station",
    "system_version",
    "relay",
    "serial",
    "status"
  ];

  const [visibleKeys, setVisibleKeys] = useState(DEFAULT_VISIBLE);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  /* ===================== STYLING ===================== */
  const selectStyle = {
    height: 38,
    bgcolor: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    color: "#fff",
    borderRadius: "8px",
    fontSize: "0.85rem",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255, 255, 255, 0.1)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "& .MuiSvgIcon-root": { color: "rgba(255, 255, 255, 0.7)" },
  };

  const menuProps = {
    PaperProps: {
      sx: {
        bgcolor: "#1a1a1a",
        backgroundImage: "none",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#fff",
        "& .MuiMenuItem-root": {
          fontSize: "0.85rem",
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.08)",
          },
          "&.Mui-selected": {
            bgcolor: alpha(theme.palette.primary.main, 0.2),
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.3),
            },
          },
        },
      },
    },
  };
  /* ===================== FETCH STATIONS ===================== */
  const fetchStations = async () => {
    if (!fromDate || !toDate || !selectedFile) return;

    try {
      const normalize = v => (v.length === 16 ? `${v}:00` : v);
      const from = encodeURIComponent(normalize(fromDate));
      const to = encodeURIComponent(normalize(toDate));

      const res = await fetch(
        `${API_BASE}/api/interlocking/stations?from=${from}&to=${to}`,
        { method: "POST", body: selectedFile }
      );

      const json = await res.json();
      if (json.success) {
        setStations(json.data || []);
      }
    } catch (err) {
      console.error("[INTERLOCKING] Station fetch error:", err);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [fromDate, toDate, selectedFile]);

  /* ===================== FETCH RELAYS ===================== */
  useEffect(() => {
    if (!station || !fromDate || !toDate || !selectedFile) return;

    const fetchRelays = async () => {
      try {
        const normalize = v => (v.length === 16 ? `${v}:00` : v);
        const from = encodeURIComponent(normalize(fromDate));
        const to = encodeURIComponent(normalize(toDate));

        const res = await fetch(
          `${API_BASE}/api/interlocking/report?from=${from}&to=${to}&station=${station}&page=1`,
          { method: "POST", body: selectedFile }
        );

        const json = await res.json();
        if (!json.success) return;

        const relays = [...new Set((json.data || []).map(r => r.relay))];
        setRelayOptions(relays);
        setRelay("ALL");
        setRows([]);
        setHasGenerated(false);
      } catch (e) {
        console.error("Relay fetch failed", e);
      }
    };

    fetchRelays();
  }, [station, selectedFile, fromDate, toDate]);

  /* ===================== GENERATE ===================== */
  const generate = async () => {
    if (!station || !relay || !isDateRangeValid) return;

    setHasGenerated(true);
    setLoading(true);

    try {
      const normalize = v => (v.length === 16 ? `${v}:00` : v);
      const from = encodeURIComponent(normalize(fromDate));
      const to = encodeURIComponent(normalize(toDate));

      const res = await fetch(
        `${API_BASE}/api/interlocking/report?from=${from}&to=${to}&station=${station}&page=1`,
        { method: "POST", body: selectedFile }
      );

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const mappedRows = (json.data || []).map((r, idx) => ({
        id: idx + 1,
        ...r,
        relayId: r.relay,
      }));

      setAllRows(mappedRows);
      setPage(1);
    } catch (err) {
      console.error("[INTERLOCKING] API error:", err);
      setRows([]);
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== FILTER LOGIC ===================== */
  useEffect(() => {
    let filtered = [...allRows];

    if (relay !== "ALL") {
      filtered = filtered.filter(r => r.relayId === relay);
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(r => {
        const s = r.status?.toUpperCase() || "";
        return statusFilter === "PICKED" ? s.includes("PICKED") : s.includes("DROP");
      });
    }

    setRows(filtered);
    setPage(1);
  }, [relay, statusFilter, allRows]);

  const clear = () => {
    setRows([]);
    setAllRows([]);
    setRelay("");
    setStatusFilter("ALL");
    setHasGenerated(false);
    clearFilters();
  };

  useImperativeHandle(ref, () => ({
    generate,
    clear,
    setFilter,
    clearFilters,
    getFilteredRows: () => filteredRows,
    getAllRows: () => allRows,
    getVisibleColumns: () => INTERLOCKING_COLUMNS.filter(c => visibleKeys.includes(c.key)),
    openColumnDialog: () => setColumnDialogOpen(true),
  }));

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const paginatedRows = filteredRows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const showNoResult = hasGenerated && !loading && filteredRows.length === 0;
  return (
    <Box
      p={1}
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ===== GLASS FILTER BAR ===== */}
      <Box
        sx={{
          mb: 0.8,
          p: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          bgcolor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "10px",
          gap: 1
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Select
            size="small"
            value={station}
            onChange={(e) => setStation(e.target.value)}
            displayEmpty
            sx={{ ...selectStyle, width: 220 }}
            MenuProps={menuProps}
          >
            <MenuItem value="" disabled sx={{ color: "rgba(255,255,255,0.3)" }}>Select Station</MenuItem>
            {stations.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={relay}
            onChange={(e) => setRelay(e.target.value)}
            displayEmpty
            sx={{ ...selectStyle, width: 220 }}
            disabled={!station || !relayOptions.length}
            MenuProps={menuProps}
          >
            <MenuItem value="ALL">All Relays</MenuItem>
            {relayOptions.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ ...selectStyle, width: 180 }}
            disabled={!allRows.length}
            MenuProps={menuProps}
          >
            <MenuItem value="ALL">All Status</MenuItem>
            <MenuItem value="PICKED">Picked Up</MenuItem>
            <MenuItem value="DROPPED">Dropped Down</MenuItem>
          </Select>
        </Stack>

        {filteredRows.length > 0 && (
          <RowsPerPageControl
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            setPage={setPage}
          />
        )}
      </Box>

      {/* ===== RESULT AREA ===== */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ height: 4, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", mt: 1, display: 'block', letterSpacing: 1 }}>
                PROCESSING INTERLOCKING TELEMETRY...
              </Typography>
            </Box>
          </motion.div>
        ) : hasGenerated ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              sx={{
                borderRadius: "16px",
                bgcolor: "rgba(18, 18, 18, 0.4)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                overflow: "hidden"
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <InterlockingTable
                  rows={paginatedRows}
                  visibleKeys={visibleKeys}
                  onColumnSearch={(key, value) => {
                    if (value) setFilter(key, value);
                    else setFilter(key, "");
                  }}
                  onSort={(key, direction) => {

                    if (!direction) {
                      let original = [...allRows];

                      if (relay !== "ALL") {
                        original = original.filter(r => r.relayId === relay);
                      }

                      if (statusFilter !== "ALL") {
                        original = original.filter(r => {
                          const s = r.status?.toUpperCase() || "";
                          return statusFilter === "PICKED"
                            ? s.includes("PICKED")
                            : s.includes("DROP");
                        });
                      }

                      setRows(original);
                      return;
                    }

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
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "center",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)"
                  }}
                >
                  <PaginationControls page={page} setPage={setPage} totalPages={totalPages} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ) : showNoResult ? (
          <motion.div key="no-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <NoResult />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ColumnFilterDialog
        open={columnDialogOpen}
        column="Table Columns"
        values={INTERLOCKING_COLUMNS.map(c => c.label)}
        selectedValues={visibleKeys.map(key => INTERLOCKING_COLUMNS.find(c => c.key === key)?.label)}
        onClose={() => setColumnDialogOpen(false)}
        onApply={(labels) => {
          const keys = INTERLOCKING_COLUMNS
            .filter(c => labels.includes(c.label))
            .map(c => c.key);
          setVisibleKeys(keys);
          setColumnDialogOpen(false);
        }}
      />
    </Box>
  );
});

export default Interlocking;