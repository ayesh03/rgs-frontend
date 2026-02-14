import { useState, useRef, useCallback } from "react";
import { Box, Tabs, Tab, Paper, alpha } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import ReportHeader from "../components/ReportHeader";
import LocoFaults from "../pages/LocoFaults";
import GPRSFaults from "../pages/GPRSFaults";
import RFCOMFaults from "../pages/RFCOMFaults";
import FaultSummary from "../pages/FaultSummary";

import useExport from "../hooks/useExport";



export default function Faults() {
  const [tab, setTab] = useState(0);
  const { exportExcel, exportPDF } = useExport();

  // Refs for Imperative Handle calls (Generate, Clear, etc.)
  const locoRef = useRef();
  const gprsRef = useRef();
  const rfcomRef = useRef();

  const [stage, setStage] = useState("FILTER");
  const isLocoFaults = tab === 0;


  // Mapping tabs to their respective refs for cleaner access
  const tabRefs = {
    0: locoRef,
    1: gprsRef,
    2: rfcomRef,
  };

  const handleAction = useCallback(async (actionType) => {
    const currentRef = tabRefs[tab]?.current;
    if (!currentRef) return;

    if (actionType === "generate") {
      setStage("ENGINE");
      await currentRef.generate();
      setStage("PREVIEW");
    }

    if (actionType === "clear") {
      currentRef.clear();
      setStage("FILTER");
    }
  }, [tab]);



  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      {/* ===== COMMAND CENTER HEADER ===== */}
      <ReportHeader
        stage={stage}
        showTableType={false}
        showException={!isLocoFaults}
        onGenerate={() => handleAction("generate")}
        onClear={() => handleAction("clear")}

        onColumns={() => tabRefs[tab]?.current?.openColumnDialog?.()}



        onSave={() => {
          const rows = tabRefs[tab]?.current?.getFilteredRows?.();
          const cols = tabRefs[tab]?.current?.getVisibleColumns?.();
          if (rows && cols)
            exportExcel(
              rows,
              cols,
              tab === 0 ? "fault_loco" : "fault_station"
            );

        }}

        onSaveAll={() => {
          const rows = tabRefs[tab]?.current?.getAllRows?.();
          const cols = tabRefs[tab]?.current?.getVisibleColumns?.();
          if (rows && cols)
            exportExcel(
              rows,
              cols,
              tab === 0 ? "fault_station":"fault_loco" 
            );

        }}
        onPrint={() => {
          const rows = tabRefs[tab]?.current?.getFilteredRows?.();
          const cols = tabRefs[tab]?.current?.getVisibleColumns?.();
          if (rows && cols)
            exportPDF(
              rows,
              cols,
              tab === 0 ?  "fault_station" : "fault_loco" 
            );

        }}

      />


      {/* ===== NAVIGATION TABS ===== */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          mb: 1,
          bgcolor: alpha('#f1f5f9', 0.5),
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { fontWeight: 'bold', px: 3 },
            '& .Mui-selected': { color: 'primary.main' },
          }}
        >
          <Tab label="Faults" />
          {/* <Tab label="GPRS Faults" /> */}
          <Tab label="RFCOM Faults" />
          <Tab label="Fault Summary" />
        </Tabs>
      </Paper>

      {/* ===== TAB CONTENT WITH ANIMATION ===== */}
      <Box sx={{ mt: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 0 && <LocoFaults ref={locoRef} />}
            {tab === 1 && <GPRSFaults ref={gprsRef} />}
            {tab === 2 && <RFCOMFaults ref={rfcomRef} />}
            {tab === 3 && <FaultSummary />}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}