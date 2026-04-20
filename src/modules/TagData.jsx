import { useState, useRef, useCallback } from "react";
import { Box, Tabs, Tab, Paper, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import ReportHeader from "../components/ReportHeader";
import TagDataPage from "../pages/TagDataPage";
import useExport from "../hooks/useExport";

export default function TagData() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [stage, setStage] = useState("FILTER");
  const { exportExcel, exportPDF } = useExport();

  const tagRef = useRef();

  const handleAction = useCallback(async (actionType) => {
    const ref = tagRef.current;
    if (!ref) return;

    if (actionType === "generate") {
      setStage("ENGINE");
      await ref.generate();
      setStage("PREVIEW");
    }

    if (actionType === "clear") {
      ref.clear();
      setStage("FILTER");
    }
  }, []);

  const handleExport = (type, isAll = false) => {
    const ref = tagRef.current;
    if (!ref) return;

    const rows = isAll ? ref.getAllRows?.() : ref.getFilteredRows?.();
    const cols = ref.getVisibleColumns?.();

    if (type === "excel") exportExcel(rows, cols, "tag_data", "tag");
else exportPDF(rows, cols, "tag_data", "tag");
  };

  return (
    <Box sx={{ p: { xs: 1, md: 0.5 } }}>
      <ReportHeader
        stage={stage}
        showTableType={false}
        onGenerate={() => handleAction("generate")}
        onClear={() => handleAction("clear")}
        onColumns={() => tagRef.current?.openColumnDialog?.()}
        onSave={() => handleExport("excel", false)}
        onSaveAll={() => handleExport("excel", true)}
        onPrint={() => handleExport("pdf", false)}
        onSearch={(v) => tagRef.current?.search?.(v)}
      />

      {/* <Paper sx={{ mb: 0.3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="TAG DATA" />
        </Tabs>
      </Paper> */}

      <AnimatePresence mode="wait">
        <motion.div key={tab}>
          <TagDataPage ref={tagRef} />
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}