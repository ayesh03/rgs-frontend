import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  LinearProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion"; // Ensure framer-motion is installed
import AssessmentIcon from '@mui/icons-material/Assessment'; // Modern icon

import FaultSummaryCards from "../components/FaultSummaryCards";
import FaultSummaryTable from "../components/FaultSummaryTable";
import NoResult from "../components/NoResult";

// Animation settings
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export default function FaultSummary() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const handleGenerate = async () => {
  setLoading(true);
  setRows([]);

  try {
    const res = await fetch(`${API_BASE}/api/fault-summary`);
    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || "Backend error");
    }

    setRows(json.data);
  } catch (err) {
    console.error("FaultSummary API error:", err);
    setRows([]);
  } finally {
    setLoading(false);
  }
};


  return (
    <Box p={3}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Typography variant="h4" fontWeight="800" gutterBottom sx={{ mb: 4, letterSpacing: -0.5 }}>
          Fault Summary
        </Typography>
      </motion.div>

      {/* Action Bar with Pulse Effect */}
      <Card 
        component={motion.div}
        whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
        sx={{ mb: 1, borderRadius: 4, border: '1px solid #eee' }}
      >
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <motion.div
              whileTap={{ scale: 0.95 }}
              animate={rows.length === 0 ? { scale: [1, 1.02, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Button 
                variant="contained" 
                size="large"
                startIcon={<AssessmentIcon />}
                onClick={handleGenerate}
                sx={{ 
                  borderRadius: 2, 
                  px: 4, 
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                }}
              >
                Generate Summary
              </Button>
            </motion.div>
            {rows.length > 0 && (
               <Typography variant="body2" color="text.secondary">
                 Last updated: Just now
               </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {/* Modern Loader */}
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card sx={{ mb: 3, borderRadius: 4, overflow: 'hidden' }}>
              <LinearProgress sx={{ height: 6 }} />
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="primary" fontWeight="500">
                  Analyzing system logs...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This may take a moment.
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Animated Summary Content */}
        {!loading && rows.length > 0 && (
          <motion.div
            key="content"
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.15 } }
            }}
          >
            <motion.div variants={fadeUp}>
              <FaultSummaryCards rows={rows} />
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card sx={{ mt: 4, borderRadius: 4, boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: '1px solid #f0f0f0' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="700" mb={2}>Detailed Station Breakdown</Typography>
                  <FaultSummaryTable rows={rows} />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* No Result Animation */}
        {!loading && rows.length === 0 && (
          <motion.div 
            key="no-result"
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
          >
            <NoResult />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}