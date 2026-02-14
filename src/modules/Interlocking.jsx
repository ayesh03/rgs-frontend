import { Box, Tabs, Tab, Paper, alpha, Typography, Stack } from "@mui/material";
import HubIcon from '@mui/icons-material/Hub';
import ReportHeader from "../components/ReportHeader";
import InterlockingReport from "../pages/InterLocking";
import { useRef, useCallback, useState } from "react";
import useExport from "../hooks/useExport";
import { INTERLOCKING_COLUMNS } from "../constants/interlockingColumns";

import { useAppContext } from "../context/AppContext";

export default function Interlocking() {
  const [tab, setTab] = useState(0);
  const interlockingRef = useRef();
  const { fromDate, toDate } = useAppContext();
  const [stage, setStage] = useState("FILTER");
  const { exportExcel, exportPDF } = useExport();

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      {/* ===== HEADER SECTION ===== */}

      <ReportHeader
  stage={stage}
  showException
  showTableType={false}
  onGenerate={async () => {
    setStage("ENGINE");               
    await interlockingRef.current?.generate();
    setStage("PREVIEW");             
  }}
  onClear={() => {
    interlockingRef.current?.clear();
    setStage("FILTER");               
  }}
  onSave={() => {
    const rows = interlockingRef.current?.getFilteredRows?.();
    exportExcel(rows, INTERLOCKING_COLUMNS, "Interlocking_Report");
  }}
  onSaveAll={() => {
    const rows = interlockingRef.current?.getAllRows?.();
    exportExcel(rows, INTERLOCKING_COLUMNS, "Interlocking_Report_All");
  }}
  onPrint={() => {
    const rows = interlockingRef.current?.getFilteredRows?.();
    exportPDF(rows, INTERLOCKING_COLUMNS, "Interlocking Report", {
      dateRange: `${fromDate || "All"} → ${toDate || "All"}`
    });
  }}
  onColumns={() => interlockingRef.current?.openColumnDialog()}
/>


      {/* ===== NAVIGATION & TITLE ===== */}
      <Stack direction="row" alignItems="center" spacing={1} mb={1} px={1}>
        <HubIcon color="primary" sx={{ fontSize: 20 }} />
        <Typography variant="subtitle2" fontWeight="800" color="text.secondary">
          STATION VITAL COMPUTER (SVC) INTERFACE
        </Typography>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          mb: 1,
          bgcolor: alpha('#1976d2', 0.03),
          border: '1px solid',
          borderColor: alpha('#1976d2', 0.1)
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
          <Tab label="Signal Aspect & Route Report" />
          {/* Future expansion: <Tab label="Point & Track Circuit Status" /> */}
        </Tabs>
      </Paper>

      {/* ===== DATA DISPLAY AREA ===== */}
      <Box
        component="section"
        sx={{
          minHeight: '60vh',
          animation: 'fadeIn 0.3s ease-in'
        }}
      >
        {tab === 0 && <InterlockingReport ref={interlockingRef} />}

      </Box>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}