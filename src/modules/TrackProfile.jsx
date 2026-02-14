import { useState } from "react";
import { Box, Tabs, Tab, Paper, alpha, Typography, Stack } from "@mui/material";
import TerrainIcon from '@mui/icons-material/Terrain';
import TimelineIcon from '@mui/icons-material/Timeline';
import TableChartIcon from '@mui/icons-material/TableChart';

import TrackProfileReport from "../pages/TrackProfileReport";
import TrackProfileGraph from "../pages/TrackProfileGraph";
import { useLocation } from "react-router-dom";

export default function TrackProfile() {

  const location = useLocation();
  const isGraphRoute = location.pathname.endsWith("/graph");
  const [tab, setTab] = useState(isGraphRoute ? 1 : 0);

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>

      {/* ===== CONTEXT HEADER (NO ACTION BUTTONS) ===== */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2} px={1}>
        <TerrainIcon color="primary" sx={{ fontSize: 20 }} />
        <Typography variant="subtitle2" fontWeight="800" color="text.secondary">
          GRADIENT, CURVATURE & PERMANENT WAY DATA
        </Typography>
      </Stack>

      {/* ===== TABS ===== */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          mb: 1,
          bgcolor: alpha('#2e7d32', 0.03),
          border: '1px solid',
          borderColor: alpha('#2e7d32', 0.1)
        }}
      >
        
      </Paper>

      {/* ===== CONTENT ===== */}
      <Box sx={{ minHeight: '60vh' }}>
        {tab === 0 && <TrackProfileReport />}
        {tab === 1 && (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <TrackProfileGraph />
          </Paper>
        )}
      </Box>
    </Box>
  );
}
