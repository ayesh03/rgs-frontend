import { useState, useRef, forwardRef, useEffect } from "react";
import { Box, Paper, Tabs, Tab, alpha } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

import ReportHeader from "../components/ReportHeader";
import useExport from "../hooks/useExport";
import Stationarykavachinfo from "../pages/Stationarykavachinfo";

// Styled Wrapper Components using ForwardRef
const StationRegular = forwardRef((props, ref) => (
  <Stationarykavachinfo ref={ref} tableType="station_regular" />
));

const AccessAuthority = forwardRef((props, ref) => (
  <Stationarykavachinfo ref={ref} tableType="station_access" />
));

const AdditionalEmergency = forwardRef((props, ref) => (
  <Stationarykavachinfo ref={ref} tableType="station_emergency" />
));

export default function StationaryKavachInfo() {
  const [tab, setTab] = useState(0);
  const [stage, setStage] = useState("FILTER");
  const { exportExcel, exportPDF } = useExport();

  const regularRef = useRef();
  const accessRef = useRef();
  const emergencyRef = useRef();
  const location = useLocation();

  const tabRefs = {
    0: regularRef,
    1: accessRef,
    2: emergencyRef,
  };

  useEffect(() => {
  const state = location.state;
  if (!state?.autoGenerate) return;

  const tabIndex = state.tabIndex ?? 0;

  setTab(tabIndex);

  const run = async () => {
  const tryGenerate = () => {
    const ref = tabRefs[tabIndex]?.current;
    if (!ref) {
      setTimeout(tryGenerate, 100); // wait until tab mounts
      return;
    }

    setStage("ENGINE");
    ref.generate().then(() => setStage("PREVIEW"));
  };

  tryGenerate();
};

  const timer = setTimeout(run, 200);
  return () => clearTimeout(timer);
}, [location.state]);

  const getCurrentRef = () => tabRefs[tab]?.current;

  const getTableType = () => {
    if (tab === 1) return "station_access";
    if (tab === 2) return "station_emergency";
    return "station_regular";
  };

  const handleGenerate = async () => {
    const ref = getCurrentRef();
    if (!ref) return;
    setStage("ENGINE");
    await ref.generate();
    setStage("PREVIEW");
  };

  const handleClear = () => {
    const ref = getCurrentRef();
    if (!ref) return;
    ref.clear();
    setStage("FILTER");
  };

  const processExport = (exportFn, type = "filtered") => {
    const currentRef = getCurrentRef();
    if (!currentRef) return;

    const rows = type === "all" ? currentRef.getAllRows() : currentRef.getFilteredRows();
    let cols = currentRef.getVisibleColumns();
    const subPacket = currentRef.getSubPacket?.();

    // Clean columns for export
    cols = cols?.filter((c) => c.key !== "pkt_type" && c.key !== "pkt_length");

    if (rows && cols) {
      exportFn(rows, cols, getTableType(), subPacket);
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ReportHeader
        stage={stage}
        showTableType={false}
        onGenerate={handleGenerate}
        onClear={handleClear}
        onColumns={() => getCurrentRef()?.openColumnDialog?.()}
        onSave={() => processExport(exportExcel)}
        onSaveAll={() => processExport(exportExcel, "all")}
        onPrint={() => processExport(exportPDF)}
      />

      <Paper
        elevation={0}
        sx={{
          mt: 1,
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
              backgroundColor: "#4dabf7",
              boxShadow: "0px -2px 10px rgba(77, 171, 247, 0.8)",
            },
            "& .MuiTab-root": {
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              py: 2,
              transition: "all 0.3s ease",
              "&.Mui-selected": {
                color: "#4dabf7",
                background: alpha("#4dabf7", 0.05),
              },
              "&:hover": {
                color: "#fff",
                background: "rgba(255, 255, 255, 0.02)",
              },
            },
          }}
        >
          <Tab label="Station Regular" />
          <Tab label="Access Authority" />
          <Tab label="Additional Emergency" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 1.5, position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {tab === 0 && <StationRegular ref={regularRef} />}
            {tab === 1 && <AccessAuthority ref={accessRef} />}
            {tab === 2 && <AdditionalEmergency ref={emergencyRef} />}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}