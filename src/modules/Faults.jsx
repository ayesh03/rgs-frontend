import { useState, useRef, useCallback, useEffect } from "react";
import { Box, Tabs, Tab, Paper, alpha, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

import ReportHeader from "../components/ReportHeader";
import LocoFaults from "../pages/LocoFaults";
import FaultSummary from "../pages/FaultSummary";
import useExport from "../hooks/useExport";

export default function Faults() {
  const theme = useTheme();
  const location = useLocation();
  const [tab, setTab] = useState(0);
  const [stage, setStage] = useState("FILTER");
  const { exportExcel, exportPDF } = useExport();

  // Refs for child components
  const stationRef = useRef();
  const locoRef = useRef();

  // Map tabs to refs for easier action handling
  const tabRefs = {
    0: stationRef,
    1: locoRef,
  };

  /* ===================== AUTO-GENERATE LOGIC ===================== */
  useEffect(() => {
    const state = location.state;
    if (!state?.autoGenerate) return;

    const runAutoGenerate = async () => {
      // Determine which tab to trigger based on navigation state
      const targetTab = state?.targetTab !== undefined ? state.targetTab : 0;
      setTab(targetTab);

      // Small delay to ensure the ref is attached after tab switch
      setTimeout(async () => {
        const currentRef = tabRefs[targetTab]?.current;
        if (currentRef) {
          setStage("ENGINE");
          await currentRef.generate();
          setStage("PREVIEW");
        }
      }, 100);
    };

    runAutoGenerate();
  }, [location.state]);

  /* ===================== ACTION HANDLER ===================== */
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

  const handleExport = (type, isAll = false) => {
    const currentRef = tabRefs[tab]?.current;
    if (!currentRef) return;

    const rows = isAll ? currentRef.getAllRows?.() : currentRef.getFilteredRows?.();
    const cols = currentRef.getVisibleColumns?.();
    const filename = tab === 0 ? "station_fault_report" : "loco_fault_report";

    if (rows && cols) {
      if (type === "excel") exportExcel(rows, cols, filename);
      else exportPDF(rows, cols, filename);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 0.5 }, minHeight: "100vh" }}>
      {/* HEADER SECTION */}
      <ReportHeader
        stage={stage}
        showTableType={false}
        showException={false}
        onGenerate={() => handleAction("generate")}
        onClear={() => handleAction("clear")}
        onColumns={() => tabRefs[tab]?.current?.openColumnDialog?.()}
        onSave={() => handleExport("excel", false)}
        onSaveAll={() => handleExport("excel", true)}
        onPrint={() => handleExport("pdf", false)}
      />

      {/* GLASSMORPHISM TABS */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "12px",
          mb: 0.3,
          bgcolor: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: "48px",
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
              bgcolor: theme.palette.primary.main,
              boxShadow: `0 -2px 10px ${theme.palette.primary.main}`,
            },
            "& .MuiTab-root": {
              fontWeight: 700,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "rgba(255,255,255,0.4)",
              transition: "0.3s",
              "&.Mui-selected": {
                color: "#fff",
              },
              "&:hover": {
                color: "rgba(255,255,255,0.8)",
                bgcolor: "rgba(255,255,255,0.02)",
              },
            },
          }}
        >
          <Tab label="Station Faults" />
          <Tab label="Loco Faults" />
          {/* <Tab label="Fault Summary" /> */}
        </Tabs>
      </Paper>

      {/* CONTENT AREA WITH ANIMATION */}
      <Box sx={{ position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {tab === 0 && (
              <LocoFaults ref={stationRef} originType="STATION" />
            )}
            {tab === 1 && (
              <LocoFaults ref={locoRef} originType="LOCO" />
            )}
            {/* {tab === 2 && (
              <Box sx={{ p: 2 }}>
                <FaultSummary />
              </Box>
            )} */}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}