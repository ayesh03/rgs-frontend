import { useState, useRef, useCallback } from "react";
import { Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import ReportHeader from "../components/ReportHeader";
import OnboardRadioPage from "../pages/OnboardRadioPage";
import useExport from "../hooks/useExport";

export default function OnboardRadio() {
  const [stage, setStage] = useState("FILTER");
  const { exportExcel, exportPDF } = useExport();

  const radioRef = useRef();

  const handleAction = useCallback(async (actionType) => {
    const ref = radioRef.current;
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
    const ref = radioRef.current;
    if (!ref) return;

    const rows = isAll ? ref.getAllRows?.() : ref.getFilteredRows?.();
    const cols = ref.getVisibleColumns?.();

    if (type === "excel") exportExcel(rows, cols, "onboard_radio", "radio");
    else exportPDF(rows, cols, "onboard_radio", "radio");
  };

  return (
    <Box sx={{ p: { xs: 1, md: 0.5 } }}>
      <ReportHeader
        stage={stage}
        showTableType={false}
        onGenerate={() => handleAction("generate")}
        onClear={() => handleAction("clear")}
        onColumns={() => radioRef.current?.openColumnDialog?.()}
        onSave={() => handleExport("excel", false)}
        onSaveAll={() => handleExport("excel", true)}
        onPrint={() => handleExport("pdf", false)}
        onSearch={(v) => radioRef.current?.search?.(v)}
      />

      <AnimatePresence mode="wait">
        <motion.div>
          <OnboardRadioPage ref={radioRef} />
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}