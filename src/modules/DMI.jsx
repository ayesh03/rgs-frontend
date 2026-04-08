import { useState, useRef, useCallback, useEffect } from "react";
import { Box, Tabs, Tab, Paper, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

import ReportHeader from "../components/ReportHeader";
import DMIEvents from "../pages/DMIEvents";
import useExport from "../hooks/useExport";

export default function DMI() {
  const theme = useTheme();
  const location = useLocation();
  const [tab, setTab] = useState(0);
  const [stage, setStage] = useState("FILTER");
  const { exportExcel, exportPDF } = useExport();

  const dmiRef = useRef();

  const tabRefs = {
    0: dmiRef,
  };

  /* ================= AUTO GENERATE ================= */
  useEffect(() => {
    const state = location.state;
    if (!state?.autoGenerate) return;

    setTimeout(async () => {
      const ref = tabRefs[0]?.current;
      if (ref) {
        setStage("ENGINE");
        await ref.generate();
        setStage("PREVIEW");
      }
    }, 100);
  }, [location.state]);

  /* ================= ACTION HANDLER ================= */
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
    const ref = tabRefs[tab]?.current;
    if (!ref) return;

    const rows = isAll ? ref.getAllRows?.() : ref.getFilteredRows?.();
    const cols = ref.getVisibleColumns?.();

    if (rows && cols) {
      if (type === "excel") exportExcel(rows, cols, "dmi_events");
      else exportPDF(rows, cols, "dmi_events");
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 0.5 }, minHeight: "100vh" }}>
      
      {/* HEADER */}
      <ReportHeader
        stage={stage}
        showTableType={false}
        onGenerate={() => handleAction("generate")}
        onClear={() => handleAction("clear")}
        onColumns={() => dmiRef.current?.openColumnDialog?.()}
        onSave={() => handleExport("excel", false)}
        onSaveAll={() => handleExport("excel", true)}
        onPrint={() => handleExport("pdf", false)}
        onSearch={(v) => dmiRef.current?.search?.(v)}
      />

      {/* TABS */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "12px",
          mb: 0.3,
          bgcolor: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{
            "& .MuiTabs-indicator": {
              height: 3,
              bgcolor: theme.palette.primary.main
            },
            "& .MuiTab-root": {
              fontWeight: 700,
              fontSize: "1.2rem",
              color: "rgba(255,255,255,0.4)",
              "&.Mui-selected": { color: "#fff" }
            }
          }}
        >
          <Tab label="DMI EVENTS" />
        </Tabs>
      </Paper>

      {/* CONTENT */}
      <Box>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DMIEvents ref={dmiRef} />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}