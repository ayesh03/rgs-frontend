import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";

import {
  Box,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
} from "@mui/material";

import { useOutletContext } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { AnimatePresence } from "framer-motion";

import RowsPerPageControl from "../components/RowsPerPageControl";
import PaginationControls from "../components/PaginationControls";
import ColumnFilterDialog from "../components/ColumnFilterDialog";
import LocoMovementTable from "../components/LocoMovementTable";

import useTableFilter from "../hooks/useFilterTable";
const hexToAscii = (hex) => {
  if (!hex) return "";

  // detect empty / invalid receiver
  if (/^0+$/.test(hex) || /^30+0+$/.test(hex)) {
    return "N/A";
  }

  try {
    return hex
      .match(/.{1,2}/g)
      .map((b) => String.fromCharCode(parseInt(b, 16)))
      .join("")
      .replace(/\u0000/g, "");
  } catch {
    return hex;
  }
};
const COLUMNS = [
  { key: "msg_type", label: "Message Type" },
  { key: "event_time", label: "Date Time" },
  { key: "stationary_kavach_id", label: "Stationary ID" },
  { key: "nms_id", label: "NMS ID" },
  { key: "version", label: "Version" },
  { key: "sequence", label: "Sequence" },

  { key: "sender_id", label: "Sender ID" },
  { key: "receiver_id", label: "Receiver ID" },

  // dynamic fields (per type)
  { key: "frame_number", label: "Frame No" },
  { key: "inner_sequence", label: "Inner Seq" },
  { key: "pdi_version", label: "PDI Version" },
  { key: "random", label: "Random" },
  { key: "result", label: "Result" },
  { key: "border_tag", label: "Border Tag" },
  { key: "onboard_kavach_id", label: "Onboard ID" },
  { key: "tsl_route_id", label: "TSL Route ID" },
  { key: "tsl_authority", label: "TSL Authority" },
  { key: "mac_code", label: "MAC Code" },
];

const TYPE_MAP = {
  pdi_req: 0x0101,
  pdi_res: 0x0102,
  heartbeat: 0x0103,
  handover_req: 0x0104,
  rri: 0x0105,
  taken_over: 0x0106,
  cancel: 0x0107,
  length_info: 0x0108,
  length_ack: 0x0109,
  tsl_req: 0x010a,
  tsl_auth: 0x010b,
  field_req: 0x010c,
  field_status: 0x010d,
  cancel_ack: 0x010e,
};

const TYPE_COLUMNS = {
  pdi_req: [
    "msg_type",
    "event_time",
    "stationary_kavach_id",
    "nms_id",
    "version",
    "sequence",
    "sender_id",
    "receiver_id",
    "pdi_version",
    // "random",
  ],
  pdi_res: [
    "msg_type",
    "event_time",
    "stationary_kavach_id",
    "nms_id",
    "version",
    "sequence",
    "sender_id",
    "receiver_id",
    "result",
    "pdi_version",
    // "random",
    // "mac_code",
  ],
  heartbeat: [
    "msg_type",
    "event_time",
    "stationary_kavach_id",
    "nms_id",
    "version",
    "sequence",
    "sender_id",
    "receiver_id",
    "frame_number",
    "inner_sequence",
    // "mac_code",
  ],
  handover_req: [
    "msg_type",
    "event_time",
    "stationary_kavach_id",
    "nms_id",
    "version",
    "sequence",
    "sender_id",
    "receiver_id",
    "frame_number",
    "inner_sequence",
    "border_tag",
    // "mac_code",
  ],
  rri: [
    "msg_type",
    "event_time",
    "stationary_kavach_id",
    "nms_id",
    "version",
    "sequence",
    "sender_id",
    "receiver_id",
    "frame_number",
    "inner_sequence",
    "border_tag",
    "onboard_kavach_id",
    // "mac_code",
  ],
  taken_over: [
    "msg_type",
    "event_time",
    "stationary_kavach_id",
    "nms_id",
    "version",
    "sequence",
    "sender_id",
    "receiver_id",
    "frame_number",
    "inner_sequence",
    "border_tag",
    "onboard_kavach_id",
    // "mac_code",
  ],
  cancel: [
    "msg_type",
    "event_time",
    "stationary_kavach_id",
    "nms_id",
    "version",
    "sequence",
    "sender_id",
    "receiver_id",
    "frame_number",
    "inner_sequence",
    "border_tag",
    "onboard_kavach_id",
    // "mac_code",
  ],
  length_info: [
    "msg_type",
    "event_time",
    "stationary_kavach_id",
    "nms_id",
    "version",
    "sequence",
    "sender_id",
    "receiver_id",
    "frame_number",
    "inner_sequence",
    "border_tag",
    "onboard_kavach_id",
    // "mac_code",
  ],
  length_ack: [
    "msg_type",
    "event_time",
    "stationary_kavach_id",
    "nms_id",
    "version",
    "sequence",
    "sender_id",
    "receiver_id",
    "frame_number",
    "inner_sequence",
    "border_tag",
    "onboard_kavach_id",
    // "mac_code",
  ],
  tsl_req: [
    "msg_type",
    "event_time",
    "stationary_kavach_id",
    "nms_id",
    "version",
    "sequence",
    "sender_id",
    "receiver_id",
    "frame_number",
    "inner_sequence",
    "border_tag",
    "onboard_kavach_id",
    "tsl_route_id",
    // "mac_code",
  ],
  tsl_auth: [
    "msg_type",
    "event_time",
    "stationary_kavach_id",
    "nms_id",
    "version",
    "sequence",
    "sender_id",
    "receiver_id",
    "frame_number",
    "inner_sequence",
    "border_tag",
    "onboard_kavach_id",
    "tsl_authority",
    // "mac_code",
  ],
  field_req: [
    "msg_type",
    "event_time",
    "stationary_kavach_id",
    "nms_id",
    "version",
    "sequence",
    "sender_id",
    "receiver_id",
    "frame_number",
    "inner_sequence",
    // "mac_code",
  ],
  field_status: [
    "msg_type",
    "event_time",
    "stationary_kavach_id",
    "nms_id",
    "version",
    "sequence",
    "sender_id",
    "receiver_id",
    "frame_number",
    "inner_sequence",
    // "mac_code",
  ],
  cancel_ack: [
    "msg_type",
    "event_time",
    "stationary_kavach_id",
    "nms_id",
    "version",
    "sequence",
    "sender_id",
    "receiver_id",
    "frame_number",
    "inner_sequence",
    "border_tag",
    "onboard_kavach_id",
    // "mac_code",
  ],
};

const AdjacentKavachInfoPage = forwardRef(({ tableType }, ref) => {
  const { fromDate, toDate, isDateRangeValid } = useAppContext();
  const { selectedFile } = useOutletContext();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [page, setPage] = useState(1);
  const [visibleKeys, setVisibleKeys] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { filteredRows, setFilter, clearFilters } = useTableFilter(rows);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const packetKeysRef = useRef(new Set());
  const pollingRef = useRef(null);

  useEffect(() => {
    setVisibleKeys(TYPE_COLUMNS[tableType] || COLUMNS.map((c) => c.key));
  }, [tableType]);

  const generate = async () => {
    if (!fromDate || !toDate || !selectedFile || !isDateRangeValid) {
      alert("Invalid input");
      return;
    }

    setLoading(true);
    clearFilters();

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(
        `${API_BASE}/api/adjacent-kavach/by-date?from=${fromDate}&to=${toDate}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const json = await res.json();

      if (!json.success) throw new Error("API failed");

      const filtered = json.data
        .filter((r) => Number(r.msg_type) === Number(TYPE_MAP[tableType]))
        .map((r) => ({
          ...r,
          sender_id: hexToAscii(r.sender_id),
          receiver_id: hexToAscii(r.receiver_id),
        }));

      const keys = new Set(
        filtered.map(
          (r) =>
            `${r.event_time}_${r.sequence}_${r.msg_type}_${r.frame_number}`,
        ),
      );

      packetKeysRef.current = keys;

      setAllRows(filtered);
      setRows(filtered);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rows.length || !selectedFile) return;

    pollingRef.current = setInterval(async () => {
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await fetch(
          `${API_BASE}/api/adjacent-kavach/by-date?from=${fromDate}&to=${toDate}`,
          {
            method: "POST",
            body: formData,
          },
        );

        const json = await res.json();

        if (!json.success) return;

        const latestPackets = json.data
          .filter((r) => Number(r.msg_type) === Number(TYPE_MAP[tableType]))
          .map((r) => ({
            ...r,
            sender_id: hexToAscii(r.sender_id),
            receiver_id: hexToAscii(r.receiver_id),
          }));

        const newPackets = latestPackets.filter((r) => {
          const key = `${r.event_time}_${r.sequence}_${r.msg_type}_${r.frame_number}`;

          if (packetKeysRef.current.has(key)) {
            return false;
          }

          packetKeysRef.current.add(key);
          return true;
        });

        if (!newPackets.length) return;

        setAllRows((prev) => [...newPackets, ...prev]);

        setRows((prev) => [...newPackets, ...prev]);
      } catch (err) {
        console.error("Live packet polling failed:", err);
      }
    }, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [rows.length, selectedFile, tableType, fromDate, toDate]);

  const clear = () => {
    setRows([]);
    setPage(1);
    clearFilters();
  };

  useImperativeHandle(ref, () => ({
    generate,
    clear,
    getFilteredRows: () => filteredRows,
    getAllRows: () => rows,
    getVisibleColumns: () => COLUMNS,
    openColumnDialog: () => setDialog(true),
    searchById: (v) => setFilter("stationary_kavach_id", v),
  }));

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  return (
    <Box>
      {loading ? (
        <LinearProgress />
      ) : (
        <CardContent sx={{ p: 0 }}>
          {filteredRows.length > 0 && (
            <RowsPerPageControl
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              setPage={setPage}
            />
          )}
          <LocoMovementTable
            rows={filteredRows.slice(
              (page - 1) * rowsPerPage,
              page * rowsPerPage,
            )}
            columns={COLUMNS.filter((c) => visibleKeys.includes(c.key))}
            visibleKeys={visibleKeys}
            onColumnSearch={(k, v) => setFilter(k, v)}
          />

          {filteredRows.length === 0 && (
            <Typography sx={{ p: 3, textAlign: "center" }}>No Data</Typography>
          )}
        </CardContent>
      )}

      {filteredRows.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 1,
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
      )}

      <ColumnFilterDialog
        open={dialog}
        values={COLUMNS.map((c) => c.label)}
        selectedValues={visibleKeys.map(
          (k) => COLUMNS.find((c) => c.key === k)?.label,
        )}
        onClose={() => setDialog(false)}
        onApply={(labels) => {
          setVisibleKeys(
            COLUMNS.filter((c) => labels.includes(c.label)).map((c) => c.key),
          );
          setDialog(false);
        }}
      />
    </Box>
  );
});

export default AdjacentKavachInfoPage;
