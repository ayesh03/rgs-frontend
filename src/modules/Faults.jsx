import { useState, useRef, useCallback } from "react";
import { Box, Tabs, Tab, Paper, alpha } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import ReportHeader from "../components/ReportHeader";
import LocoFaults from "../pages/LocoFaults";
import FaultSummary from "../pages/FaultSummary";

import useExport from "../hooks/useExport";

export default function Faults() {
  const [tab, setTab] = useState(0);
  const { exportExcel, exportPDF } = useExport();

  const stationRef = useRef();
  const locoRef = useRef();

  const [stage, setStage] = useState("FILTER");

  // Correct tab → ref mapping
  const tabRefs = {
    0: stationRef,
    1: locoRef,
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
      <ReportHeader
        stage={stage}
        showTableType={false}
        showException={false}
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
              tab === 0 ? "station_faults" : "loco_faults"
            );
        }}

        onSaveAll={() => {
          const rows = tabRefs[tab]?.current?.getAllRows?.();
          const cols = tabRefs[tab]?.current?.getVisibleColumns?.();
          if (rows && cols)
            exportExcel(
              rows,
              cols,
              tab === 0 ? "station_faults_all" : "loco_faults_all"
            );
        }}

        onPrint={() => {
          const rows = tabRefs[tab]?.current?.getFilteredRows?.();
          const cols = tabRefs[tab]?.current?.getVisibleColumns?.();
          if (rows && cols)
            exportPDF(
              rows,
              cols,
              tab === 0 ? "station_faults" : "loco_faults"
            );
        }}
      />

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          mb: 1,
          bgcolor: alpha("#f1f5f9", 0.5),
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": { fontWeight: "bold", px: 3 },
            "& .Mui-selected": { color: "primary.main" },
          }}
        >
          <Tab label="Station Faults" />
          <Tab label="Loco Faults" />
          <Tab label="Fault Summary" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 0 && (
              <LocoFaults ref={stationRef} originType="STATION" />
            )}
            {tab === 1 && (
              <LocoFaults ref={locoRef} originType="LOCO" />
            )}
            {tab === 2 && <FaultSummary />}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
