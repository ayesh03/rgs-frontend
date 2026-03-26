import {
    Box, Card, CardContent, Typography,
    LinearProgress, Stack
} from "@mui/material";
import { forwardRef, useState, useImperativeHandle, useEffect } from "react";
import RSSITable from "../components/RSSITable";
import { RSSI_COLUMNS } from "../constants/rssiColumns";
import { useOutletContext } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import PaginationControls from "../components/PaginationControls";
import RowsPerPageControl from "../components/RowsPerPageControl";
import ColumnFilterDialog from "../components/ColumnFilterDialog";
import useTableFilter from "../hooks/useFilterTable";
const RSSIPage = forwardRef(({ type }, ref) => {

    const { selectedFile } = useOutletContext();
    const { fromDate, toDate } = useAppContext();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [columnDialogOpen, setColumnDialogOpen] = useState(false);

    const { filteredRows, setFilter, clearFilters } = useTableFilter(rows);

    const columns = RSSI_COLUMNS;
    const [visibleKeys, setVisibleKeys] = useState(columns.map(c => c.key));


    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

    const paginatedRows = filteredRows.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    /* ================= FETCH ================= */

    const generate = async () => {
        if (!selectedFile) return;

        setLoading(true);

        try {
            const buffer = await selectedFile.arrayBuffer();
            const API_BASE = import.meta.env.VITE_API_BASE_URL;

            const endpoint =
                type === "LOCO"
                    ? "/api/rssi/loco/by-date"
                    : "/api/rssi/stationary/by-date";

            const normalizeDate = (v) => v && v.length === 16 ? `${v}:00` : v;

            const encodedFrom = encodeURIComponent(normalizeDate(fromDate));
            const encodedTo = encodeURIComponent(normalizeDate(toDate));

            const res = await fetch(
                `${API_BASE}${endpoint}?from=${encodedFrom}&to=${encodedTo}`,
                {
                    method: "POST",
                    body: buffer,
                    headers: { "Content-Type": "application/octet-stream" }
                }
            );

            const json = await res.json();

            setRows(json.data || []);
            clearFilters();
            setPage(1);
            return json.data;
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const clear = () => setRows([]);

    /* ================= REF ================= */

    const flattenRows = (data) => {
        const flat = [];

        data.forEach(r => {
            const base = {
                event_time: r.event_time,
                loco_kavach_id: r.loco_kavach_id,
                stationary_kavach_id: r.stationary_kavach_id,
                nms_system_id: r.nms_system_id,

                // ✅ ADD THESE (you missed this)
                rssi1_sample_count: r.rssi1_sample_count,
                rssi2_sample_count: r.rssi2_sample_count,
            };

            r.radio1_samples?.forEach(s => {
                flat.push({
                    ...base,
                    radio: "R1",
                    rfid: s.rfid,
                    abs_location: s.abs_location,
                    rssi_dbm: s.rssi_dbm
                });
            });

            r.radio2_samples?.forEach(s => {
                flat.push({
                    ...base,
                    radio: "R2",
                    rfid: s.rfid,
                    abs_location: s.abs_location,
                    rssi_dbm: s.rssi_dbm
                });
            });
        });

        return flat;
    };

    useImperativeHandle(ref, () => ({
        generate,
        clear,
        setFilter,
        clearFilters,
        getFilteredRows: () => flattenRows(filteredRows),
        getAllRows: () => flattenRows(rows),
        getVisibleColumns: () => columns.filter(c => visibleKeys.includes(c.key)),
        openColumnDialog: () => setColumnDialogOpen(true),
        searchByRSSI: (value) => setFilter("loco_kavach_id", value),
    }));

    useEffect(() => {
        setPage(1);
    }, [filteredRows.length]);

    // Auto-refresh when file changes
useEffect(() => {
  if (selectedFile && fromDate && toDate && rows.length > 0) {
    generate();
  }
}, [selectedFile]);

    /* ================= UI ================= */

    return (
        <Box>


            {/* <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Typography fontWeight={800}>
                    {type === "LOCO" ? "LOCO RSSI" : "STATIONARY RSSI"}
                </Typography>
            </Stack> */}

            {loading && <LinearProgress />}

            <Card
                variant="outlined"
                sx={{
                    bgcolor: "rgba(255, 255, 255, 0.02)",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    borderRadius: 3,
                    backdropFilter: "blur(10px)"
                }}
            >
                {filteredRows.length > 0 && (
                    <RowsPerPageControl
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        setPage={setPage}
                    />
                )}
                <CardContent sx={{ p: 0 }}>
                    {/* </CardContent> */}

                    {/* <CardContent sx={{ p: 0 }}> */}
                    <RSSITable
                        rows={paginatedRows}
                        columns={columns}
                        visibleKeys={visibleKeys}
                        onColumnSearch={(key, value) => {
                            if (value) setFilter(key, value);
                            else setFilter(key, "");
                        }}
                        onSort={(key, direction) => {
                            if (!direction) {
                                setRows([...rows]); // reset
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
                </CardContent>
            </Card>


            {!loading && rows.length === 0 && (
                <Typography sx={{ mt: 2, textAlign: "center", opacity: 0.5 }}>
                    NO RSSI DATA FOUND
                </Typography>
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

export default RSSIPage;