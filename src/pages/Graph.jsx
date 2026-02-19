import { useState, useEffect, useRef } from "react";
import {
  Box, Card, CardContent, Typography, Stack, Select, MenuItem, Grid, LinearProgress, Divider, Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { Label } from "recharts";
import { AreaChart, LineChart, BarChart, ComposedChart, ScatterChart, Scatter, Area, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, } from "recharts";
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
  0: "Stand By",
  1: "Staff Responsible Mode",
  2: "Limited Supervision",
  3: "Full Supervision",
  4: "Override",
  5: "On Sight",
  6: "Trip",
  7: "Post Trip",
  8: "Reverse",
  9: "Shunting",
  10: "Non Leading",
  11: "System Failure",
  12: "Isolation",
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
  const { fromDate, toDate, isDateRangeValid } = useAppContext();
  const { selectedFile } = useOutletContext();

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

  // ===== REQUIREMENT STATES =====
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [lineWidth, setLineWidth] = useState(2);
  const [nominalColor, setNominalColor] = useState("#1976d2");
  const [reverseColor, setReverseColor] = useState("#e91e63");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fgColor, setFgColor] = useState("#000000");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [meta, setMeta] = useState({
    locos: [],
    directions: [],
    graphTypes: [],
  });

  const stage =
    graphData.length > 0 ? "PREVIEW" : loading ? "ENGINE" : "FILTER";

  /* ================= META LOAD ================= */
  useEffect(() => {
    if (!fromDate || !toDate || !isDateRangeValid || !selectedFile) return;
    const loadMeta = async () => {
      try {
        setMetaLoading(true);
        setError("");

        const from =
          fromDate.length === 16 ? `${fromDate}:00` : fromDate;
        const to =
          toDate.length === 16 ? `${toDate}:00` : toDate;
        if (!selectedFile) return;
        const fileBuffer = await selectedFile.arrayBuffer();

        const res = await fetch(
          `${API_BASE}/api/graph/meta?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
          {
            method: "POST",
            body: fileBuffer,
            headers: {
              "Content-Type": "application/octet-stream",
            },
          }
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
  }, [fromDate, toDate, selectedFile, isDateRangeValid]);
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

      if (!selectedFile) {
        setError("Please upload BIN file");
        return;
      }
      const fileBuffer = await selectedFile.arrayBuffer();
      const res = await fetch(
        `${API_BASE}/api/graph/data` +
        `?locoId=${locoId}` +
        `&from=${encodeURIComponent(from)}` +
        `&to=${encodeURIComponent(to)}` +
        `&direction=${direction}` +
        `&graphType=${encodeURIComponent(graphType)}`,
        {
          method: "POST",
          body: fileBuffer,
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
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
  const getFilteredByTime = () => {
    if (!graphType.includes("Time")) return graphData;
    if (!timeStart || !timeEnd) return graphData;

    return graphData.filter((d) => {
      return d.time >= timeStart && d.time <= timeEnd;
    });
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
              <Select
                fullWidth
                size="small"
                value={lineWidth}
                onChange={e => setLineWidth(e.target.value)}
              >
                {[1, 2, 3, 4, 5].map(w => (
                  <MenuItem key={w} value={w}>
                    {`Line Width ${w}`}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
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
                {/* <MenuItem value="">Direction</MenuItem> */}
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
            <Grid item xs={12} sm={4}>
              <input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <input
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              />
            </Grid>
          </Grid>



          {error && <Typography color="error" mt={2}>{error}</Typography>}
          {noData && <Typography color="warning.main" mt={2}>No graph data available.</Typography>}
        </CardContent>
      </Card>
      <Stack direction="row" spacing={2} mb={2}>
        <Chip label="Zoom +" onClick={() => setZoom(z => z + 0.2)} />
        <Chip label="Zoom -" onClick={() => setZoom(z => Math.max(1, z - 0.2))} />
        <Chip
          label="Grid"
          color={showGrid ? "primary" : "default"}
          onClick={() => setShowGrid(v => !v)}
        />
      </Stack>


      {(loading || metaLoading) && (
        <Box py={6} textAlign="center">
          <LinearProgress sx={{ maxWidth: 400, mx: "auto" }} />
        </Box>
      )}

      {/* GRAPH */}
      {!loading && graphData.length > 0 && (
        <Card
          ref={graphRef}
          sx={{
            borderRadius: 4,
            backgroundColor: bgColor,
            color: fgColor,
          }}
        >

          <CardContent>
            <Stack direction="row" spacing={1} mb={2}>
              <Chip label={`Loco: ${locoId}`} />
              <Chip label={`Direction: ${direction}`} />
            </Stack>

            <Typography fontWeight={700} mb={2}>{graphType}</Typography>

            <Box sx={{ overflowX: "auto" }}>
              <Box sx={{ minWidth: Math.max(graphData.length * 12 * zoom, 1400) }}>
                {graphType === "Location Vs Speed" && (
                  <AreaChart
                    width={Math.max(graphData.length * 12 * zoom, 1400)}
                    height={420}
                    data={getFilteredByTime()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 50 }}
                  >
                    <defs>
                      <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3949ab" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3949ab" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    {showGrid && (
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e0e0e0"
                      />
                    )}

                    <XAxis
                      dataKey="x"
                      tickLine={false}
                      axisLine={{ stroke: '#ccd1d9' }}
                      tick={{ fontSize: 12, fill: '#666' }}
                      minTickGap={30}
                    >
                      <Label value="Location" position="bottom" offset={20} />
                    </XAxis>



                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                      domain={[
                        0,
                        Math.ceil(Math.max(...graphData.map((d) => d.y)) / 10) * 10 + 10,
                      ]}
                    >
                      <Label value="Speed (km/h)" angle={-90} position="insideLeft" />
                    </YAxis>


                    <Tooltip
                      content={<GraphTooltip graphType={graphType} />}
                      cursor={{ stroke: '#3949ab', strokeWidth: 2 }}
                    />

                    {/* The Area provides the color fill */}
                    <Area
                      type="monotone"
                      dataKey="y"
                      stroke="none"
                      fillOpacity={1}
                      fill="url(#speedGradient)"
                      animationDuration={1500}
                    />

                    {/* The Line provides the sharp top edge */}
                    <Area
                      type="monotone"
                      dataKey="y"
                      stroke="#3949ab"
                      strokeWidth={lineWidth}
                      fill="transparent"
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#1a237e' }}
                    />
                  </AreaChart>
                )}
                {graphType === "Time Vs Speed" && (
                  <AreaChart
                    width={Math.max(graphData.length * 12 * zoom, 1400)}
                    height={420}
                    data={getFilteredByTime()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 50 }}
                  >
                    {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                    <XAxis dataKey="x">
                      <Label value="Time" position="bottom" offset={20} />
                    </XAxis>


                    <YAxis
                      domain={[
                        0,
                        Math.ceil(Math.max(...graphData.map(d => d.y)) / 10) * 10,
                      ]}
                    >
                      <Label value="Speed (km/h)" angle={-90} position="insideLeft" />
                    </YAxis>

                    <Tooltip content={<GraphTooltip graphType={graphType} />} />
                    <Area
                      type="monotone"
                      dataKey="y"
                      stroke="#00897b"
                      fill="#2e7d32"
                      fillOpacity={0.3}
                    // stroke={direction === "Nominal" ? nominalColor : reverseColor}
                    // fill={direction === "Nominal" ? nominalColor : reverseColor}
                    />

                  </AreaChart>
                )}

                {graphType === "Location Vs Mode" && (
                  <ComposedChart
                    width={Math.max(graphData.length * 12 * zoom, 1400)}
                    height={420}
                    data={getFilteredByTime()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />}

                    <defs>
                      <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8e24aa" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8e24aa" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="x"
                      tick={{ fill: '#666', fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#ccc' }}
                    >
                      <Label value="Location" position="bottom" offset={20} />
                    </XAxis>



                    <YAxis
                      domain={[0, 12]}
                      ticks={Object.keys(MODE_LEGEND).map(Number)}
                      tickFormatter={(value) => MODE_LEGEND[value] || value}
                      tick={{ fill: '#666', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    >
                      <Label value="Mode" angle={-90} position="insideLeft" />
                    </YAxis>


                    <Tooltip
                      content={<GraphTooltip graphType={graphType} />}
                      cursor={{ stroke: '#8e24aa', strokeWidth: 1 }}
                    />


                    <Area
                      type="monotone"
                      dataKey="y"
                      stroke="none"
                      fillOpacity={1}
                      fill="url(#colorY)"
                    />

                    {/* The Line provides the sharp definition */}
                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke="#6a1b9a"
                      strokeWidth={4}
                      dot={false}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </ComposedChart>
                )}
                {graphType === "Time Vs Mode" && (
                  <ComposedChart
                    width={Math.max(graphData.length * 12 * zoom, 1400)}
                    height={420}
                    data={getFilteredByTime()}
                    margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
                  >
                    <defs>
                      {/* A soft, premium indigo-to-transparent wash */}
                      <linearGradient id="premiumWash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    {/* Remove standard grid for a 'Blank Canvas' feel */}
                    {showGrid && (
                      <CartesianGrid
                        vertical={false}
                        stroke="#f1f5f9"
                        strokeDasharray="0"
                      />
                    )}

                    <XAxis
                      dataKey="x"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                      dy={15}
                    >
                      <Label value="Time" position="bottom" offset={20} />
                    </XAxis>


                    <YAxis
                      domain={[0, 12]}
                      ticks={Object.keys(MODE_LEGEND).map(Number)}
                      tickFormatter={(value) => MODE_LEGEND[value] || value}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      dx={-10}
                    >
                      <Label value="Mode" angle={-90} position="insideLeft" />
                    </YAxis>


                    <Tooltip
                      cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                      content={<GraphTooltip graphType={graphType} />}
                    />

                    {/* The 'Volume': A stepped area with a high-end muted indigo wash */}
                    <Area
                      type="stepAfter"
                      dataKey="y"
                      stroke="none"
                      fill="url(#premiumWash)"
                      animationDuration={1500}
                    />

                    {/* The 'Timeline': A ultra-thin, almost invisible guide line */}
                    <Line
                      type="stepAfter"
                      dataKey="y"
                      stroke="#cbd5e1"
                      strokeWidth={1}
                      dot={false}
                      activeDot={false}
                    />

                    {/* The 'Beads': High-contrast, floating data markers */}
                    <Scatter
                      dataKey="y"
                      shape={(props) => {
                        const { cx, cy, payload } = props;
                        // We only render a bead every few frames or on change to keep it 'Classy'
                        return (
                          <g>
                            {/* The outer ring for depth */}
                            <circle cx={cx} cy={cy} r={5} fill="#fff" stroke="#6366f1" strokeWidth={1} />
                            {/* The inner solid core */}
                            <circle cx={cx} cy={cy} r={2.5} fill="#4f46e5" />
                          </g>
                        );
                      }}
                    />

                    {/* The 'Cap': A subtle highlight line at the very top of the mode height */}
                    <Line
                      type="stepAfter"
                      dataKey="y"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      strokeLinecap="round"
                      dot={false}
                      activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
