import {
    Box, Card, CardContent, Typography,
    LinearProgress, Stack
} from "@mui/material";
import { forwardRef, useState, useImperativeHandle } from "react";
import RSSITable from "../components/RSSITable";
import { RSSI_COLUMNS } from "../constants/rssiColumns";
import { useOutletContext } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const RSSIPage = forwardRef(({ type }, ref) => {

    const { selectedFile } = useOutletContext();
    const { fromDate, toDate } = useAppContext();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const columns = RSSI_COLUMNS;
    const [visibleKeys, setVisibleKeys] = useState(columns.map(c => c.key));

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
            return json.data;
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const clear = () => setRows([]);

    /* ================= REF ================= */

    useImperativeHandle(ref, () => ({
        generate,
        clear,
        getFilteredRows: () => rows,
        getAllRows: () => rows,
        getVisibleColumns: () => columns,
        searchByRSSI: () => { } // optional
    }));

    /* ================= UI ================= */

    return (
        <Box>

            {/* <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Typography fontWeight={800}>
                    {type === "LOCO" ? "LOCO RSSI" : "STATIONARY RSSI"}
                </Typography>
            </Stack> */}

            {loading && <LinearProgress />}

            <Card>
                {/* <CardContent sx={{ p: 0 }}> */}
                    <RSSITable
                        rows={rows}
                        columns={columns}
                        visibleKeys={visibleKeys}
                    />
                {/* </CardContent> */}
            </Card>

            {!loading && rows.length === 0 && (
                <Typography sx={{ mt: 2, textAlign: "center", opacity: 0.5 }}>
                    NO RSSI DATA FOUND
                </Typography>
            )}

        </Box>
    );
});

export default RSSIPage;