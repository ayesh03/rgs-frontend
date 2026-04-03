import {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";

import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Stack,
} from "@mui/material";

import { useOutletContext } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

import RowsPerPageControl from "../components/RowsPerPageControl";
import PaginationControls from "../components/PaginationControls";
import ColumnFilterDialog from "../components/ColumnFilterDialog";
import LocoMovementTable from "../components/LocoMovementTable";

import useTableFilter from "../hooks/useFilterTable";

/* ================= COLUMN DEFINITIONS ================= */

// COMMON HEADER (same style as other modules)
const COMMON_COLUMNS = [
    { key: "tsrms_id", label: "TSRMS ID" },
    { key: "nms_id", label: "NMS ID" },
    { key: "version", label: "Version" },
    { key: "event_time", label: "Date Time" },
];

// 0x11 → TSR INFO
const TSR_INFO_COLUMNS = [
    { key: "section_id", label: "Section ID" },
    { key: "station1_id", label: "Station 1" },
    { key: "station2_id", label: "Station 2" },
    { key: "tsr_id", label: "TSR ID" },
    { key: "direction", label: "Direction" },
    { key: "start_distance", label: "Start Distance" },
    { key: "length", label: "Length" },
    { key: "class_type", label: "Class Type" },
    { key: "universal_speed", label: "Universal Speed" },
    { key: "status", label: "Status" },
];

// 0x12 → DIAGNOSTIC
const TSR_DIAG_COLUMNS = [
    { key: "event_id", label: "Event ID" },
    { key: "event_data", label: "Event Data" },
];

// 0x13 → FAULT
const TSR_FAULT_COLUMNS = [
    { key: "fault_codes", label: "Fault Codes" }, // array
];
const PDI_COLUMNS = [
    { key: "pdi_version", label: "PDI Version" },
    { key: "result", label: "Result" },
];

const ALL_TSR_COLUMNS = [
    { key: "tsr_count", label: "TSR Count" },
    { key: "activation_time", label: "Activation Time" },
];

const GET_TSR_COLUMNS = [
    { key: "request_type", label: "Request Type" },
];

const SKAVACH_COLUMNS = [
    { key: "frame_number", label: "Frame No" },
    { key: "tan", label: "TAN" },
];

const INTEGRITY_COLUMNS = [
    { key: "frame_number", label: "Frame No" },
];

const ACK_COLUMNS = [
    { key: "ack_status", label: "Ack Status" },
];

/* ================= MAIN COMPONENT ================= */

const TSRMSPage = forwardRef(({ tableType }, ref) => {
    const { fromDate, toDate, isDateRangeValid } = useAppContext();
    const { selectedFile } = useOutletContext();

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [allRows, setAllRows] = useState([]);
    const [page, setPage] = useState(1);
    const [columnDialogOpen, setColumnDialogOpen] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState([]);

    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { filteredRows, setFilter, clearFilters } =
        useTableFilter(rows);

    /* ================= COLUMN LOGIC ================= */

    const getColumns = () => {
        if (tableType === "tsr_diagnostic")
            return [...COMMON_COLUMNS, ...TSR_DIAG_COLUMNS];

        if (tableType === "tsr_fault")
            return [...COMMON_COLUMNS, ...TSR_FAULT_COLUMNS];
        if (tableType === "pdi_version")
            return [...COMMON_COLUMNS, ...PDI_COLUMNS];

        if (tableType === "all_tsr_info")
            return [...COMMON_COLUMNS, ...ALL_TSR_COLUMNS];

        if (tableType === "get_tsr_info")
            return [...COMMON_COLUMNS, ...GET_TSR_COLUMNS];

        if (tableType === "skavach_tsr_data")
            return [...COMMON_COLUMNS, ...SKAVACH_COLUMNS];

        if (tableType === "tsr_integrity")
            return [...COMMON_COLUMNS, ...INTEGRITY_COLUMNS];

        if (tableType === "skavach_ack")
            return [...COMMON_COLUMNS, ...ACK_COLUMNS];

        return [...COMMON_COLUMNS, ...TSR_INFO_COLUMNS];
    };

    const columns = getColumns();

    useEffect(() => {
        setVisibleKeys(columns.map((c) => c.key));
    }, [tableType]);

    /* ================= AUTO REFRESH ================= */

    useEffect(() => {
        if (!selectedFile || allRows.length === 0) return;

        console.log(" TSRMS auto-refresh triggered");
        generate();
    }, [selectedFile]);

    /* ================= FETCH ================= */

    const generate = async () => {
        if (!fromDate || !toDate) {
            alert("Select date range");
            return;
        }

        if (!selectedFile) {
            alert("Select BIN file");
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
            const API_BASE = import.meta.env.VITE_API_BASE_URL;

            let endpoint = "tsr-info";

            if (tableType === "tsr_diagnostic") endpoint = "tsr-diagnostic";
            if (tableType === "tsr_fault") endpoint = "tsr-fault";

            if (tableType === "pdi_version") endpoint = "pdi-version";
            if (tableType === "all_tsr_info") endpoint = "all-tsr-info";
            if (tableType === "get_tsr_info") endpoint = "get-tsr-info";
            if (tableType === "skavach_tsr_data") endpoint = "skavach-tsr-data";
            if (tableType === "tsr_integrity") endpoint = "tsr-integrity";
            if (tableType === "skavach_ack") endpoint = "skavach-ack";

            const buffer = await selectedFile.arrayBuffer();

            const res = await fetch(
                `${API_BASE}/api/tsr/by-date?from=${fromDate}&to=${toDate}`,
                {
                    method: "POST",
                    body: buffer,
                    headers: {
                        "Content-Type": "application/octet-stream",
                    },
                }
            );

            const json = await res.json();

            if (!json.success) {
                throw new Error(json.error || "Backend error");
            }

            const mapped = (json.data || []).map((r, i) => ({
                id: i + 1,
                ...r,
            }));

            const filtered = mapped.filter((r) => {
                if (tableType === "tsr_diagnostic") return r.msg_type === 0x12;
                if (tableType === "tsr_fault") return r.msg_type === 0x13;
                return r.msg_type === 0x11; // default TSR info
            });

            setAllRows(filtered);
            setRows(filtered);
            setPage(1);
        } catch (err) {
            console.error(err);
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

    /* ================= EXPOSE METHODS ================= */

    useImperativeHandle(ref, () => ({
        generate,
        clear,
        getFilteredRows: () => filteredRows,
        getAllRows: () => rows,
        getVisibleColumns: () => columns,
        openColumnDialog: () => setColumnDialogOpen(true),
        searchByTSR: (val) => setFilter("tsr_id", val),
    }));

    /* ================= PAGINATION ================= */

    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

    const paginatedRows = filteredRows.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    /* ================= UI ================= */

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                {filteredRows.length > 0 && (
                    <RowsPerPageControl
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        setPage={setPage}
                    />
                )}
            </Stack>

            <AnimatePresence mode="wait">
                {loading ? (
                    <Box sx={{ py: 6 }}>
                        <LinearProgress />
                        <Typography sx={{ mt: 1 }}>
                            Processing TSRMS packets...
                        </Typography>
                    </Box>
                ) : (
                    //   <Card>
                    <CardContent sx={{ p: 0 }}>
                        <LocoMovementTable
                            rows={paginatedRows}
                            columns={columns}
                            visibleKeys={visibleKeys}
                            onColumnSearch={(k, v) => setFilter(k, v)}
                        />

                        {filteredRows.length === 0 && (
                            <Box sx={{ p: 4, textAlign: "center" }}>
                                <Typography>No Data Found</Typography>
                            </Box>
                        )}
                    </CardContent>
                    //   </Card>
                )}
            </AnimatePresence>

            {filteredRows.length > 0 && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mt: 1,
                        p: 1,
                        bgcolor: "rgba(255,255,255,0.02)",
                        borderRadius: 2
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
                open={columnDialogOpen}
                values={columns.map((c) => c.label)}
                selectedValues={visibleKeys.map(
                    (k) => columns.find((c) => c.key === k)?.label
                )}
                onClose={() => setColumnDialogOpen(false)}
                onApply={(labels) => {
                    setVisibleKeys(
                        columns
                            .filter((c) => labels.includes(c.label))
                            .map((c) => c.key)
                    );
                    setColumnDialogOpen(false);
                }}
            />
        </Box>
    );
});

export default TSRMSPage;