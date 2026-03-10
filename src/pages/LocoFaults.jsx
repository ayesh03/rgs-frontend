import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { useOutletContext } from "react-router-dom";
import RowsPerPageControl from "../components/RowsPerPageControl";

import LocoFaultsTable from "../components/LocoFaultsTable";
import PaginationControls from "../components/PaginationControls";
import NoResult from "../components/NoResult";
import ColumnFilterDialog from "../components/ColumnFilterDialog";

import { FAULT_ALL_COLUMNS } from "../constants/faultColumns";
import { useAppContext } from "../context/AppContext";

const LocoFaults = forwardRef(({ originType }, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { fromDate, toDate, isDateRangeValid } = useAppContext();
  const { selectedFile } = useOutletContext();

  /* ===================== STATE ===================== */
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 6: 12);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(
    FAULT_ALL_COLUMNS.map((c) => c.key)
  );

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // /* ===================== AUTO-FETCH ON TAB CHANGE ===================== */
  // useEffect(() => {
  //   if (selectedFile && fromDate && toDate && isDateRangeValid) {
  //     generate();
  //   }
  // }, [originType, selectedFile]);

  /* ===================== GENERATE ===================== */
  const generate = async () => {
    if (!isDateRangeValid || !selectedFile) return;

    setLoading(true);
    setRows([]);

    try {
      const normalize = (v) => (v && v.length === 16 ? `${v}:00` : v);
      const from = encodeURIComponent(normalize(fromDate));
      const to = encodeURIComponent(normalize(toDate));
      const fileBuffer = await selectedFile.arrayBuffer();

      const res = await fetch(
        `${API_BASE}/api/loco-faults/by-date?from=${from}&to=${to}`,
        {
          method: "POST",
          body: fileBuffer,
          headers: { "Content-Type": "application/octet-stream" },
        }
      );

      const json = await res.json();
      if (json.success === false) throw new Error(json.error || "Backend error");

      const mappedRows = (json.data || []).map((r, idx) => {
        const dt = new Date(r.event_time);
        return {
          id: idx + 1,
          date: dt.toISOString().slice(0, 10),
          time: dt.toTimeString().slice(0, 8),
          ...r,
        };
      });

      setRows(mappedRows);
      setPage(1);
    } catch (err) {
      console.error("LocoFaults API error:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setRows([]);
    setPage(1);
  };

  useImperativeHandle(ref, () => ({
    generate,
    clear,
    getFilteredRows: () => filteredRows,
    getAllRows: () => rows,
    getVisibleColumns: () => FAULT_ALL_COLUMNS.filter((c) => visibleKeys.includes(c.key)),
    openColumnDialog: () => setColumnDialogOpen(true),
  }));

  const filteredRows = rows.filter((r) => r.fault_origin === originType);
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  /* ===================== ANIMATION VARIANTS ===================== */
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  return (
    <Box
      sx={{ width: "100%", p: { xs: 1, md: 0.5 } }}
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HEADER SECTION */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb:1,mt: 0.5, px: 1 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {/* <Box
            sx={{
              p: 1,
              borderRadius: "10px",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
            }}
          >
            <EngineeringIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
          </Box> */}
          {/* <Box>
            <Typography sx={{ fontWeight: 900, fontSize: "0.9rem", color: "#fff", letterSpacing: 1 }}>
              {originType === "STATION" ? "STATION FAULT DIAGNOSTICS" : "LOCO FAULT DIAGNOSTICS"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
              Real-time System Anomaly Logs
            </Typography>
          </Box> */}
        </Stack>

        {filteredRows.length > 0 && (
          <RowsPerPageControl
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            setPage={setPage}
          />
        )}
      </Stack>

      {/* DATA CONTENT */}
      <AnimatePresence mode="wait">
        {loading ? (
          <Box key="loading" sx={{ py: 10, textAlign: "center" }}>
            <LinearProgress
              sx={{
                width: "60%",
                mx: "auto",
                height: 4,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.05)",
                "& .MuiLinearProgress-bar": { borderRadius: 2, bgcolor: theme.palette.primary.main },
              }}
            />
            <Typography sx={{ mt: 2, color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", letterSpacing: 2 }}>
              SCANNING KAVACH FAULT REGISTERS...
            </Typography>
          </Box>
        ) : filteredRows.length > 0 ? (
          <Box key="data">
            <Card
              sx={{
                bgcolor: "rgba(18, 18, 18, 0.4)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px 0 rgba(0,0,0,0.3)",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <LocoFaultsTable
                  rows={paginatedRows}
                  columns={FAULT_ALL_COLUMNS}
                  visibleKeys={visibleKeys}
                />
              </CardContent>
            </Card>

            {/* PAGINATION */}
            <Stack
              direction="row"
              justifyContent="center"
              sx={{
                mt: 1.2,
                "& .MuiPaginationItem-root": {
                  color: "rgba(255,255,255,0.7)",
                  borderColor: "rgba(255,255,255,0.1)",
                  "&.Mui-selected": {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.primary.light,
                    border: `1px solid ${theme.palette.primary.main}`,
                  },
                },
              }}
            >
              <PaginationControls page={page} setPage={setPage} totalPages={totalPages} />
            </Stack>
          </Box>
        ) : (
          <Box key="empty" sx={{ py: 8 }}>
            <NoResult />
          </Box>
        )}
      </AnimatePresence>

      {/* DIALOG */}
      <ColumnFilterDialog
        open={columnDialogOpen}
        column="Fault Columns"
        values={FAULT_ALL_COLUMNS.map((c) => c.label)}
        selectedValues={visibleKeys.map((key) => FAULT_ALL_COLUMNS.find((c) => c.key === key)?.label)}
        onClose={() => setColumnDialogOpen(false)}
        onApply={(labels) => {
          const keys = FAULT_ALL_COLUMNS.filter((c) => labels.includes(c.label)).map((c) => c.key);
          setVisibleKeys(keys);
          setColumnDialogOpen(false);
        }}
      />
    </Box>
  );
});

export default LocoFaults;