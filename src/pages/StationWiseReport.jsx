import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  LinearProgress,
  alpha,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import StationWiseTable from "../components/StationWiseTable";
import PaginationControls from "../components/PaginationControls";
import NoResult from "../components/NoResult";

export default function StationWiseReport() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);

  const handleGenerate = () => {
    setLoading(true);
    setRows([]); // Reset for re-entry animation

    setTimeout(() => {
      setRows([
        { date: "18/10/2017", time: "10:12:45", stnCode: "STN001", locoId: "L123", speed: 60, direction: "UP" },
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <Box p={3} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* Navigation & Title */}
      <Breadcrumbs sx={{ mb: 1, '& .MuiTypography-root': { fontSize: '0.75rem', fontWeight: 700 } }}>
        <Link underline="hover" color="inherit" href="/">DASHBOARD</Link>
        <Typography color="primary">REPORTS</Typography>
      </Breadcrumbs>
      
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <LocationOnIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: -1 }}>
              Station Wise Report
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 5.5 }}>
            Localized performance tracking and locomotive logs per station node.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading}
          startIcon={<AssessmentIcon />}
          sx={{ 
            borderRadius: 3, 
            px: 4, 
            py: 1.2, 
            fontWeight: 'bold',
            boxShadow: '0 8px 16px rgba(25, 118, 210, 0.2)' 
          }}
        >
          Generate Report
        </Button>
      </Stack>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
              <LinearProgress 
                variant="indeterminate" 
                sx={{ height: 8, bgcolor: alpha('#1976d2', 0.1) }} 
              />
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Typography variant="h6" fontWeight="600" color="primary">
                    Compiling Station Records...
                  </Typography>
                </motion.div>
                <Typography variant="caption" color="text.secondary">
                  Accessing distributed trackside database
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ) : rows.length > 0 ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          >
            <Card sx={{ borderRadius: 4, boxShadow: '0 20px 50px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #f9f9f9' }}>
                <Button size="small" startIcon={<DownloadIcon />} sx={{ fontWeight: 700 }}>
                  Export CSV
                </Button>
              </Box>
              <CardContent sx={{ p: 0 }}>
                <StationWiseTable rows={rows} />
                <Box p={3} display="flex" justifyContent="center" bgcolor={alpha('#000', 0.01)}>
                  <PaginationControls
                    page={page}
                    setPage={setPage}
                    totalPages={5}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <NoResult />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}