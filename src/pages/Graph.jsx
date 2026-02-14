import { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Select,
  MenuItem,
  Grid,
  LinearProgress,
  Divider,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TuneIcon from "@mui/icons-material/Tune";

import ReportHeader from "../components/ReportHeader";
import { useAppContext } from "../context/AppContext";

import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/* =====================================================
   Frame → Time (DESKTOP PARITY)
===================================================== */
function frameToTime(frame) {
  if (!frame || frame <= 0) return "00:00:00";
  const sec = frame - 1;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(
    2,
    "0"
  )}:${String(s).padStart(2, "0")}`;
}
/* =====================================================
   MODE LEGEND (DESKTOP PARITY)
===================================================== */
const MODE_LEGEND = {
  1: "Stand By",
  2: "Staff Responsible Mode",
  3: "Limited Supervision",
  4: "Full Supervision",
  5: "Override",
  6: "On Sight",
  7: "Trip",
  8: "Post Trip",
  9: "Reverse",
  10: "Shunting",
  11: "Non Leading",
  12: "System Failure",
  13: "Isolation",
};

/* =====================================================
   Custom Tooltip (desktop-style)
===================================================== */
function GraphTooltip({ active, payload, graphType }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid #ddd",
        p: 1.5,
        borderRadius: 2,
        fontSize: 13,
      }}
    >
      {graphType.includes("Time") ? (
        <>
          <Typography><b>Time:</b> {p.time}</Typography>
          <Typography><b>Frame:</b> {p.frame}</Typography>
        </>
      ) : (
        <Typography><b>Location:</b> {p.x}</Typography>
      )}

      <Typography>
        <b>{graphType.includes("Speed") ? "Speed" : "Mode"}:</b>{" "}
        {isNaN(p.y) ? p.y : `${p.y} (${MODE_LEGEND[p.y] || "Unknown"})`}

      </Typography>
    </Box>
  );
}

/* =====================================================
   MAIN COMPONENT
===================================================== */
export default function Graph() {
  const { fromDate, toDate, logDir, isDateRangeValid } = useAppContext();
  const graphRef = useRef(null);

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [error, setError] = useState("");
  const [noData, setNoData] = useState(false);

  const [locoId, setLocoId] = useState("");
  const [direction, setDirection] = useState("");
  const [graphType, setGraphType] = useState("");

  const [graphData, setGraphData] = useState([]);

  const [meta, setMeta] = useState({
    locos: [],
    directions: [],
    graphTypes: [],
  });

  const stage =
    graphData.length > 0 ? "PREVIEW" : loading ? "ENGINE" : "FILTER";

  /* ================= META LOAD ================= */
  useEffect(() => {
    if (!logDir || !fromDate || !toDate || !isDateRangeValid) return;

    const loadMeta = async () => {
      try {
        setMetaLoading(true);
        setError("");

        const from =
          fromDate.length === 16 ? `${fromDate}:00` : fromDate;
        const to =
          toDate.length === 16 ? `${toDate}:00` : toDate;

        const res = await fetch(
          `${API_BASE}/api/graph/meta` +
          `?from=${encodeURIComponent(from)}` +
          `&to=${encodeURIComponent(to)}` +
          `&logDir=${encodeURIComponent(logDir)}`
        );

        const json = await res.json();
        if (!json.success) throw new Error("Meta API failed");

        setMeta({
          locos: json.locos || [],
          directions: json.directions || [],
          graphTypes: json.graphTypes || [],
        });

        setGraphType(json.graphTypes?.[0] || "");
      } catch (e) {
        console.error("[GRAPH META]", e);
        setError("Failed to load graph metadata");
      } finally {
        setMetaLoading(false);
      }
    };

    loadMeta();
  }, [fromDate, toDate, logDir, isDateRangeValid]);

  /* ================= RESET ON FILTER CHANGE ================= */
  useEffect(() => {
    setGraphData([]);
    setNoData(false);
    setError("");
  }, [locoId, direction, graphType]);

  /* ================= GENERATE ================= */
  const handleGenerate = async () => {
    setError("");
    setNoData(false);

    if (!locoId || !direction || !graphType) {
      setError("Please select Loco, Direction and Graph Type");
      return;
    }

    try {
      setLoading(true);

      const from =
        fromDate.length === 16 ? `${fromDate}:00` : fromDate;
      const to =
        toDate.length === 16 ? `${toDate}:00` : toDate;

      const res = await fetch(
        `${API_BASE}/api/graph/data` +
        `?locoId=${locoId}` +
        `&from=${encodeURIComponent(from)}` +
        `&to=${encodeURIComponent(to)}` +
        `&direction=${direction}` +
        `&graphType=${encodeURIComponent(graphType)}` +
        `&logDir=${encodeURIComponent(logDir)}`
      );

      const json = await res.json();
      if (!json.success) throw new Error("Graph API failed");

      const x = json.data?.x || [];
      const y = json.data?.y || [];

      if (!x.length) {
        setNoData(true);
        setGraphData([]);
        return;
      }

      const mapped = x.map((val, i) => {
        if (graphType.includes("Time")) {
          return {
            x: frameToTime(val),
            time: frameToTime(val),
            frame: val,
            y: y[i],
          };
        }
        return { x: val, y: y[i] };
      });

      setGraphData(mapped);
    } catch (e) {
      console.error("[GRAPH]", e);
      setError("Failed to load graph data");
      setGraphData([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EXPORT ================= */
  const handleSavePNG = async () => {
    if (!graphRef.current) return;
    const blob = await htmlToImage.toBlob(graphRef.current);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Graph_${locoId}_${graphType.replace(/\s+/g, "_")}.png`;
    link.click();
  };

  const handlePrintPDF = async () => {
    if (!graphRef.current) return;
    const img = await htmlToImage.toPng(graphRef.current);
    const pdf = new jsPDF("l", "pt", "a4");

    pdf.setFontSize(14);
    pdf.text("INDIAN RAILWAYS - TCAS RGS", 40, 40);
    pdf.setFontSize(10);
    pdf.text(
      `Loco: ${locoId} | Direction: ${direction} | ${graphType}`,
      40,
      60
    );

    const w = pdf.internal.pageSize.getWidth() - 80;
    pdf.addImage(img, "PNG", 40, 80, w, 320);
    pdf.save(`Graph_${locoId}_${graphType.replace(/\s+/g, "_")}.pdf`);
  };

  const handleClear = () => {
    setGraphData([]);
    setNoData(false);
    setError("");
  };

  /* ================= UI ================= */
  const isModeGraph = graphType.includes("Mode");

  return (
    <Box p={2} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* HEADER */}
      <Stack direction="row" spacing={2} mb={1}>
        <Box sx={{ bgcolor: "primary.dark", p: 1, borderRadius: 2 }}>
          <ShowChartIcon sx={{ color: "#fff" }} />
        </Box>
        <Typography variant="h5" fontWeight={800}>
          Graph Analysis
        </Typography>
      </Stack>

      <ReportHeader
        stage={stage}
        showTableType={false}
        onGenerate={handleGenerate}
        onClear={handleClear}
        onSave={handleSavePNG}
        onPrint={handlePrintPDF}
        showAdvancedSearch={false}
        showSaveAll={false}
        showColumns={false}
      />

      {/* CONFIG */}
      <Card sx={{ mb: 1, borderRadius: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} mb={2}>
            <TuneIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight={700}>
              CONFIGURATION
            </Typography>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Select fullWidth size="small" value={locoId} onChange={e => setLocoId(e.target.value)} displayEmpty>
                <MenuItem value="">Loco ID</MenuItem>
                {meta.locos.map(l => (
                  <MenuItem key={l} value={l}>{l}</MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Select fullWidth size="small" value={direction} onChange={e => setDirection(e.target.value)} displayEmpty>
                <MenuItem value="">Direction</MenuItem>
                {meta.directions.map(d => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Select fullWidth size="small" value={graphType} onChange={e => setGraphType(e.target.value)}>
                {meta.graphTypes.map(g => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>

          {error && <Typography color="error" mt={2}>{error}</Typography>}
          {noData && <Typography color="warning.main" mt={2}>No graph data available.</Typography>}
        </CardContent>
      </Card>

      {(loading || metaLoading) && (
        <Box py={6} textAlign="center">
          <LinearProgress sx={{ maxWidth: 400, mx: "auto" }} />
        </Box>
      )}

      {/* GRAPH */}
      {!loading && graphData.length > 0 && (
        <Card ref={graphRef} sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack direction="row" spacing={1} mb={2}>
              <Chip label={`Loco: ${locoId}`} />
              <Chip label={`Direction: ${direction}`} />
            </Stack>

            <Typography fontWeight={700} mb={2}>{graphType}</Typography>

            <Box sx={{ overflowX: "auto" }}>
              <Box sx={{ minWidth: Math.max(graphData.length * 12, 1400) }}>
                <AreaChart
                  width={Math.max(graphData.length * 12, 1400)}
                  height={420}
                  data={graphData}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="x"
                    label={{
                      value: graphType.includes("Time")
                        ? "Time (HH:MM:SS)"
                        : "Absolute Location",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />

                  <YAxis
                    domain={isModeGraph ? [0, 13] : ["auto", "auto"]}
                    allowDecimals={!isModeGraph}
                    label={{
                      value: graphType.includes("Speed") ? "Speed" : "Mode",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />

                  <Tooltip content={<GraphTooltip graphType={graphType} />} />
                  <Area
                    type={isModeGraph ? "stepAfter" : "monotone"}
                    dataKey="y"
                    stroke="#1976d2"
                    fillOpacity={0.3}
                    fill="#1976d2"
                  />


                </AreaChart>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
