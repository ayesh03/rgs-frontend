import { Box, Tabs, Tab, Paper, alpha, Typography, Stack } from "@mui/material";
import { useState } from "react";
import BusinessIcon from '@mui/icons-material/Business';

import ReportHeader from "../components/ReportHeader";
import StationMaster from "../pages/Station";
import StationWiseReport from "../pages/StationWiseReport";

export default function Station() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      {/* ===== UNIFIED COMMAND HEADER ===== */}
      <ReportHeader
        title="Station Management"
        onGenerate={() => console.log("Generating Station Analytics...")}
        onClear={() => console.log("Filters Reset")}
        onPrint={() => window.print()}
        onSave={() => console.log("Exporting Station Data")}
      />

      {/* ===== CONTEXTUAL BRANDING ===== */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2} px={1}>
        <BusinessIcon color="primary" sx={{ fontSize: 20 }} />
        <Typography variant="subtitle2" fontWeight="800" color="text.secondary">
          INFRASTRUCTURE & SECTIONAL LOGS
        </Typography>
      </Stack>

      {/* ===== NAVIGATION TRAY ===== */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2, 
          mb: 1, 
          bgcolor: alpha('#1565c0', 0.03), 
          border: '1px solid',
          borderColor: alpha('#1565c0', 0.1)
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            px: 2,
            '& .MuiTab-root': { fontWeight: 'bold', minHeight: 48 }
          }}
        >
          <Tab label="Station Master" />
          <Tab label="Station Wise Report" />
        </Tabs>
      </Paper>

      {/* ===== TAB CONTENT AREA ===== */}
      <Box 
        sx={{ 
          minHeight: '60vh',
          animation: 'fadeIn 0.3s ease-in-out'
        }}
      >
        {tab === 0 && <StationMaster />}
        {tab === 1 && <StationWiseReport />}
      </Box>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.99); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Box>
  );
}