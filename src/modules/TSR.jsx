import { useState, useCallback } from "react";
import { Box, Tabs, Tab, Paper, alpha, Typography, Stack } from "@mui/material";
import SpeedIcon from '@mui/icons-material/Speed';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import ReportHeader from "../components/ReportHeader";
import TSRField from "../pages/TSRField";
import TSRSummary from "../pages/TSRSummary";

export default function TSR() {
  const [tab, setTab] = useState(0);

  // Helper for tab-specific actions
  const handleGenerate = useCallback(() => {
    const reportType = tab === 0 ? "Field Telemetry" : "Executive Summary";
    console.log(`Generating ${reportType} TSR data...`);
  }, [tab]);

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      {/* ===== COMMAND HEADER ===== */}
      <ReportHeader
        title="Speed Restriction Analysis"
        onGenerate={handleGenerate}
        onClear={() => console.log("TSR Filters Cleared")}
        onPrint={() => window.print()}
        onSave={() => console.log("Exporting current TSR view...")}
        onSaveAll={() => console.log("Full Division TSR Export")}
      />

      {/* ===== ALERT/CONTEXT BAR ===== */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2} px={1}>
        <WarningAmberIcon sx={{ color: '#f57c00', fontSize: 20 }} />
        <Typography variant="subtitle2" fontWeight="800" color="text.secondary">
          ACTIVE SPEED RESTRICTION MONITORING
        </Typography>
      </Stack>

      {/* ===== NAVIGATION TRAY ===== */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2, 
          mb: 1, 
          bgcolor: alpha('#f57c00', 0.04), // Amber background to signal "Caution/Restriction"
          border: '1px solid',
          borderColor: alpha('#f57c00', 0.1)
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          indicatorColor="warning"
          textColor="warning"
          sx={{
            px: 2,
            '& .MuiTab-root': { 
              fontWeight: 'bold', 
              minHeight: 48,
              '&.Mui-selected': { color: '#ef6c00' }
            }
          }}
        >
          <Tab icon={<SpeedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="TSR Field Logs" />
          <Tab icon={<WarningAmberIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="TSR Summary" />
        </Tabs>
      </Paper>

      {/* ===== TAB CONTENT AREA ===== */}
      <Box 
        sx={{ 
          minHeight: '60vh',
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        {tab === 0 && <TSRField />}
        {tab === 1 && <TSRSummary />}
      </Box>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}