import { useState, useRef, forwardRef } from "react";
import { Box, Paper, Tabs, Tab } from "@mui/material";

import ReportHeader from "../components/ReportHeader";
import useExport from "../hooks/useExport";
import Stationarykavachinfo from "../pages/Stationarykavachinfo";

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

  const tabRefs = {
    0: regularRef,
    1: accessRef,
    2: emergencyRef,
  };

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

  return (
    <Box>
      <ReportHeader
        stage={stage}
        showTableType={false}
        onGenerate={handleGenerate}
        onClear={handleClear}
        onColumns={() => getCurrentRef()?.openColumnDialog?.()}

        onSave={() => {
  const currentRef = getCurrentRef();
  if (!currentRef) return;

  const rows = currentRef.getFilteredRows();
  let cols = currentRef.getVisibleColumns();
  const subPacket = currentRef.getSubPacket?.();

  cols = cols?.filter(
    (c) => c.key !== "pkt_type" && c.key !== "pkt_length"
  );

  if (rows && cols) {
    exportExcel(rows, cols, getTableType(), subPacket);
  }
}}

onSaveAll={() => {
  const currentRef = getCurrentRef();
  if (!currentRef) return;

  const rows = currentRef.getAllRows();
  let cols = currentRef.getVisibleColumns();
  const subPacket = currentRef.getSubPacket?.();

  cols = cols?.filter(
    (c) => c.key !== "pkt_type" && c.key !== "pkt_length"
  );

  if (rows && cols) {
    exportExcel(rows, cols, getTableType(), subPacket);
  }
}}

onPrint={() => {
  const currentRef = getCurrentRef();
  if (!currentRef) return;

  const rows = currentRef.getFilteredRows();
  let cols = currentRef.getVisibleColumns();
  const subPacket = currentRef.getSubPacket?.();

  cols = cols?.filter(
    (c) => c.key !== "pkt_type" && c.key !== "pkt_length"
  );

  if (rows && cols) {
    exportPDF(rows, cols, getTableType(), subPacket);
  }
}}


      />

      <Paper>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Station Regular" />
          <Tab label="Access Authority" />
          <Tab label="Additional Emergency" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 1 }}>
        {tab === 0 && <StationRegular ref={regularRef} />}
        {tab === 1 && <AccessAuthority ref={accessRef} />}
        {tab === 2 && <AdditionalEmergency ref={emergencyRef} />}
      </Box>
    </Box>
  );
}
