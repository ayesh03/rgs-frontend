import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Stack,
    alpha,
} from "@mui/material";
import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import { useOutletContext } from "react-router-dom";
import RowsPerPageControl from "../components/RowsPerPageControl";

import LocoFaultsTable from "../components/LocoFaultsTable";
import PaginationControls from "../components/PaginationControls";
import NoResult from "../components/NoResult";
import ColumnFilterDialog from "../components/ColumnFilterDialog";

import { HEALTH_ALL_COLUMNS } from "../constants/healthColumns";

import { useAppContext } from "../context/AppContext";

import {
    formatStationaryHealth,
    formatOnboardHealth,
} from "../utils/healthFormatter";

const StationaryHealth = forwardRef(({ healthType }, ref) => {
    const { fromDate, toDate, isDateRangeValid } = useAppContext();
    const { selectedFile } = useOutletContext();

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [columnDialogOpen, setColumnDialogOpen] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState(
        HEALTH_ALL_COLUMNS.map((c) => c.key)
    );

    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    /* ===================== GENERATE ===================== */
    const generate = async () => {
        if (!isDateRangeValid) {
            alert("Invalid date range");
            return;
        }

        if (!selectedFile) {
            alert("Please select BIN file");
            return;
        }

        setLoading(true);
        setRows([]);

        try {
            const normalize = (v) =>
                v && v.length === 16 ? `${v}:00` : v;

            const from = encodeURIComponent(normalize(fromDate));
            const to = encodeURIComponent(normalize(toDate));

            const fileBuffer = await selectedFile.arrayBuffer();

            const endpoint =
                healthType === "STATIONARY"
                    ? "/api/stationary/health/by-date"
                    : "/api/onboard/health/by-date";

            const res = await fetch(
                `${API_BASE}${endpoint}?from=${from}&to=${to}`,
                {
                    method: "POST",
                    body: fileBuffer,
                    headers: {
                        "Content-Type": "application/octet-stream",
                    },
                }
            );

            const json = await res.json();

            if (json.success === false) {
                throw new Error(json.error || "Backend error");
            }

            const mappedRows = (json.data || []).map((r, idx) => {
                const dt = r.event_time
                    ? new Date(r.event_time)
                    : null;

                // Expand events into readable rows
                const expandedEvents = (r.events || []).map((ev, i) => {
                    const formatter =
                        healthType === "STATIONARY"
                            ? formatStationaryHealth
                            : formatOnboardHealth;

                    const formatted = formatter(ev.event_id, ev.event_data);

                    return {
                        ...r,

                        id: `${idx + 1}-${i}`,
                        date: dt ? dt.toISOString().slice(0, 10) : "",
                        time: dt ? dt.toTimeString().slice(0, 8) : "",

                        event_id: ev.event_id,
                        event_name: formatted.name,
                        event_description: formatted.desc,

                        stationary_kavach_id:
                            r.stationary_kavach_id || r.onboard_kavach_id || "",
                    };


                });

                return expandedEvents;
            }).flat();

            setRows(mappedRows);
            setPage(1);

        } catch (err) {
            console.error("Health API error:", err);
            alert(err.message);
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    /* ===================== CLEAR ===================== */
    const clear = () => {
        setRows([]);
        setPage(1);
    };

    /* ===================== IMPERATIVE API ===================== */
    useImperativeHandle(ref, () => ({
        generate,
        clear,
        getFilteredRows: () => rows,
        getAllRows: () => rows,
        getVisibleColumns: () =>
            dynamicColumns.filter((c) => visibleKeys.includes(c.key)),

        openColumnDialog: () => setColumnDialogOpen(true),
    }));

    const totalPages = Math.ceil(rows.length / rowsPerPage);

    const paginatedRows = rows.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    useEffect(() => {
        setVisibleKeys(HEALTH_ALL_COLUMNS.map((c) => c.key));
    }, []);
    const dynamicColumns = HEALTH_ALL_COLUMNS.map((col) => {
        if (col.key === "stationary_kavach_id") {
            return {
                ...col,
                label:
                    healthType === "STATIONARY"
                        ? "Stationary Health ID"
                        : "Onboard Health ID",
            };
        }
        return col;
    });


    return (
        <Box p={2}>
            <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1.5}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <HealthAndSafetyIcon color="primary" sx={{ fontSize: 28 }} />
                        <Typography variant="h5" fontWeight={800}>
                            {healthType === "STATIONARY"
                                ? "Stationary Health Report"
                                : "Onboard Health Report"}
                        </Typography>
                    </Stack>

                    {rows.length > 0 && (
                        <RowsPerPageControl
                            rowsPerPage={rowsPerPage}
                            setRowsPerPage={setRowsPerPage}
                            setPage={setPage}
                        />
                    )}
                </Stack>
            </motion.div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <Box sx={{ width: "100%", mb: 2 }}>
                        <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
                        <Typography
                            variant="caption"
                            sx={{
                                mt: 1,
                                display: "block",
                                textAlign: "center",
                                color: "primary.main",
                                fontWeight: 600,
                            }}
                        >
                            ANALYZING HEALTH PACKETS…
                        </Typography>
                    </Box>
                ) : rows.length > 0 ? (
                    <Card
                        sx={{
                            borderRadius: 4,
                            boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
                            border: "1px solid #f0f0f0",
                        }}
                    >
                        <CardContent sx={{ p: 0 }}>
                            <LocoFaultsTable
                                rows={paginatedRows}
                                columns={dynamicColumns}
                                visibleKeys={visibleKeys}
                            />

                            <Box
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    justifyContent: "center",
                                    borderTop: `1px solid ${alpha("#000", 0.05)}`,
                                }}
                            >
                                <PaginationControls
                                    page={page}
                                    setPage={setPage}
                                    totalPages={totalPages}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                ) : (
                    <NoResult />
                )}
            </AnimatePresence>

            <ColumnFilterDialog
                open={columnDialogOpen}
                column="Columns"
                values={dynamicColumns.map((c) => c.label)}


                selectedValues={visibleKeys.map(
                    (key) => dynamicColumns.find((c) => c.key === key)?.label
                )}


                onApply={(labels) => {
                    const keys = dynamicColumns

                        .filter((c) => labels.includes(c.label))
                        .map((c) => c.key);

                    setVisibleKeys(keys);
                    setColumnDialogOpen(false);
                }}
            />
        </Box>
    );
});

export default StationaryHealth;
