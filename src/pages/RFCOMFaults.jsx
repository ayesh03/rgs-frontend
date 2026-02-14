import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  LinearProgress,
  Stack,
  alpha,
} from "@mui/material";
import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RouterIcon from '@mui/icons-material/Router'; // Icon for RF Communication
import SensorsIcon from '@mui/icons-material/Sensors';
import ColumnFilterDialog from "../components/ColumnFilterDialog";
import { useAppContext } from "../context/AppContext";

import RFCOMFaultsTable from "../components/RFCOMFaultsTable";
import PaginationControls from "../components/PaginationControls";
import NoResult from "../components/NoResult";
import {
  FAULT_ALL_COLUMNS,
} from "../constants/faultColumns";

const RFCOMFaults = forwardRef((props, ref) => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(false);
  const [station, setStation] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
   const { fromDate, toDate, isDateRangeValid } = useAppContext();
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(FAULT_VISIBLE_COLUMNS);


  const rowsPerPage = 5;
  const [stations, setStations] = useState([]);

  const fetchStations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rfcom-faults/stations`);
      const json = await res.json();

      if (json.success) {
        setStations(json.data);
      }
    } catch (err) {
      console.error("RFCOM station fetch error:", err);
    }
  };

  const generate = async () => {
  if (!station) return;

  if (!isDateRangeValid) {
    alert("Invalid date range");
    return;
  }

  setLoading(true);
  setRows([]);

  try {
    const normalizeDate = (v) => {
      if (!v) return "";
      return v.length === 16 ? `${v}:00` : v; // add seconds if missing
    };

    const from = normalizeDate(fromDate);
    const to   = normalizeDate(toDate);

    let url = `${API_BASE}/api/rfcom-faults?station=${station}`;

    if (from && to) {
      url += `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    }

    const res = await fetch(url);
    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || "Backend error");
    }

    // Backend already returns mapped fields (date, time, locoId, station, etc.)
    setRows(
      json.data.map((r, idx) => ({
        id: idx + 1,
        ...r,
      }))
    );

    setPage(1);
  } catch (err) {
    console.error("RFCOMFaults API error:", err);
    setRows([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchStations();
  }, []);

  const clear = () => {
    setRows([]);

  };

  useImperativeHandle(ref, () => ({
    generate,
    clear,
    getFilteredRows: () => rows,
    getAllRows: () => rows,
    getVisibleColumns: () =>
      FAULT_ALL_COLUMNS.filter(c => visibleKeys.includes(c.key)),
    openColumnDialog: () => setColumnDialogOpen(true),
  }));




  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const paginatedRows = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box p={1}>
      {/* Animated Title Section */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
          <Box
            component={motion.div}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            sx={{ display: 'flex', color: 'primary.main' }}
          >
            <SensorsIcon />
          </Box>
          <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: -0.5 }}>
            RFCOM Fault Report
          </Typography>
        </Stack>
      </motion.div>

      {/* Modern Selector Bar */}
      <Card
        sx={{
          mb: 1,
          borderRadius: 3,
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <CardContent sx={{ py: 2.5 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Typography variant="body2" fontWeight="700" color="text.secondary">
              RF DOMAIN:
            </Typography>
            <Select
              size="small"
              value={station}
              onChange={(e) => setStation(e.target.value)}
              displayEmpty
              sx={{
                width: 220,
                borderRadius: 2,
                bgcolor: alpha('#1976d2', 0.03),
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <MenuItem value="" disabled>Select Station Coverage</MenuItem>
              {stations.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </Stack>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Box sx={{ width: '100%', mb: 1 }}>
              <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
              <Typography variant="caption" sx={{ mt: 1.5, display: 'block', textAlign: 'center', fontWeight: 600, color: 'text.secondary' }}>
                SCANNING RF FREQUENCIES AND TIMEOUT LOGS...
              </Typography>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <Card sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 0 }}>
                {rows.length > 0 ? (
                  <>
                    <RFCOMFaultsTable
                      rows={paginatedRows}
                      visibleKeys={visibleKeys}
                    />

                    <Box p={3} sx={{ bgcolor: alpha('#000', 0.01) }}>
                      <PaginationControls
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                      />
                    </Box>
                  </>
                ) : (
                  <NoResult />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
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

      </AnimatePresence>
    </Box>
  );
});

export default RFCOMFaults;