import { Box, Paper, alpha, Typography, Stack, useTheme } from "@mui/material";
import HubIcon from '@mui/icons-material/Hub';
import { motion, AnimatePresence } from "framer-motion";
import ReportHeader from "../components/ReportHeader";
import InterlockingReport from "../pages/InterLocking";
import { useRef, useState } from "react";
import useExport from "../hooks/useExport";
import { INTERLOCKING_COLUMNS } from "../constants/interlockingColumns";
import { useAppContext } from "../context/AppContext";

export default function Interlocking() {
  const theme = useTheme();
  const [tab] = useState(0);
  const interlockingRef = useRef();
  const { fromDate, toDate } = useAppContext();
  const [stage, setStage] = useState("FILTER");
  const { exportExcel, exportPDF } = useExport();

  /* ===================== ACTION HANDLERS ===================== */
  const handleGenerate = async () => {
    setStage("ENGINE");
    await interlockingRef.current?.generate();
    setStage("PREVIEW");
  };

  const handleClear = () => {
    interlockingRef.current?.clear();
    setStage("FILTER");
  };

  const handleExport = (type, isAll = false) => {

  const rows = isAll
    ? interlockingRef.current?.getAllRows?.()
    : interlockingRef.current?.getFilteredRows?.();

  const columns = isAll
    ? INTERLOCKING_COLUMNS
    : interlockingRef.current?.getVisibleColumns?.();

  if (!rows || !rows.length) return;

  if (type === "excel") {
    exportExcel(rows, columns, "interlocking");
  } else {
    exportPDF(rows, columns, "interlocking");
  }
};

  return (
    <Box sx={{ p: { xs: 1, md: 0.5 }, minHeight: '100vh' }}>
      
      {/* ===== HEADER SECTION ===== */}
      <ReportHeader
        stage={stage}
        showException
        showTableType={false}
        onGenerate={handleGenerate}
        onClear={handleClear}
        onColumns={() => interlockingRef.current?.openColumnDialog()}
        onSave={() => handleExport("excel", false)}
        onSaveAll={() => handleExport("excel", true)}
        onPrint={() => handleExport("pdf", false)}
      />

      {/* ===== BREADCRUMB / STATUS AREA ===== */}
      {/* <Paper
        elevation={0}
        component={motion.div}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          borderRadius: "12px",
          mb: 2,
          p: 2,
          bgcolor: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      > */}
        {/* <Stack direction="row" alignItems="center" spacing={2}> */}
          {/* <Box
            sx={{
              p: 1,
              borderRadius: "10px",
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              display: "flex",
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
            }}
          >
            <HubIcon sx={{ color: theme.palette.secondary.main, fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#fff", letterSpacing: 0.5 }}>
              STATION INTERLOCKING INTERFACE
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", display: 'block' }}>
              Monitoring Electronic Interlocking (EI) Packet Exchange
            </Typography>
          </Box> */}
        {/* </Stack> */}
      {/* </Paper> */}

      {/* ===== DATA DISPLAY AREA ===== */}
      <AnimatePresence mode="wait">
        <Box
          key={tab}
          component={motion.section}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          sx={{ minHeight: '60vh' }}
        >
          {tab === 0 && <InterlockingReport ref={interlockingRef} />}
        </Box>
      </AnimatePresence>
    </Box>
  );
}