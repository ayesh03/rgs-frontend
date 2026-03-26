import { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, Box,
    IconButton, Stack, Popover, TextField
} from "@mui/material";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FilterListIcon from "@mui/icons-material/FilterList";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export default function RSSITable({
    rows = [],
    columns = [],
    visibleKeys = [],
    onSort,
    onColumnSearch
}) {
    const [openRows, setOpenRows] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeCol, setActiveCol] = useState(null);
    const [searchVal, setSearchVal] = useState("");
    const [sortState, setSortState] = useState({});
    const [filteredRows, setFilteredRows] = useState(rows);

    const visibleColumns = columns.filter(col =>
        visibleKeys.includes(col.key)
    );

    const toggleRow = (id) => {
        setOpenRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    useEffect(() => {
        setFilteredRows(rows);
    }, [rows]);
    return (
        <Box sx={{ width: "100%" }}>
            <TableContainer
                sx={{
                    maxHeight: "70vh",
                    "&::-webkit-scrollbar": { height: 8, width: 8 },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderRadius: 4
                    }
                }}
            >
                <Table stickyHeader size="small" sx={{
                    borderCollapse: "collapse",
                    "& td, & th": {
                        borderBottom: "none !important",
                        border: "none !important"
                    }
                }}>

                    {/* ================= HEADER ================= */}
                    <TableHead>
                        <TableRow>

                            {/* EXPAND ICON COLUMN */}
                            <TableCell sx={{ bgcolor: "#12161c" }} />

                            {visibleColumns.map(col => {
                                const sort = sortState[col.key];

                                return (
                                    <TableCell
                                        key={col.key}
                                        sx={{
                                            px: 1.5, py: 1.5,
                                            fontSize: "1rem",
                                            fontWeight: 900,
                                            color: "rgba(255,255,255,0.7)",
                                            bgcolor: "#12161c",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <Typography sx={{ fontWeight: 900 }}>
                                                {col.label.toUpperCase()}
                                            </Typography>

                                            {/* SORT */}
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    let next;
                                                    if (!sort) next = "asc";
                                                    else if (sort === "asc") next = "desc";
                                                    else next = null;

                                                    setSortState(prev => ({ ...prev, [col.key]: next }));
                                                    onSort?.(col.key, next);
                                                }}
                                                sx={{ p: 0.2, color: sort ? "#5b8ffe" : "#aaa" }}
                                            >
                                                {sort === "desc"
                                                    ? <ArrowDownwardIcon sx={{ fontSize: 13 }} />
                                                    : <ArrowUpwardIcon sx={{ fontSize: 13 }} />}
                                            </IconButton>

                                            {/* FILTER */}
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    setAnchorEl(e.currentTarget);
                                                    setActiveCol(col.key);
                                                    setSearchVal("");
                                                }}
                                                sx={{ p: 0.2, color: "#aaa" }}
                                            >
                                                <FilterListIcon sx={{ fontSize: 13 }} />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>

                    {/* ================= BODY ================= */}
                    <TableBody>
                        {filteredRows.map((row, i) => (
                            <>
                                {/* MAIN ROW */}
                                <TableRow
                                    key={i}
                                    sx={{
                                        backgroundColor: "#1a1f2e",
                                        "&:hover": {
                                            backgroundColor: "#1a1f2e"
                                        },
                                        "& td": {
                                            borderBottom: "none !important",
                                            border: "none !important"
                                        }
                                    }}
                                >
                                    <TableCell sx={{ color: "#fff" }}>
                                        <IconButton size="small" onClick={() => toggleRow(i)}>
                                            {openRows[i]
                                                ? <KeyboardArrowUpIcon sx={{ color: "#fff" }} />
                                                : <KeyboardArrowDownIcon sx={{ color: "#fff" }} />}
                                        </IconButton>
                                    </TableCell>

                                    {visibleColumns.map(col => (
                                        <TableCell key={col.key} sx={{ color: "#fff" }}>
                                            {col.key === "event_time" ? (
                                                <Box>
                                                    <Typography sx={{ fontWeight: 700, color: "#fff" }}>
                                                        {row.event_time?.split(" ")[0]}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "0.8rem", color: "#fff" }}>
                                                        {row.event_time?.split(" ")[1]}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography sx={{ color: "#fff" }}>
                                                    {row[col.key]}
                                                </Typography>
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>

                                {/* EXPAND ROW */}
                                <TableRow sx={{
                                    "& td": {
                                        borderBottom: "none !important",
                                        border: "none !important"
                                    }
                                }}>
                                    <TableCell colSpan={visibleColumns.length + 1} sx={{ p: 0, border: "none !important" }}>
                                        {openRows[i] && (
                                            <Box sx={{ p: 2, bgcolor: "#0d1117" }}>

                                                <Typography sx={{ fontWeight: 700, mb: 1, color: "#fff" }}>
                                                    RADIO 1
                                                </Typography>
                                                <SampleTable samples={row.radio1_samples} />

                                                <Typography sx={{ fontWeight: 700, mt: 2, mb: 1, color: "#fff" }}>
                                                    RADIO 2
                                                </Typography>
                                                <SampleTable samples={row.radio2_samples} />

                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            </>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ================= FILTER POPOVER ================= */}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                PaperProps={{
                    sx: {
                        bgcolor: "#1e2227",   // 🔥 DARK PANEL
                        border: "1px solid #333",
                        borderRadius: 2
                    }
                }}
            >
                <Box sx={{ p: 1.5 }}>
                    <TextField
                        autoFocus
                        size="small"
                        fullWidth
                        placeholder="Search..."
                        value={searchVal}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSearchVal(val);

                            if (!val) {
                                setFilteredRows(rows); // reset
                                return;
                            }

                            const filtered = rows.filter(r =>
                                String(r[activeCol] ?? "")
                                    .toLowerCase()
                                    .includes(val.toLowerCase())
                            );

                            setFilteredRows(filtered);
                        }}
                        sx={{
                            input: {
                                color: "#fff",
                                fontSize: "0.85rem"
                            },
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: "#12161c",   // 🔥 EXACT INNER DARK
                                "& fieldset": {
                                    borderColor: "#444"
                                },
                                "&:hover fieldset": {
                                    borderColor: "#5b8ffe"
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "#5b8ffe"
                                }
                            }
                        }}
                    />
                </Box>
            </Popover>
        </Box>
    );
}

/* ================= SAMPLE TABLE ================= */

function SampleTable({ samples = [] }) {

    const [sortState, setSortState] = useState({});
    const [data, setData] = useState(samples);

    const handleSort = (key, direction) => {
        if (!direction) {
            setData(samples); // reset
            return;
        }

        const sorted = [...data].sort((a, b) => {
            const av = a[key] ?? "";
            const bv = b[key] ?? "";

            return direction === "asc"
                ? av - bv
                : bv - av;
        });

        setData(sorted);
    };

    const renderHeader = (label, key) => {
        const sort = sortState[key];

        return (
            <TableCell
                sx={{
                    color: "#4dabf7",
                    fontWeight: 800
                }}
            >
                <Stack direction="row" alignItems="center" spacing={0.3}>
                    <Typography sx={{ fontWeight: 800 }}>
                        {label}
                    </Typography>

                    {/* SORT */}
                    <IconButton
                        size="small"
                        onClick={() => {
                            let next;
                            if (!sort) next = "asc";
                            else if (sort === "asc") next = "desc";
                            else next = null;

                            setSortState(prev => ({ ...prev, [key]: next }));
                            handleSort(key, next);
                        }}
                        sx={{ p: 0.2, color: sort ? "#5b8ffe" : "#aaa" }}
                    >
                        {sort === "desc"
                            ? <ArrowDownwardIcon sx={{ fontSize: 12 }} />
                            : <ArrowUpwardIcon sx={{ fontSize: 12 }} />}
                    </IconButton>

                    <IconButton size="small" sx={{ p: 0.2, color: "#100f0f" }}>
                        <FilterListIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                </Stack>
            </TableCell>
        );
    };

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    {renderHeader("RFID", "rfid")}
                    {renderHeader("ABS LOCATION", "abs_location")}
                    {renderHeader("RSSI (dBm)", "rssi_dbm")}
                </TableRow>
            </TableHead>

            <TableBody>
                {data.map((s, i) => (
                    <TableRow
                        key={i}
                        sx={{
                            "&:hover": {
                                backgroundColor: "rgba(77,171,247,0.05)"
                            }
                        }}
                    >
                        <TableCell sx={{ color: "#fff" }}>
                            {s.rfid}
                        </TableCell>

                        <TableCell sx={{ color: "#fff" }}>
                            {s.abs_location}
                        </TableCell>

                        <TableCell
                            sx={{
                                color:
                                    s.rssi_dbm >= -60
                                        ? "#1de9b6"
                                        : s.rssi_dbm >= -80
                                            ? "#ffd54f"
                                            : "#ff6b6b",
                                fontWeight: 700
                            }}
                        >
                            {s.rssi_dbm}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}