import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import MovingIcon from "@mui/icons-material/Moving";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

import LocoMovementTable from "../components/LocoMovementTable";
import PaginationControls from "../components/PaginationControls";
import ColumnFilterDialog from "../components/ColumnFilterDialog";

import useTableFilter from "../hooks/useFilterTable";
import { useAppContext } from "../context/AppContext";

import {
  ONBOARD_COLUMNS,
  ACCESS_COLUMNS,
} from "../constants/locoColumns";


const LocoMovement = forwardRef(({ tableType }, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(false);
  const [allRows, setAllRows] = useState([]);
  const [rows, setRows] = useState([]);

  const [page, setPage] = useState(1);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);




  /* ================= CONTEXT ================= */
  const { fromDate, toDate, logDir, isDateRangeValid } = useAppContext();
  const { filteredRows, setFilter, clearFilters } = useTableFilter(rows);

  const rowsPerPage = isMobile ? 6 : 10;
  const columns =
    tableType === "access"
      ? ACCESS_COLUMNS
      : ONBOARD_COLUMNS;

  const [visibleKeys, setVisibleKeys] = useState(
    columns.map(c => c.key)
  );




  /* ================= RESET ON TABLE SWITCH ================= */
  useEffect(() => {
    if (!allRows.length) return;

    const filtered =
      tableType === "onboard"
        ? allRows.filter(r => r.packet_type === 10 || r.packet_type === "10")
        : allRows.filter(r => r.packet_type === 13 || r.packet_type === "13");

    setRows(filtered);
    clearFilters();
    setPage(1);
  }, [tableType, allRows]);

  useEffect(() => {
    setVisibleKeys(columns.map(c => c.key));
  }, [tableType]);



  /* ================= DATA FETCH ================= */
  const generate = async () => {
    if (!fromDate || !toDate) {
      alert("Please select From and To date");
      return;
    }

    if (!isDateRangeValid) {
      alert("Invalid date range");
      return;
    }

    setLoading(true);
    setRows([]);
    clearFilters();

    try {
      const normalizeDate = (v) =>
        v && v.length === 16 ? `${v}:00` : v;

      const encodedFrom = encodeURIComponent(normalizeDate(fromDate));
      const encodedTo = encodeURIComponent(normalizeDate(toDate));

      const API_BASE = import.meta.env.VITE_API_BASE_URL;

      const url =
        `${API_BASE}/api/loco-movement/by-date` +
        `?from=${encodedFrom}` +
        `&to=${encodedTo}` +
        `&logDir=${encodeURIComponent(logDir)}`;

      const res = await fetch(url);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Backend error");
      }

      const mappedRows = json.data.map((r, idx) => {
        const dt = new Date(r.event_time);

        return {
          id: idx + 1,
          date: dt.toISOString().slice(0, 10),
          time: dt.toTimeString().slice(0, 8),
          ...r,
        };
      });


      setAllRows(mappedRows);
      setPage(1);

    } catch (err) {
      console.error("Loco Movement fetch error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };


  const clear = () => {
    setRows([]);
    setPage(1);
    clearFilters();
  };

  /* ================= EXPOSE API ================= */
  useImperativeHandle(ref, () => ({
    generate,
    clear,
    getFilteredRows: () => filteredRows,
    getAllRows: () => allRows,
    getVisibleColumns: () =>
      columns.filter(c => visibleKeys.includes(c.key)),


    openColumnDialog: () => setColumnDialogOpen(true),
    searchByLoco: (value) => setFilter("source_loco_id", value),
  }));
  //very nothing to say just organized very simpler way than
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  /* ================= UI ================= */
  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Stack direction="row" spacing={0.5}>
          <MovingIcon color="primary" fontSize="small" />
          <Typography fontWeight={900} fontSize="0.75rem">
            LOCO MOVEMENT
          </Typography>
        </Stack>
        {/* <Tooltip title="Select Columns">
          <IconButton size="small" onClick={() => setColumnDialogOpen(true)} disabled={!rows.length}>
            <ViewColumnIcon fontSize="small" />
          </IconButton>
        </Tooltip> */}
      </Box>

      <AnimatePresence>
        {loading ? (
          <LinearProgress />
        ) : (
          <Card variant="outlined">
            <CardContent sx={{ p: 0 }}>
              {filteredRows.length ? (
                <LocoMovementTable
                  rows={paginatedRows}
                  columns={columns}
                  visibleKeys={visibleKeys}
                />


              ) : (
                <Box
                  sx={{
                    minHeight: 280,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: "text.secondary",
                    }}
                  >
                    NO MOVEMENT DATA FOUND
                  </Typography>
                </Box>
              )}
            </CardContent>

          </Card>
        )}
      </AnimatePresence>

      {filteredRows.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 1,
            mb: 0.5,
          }}
        >
          <PaginationControls
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            size="small"
          />
        </Box>
      )}
      <ColumnFilterDialog
        open={columnDialogOpen}
        column="Columns"
        values={columns.map(c => c.label)}
        selectedValues={visibleKeys.map(
          key => columns.find(c => c.key === key)?.label
        )}
        onClose={() => setColumnDialogOpen(false)}
        onApply={(labels) => {
          setVisibleKeys(
            columns
              .filter(c => labels.includes(c.label))
              .map(c => c.key)
          );
          setColumnDialogOpen(false);
        }}
      />


    </Box>
  );
});

export default LocoMovement;
