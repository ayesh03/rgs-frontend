import { Box, Card, CardContent, LinearProgress, Stack } from "@mui/material";

import { useState, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";

import PaginationControls from "../components/PaginationControls";
import RowsPerPageControl from "../components/RowsPerPageControl";
import NoResult from "../components/NoResult";
import ColumnFilterDialog from "../components/ColumnFilterDialog";
import { useTheme, useMediaQuery } from "@mui/material";
import OnboardRadioTable from "../components/OnboardRadioTable";
import { useAppContext } from "../context/AppContext";

const OnboardRadioPage = forwardRef((props, ref) => {
  const { fromDate, toDate, isDateRangeValid } = useAppContext();
  const { selectedFile } = useOutletContext();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [page, setPage] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedColumns, setSelectedColumns] = useState([]);

  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 6 : 12);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const generate = async () => {
    if (!isDateRangeValid || !selectedFile) return;

    setLoading(true);
    setRows([]);

    try {
      const fileBuffer = await selectedFile.arrayBuffer();

      const res = await fetch(
        `${API_BASE}/api/onboard/radio/by-date?from=${fromDate}&to=${toDate}`,
        {
          method: "POST",
          body: fileBuffer,
          headers: { "Content-Type": "application/octet-stream" },
        },
      );

      const json = await res.json();

      const mapped = (json.data || []).map((pkt, i) => ({
        id: i + 1,

        // EXISTING
        event_time: pkt.event_time,
        msg_type: pkt.msg_type,

        sequence: pkt.sequence,
        kavach_id: pkt.kavach_id,
        nms_id: pkt.nms_id,
        version: pkt.version,
        date: pkt.date,
        time: pkt.time,
        radio_pkt_count: pkt.radio_pkt_count,
        crc: pkt.crc,

        sub_packets:
          pkt.sub_packets && pkt.sub_packets.length > 0
            ? pkt.sub_packets
            : [
                {
                  packet: pkt.packet || pkt.msg_type,
                  ...pkt,
                  sub_packets: [],
                },
              ],
      }));

      setAllRows(mapped);
      setRows(mapped);
      setPage(1);
    } catch (err) {
      console.error("RADIO API ERROR:", err);
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
    getFilteredRows: () => rows,
    getAllRows: () => rows,
    getVisibleColumns: () =>
      selectedColumns.length
        ? getAllColumns(rows).filter((col) =>
            selectedColumns.includes(col.label),
          )
        : getAllColumns(rows),
    openColumnDialog: () => setColumnDialogOpen(true),
    search: (value) => {
      if (!value) {
        setRows(allRows);
        return;
      }

      const v = value.toLowerCase();

      const filtered = allRows.filter(
        (r) =>
          String(r.event_time).toLowerCase().includes(v) ||
          String(r.msg_type).toLowerCase().includes(v),
      );

      setRows(filtered);
      setPage(1);
    },
  }));

  const totalPages = Math.ceil(rows.length / rowsPerPage);

  const paginatedRows = rows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );
  const getAllColumns = (rows) => {
    const keys = new Set();

    rows.forEach((row) => {
      row.sub_packets?.forEach((pkt) => {
        Object.keys(pkt).forEach((k) => {
          if (k !== "packet" && k !== "sub_packets") keys.add(k);
        });

        pkt.sub_packets?.forEach((sp) => {
          Object.keys(sp).forEach((k) => {
            if (k !== "type") keys.add(k);
          });
        });
      });
    });

    return [
  { key: "event_time", label: "Event Time" },
  { key: "msg_type", label: "Message Type" },


  { key: "sequence", label: "Sequence" },
  { key: "kavach_id", label: "Kavach ID" },
  { key: "nms_id", label: "NMS ID" },
  { key: "version", label: "Version" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "radio_pkt_count", label: "Radio Packet Count" },
  { key: "crc", label: "CRC" },

  ...Array.from(keys).map((k) => ({
    key: k,
    label: k,
  })),
];
  };
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Stack direction="row" justifyContent="flex-end">
        {rows.length > 0 && (
          <RowsPerPageControl
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            setPage={setPage}
          />
        )}
      </Stack>

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
                <OnboardRadioTable
                  rows={paginatedRows}
                  visibleColumns={selectedColumns}
                />
              </CardContent>
            </Card>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 1.2,
                p: 1,
                bgcolor: "rgba(255,255,255,0.02)",
                borderRadius: 2,
              }}
            >
              <PaginationControls
                page={page}
                setPage={setPage}
                totalPages={totalPages}
              />
            </Box>
          </>
        ) : (
          <NoResult />
        )}
      </AnimatePresence>

      <ColumnFilterDialog
        open={columnDialogOpen}
        column="Radio Columns"
        values={getAllColumns(rows).map((c) => c.label)}
        selectedValues={
          selectedColumns.length
            ? selectedColumns
            : getAllColumns(rows).map((c) => c.label)
        }
        onClose={() => setColumnDialogOpen(false)}
        onApply={(vals) => {
          setSelectedColumns(vals);
          setColumnDialogOpen(false);
        }}
      />
    </Box>
  );
});

export default OnboardRadioPage;
