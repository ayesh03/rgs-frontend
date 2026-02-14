import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  Stack,
  LinearProgress,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";
import { useState, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import SignalCellular4BarIcon from '@mui/icons-material/SignalCellular4Bar';

import PaginationControls from "../components/PaginationControls";
import NoResult from "../components/NoResult";

const RadioCommunication = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("station");
  const [filter, setFilter] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const generate = () => {
    setLoading(true);
    setRows([]); // Reset for re-animation

    setTimeout(() => {
      setRows([
        { id: 1, station: "STN001", locoId: "L123", direction: "UP", expected: 120, received: 90, percentage: 75 },
        { id: 2, station: "STN002", locoId: "L124", direction: "DOWN", expected: 100, received: 92, percentage: 92 },
      ]);
      setPage(1);
      setLoading(false);
    }, 1200);
  };

  const clear = () => {
    setRows([]);
    setPage(1);
  };

  useImperativeHandle(ref, () => ({ generate, clear }));

  const filteredRows = rows.filter((r) => {
    if (!filter) return true;
    return r.percentage <= Number(filter);
  });

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Helper to determine signal color
  const getSignalColor = (pct) => {
    if (pct >= 90) return "#2e7d32"; // Green
    if (pct >= 80) return "#ed6c02"; // Orange
    return "#d32f2f"; // Red
  };

  return (
    <Box p={3}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <SettingsInputAntennaIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: -1 }}>
            Radio Communication
          </Typography>
        </Stack>
      </motion.div>

      {/* Modern Filter Glass-Card */}
      <Card sx={{ mb: 1, borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" }}>
        <CardContent sx={{ py: 2 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Typography variant="subtitle2" fontWeight="700" color="text.secondary">VIEW MODE:</Typography>
            <Select
              size="small"
              value={view}
              onChange={(e) => setView(e.target.value)}
              sx={{ borderRadius: 2, minWidth: 160, bgcolor: 'background.paper' }}
            >
              <MenuItem value="station">Station Wise</MenuItem>
              <MenuItem value="loco">Loco Wise</MenuItem>
            </Select>

            <Divider orientation="vertical" flexItem />

            <Typography variant="subtitle2" fontWeight="700" color="text.secondary">SIGNAL THRESHOLD:</Typography>
            <Select
              size="small"
              value={filter}
              displayEmpty
              onChange={(e) => setFilter(e.target.value)}
              sx={{ borderRadius: 2, minWidth: 120, bgcolor: 'background.paper' }}
            >
              <MenuItem value="">All Signals</MenuItem>
              <MenuItem value="80">Critically Low (≤ 80%)</MenuItem>
              <MenuItem value="90">Weak (≤ 90%)</MenuItem>
            </Select>
          </Stack>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Box textAlign="center" py={10}>
              <CircularProgress size={60} thickness={2} sx={{ mb: 1 }} />
              <Typography variant="h6" color="text.secondary">Analyzing Signal Packets...</Typography>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {paginatedRows.length > 0 ? (
              <>
                <Stack spacing={2} mb={1}>
                  {paginatedRows.map((r) => (
                    <motion.div
                      key={r.id}
                      variants={{
                        hidden: { x: -20, opacity: 0 },
                        visible: { x: 0, opacity: 1 }
                      }}
                    >
                      <Card 
                        sx={{ 
                          borderRadius: 3, 
                          borderLeft: `6px solid ${getSignalColor(r.percentage)}`,
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.01)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }
                        }}
                      >
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                {view === "station" ? "STATION IDENTIFIER" : "LOCOMOTIVE ID"}
                              </Typography>
                              <Typography variant="h6" fontWeight="700">
                                {view === "station" ? r.station : r.locoId}
                              </Typography>
                            </Stack>

                            <Stack direction="row" spacing={4} alignItems="center">
                              <Box textAlign="center">
                                <Typography variant="caption" color="text.secondary" display="block">DIRECTION</Typography>
                                <Chip label={r.direction} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                              </Box>

                              <Box textAlign="center">
                                <Typography variant="caption" color="text.secondary" display="block">PACKETS (RX/TX)</Typography>
                                <Typography variant="body2" fontWeight="600">{r.received} / {r.expected}</Typography>
                              </Box>

                              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                <CircularProgress 
                                  variant="determinate" 
                                  value={r.percentage} 
                                  size={50}
                                  sx={{ color: getSignalColor(r.percentage) }}
                                />
                                <Box
                                  sx={{
                                    top: 0, left: 0, bottom: 0, right: 0,
                                    position: 'absolute', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                  }}
                                >
                                  <Typography variant="caption" component="div" fontWeight="bold">
                                    {`${Math.round(r.percentage)}%`}
                                  </Typography>
                                </Box>
                              </Box>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </Stack>
                <PaginationControls page={page} setPage={setPage} totalPages={totalPages} />
              </>
            ) : (
              !loading && <NoResult />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
});

export default RadioCommunication;