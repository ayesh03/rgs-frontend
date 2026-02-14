import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  alpha,
} from "@mui/material";
import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { Select, MenuItem } from "@mui/material";

import LocoFaultsTable from "../components/LocoFaultsTable";
import PaginationControls from "../components/PaginationControls";
import NoResult from "../components/NoResult";
import ColumnFilterDialog from "../components/ColumnFilterDialog";
import {
  formatDateTime,
  decodePacketType,
  decodeSubsystemType,
  decodeSystemVersion,
  decodeFaultType,
} from "../utils/faultFormatter";
import {
  FAULT_ALL_COLUMNS,
} from "../constants/faultColumns";

import { useAppContext } from "../context/AppContext";

const LocoFaults = forwardRef((props, ref) => {
  const { fromDate, toDate, isDateRangeValid, logDir } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [originFilter, setOriginFilter] = useState("STATION");


  const rowsPerPage = 10;

  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(
    FAULT_ALL_COLUMNS.map(c => c.key)
  );


  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  /* ===================== GENERATE ===================== */
  const generate = async () => {
    if (!isDateRangeValid) {
      alert("Invalid date range");
      return;
    }

    if (!logDir) {
      alert("BIN log directory not selected");
      return;
    }

    setLoading(true);
    setRows([]);

    try {
      const normalize = (v) => (v.length === 16 ? `${v}:00` : v);

      const from = encodeURIComponent(normalize(fromDate));
      const to = encodeURIComponent(normalize(toDate));
      const dir = encodeURIComponent(logDir);

      const url = `${API_BASE}/api/loco-faults/by-date?from=${from}&to=${to}&logDir=${dir}`;

      const res = await fetch(url);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Backend error");
      }

      const mappedRows = (json.data || []).map((r, idx) => {
        const dt = new Date(r.event_time);

        return {
          id: idx + 1,
          date: dt.toISOString().slice(0, 10),
          time: dt.toTimeString().slice(0, 8),
          ...r, // keep RAW values
        };
      });

      setRows(mappedRows);
      setPage(1);


      setPage(1);
    } catch (err) {
      console.error("LocoFaults API error:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== CLEAR ===================== */
  const clear = () => {
    setRows([]);
    setPage(1);
  };

  /* ===================== IMPERATIVE API ===================== */
  useImperativeHandle(ref, () => ({
    generate,
    clear,
    getFilteredRows: () => rows,
    getAllRows: () => rows,
    getVisibleColumns: () =>
      FAULT_ALL_COLUMNS.filter(c => visibleKeys.includes(c.key)),
    openColumnDialog: () => setColumnDialogOpen(true),
  }));

  /* ===================== PAGINATION ===================== */
  const filteredRows =
    originFilter === "ALL"
      ? rows
      : rows.filter(r => r.fault_origin === originFilter);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const paginatedRows = filteredRows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  useEffect(() => {
    setVisibleKeys(FAULT_ALL_COLUMNS.map(c => c.key));
  }, []);
  return (
    <Box p={2}>
      {/* ===== TITLE ===== */}
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
          <EngineeringIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight={800}>
            Faults Report
          </Typography>
          <Select
            size="small"
            value={originFilter}
            onChange={(e) => {
              setOriginFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="STATION">Station</MenuItem>
            <MenuItem value="LOCO">Loco</MenuItem>
          </Select>
        </Stack>
      </motion.div>
      <Stack direction="row" spacing={2} mb={2}>
      </Stack>


      {/* ===== RESULT AREA ===== */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Box sx={{ width: "100%", mb: 2 }}>
              <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  display: "block",
                  textAlign: "center",
                  color: "primary.main",
                  fontWeight: 600,
                }}
              >
                ANALYZING FAULT PACKETS…
              </Typography>
            </Box>
          </motion.div>
        ) : filteredRows.length > 0 ? (
          <motion.div
            key="data"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
                border: "1px solid #f0f0f0",
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <LocoFaultsTable
                  rows={paginatedRows}
                  columns={FAULT_ALL_COLUMNS}
                  visibleKeys={visibleKeys}
                />

                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "center",
                    borderTop: `1px solid ${alpha("#000", 0.05)}`,
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
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <NoResult />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== COLUMN DIALOG ===== */}
      <ColumnFilterDialog
        open={columnDialogOpen}
        column="Columns"
        values={FAULT_ALL_COLUMNS.map(c => c.label)}
        selectedValues={visibleKeys.map(
          key => FAULT_ALL_COLUMNS.find(c => c.key === key)?.label
        )}
        onClose={() => setColumnDialogOpen(false)}
        onApply={(labels) => {
          const keys = FAULT_ALL_COLUMNS
            .filter(c => labels.includes(c.label))
            .map(c => c.key);
          setVisibleKeys(keys);
          setColumnDialogOpen(false);
        }}
      />
    </Box>
  );
});

export default LocoFaults;
