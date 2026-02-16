import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Select,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useOutletContext } from "react-router-dom";
import RowsPerPageControl from "../components/RowsPerPageControl";

import PaginationControls from "../components/PaginationControls";
import NoResult from "../components/NoResult";
import InterlockingTable from "../components/InterLockingTable";
import ColumnFilterDialog from "../components/ColumnFilterDialog";
import { INTERLOCKING_COLUMNS } from "../constants/interlockingColumns";

const Interlocking = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(false);

  const [stations, setStations] = useState([]);
  const [station, setStation] = useState("");

  const [relay, setRelay] = useState("");
  const [relayOptions, setRelayOptions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [allRows, setAllRows] = useState([]);
  const [rows, setRows] = useState([]);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);


  const [hasGenerated, setHasGenerated] = useState(false);

  const { fromDate, toDate, logDir, isDateRangeValid } = useAppContext();
  const { selectedFile } = useOutletContext();


  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const DEFAULT_VISIBLE = [
    "date",
    "time",
    "frameNo",
    "station",
    "relay",
    "serial",
    "status"
  ];

  const [visibleKeys, setVisibleKeys] = useState(DEFAULT_VISIBLE);


  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  /* ===================== FETCH STATIONS ===================== */
  const fetchStations = async () => {
    if (!fromDate || !toDate || !selectedFile) return;

    try {
      const normalize = v => (v.length === 16 ? `${v}:00` : v);
      const from = encodeURIComponent(normalize(fromDate));
      const to = encodeURIComponent(normalize(toDate));

      const res = await fetch(
        `${API_BASE}/api/interlocking/stations?from=${from}&to=${to}`,
        {
          method: "POST",
          body: selectedFile

        }
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
  useEffect(() => {
    if (!station || !fromDate || !toDate || !selectedFile) return;

    const fetchRelays = async () => {
      try {
        const normalize = v => (v.length === 16 ? `${v}:00` : v);
        const from = encodeURIComponent(normalize(fromDate));
        const to = encodeURIComponent(normalize(toDate));

        const res = await fetch(
          `${API_BASE}/api/interlocking/report` +
          `?from=${from}&to=${to}` +
          `&station=${station}` +
          `&page=1`,
          {
            method: "POST",
            body: selectedFile
          }
        );

        const json = await res.json();
        if (!json.success) return;

        const relays = [
          ...new Set((json.data || []).map(r => r.relay))
        ];

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
    if (!station || !relay) return;


    if (!isDateRangeValid) {
      alert("Invalid date range");
      return;
    }

    setHasGenerated(true);
    setLoading(true);
    setRows([]);
    setAllRows([]);

    try {
      const normalize = v => (v.length === 16 ? `${v}:00` : v);
      const from = encodeURIComponent(normalize(fromDate));
      const to = encodeURIComponent(normalize(toDate));

      const res = await fetch(
        `${API_BASE}/api/interlocking/report` +
        `?from=${from}&to=${to}` +
        `&station=${station}` +
        `&page=1`,
        {
          method: "POST",
          body: selectedFile

        }
      );

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const mappedRows = (json.data || []).map((r, idx) => ({
        id: idx + 1,
        ...r,
        relayId: r.relay,
        date: r.date && r.time ? `${r.date} ${r.time}` : r.date,
      }));


      setAllRows(mappedRows);

      if (relay === "ALL") {
        setRows(mappedRows);
      } else {
        setRows(mappedRows.filter(r => r.relayId === relay));
      }

      setPage(1);
      setAllRows(mappedRows);
      setRows(mappedRows);

      const uniqueRelays = [...new Set(mappedRows.map(r => r.relayId))];
      setRelayOptions(uniqueRelays);

      setPage(1);
    } catch (err) {
      console.error("[INTERLOCKING] API error:", err);
      setRows([]);
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...allRows];

    if (relay !== "ALL") {
      filtered = filtered.filter(r => r.relayId === relay);
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(r => {
        const s = r.status?.toUpperCase();
        return statusFilter === "PICKED"
          ? s.includes("PICKED")
          : s.includes("DROP");
      });
    }

    setRows(filtered);
    setPage(1);
  }, [relay, statusFilter, allRows]);



  /* ===================== CLEAR ===================== */
  const clear = () => {
    setRows([]);
    setAllRows([]);
    setRelay("");
    setStatusFilter("ALL");
    setRelayOptions([]);
    setPage(1);
    setHasGenerated(false);
  };

  /* ===================== REF API ===================== */
  useImperativeHandle(ref, () => ({
    generate,
    clear,
    getFilteredRows: () => rows,
    getAllRows: () => allRows,
    getVisibleColumns: () =>
      INTERLOCKING_COLUMNS.filter(c => visibleKeys.includes(c.key)),
    openColumnDialog: () => setColumnDialogOpen(true),
  }));

  /* ===================== PAGINATION ===================== */
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const paginatedRows = rows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const showNoResult =
    hasGenerated &&
    !loading &&
    rows.length === 0 &&
    allRows.length > 0;


  /* ===================== UI ===================== */
  return (
    <Box p={1} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* ===== FILTER CARD ===== */}
      <Box
        sx={{
          mb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap"
        }}
      >
        {/* LEFT SIDE DROPDOWNS */}
        <Stack direction="row" spacing={1.5} alignItems="center">

          <Select
            size="small"
            value={station}
            onChange={(e) => setStation(e.target.value)}
            displayEmpty
            sx={{ width: 240 }}
          >
            <MenuItem value="" disabled>
              Select Station
            </MenuItem>
            {stations.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={relay}
            onChange={(e) => setRelay(e.target.value)}
            displayEmpty
            sx={{ width: 240 }}
            disabled={!station || !relayOptions.length}
          >
            <MenuItem value="ALL">All Relays</MenuItem>
            <MenuItem value="" disabled>
              Select Relay
            </MenuItem>
            {relayOptions.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 200 }}
            disabled={!allRows.length}
          >
            <MenuItem value="ALL">All Status</MenuItem>
            <MenuItem value="PICKED">Picked Up</MenuItem>
            <MenuItem value="DROPPED">Drop Down</MenuItem>
          </Select>
        </Stack>

        {/* RIGHT SIDE ROWS DROPDOWN */}
        {rows.length > 0 && (
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
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
          </motion.div>
        ) : rows.length > 0 ? (
          <motion.div key="table" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 0 }}>
                <InterlockingTable
                  rows={paginatedRows}
                  visibleKeys={visibleKeys}
                />
                <Box
                  sx={{
                    p: 3,
                    display: "flex",
                    justifyContent: "center",
                    borderTop: "1px solid #f9f9f9"
                  }}
                >
                  <PaginationControls
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ) : showNoResult ? (
          <motion.div
            key="no-result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <NoResult />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* MUST be OUTSIDE AnimatePresence */}
      <ColumnFilterDialog
        open={columnDialogOpen}
        column="Columns"
        values={INTERLOCKING_COLUMNS.map(c => c.label)}
        selectedValues={visibleKeys.map(
          key => INTERLOCKING_COLUMNS.find(c => c.key === key)?.label
        )}
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
