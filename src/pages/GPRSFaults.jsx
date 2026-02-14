import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  LinearProgress,
  Stack,
  Fade,
} from "@mui/material";
import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Modern animation engine
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';

import GPRSFaultsTable from "../components/GPRSFaultsTable";
import PaginationControls from "../components/PaginationControls";
import NoResult from "../components/NoResult";
import ColumnFilterDialog from "../components/ColumnFilterDialog";
import {
  FAULT_ALL_COLUMNS,
} from "../constants/faultColumns";
import { useAppContext } from "../context/AppContext";


const GPRSFaults = forwardRef((props, ref) => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const { fromDate, toDate, isDateRangeValid } = useAppContext();

  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(FAULT_VISIBLE_COLUMNS);



  const [loading, setLoading] = useState(false);
  const [station, setStation] = useState("");
  const [rows, setRows] = useState([]);
  const [stations, setStations] = useState([]);

  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const fetchStations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/gprs-faults/stations`);
      const json = await res.json();
      if (json.success) setStations(json.data);
    } catch (err) {
      console.error("GPRS station fetch error:", err);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

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
      return v.length === 16 ? `${v}:00` : v;
    };
    const from = normalizeDate(fromDate);
    const to = normalizeDate(toDate);

    let url = `${API_BASE}/api/gprs-faults?station=${station}`;

    if (from && to) {
      url += `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    }


const res = await fetch(url);
const json = await res.json();

if (!json.success) {
  throw new Error(json.error || "Backend error");
}

setRows(
  json.data.map((r, idx) => {
    const [date, time] = r.event_time.split(" ");
    return {
      id: idx + 1,
      date,
      time,
      station: r.station_code,
      locoId: r.loco_id,
      faultCode: r.fault_code,
      description: r.description,
      status: r.status,
    };
  })
);

setPage(1);


    setPage(1);
  } catch (err) {
    console.error("GPRSFaults API error:", err);
    setRows([]);
  } finally {
    setLoading(false);
  }
};



  const clear = () => {
    setRows([]);
    setPage(1);
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
  const paginatedRows = rows.slice(
  (page - 1) * rowsPerPage,
  page * rowsPerPage
);



  return (
    <Box p={2}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
          <SignalCellularAltIcon color="primary" />
          <Typography variant="h5" fontWeight="700">
            GPRS Fault Report
          </Typography>
        </Stack>
      </motion.div>

      {/* Modern Filter Bar */}
      <Card
        component={motion.div}
        whileHover={{ y: -2 }}
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          background: 'linear-gradient(to right, #ffffff, #fcfcfc)'
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary" fontWeight="600">
              LOCATION MONITOR:
            </Typography>

            <Select
              size="small"
              value={station}
              onChange={(e) => {
                setStation(e.target.value);
                setPage(1);
              }}

              displayEmpty
              sx={{ width: 220 }}
            >
              <MenuItem value="" disabled>
                Select Station
              </MenuItem>
              {stations.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}

            </Select>
          </Stack>
        </CardContent>

      </Card>

      {/* Progress Bar with Fade */}
      <Box sx={{ height: 4, mb: 1 }}>
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LinearProgress sx={{ borderRadius: 2, height: 4 }} />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Table Container */}
      <Card
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          border: '1px solid #f0f0f0'
        }}
      >
        <CardContent>
          <AnimatePresence mode="wait">
            {loading ? null : rows.length > 0 ? (
              <motion.div
                key="table-content"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.4 }}
              >
                <GPRSFaultsTable
  rows={paginatedRows}
  visibleKeys={visibleKeys}
/>



                <Box mt={3} display="flex" justifyContent="center">
                  <PaginationControls
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                  />
                </Box>
              </motion.div>
            ) : (
              <NoResult />
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
        </CardContent>
      </Card>
    </Box>
  );
});

export default GPRSFaults;