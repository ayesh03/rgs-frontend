import { useState, useEffect, useRef } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Grid,
    Select,
    MenuItem,
    LinearProgress,
    Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

import ShowChartIcon from "@mui/icons-material/ShowChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import TerrainIcon from "@mui/icons-material/Terrain";

import ReportHeader from "../components/ReportHeader";
import { useAppContext } from "../context/AppContext";

import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function TrackProfileGraph() {
    const { fromDate, toDate, logDir, isDateRangeValid } = useAppContext();
    const captureRef = useRef(null);


    /* ================= SELECTION ================= */
    const [locoId, setLocoId] = useState("");
    const [station, setStation] = useState("");
    const [direction, setDirection] = useState("");
    const [profileId, setProfileId] = useState("");

    const formatLocation = (value) => `${value.toLocaleString()} m`;

    const speedFormatter = (value) => [`${value} km/h`, "Speed"];

    const gradientFormatter = (value) => [`1 in ${value}`, "Gradient"];


    /* ================= META ================= */
    const [meta, setMeta] = useState({
        locos: [],
        stations: [],
        directions: [],
        profiles: [],
    });

    /* ================= GRAPH DATA ================= */
    const [speedGraph, setSpeedGraph] = useState([]);
    const [gradientGraph, setGradientGraph] = useState([]);

    /* ================= UI ================= */
    const [loading, setLoading] = useState(false);
    const [metaLoading, setMetaLoading] = useState(false);
    const [error, setError] = useState("");
    const [noData, setNoData] = useState(false);

    const normalizeDate = (d) => d?.split("T")[0];


    /* ================= VALIDATION ================= */
    // ONLY selection validation (dates handled separately like Graph.jsx)
    const canGenerate =
        locoId &&
        station &&
        direction &&
        profileId;

    const stage =
        speedGraph.length || gradientGraph.length
            ? "PREVIEW"
            : loading
                ? "ENGINE"
                : "FILTER";

    const captureFullGraph = async () => {
        if (!graphRef.current) return null;

        const node = graphRef.current;

        // save original styles
        const originalOverflow = node.style.overflow;
        const originalWidth = node.style.width;

        // force full render
        node.style.overflow = "visible";
        node.style.width = "max-content";

        await new Promise(r => setTimeout(r, 50)); // allow reflow

        const blob = await htmlToImage.toBlob(node);

        // restore styles
        node.style.overflow = originalOverflow;
        node.style.width = originalWidth;

        return blob;
    };




    /* ================= LOAD META ================= */
    useEffect(() => {
        if (!logDir || !fromDate || !toDate) return;

        const loadMeta = async () => {
            try {
                setMetaLoading(true);
                setError("");

                const url =
                    `${API_BASE}/api/track-profile/meta` +
                    `?from=${normalizeDate(fromDate)}` +
                    `&to=${normalizeDate(toDate)}` +
                    `&logDir=${encodeURIComponent(logDir)}`;

                const res = await fetch(url);
                const json = await res.json();

                if (!json.success) throw new Error("Meta API failed");

                setMeta({
                    locos: json.locos || [],
                    stations: json.stations || [],
                    directions: json.directions || [],
                    profiles: json.profiles || [],
                });
            } catch (e) {
                setError("Failed to load Track Profile metadata");
            } finally {
                setMetaLoading(false);
            }
        };

        loadMeta();
    }, [logDir, fromDate, toDate]);


    /* ===== AUTO CLEAR ON FILTER CHANGE ===== */
    useEffect(() => {
        setSpeedGraph([]);
        setGradientGraph([]);
        setNoData(false);
        setError("");
    }, [locoId, station, direction, profileId]);

    /* ================= GENERATE ================= */
    const handleGenerate = async () => {
        setError("");
        setNoData(false);

        if (!canGenerate) {
            setError("Please complete all selections");
            return;
        }

        if (!fromDate || !toDate || !logDir || !isDateRangeValid) {
            setError("Invalid global date range or log directory");
            return;
        }

        try {
            setLoading(true);

            const url =
                `${API_BASE}/api/track-profile/graph` +
                `?locoId=${locoId}` +
                `&station=${station}` +
                `&direction=${direction}` +
                `&profileId=${profileId}` +
                `&from=${normalizeDate(fromDate)}` +
                `&to=${normalizeDate(toDate)}` +
                `&logDir=${encodeURIComponent(logDir)}`;

            const res = await fetch(url);
            const json = await res.json();

            if (!json.success) throw new Error("Graph API failed");

            if (!json.hasData) {
                setNoData(true);
                setSpeedGraph([]);
                setGradientGraph([]);
                return;
            }

            // DESKTOP PARITY: SORT BY LOCATION
            const speed = [...(json.speedGraph || [])].sort((a, b) => a.x - b.x);
            const grad = [...(json.gradientGraph || [])].sort((a, b) => a.x - b.x);

            setSpeedGraph(speed);
            setGradientGraph(grad);
        } catch (e) {
            setError("Failed to generate Track Profile Graph");
        } finally {
            setLoading(false);
        }
    };


/* ================= EXPORT ================= */
const handleSavePNG = async () => {
    if (!captureRef.current) return;

    const node = captureRef.current;
    
    // 1. Find the scrollable containers inside the ref
    const scrollContainers = node.querySelectorAll('[style*="overflow-x: auto"]');
    const originalStyles = [];

    // 2. Temporarily force them to show full content
    scrollContainers.forEach((el) => {
        originalStyles.push({ el, style: el.style.cssText });
        el.style.overflowX = "visible";
        el.style.width = "max-content";
    });

    try {
        // 3. Capture the full width (node.scrollWidth is the key here)
        const dataUrl = await htmlToImage.toPng(node, {
            backgroundColor: "#ffffff",
            width: node.scrollWidth,
            height: node.scrollHeight,
            style: {
                padding: '20px' // Add some breathing room for the capture
            }
        });

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `Track_Profile_${locoId}.png`;
        link.click();
    } catch (err) {
        console.error("PNG Export failed", err);
    } finally {
        // 4. Restore original styles immediately
        originalStyles.forEach(({ el, style }) => {
            el.style.cssText = style;
        });
    }
};

const handlePrintPDF = async () => {
    if (!captureRef.current) return;

    const node = captureRef.current;
    const scrollContainers = node.querySelectorAll('[style*="overflow-x: auto"]');
    const originalStyles = [];

    scrollContainers.forEach((el) => {
        originalStyles.push({ el, style: el.style.cssText });
        el.style.overflowX = "visible";
        el.style.width = "max-content";
    });

    try {
        const dataUrl = await htmlToImage.toPng(node, { 
            backgroundColor: "#ffffff",
            width: node.scrollWidth,
            height: node.scrollHeight
        });
        
        // Use custom dimensions based on the actual graph width
        // [width, height] in points. 1 point = 1/72 inch.
        const pdfWidth = node.scrollWidth + 80;
        const pdfHeight = node.scrollHeight + 150;
        const pdf = new jsPDF("l", "pt", [pdfWidth, pdfHeight]);

        pdf.setFontSize(16);
        pdf.text("INDIAN RAILWAYS – TRACK PROFILE GRAPH", 40, 40);
        pdf.setFontSize(10);
        pdf.text(`Loco: ${locoId} | Station: ${station} | Direction: ${direction}`, 40, 65);

        pdf.addImage(dataUrl, "PNG", 20, 100, node.scrollWidth, node.scrollHeight);
        pdf.save(`Track_Profile_${locoId}.pdf`);
    } catch (err) {
        console.error("PDF Export failed", err);
    } finally {
        originalStyles.forEach(({ el, style }) => {
            el.style.cssText = style;
        });
    }
};

    const handleClear = () => {
        setSpeedGraph([]);
        setGradientGraph([]);
        setNoData(false);
        setError("");
    };

    /* ================= UI ================= */
    return (
        <Box
            p={2}
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* HEADER */}
            <Stack direction="row" spacing={2} mb={1}>
                <Box sx={{ bgcolor: "primary.main", p: 1, borderRadius: 2 }}>
                    <ShowChartIcon sx={{ color: "#fff" }} />
                </Box>
                <Typography variant="h5" fontWeight={800}>
                    Track Profile Graph
                </Typography>
            </Stack>

            {/* REPORT HEADER (ONLY BUTTON SOURCE) */}
            <ReportHeader
                stage={stage}
                onGenerate={handleGenerate}
                showTableType={false}
                onClear={handleClear}
                onSave={handleSavePNG}
                onPrint={handlePrintPDF}
                disableGenerate={!canGenerate}
                showAdvancedSearch={false}
                showException={false}
                showSaveAll={false}
                showColumns={false}
            />

            {/* FILTERS */}
            <Card sx={{ mb: 1 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <Select fullWidth size="small" value={locoId} onChange={e => setLocoId(e.target.value)} displayEmpty>
                                <MenuItem value="">Loco</MenuItem>
                                {meta.locos.map(l => (
                                    <MenuItem key={l} value={l}>{l}</MenuItem>
                                ))}
                            </Select>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Select fullWidth size="small" value={station} onChange={e => setStation(e.target.value)} displayEmpty>
                                <MenuItem value="">Station</MenuItem>
                                {meta.stations.map(s => (
                                    <MenuItem key={s} value={s}>{s}</MenuItem>
                                ))}
                            </Select>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Select fullWidth size="small" value={direction} onChange={e => setDirection(e.target.value)} displayEmpty>
                                <MenuItem value="">Direction</MenuItem>
                                {meta.directions.map(d => (
                                    <MenuItem key={d} value={d}>{d}</MenuItem>
                                ))}
                            </Select>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Select fullWidth size="small" value={profileId} onChange={e => setProfileId(e.target.value)} displayEmpty>
                                <MenuItem value="">Profile</MenuItem>
                                {meta.profiles.map(p => (
                                    <MenuItem key={p} value={p}>{p}</MenuItem>
                                ))}
                            </Select>
                        </Grid>
                    </Grid>

                    {error && <Typography color="error" mt={2}>{error}</Typography>}
                    {noData && <Typography color="warning.main" mt={2}>No Track Profile data available.</Typography>}
                </CardContent>
            </Card>

            {/* LOADING */}
            {(loading || metaLoading) && (
                <Box py={6} textAlign="center">
                    <LinearProgress sx={{ maxWidth: 400, mx: "auto" }} />
                    <Typography variant="caption">Processing BIN data…</Typography>
                </Box>
            )}

            {/* GRAPHS */}
            {(speedGraph.length || gradientGraph.length) > 0 && (
    <Card>
        {/* WE PUT THE REF HERE TO CAPTURE CHIPS + BOTH GRAPHS */}
        <CardContent ref={captureRef} sx={{ bgcolor: 'white' }}>
            <Stack direction="row" spacing={1} mb={2}>
                <Chip label={`Loco: ${locoId}`} />
                <Chip label={`Station: ${station}`} />
                <Chip label={`Direction: ${direction}`} />
            </Stack>

                        <Stack spacing={4}>
                            {/* ===== SPEED GRAPH ===== */}
                            <Box>
                                <Typography fontWeight={700} mb={1}>
                                    <TimelineIcon fontSize="small" /> Location vs Speed
                                </Typography>

                                <Box
                                    sx={{
                                        overflowX: "auto",
                                        overflowY: "visible",
                                        border: "1px solid #eee",
                                        borderRadius: 1,
                                        p: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: Math.max(speedGraph.length * 8, 1800),
                                            height: 340,
                                            pt: 1,
                                        }}
                                    >
                                        <AreaChart
                                            width={Math.max(speedGraph.length * 8, 1800)}
                                            height={340}
                                            data={speedGraph}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="x" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={speedFormatter}
                                                labelFormatter={(label) => `Location : ${formatLocation(label)}`}
                                            />
                                            <Area
                                                dataKey="y"
                                                stroke="#1976d2"
                                                fill="#1976d2"
                                                fillOpacity={0.3}
                                            />
                                        </AreaChart>
                                    </Box>

                                </Box>
                            </Box>


                            {/* ===== GRADIENT GRAPH ===== */}
                            <Box>
                                <Typography fontWeight={700} mb={1}>
                                    <TerrainIcon fontSize="small" /> Location vs Gradient
                                </Typography>

                                <Box
                                    sx={{
                                        overflowX: "auto",
                                        overflowY: "visible",
                                        border: "1px solid #eee",
                                        borderRadius: 1,
                                        p: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: Math.max(gradientGraph.length * 8, 1800),
                                            height: 340,
                                        }}
                                    >
                                        <AreaChart
                                            width={Math.max(gradientGraph.length * 8, 1800)}
                                            height={340}
                                            data={gradientGraph}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="x" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={gradientFormatter}
                                                labelFormatter={(label) => `Location : ${formatLocation(label)}`}
                                            />

                                            <Area
                                                dataKey="y"
                                                stroke="#2e7d32"
                                                fill="#2e7d32"
                                                fillOpacity={0.3}
                                            />
                                        </AreaChart>
                                    </Box>

                                </Box>
                            </Box>

                        </Stack>


                    </CardContent>
                </Card>
            )}
        </Box>
    );
}
