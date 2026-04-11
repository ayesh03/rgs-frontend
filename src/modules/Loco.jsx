import { useRef, useState, useMemo } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";

import ReportHeader from "../components/ReportHeader";
import LocoMovement from "../pages/LocoMovement";
import ExceptionReport from "../pages/ExceptionReport";
import useExport from "../hooks/useExport";

import AdvancedSearchDialog from "../components/AdvancedSearchDialog";

import {
  ONBOARD_COLUMNS,
  ACCESS_COLUMNS,
  ROUTE_RFID_COLUMNS,
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

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const [exceptionType, setExceptionType] = useState("Emergency Brake");


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

  const locoList = (locoRef.current?.getAllRows?.() || [])
    .map(r => r.source_loco_id)
    .filter(v => v != null && v !== "")
    .map(String);

  const uniqueLocos = [...new Set(locoList)];

  return (
    <Box sx={{ p: 0.5 }}>
      <ReportHeader
        stage={stage}
        tableType={tableType}
        showTableType={true}
        onTableTypeChange={setTableType}
        onGenerate={handleGenerate}
        onClear={handleClear}
        onAdvancedSearch={() => setAdvancedOpen(true)}
        onColumns={() => activeTabContext.ref.current?.openColumnDialog()}
        onSearch={(value) =>
          activeTabContext.ref.current?.searchByLoco?.(value)
        }
        exceptionTab={tab === 1}
        exceptionType={exceptionType}
        onExceptionTypeChange={(type) => {
          setExceptionType(type);
          exceptionRef.current?.setType?.(type);


          setTimeout(() => {
            exceptionRef.current?.generate?.();
          }, 0);
        }}
        onSave={() => {
          const rows = activeTabContext.ref.current?.getFilteredRows();
          const cols = activeTabContext.ref.current?.getVisibleColumns?.();

          const reportTypeFinal = tab === 1 ? "exception" : tableType;

          if (rows && cols)
            exportExcel(rows, cols, reportTypeFinal, exceptionType);
        }}

        onSaveAll={() => {
          const rows = activeTabContext.ref.current?.getFilteredRows();

          const cols =
            tableType === "access"
              ? ACCESS_COLUMNS
              : tableType === "route_rfid"
                ? ROUTE_RFID_COLUMNS
                : ONBOARD_COLUMNS;

          const reportTypeFinal = tab === 1 ? "exception" : tableType;

          if (rows && cols) {
            exportExcel(rows, cols, reportTypeFinal, exceptionType);
          }
        }}

        onPrint={() => {
          const rows = activeTabContext.ref.current?.getFilteredRows();
          const cols = activeTabContext.ref.current?.getVisibleColumns?.();

          const reportTypeFinal = tab === 1 ? "exception" : tableType;

          if (rows && cols)
            exportPDF(rows, cols, reportTypeFinal, exceptionType);
        }}


      />

      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(12px)",
          mb: 0.5,
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, v) => {
            setTab(v);
            setStage("FILTER");
          }}
          sx={{
            minHeight: "36px",

            "& .MuiTabs-indicator": {
              backgroundColor: "#4dabf7",
              height: 3,
              borderRadius: 2,
            },
          }}
        >
          <Tab
            label="Loco Movement"
            sx={{
              textTransform: "none",
              fontSize: "0.9rem",
              minHeight: "36px",
              color: "rgba(255,255,255,0.6)",
              "&.Mui-selected": {
                color: "#fff",
                fontWeight: 600,
              },
            }}
          />

          <Tab
            label="Exception Report"
            sx={{
              textTransform: "none",
              fontSize: "0.9rem",
              minHeight: "36px",
              color: "rgba(255,255,255,0.6)",
              "&.Mui-selected": {
                color: "#fff",
                fontWeight: 600,
              },
            }}
          />
        </Tabs>
      </Paper>

      {/* ===== CONTENT ===== */}
      <Box sx={{ mt: 0.5 }}>
        <LocoMovement ref={locoRef} tableType={tableType} />

        {tab === 1 && (
          <ExceptionReport
            ref={exceptionRef}
            innerRef={locoRef}
          />
        )}
      </Box>

      <AdvancedSearchDialog
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        onApply={(filters) => {
          setAdvancedFilters(filters);
          locoRef.current?.applyAdvancedFilters?.(filters);
        }}
        locoOptions={uniqueLocos}
      />
    </Box>
  );
}