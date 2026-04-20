import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import { useState, forwardRef, useImperativeHandle, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext, useLocation } from "react-router-dom";

import RowsPerPageControl from "../components/RowsPerPageControl";
import useTableFilter from "../hooks/useFilterTable";
import PaginationControls from "../components/PaginationControls";
import NoResult from "../components/NoResult";
import ColumnFilterDialog from "../components/ColumnFilterDialog";

import TagDataTable from "../components/TagDataTable";
import { TAG_ALL_COLUMNS } from "../constants/tagColumns";
import { useAppContext } from "../context/AppContext";

const TAGDATAEvents = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { fromDate, toDate, isDateRangeValid } = useAppContext();
  const { selectedFile } = useOutletContext();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 6 : 12);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);

  const handleSort = (key, direction) => {
    if (!direction) {
      setRows(allRows);
      return;
    }

    const sorted = [...rows].sort((a, b) => {
      const av = a[key] ?? "";
      const bv = b[key] ?? "";

      return direction === "asc"
        ? String(av).localeCompare(String(bv), undefined, { numeric: true })
        : String(bv).localeCompare(String(av), undefined, { numeric: true });
    });

    setRows(sorted);
  };

  const [visibleKeys, setVisibleKeys] = useState(
    TAG_ALL_COLUMNS.map((c) => c.key),
  );

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  /* ================= GENERATE ================= */
  const generate = async () => {
    if (!isDateRangeValid || !selectedFile) return;

    setLoading(true);
    setRows([]);

    try {
      const fileBuffer = await selectedFile.arrayBuffer();

      const res = await fetch(
        `${API_BASE}/api/onboard/tag/by-date?from=${fromDate}&to=${toDate}`,
        {
          method: "POST",
          body: fileBuffer,
          headers: { "Content-Type": "application/octet-stream" },
        },
      );

      const json = await res.json();

      const mapped = (json.data || []).map((pkt, i) => {
        return {
          id: i + 1,

          // packet fields
          event_time: pkt.event_time,
          kavach_id: pkt.kavach_id,
          nms_id: pkt.nms_id,
          message_sequence: pkt.message_sequence,
          version: pkt.version,
          tag_count: pkt.tag_count,

          tags: (pkt.tags || []).map((t) => ({
            ...t,
            tag_type: Number(t.tag_type),
          })),

          // default selected index
          selectedTagIndex: 0,
        };
      });

      setAllRows(mapped);
      setRows(mapped);
      setPage(1);
    } catch (err) {
      console.error("DMI API error:", err);
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
    getVisibleColumns: () =>
      TAG_ALL_COLUMNS.filter((c) => visibleKeys.includes(c.key)),
    openColumnDialog: () => setColumnDialogOpen(true),
    search: (value) => {
      if (!value) {
        setRows(allRows);
        return;
      }

      const v = value.toLowerCase();

      const filtered = allRows.filter(
        (r) =>
          String(r.kavach_id).includes(v) ||
          String(r.nms_id).includes(v) ||
          String(r.rfid_tag_id).includes(v) ||
          String(r.tag_type).toLowerCase().includes(v),
      );

      setRows(filtered);
      setPage(1);
    },
  }));

  const { filteredRows, setFilter } = useTableFilter(rows);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const paginatedRows = filteredRows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* HEADER */}
      <Stack direction="row" justifyContent="flex-end">
        {rows.length > 0 && (
          <RowsPerPageControl
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            setPage={setPage}
          />
        )}
      </Stack>

      {/* CONTENT */}
      <AnimatePresence>
        {loading ? (
          <LinearProgress sx={{ mt: 4 }} />
        ) : rows.length > 0 ? (
          <>
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
                <TagDataTable
                  rows={paginatedRows}
                  columns={TAG_ALL_COLUMNS.filter((c) =>
                    [
                      "event_time",
                      "kavach_id",
                      "nms_id",
                      "message_sequence",
                      "version",
                      "tag_count",
                    ].includes(c.key),
                  )}
                  visibleKeys={visibleKeys}
                  onColumnSearch={(key, value) => {
                    if (value) setFilter(key, value);
                    else setFilter(key, "");
                  }}
                  onSort={handleSort}
                />
              </CardContent>
            </Card>

            {filteredRows.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 1.2,
                  p: 1,
                  bgcolor: "rgba(255,255,255,0.02)",
                  borderRadius: 2,
                  "& .MuiPaginationItem-root": {
                    color: "rgba(255,255,255,0.7)",
                    borderColor: "rgba(255,255,255,0.1)",
                    "&.Mui-selected": {
                      bgcolor: "rgba(77,171,247,0.2)",
                      color: "#74c0fc",
                      border: "1px solid #4dabf7",
                    },
                  },
                }}
              >
                <PaginationControls
                  page={page}
                  setPage={setPage}
                  totalPages={totalPages}
                />
              </Box>
            )}
          </>
        ) : (
          <NoResult />
        )}
      </AnimatePresence>

      {/* COLUMN DIALOG */}
      <ColumnFilterDialog
        open={columnDialogOpen}
        column="Tag Columns"
        values={TAG_ALL_COLUMNS.map((c) => c.label)}
        selectedValues={visibleKeys.map(
          (k) => TAG_ALL_COLUMNS.find((c) => c.key === k)?.label,
        )}
        onClose={() => setColumnDialogOpen(false)}
        onApply={(labels) => {
          const keys = TAG_ALL_COLUMNS.filter((c) =>
            labels.includes(c.label),
          ).map((c) => c.key);

          setVisibleKeys(keys);
          setColumnDialogOpen(false);
        }}
      />
    </Box>
  );
});

export default TAGDATAEvents;
