import { useState, forwardRef, useImperativeHandle } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Select,
  MenuItem,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion"; // Modern animation engine
import PaginationControls from "../components/PaginationControls";
import DataPreview from "../components/DataPreview";

const EXCEPTION_TYPES = [
  "Emergency Brake",
  "Loco SOS",
  "Station SOS",
  "Override Mode",
  "Trip Mode",
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

const ExceptionReport = forwardRef((props, ref) => {
  const [exceptionType, setExceptionType] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const generate = async () => {
  setLoading(true);
  setRows([]);
  setPage(1);

  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

const res = await fetch(`${API_BASE}/api/loco-movement/latest`);

    const text = await res.text();

let json;
try {
  json = JSON.parse(text);
} catch (e) {
  console.error("Response was not JSON:", text);
  throw new Error("Backend returned invalid response");
}


    const filtered = json.data.filter((r) => {
      switch (exceptionType) {
        case "Emergency Brake":
          return r.brake_mode === "EMERGENCY";
        case "Loco SOS":
          return r.loco_sos === "1";
        case "Station SOS":
          return r.emergency_general_sos === "1";
        case "Override Mode":
          return r.tcas_mode === "OS";
        case "Trip Mode":
          return r.tcas_mode === "TR";
        default:
          return false;
      }
    });

    const mapped = filtered.map((r, idx) => {
      const [date, time] = r.event_time.split(" ");
      return {
        id: idx + 1,
        date,
        time,
        locoId: r.loco_id,
        station: r.station_code,
        exception: exceptionType,
      };
    });

    setRows(mapped);

    return mapped.length > 0; 
  } catch (err) {
    console.error(err);
    return false;
  } finally {
    setLoading(false);
  }
};

  const clear = () => {
    setRows([]);
    setPage(1);
    setExceptionType("");
  };


  useImperativeHandle(ref, () => ({
  generate,
  clear,
  hasExceptions: () => rows.length > 0,

  getFilteredRows: () => rows,
  getAllRows: () => rows,
}));




  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const paginatedRows = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box p={4} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Typography variant="h4" fontWeight="300" gutterBottom sx={{ color: "primary.main", mb: 1 }}>
        Exception Report
      </Typography>

      {/* Modern Selector Card */}
      <Card sx={{ mb: 1, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ py: 3 }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Typography variant="subtitle1" fontWeight="600">Report Type:</Typography>
            <Select
              value={exceptionType}
              onChange={(e) => setExceptionType(e.target.value)}
              displayEmpty
              size="small"
              sx={{
                width: 300,
                borderRadius: 2,
                backgroundColor: "rgba(0,0,0,0.02)",
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
              }}
            >
              <MenuItem value="" disabled>Select Exception Type</MenuItem>
              {EXCEPTION_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </Stack>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card sx={{ mb: 1, borderRadius: 3, textAlign: 'center', p: 2 }}>
              <Typography color="text.secondary" mb={2}>
                Processing high-volume data...
              </Typography>
              <LinearProgress sx={{ height: 8, borderRadius: 5 }} />
            </Card>
          </motion.div>
        ) : rows.length > 0 ? (
          <motion.div
            key="results"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <DataPreview
              rows={rows}
              title={`Exception Summary — ${exceptionType}`}
            />

            <Stack spacing={2} sx={{ mb: 1 }}>
              {paginatedRows.map((r, i) => (
                <motion.div key={r.id || i} variants={itemVariants}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: "1px solid #f0f0f0",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontWeight={600}>
                          {r.date} | {r.time}
                        </Typography>
                        <Chip label={r.exception} color="error" />
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <PaginationControls
                page={page}
                setPage={setPage}
                totalPages={totalPages}
              />
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Box
              textAlign="center"
              py={8}
              sx={{
                bgcolor: 'rgba(0,0,0,0.02)',
                borderRadius: 4,
                border: '2px dashed #ddd',
              }}
            >
              <Typography color="text.secondary">
                No reports generated. Select a type to begin.
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

    </Box>
  );
});

export default ExceptionReport;