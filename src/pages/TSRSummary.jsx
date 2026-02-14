import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  LinearProgress,
  Grid,
  alpha,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SummarizeIcon from '@mui/icons-material/Summarize';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import SpeedIcon from '@mui/icons-material/Speed';
import RuleIcon from '@mui/icons-material/Rule';

import TSRSummaryTable from "../components/TSRSummaryTable";
import NoResult from "../components/NoResult";

export default function TSRSummary() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const handleGenerate = () => {
    setLoading(true);
    setRows([]);

    setTimeout(() => {
      setRows([
        { station: "STN001", tsrCount: 5, maxSpeed: 40, minSpeed: 20, totalLength: 1250 },
        { station: "STN002", tsrCount: 3, maxSpeed: 35, minSpeed: 25, totalLength: 800 },
      ]);
      setLoading(false);
    }, 1200);
  };

  // Calculate high-level metrics for the Summary Header
  const totalTSRs = rows.reduce((acc, curr) => acc + curr.tsrCount, 0);
  const avgMinSpeed = rows.length ? (rows.reduce((acc, curr) => acc + curr.minSpeed, 0) / rows.length).toFixed(1) : 0;

  return (
    <Box p={3} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SummarizeIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: -1 }}>
              TSR Summary
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 5.5 }}>
            Executive overview of speed restrictions and track availability across stations.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            onClick={handleGenerate} 
            disabled={loading}
            sx={{ borderRadius: 2, fontWeight: 'bold', px: 3 }}
          >
            {loading ? "Processing..." : "Generate Summary"}
          </Button>
          <Button variant="outlined" startIcon={<SaveIcon />} disabled={!rows.length || loading} sx={{ borderRadius: 2 }}>
            Save
          </Button>
          <Button variant="outlined" startIcon={<PrintIcon />} disabled={!rows.length || loading} sx={{ borderRadius: 2 }}>
            Print
          </Button>
        </Stack>
      </Stack>

      {/* KPI Cards (Conditional) */}
      <AnimatePresence>
        {rows.length > 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Grid container spacing={3} mb={1}>
              <Grid item xs={12} md={1}>
                <Card sx={{ bgcolor: alpha('#1976d2', 0.05), border: '1px solid', borderColor: alpha('#1976d2', 0.1), borderRadius: 3 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="overline" fontWeight="700">Total Active TSRs</Typography>
                    <Typography variant="h3" fontWeight="900" color="primary">{totalTSRs}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={1}>
                <Card sx={{ bgcolor: alpha('#ed6c02', 0.05), border: '1px solid', borderColor: alpha('#ed6c02', 0.1), borderRadius: 3 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="overline" fontWeight="700">Avg. Restriction Speed</Typography>
                    <Typography variant="h3" fontWeight="900" color="warning.main">{avgMinSpeed} <small style={{ fontSize: '1rem' }}>km/h</small></Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={1}>
                <Card sx={{ bgcolor: alpha('#2e7d32', 0.05), border: '1px solid', borderColor: alpha('#2e7d32', 0.1), borderRadius: 3 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="overline" fontWeight="700">Impacted Distance</Typography>
                    <Typography variant="h3" fontWeight="900" color="success.main">
                      {rows.reduce((acc, curr) => acc + curr.totalLength, 0)} <small style={{ fontSize: '1rem' }}>m</small>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box py={10} textAlign="center">
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="h6" fontWeight="600" color="text.secondary">Aggregating Station Data...</Typography>
              <Box px={10} mt={1}>
                <LinearProgress sx={{ borderRadius: 5, height: 6 }} />
              </Box>
            </Box>
          ) : rows.length > 0 ? (
            <TSRSummaryTable rows={rows} />
          ) : (
            <NoResult />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}