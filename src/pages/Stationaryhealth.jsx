import { Box, Card, CardContent, Typography, LinearProgress, Stack, alpha, useTheme } from "@mui/material";
import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import { useOutletContext } from "react-router-dom";
import RowsPerPageControl from "../components/RowsPerPageControl";

import LocoFaultsTable from "../components/LocoFaultsTable";
import PaginationControls from "../components/PaginationControls";
import NoResult from "../components/NoResult";
import ColumnFilterDialog from "../components/ColumnFilterDialog";
import { useLocation } from "react-router-dom";
import { HEALTH_ALL_COLUMNS } from "../constants/healthColumns";
import { useAppContext } from "../context/AppContext";
import {
    formatStationaryHealth,
    formatOnboardHealth,
    decodeSystemVersion
} from "../utils/healthFormatter";

const StationaryHealth = forwardRef(({ healthType }, ref) => {
    const theme = useTheme();
    const { fromDate, toDate, isDateRangeValid } = useAppContext();
    const { selectedFile } = useOutletContext();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(12);
    const [allRows, setAllRows] = useState([]);

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

                const versionText = decodeSystemVersion(r.system_version);
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
                        system_version: versionText,   // add this
                        event_id: ev.event_id,
                        event_name: formatted.name,
                        event_description: formatted.desc,
                        stationary_kavach_id:
                            r.stationary_kavach_id || r.onboard_kavach_id || "",
                    };
                });

                return expandedEvents;
            }).flat();

            setAllRows(mappedRows);
            setRows(mappedRows);
            setPage(1);
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
        searchByHealth: (value) => {
            if (!value) {
                setRows(allRows);
                return;
            }

            const v = value.toLowerCase();

            const filtered = allRows.filter(r =>
                Object.values(r).some(val =>
                    String(val ?? "").toLowerCase().includes(v)
                )
            );

            setRows(filtered);
            setPage(1);
        },
    }));

    const totalPages = Math.ceil(rows.length / rowsPerPage);
    const paginatedRows = rows.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    useEffect(() => {
        setVisibleKeys(HEALTH_ALL_COLUMNS.map((c) => c.key));
    }, []);

    useEffect(() => {
        if (!location.state?.dashboardFilter) return;

        const { field, value } = location.state.dashboardFilter;

        setRows(prev => prev.filter(r => String(r[field]) === String(value)));

    }, [location.state]);
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
        <Box sx={{ width: "100%", p: { xs: 1, md: 0.5 } }}>
            {/* ===== HEADER BAR ===== */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={0.5}
                    sx={{
                        p: 1,
                        borderRadius: "12px",
                        bgcolor: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        backdropFilter: "blur(10px)"
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                            sx={{
                                p: 0.5,
                                borderRadius: "10px",
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                display: 'flex'
                            }}
                        >
                            <HealthAndSafetyIcon sx={{ color: theme.palette.primary.light, fontSize: 26 }} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={500} sx={{ color: "#fff", lineHeight: 0.8, letterSpacing: 0.5 }}>
                                {healthType === "STATIONARY" ? "STATIONARY HEALTH" : "ONBOARD HEALTH"}
                            </Typography>
                        </Box>
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

            {/* ===== CONTENT AREA ===== */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <Box
                        key="loading"
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        sx={{ width: "100%", py: 8, textAlign: 'center' }}
                    >
                        <LinearProgress
                            sx={{
                                height: 4,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "& .MuiLinearProgress-bar": {
                                    boxShadow: `0 0 10px ${theme.palette.primary.main}`
                                }
                            }}
                        />
                        <Typography
                            sx={{
                                mt: 2,
                                display: "block",
                                color: "rgba(255,255,255,0.5)",
                                fontWeight: 800,
                                fontSize: "0.8rem",
                                letterSpacing: 2
                            }}
                        >
                            ANALYZING HEALTH PACKETS…
                        </Typography>
                    </Box>
                ) : (
                    <Card
                        key="data"
                        component={motion.div}
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        sx={{
                            borderRadius: "16px",
                            bgcolor: "rgba(18, 18, 18, 0.4)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            backgroundImage: "none",
                            overflow: "hidden"
                        }}
                    >
                        <CardContent sx={{ p: 0 }}>
                            <LocoFaultsTable
                                rows={paginatedRows}
                                columns={dynamicColumns}
                                visibleKeys={visibleKeys}
                                formatter={(row, key) => row[key] ?? "-"}

                                onColumnSearch={(key, value) => {
                                    if (!value) {
                                        setRows(allRows);
                                        return;
                                    }

                                    const filtered = allRows.filter(r =>
                                        String(r[key] ?? "").toLowerCase().includes(value.toLowerCase())
                                    );

                                    setRows(filtered);
                                    setPage(1);
                                }}

                                onSort={(key, direction) => {
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
                                }}
                            />

                            <Box
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    justifyContent: "center",
                                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
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
                )}
            </AnimatePresence>

            <ColumnFilterDialog
                open={columnDialogOpen}
                column="Table Columns"
                values={dynamicColumns.map((c) => c.label)}
                selectedValues={visibleKeys.map(
                    (key) => dynamicColumns.find((c) => c.key === key)?.label
                )}
                onClose={() => setColumnDialogOpen(false)}
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