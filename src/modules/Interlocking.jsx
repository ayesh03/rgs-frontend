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
    <Box sx={{ p: { xs: 1 } }}>
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