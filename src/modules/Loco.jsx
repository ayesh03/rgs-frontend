import { useRef, useState, useMemo } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";

import ReportHeader from "../components/ReportHeader";
import LocoMovement from "../pages/LocoMovement";
import ExceptionReport from "../pages/ExceptionReport";
import useExport from "../hooks/useExport";
import {
  ONBOARD_COLUMNS,
  ACCESS_COLUMNS,
} from "../constants/locoColumns";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
export default function Loco() {
  const [tab, setTab] = useState(0);
  const [stage, setStage] = useState("FILTER");

  const locoRef = useRef();
  const exceptionRef = useRef();
  const [tableType, setTableType] = useState("onboard");
  const location = useLocation();


  const activeTabContext = useMemo(() => {
    return tab === 0
      ? {
        ref: locoRef,
        title: "Loco Movement Report",
      }
      : {
        ref: exceptionRef,
        title: "Loco Exception Report",
      };
  }, [tab]);

  const { exportExcel, exportPDF } = useExport();

  useEffect(() => {
    const state = location.state;
    if (!state?.autoGenerate) return;

    const run = async () => {
      const ref = locoRef.current;
      if (!ref) return;

      setStage("ENGINE");

      await ref.generate();

      if (state.dashboardFilter) {
        const { field, value, extra } = state.dashboardFilter;

        const normalizedValue = Array.isArray(value)
          ? value.map(v => Number(v))   // keep array BUT ensure numbers
          : Number(value);

        // handle array filter manually
        if (Array.isArray(normalizedValue)) {
          ref.setFilter?.(field, (val) => normalizedValue.includes(Number(val)));
        } else {
          ref.setFilter?.(field, normalizedValue);
        }
        if (extra) {
          const extraValue = Array.isArray(extra.value)
            ? extra.value.map(v => isNaN(v) ? v : Number(v))
            : isNaN(extra.value) ? extra.value : Number(extra.value);

          ref.setFilter?.(extra.field, extraValue);
        }
      }

      setStage("PREVIEW");
    };

    run();
  }, []);

  const handleGenerate = async () => {
    const ref = activeTabContext.ref.current;
    if (!ref) return;

    setStage("ENGINE");

    // remove dashboard filter only once
    // if (ref.dashboardFiltered) {
    //   ref.clearFilters?.();
    //   ref.dashboardFiltered = false;
    // }

    ref.clearFilters?.();
    await ref.generate();

    setStage("PREVIEW");
  };
  const handleClear = () => {
    activeTabContext.ref.current?.clear();
    setStage("FILTER");
  };

  return (
    <Box sx={{ p: 0.5 }}>
      <ReportHeader
        stage={stage}
        tableType={tableType}
        showTableType={true}
        onTableTypeChange={setTableType}
        showException
        onGenerate={handleGenerate}
        onClear={handleClear}
        onColumns={() => activeTabContext.ref.current?.openColumnDialog()}
        onSearch={(value) =>
          activeTabContext.ref.current?.searchByLoco?.(value)
        }
        onSave={() => {
          const rows = activeTabContext.ref.current?.getFilteredRows();
          const cols = activeTabContext.ref.current?.getVisibleColumns?.();
          if (rows && cols)
            exportExcel(rows, cols, tableType);
        }}

        onSaveAll={() => {
          const rows = activeTabContext.ref.current?.getFilteredRows();
          const cols =
            tableType === "access"
              ? ACCESS_COLUMNS
              : ONBOARD_COLUMNS;

          if (rows && cols) {
            exportExcel(rows, cols, tableType);
          }
        }}

        onPrint={() => {
          const rows = activeTabContext.ref.current?.getFilteredRows();
          const cols = activeTabContext.ref.current?.getVisibleColumns?.();
          if (rows && cols)
            exportPDF(rows, cols, tableType);
        }}


      />

      {/* ===== TAB NAVIGATION ===== */}
      {/* <Paper elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}> */}
      {/* <Tabs */}
      {/* value={tab} */}
      {/* onChange={(e, v) => { */}
      {/* setTab(v); */}
      {/* setStage("FILTER"); */}
      {/* }} */}
      {/* > */}

      {/* <Tab label="Loco Movement" /> */}
      {/* <Tab label="Exception Report" /> */}
      {/* </Tabs> */}
      {/* </Paper> */}

      {/* ===== CONTENT ===== */}
      <Box sx={{ mt: 0.5 }}>
        <LocoMovement ref={locoRef} tableType={tableType} />
        {tab === 1 && <ExceptionReport ref={exceptionRef} />}
      </Box>
    </Box>
  );
}