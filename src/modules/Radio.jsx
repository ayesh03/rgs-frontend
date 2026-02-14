import { useRef, useState } from "react";
import { Box, Tabs, Tab, Paper, alpha, Typography, Stack } from "@mui/material";
import RssFeedIcon from '@mui/icons-material/RssFeed';
import ReportHeader from "../components/ReportHeader";
import RadioCommunication from "../pages/RadioCommunication";

export default function Radio() {
  const radioRef = useRef();
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      {/* ===== COMMAND HEADER ===== */}
      <ReportHeader
        title="Radio Link Analysis"
        onGenerate={() => radioRef.current?.generate()}
        onClear={() => radioRef.current?.clear()}
        onPrint={() => window.print()}
        onSave={() => radioRef.current?.exportCurrent()}
        onSaveAll={() => radioRef.current?.exportAll()}
      />

      {/* ===== SYSTEM CONTEXT ===== */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2} px={1}>
        <RssFeedIcon color="primary" sx={{ fontSize: 20 }} />
        <Typography variant="subtitle2" fontWeight="800" color="text.secondary">
          UHF DATA LINK TELEMETRY (TDMA SLOTS)
        </Typography>
      </Stack>

      {/* ===== NAVIGATION TRAY ===== */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2, 
          mb: 1, 
          bgcolor: alpha('#ed6c02', 0.03), // Subtle amber to match RFCOM fault theme
          border: '1px solid',
          borderColor: alpha('#ed6c02', 0.1)
        }}
      >
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)}
          sx={{ 
            px: 2,
            '& .MuiTab-root': { fontWeight: 'bold', textTransform: 'none' }
          }}
        >
          <Tab label="Radio Communication Log" />
          {/* Future expansion: <Tab label="Signal Strength (RSSI) Map" /> */}
        </Tabs>
      </Paper>

      {/* ===== DATA DISPLAY AREA ===== */}
      <Box 
        component="section"
        sx={{ 
          minHeight: '60vh',
          animation: 'slideUp 0.3s ease-out' 
        }}
      >
        {tab === 0 && <RadioCommunication ref={radioRef} />}
      </Box>

      <style >{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}