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
  alpha,
  useTheme,
  Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { Label } from "recharts";
import {
  AreaChart,
  LineChart,
  BarChart,
  ComposedChart,
  ScatterChart,
  Scatter,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TuneIcon from "@mui/icons-material/Tune";
import ReportHeader from "../components/ReportHeader";
import { useAppContext } from "../context/AppContext";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import areaLogo from "../assets/arecaLogo.png";
import GraphPropertiesPopup from "../components/GraphPropertiesPopup";
import SettingsIcon from "@mui/icons-material/Settings";
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
    "0",
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
        bgcolor: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.2)",
        p: 1.5,
        borderRadius: 2,
        fontSize: 13,
        color: "#fff",
      }}
    >
      {graphType.includes("Time") ? (
        <>
          <Typography sx={{ color: "#fff" }}>
            <b>Time:</b> {p.time}
          </Typography>
          <Typography sx={{ color: "#fff" }}>
            <b>Frame:</b> {p.frame}
          </Typography>
        </>
      ) : (
        <Typography sx={{ color: "#fff" }}>
          <b>Location:</b> {p.x}
        </Typography>
      )}

      <Typography sx={{ color: "#fff" }}>
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
  const theme = useTheme();

  /* ===================== DROPDOWN STYLE (same as Interlocking) ===================== */

  const selectStyle = {
    height: 38,
    bgcolor: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    color: "#fff",
    borderRadius: "8px",
    fontSize: "0.85rem",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255, 255, 255, 0.1)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "& .MuiSvgIcon-root": {
      color: "rgba(255,255,255,0.7)",
    },
  };

  const menuProps = {
    PaperProps: {
      sx: {
        bgcolor: "#1a1a1a",
        backgroundImage: "none",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#fff",
        "& .MuiMenuItem-root": {
          fontSize: "0.85rem",
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.08)",
          },
          "&.Mui-selected": {
            bgcolor: alpha(theme.palette.primary.main, 0.2),
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.3),
            },
          },
        },
      },
    },
  };
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
  const [pdfExporting, setPdfExporting] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  const [locDiv, setLocDiv] = useState(600);

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

  const [openProps, setOpenProps] = useState(false);

  const graphConfig = {
    lineWidth,
    nominalColor,
    reverseColor,
    bgColor,
    fgColor,
    showGrid,
  };

  const handleApplyProps = (cfg) => {
    if (cfg.bgColor === cfg.fgColor) {
      setError("Background and Foreground colors cannot be the same");
      return;
    }

    if (cfg.lineWidth <= 0) {
      setError("Line width must be greater than 0");
      return;
    }

    setError(""); // clear old errors

    setLineWidth(cfg.lineWidth);
    setNominalColor(cfg.nominalColor);
    setReverseColor(cfg.reverseColor);
    setBgColor(cfg.bgColor);
    setFgColor(cfg.fgColor);
    setShowGrid(cfg.showGrid);
  };

  const stage =
    graphData.length > 0 ? "PREVIEW" : loading ? "ENGINE" : "FILTER";

  /* ================= META LOAD ================= */
  useEffect(() => {
    if (!fromDate || !toDate || !isDateRangeValid || !selectedFile) return;
    const loadMeta = async () => {
      try {
        setMetaLoading(true);
        setError("");

        const from = fromDate.length === 16 ? `${fromDate}:00` : fromDate;
        const to = toDate.length === 16 ? `${toDate}:00` : toDate;
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
          },
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

  // Auto-refresh metadata when file changes
  useEffect(() => {
    if (
      fromDate &&
      toDate &&
      isDateRangeValid &&
      selectedFile &&
      meta.locos.length > 0
    ) {
      // Reload meta data
      const loadMeta = async () => {
        try {
          setMetaLoading(true);
          const from = fromDate.length === 16 ? `${fromDate}:00` : fromDate;
          const to = toDate.length === 16 ? `${toDate}:00` : toDate;

          const fileBuffer = await selectedFile.arrayBuffer();

          const res = await fetch(
            `${API_BASE}/api/graph/meta?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
            {
              method: "POST",
              body: fileBuffer,
              headers: { "Content-Type": "application/octet-stream" },
            },
          );
          const json = await res.json();
          if (json.success) {
            setMeta({
              locos: json.locos || [],
              directions: json.directions || [],
              graphTypes: json.graphTypes || [],
            });
          }
        } catch (e) {
          console.error("[GRAPH META ON UPDATE]", e);
        } finally {
          setMetaLoading(false);
        }
      };

      loadMeta();
    }
  }, [selectedFile]);

  /* ================= GENERATE ================= */
  const handleGenerate = async () => {
    if (bgColor === fgColor) {
      setError("Background and Foreground colors cannot be the same");
      return;
    }
    setError("");
    setNoData(false);

    if (!locoId || !direction || !graphType) {
      setError("Please select Loco, Direction and Graph Type");
      return;
    }

    try {
      setLoading(true);

      const from = fromDate.length === 16 ? `${fromDate}:00` : fromDate;
      const to = toDate.length === 16 ? `${toDate}:00` : toDate;

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
        },
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

    try {
      setPdfExporting(true);
      setPdfProgress(0);

      const svgEl = graphRef.current.querySelector(".recharts-wrapper svg");
      if (!svgEl) {
        console.error("No SVG found");
        return;
      }

      const svgWidth = parseFloat(svgEl.getAttribute("width")) || 1400;
      const svgHeight = parseFloat(svgEl.getAttribute("height")) || 420;

      const clipPathRect = svgEl.querySelector("defs clipPath rect");
      const plotX = clipPathRect
        ? parseFloat(clipPathRect.getAttribute("x") || "0")
        : 65;
      const plotWidth = clipPathRect
        ? parseFloat(clipPathRect.getAttribute("width") || String(svgWidth))
        : svgWidth - 65;
      const rightMarginW = svgWidth - plotX - plotWidth;
      const plotY = clipPathRect
        ? parseFloat(clipPathRect.getAttribute("y") || "0")
        : 10;
      const plotHeight = clipPathRect
        ? parseFloat(clipPathRect.getAttribute("height") || String(svgHeight))
        : svgHeight - 60;

      const isModeGraph = graphType.includes("Mode");
      const isSpeedGraph = graphType.includes("Speed");

      // ── Y axis ticks ──
      let yTicks = [];
      if (isModeGraph) {
        yTicks = Object.entries(MODE_LEGEND).map(([k, v]) => ({
          value: Number(k),
          label: v,
        }));
      } else {
        const maxY =
          Math.ceil(Math.max(...graphData.map((d) => d.y)) / 50) * 50 || 200;
        for (let v = 0; v <= maxY; v += 50)
          yTicks.push({ value: v, label: String(v) });
      }
      const yMin = 0;
      const yMax = isModeGraph ? 12 : yTicks[yTicks.length - 1]?.value || 200;

      const xAxisLabel = graphType.includes("Time") ? "Time" : "Location";
      const yAxisLabel = isSpeedGraph ? "Speed (km/h)" : "Mode";

      // ── Serialize SVG ONCE — reuse the string every page ──

      const serializer = new XMLSerializer();
      const rawSvgStr = serializer.serializeToString(svgEl);

      // ── PDF setup ──
      const pdf = new jsPDF("l", "pt", "a3");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const outerMargin = 40;
      const headerH = 24;
      const footerH = 24;
      const yAxisPdfW = isModeGraph ? 110 : 44;
      const xAxisPdfH = 28;

      const graphLeft = outerMargin + yAxisPdfW;
      const graphTop = outerMargin + headerH;
      const graphRight = pdfW - outerMargin;
      const graphBottom = pdfH - outerMargin - footerH - xAxisPdfH;
      const graphW = graphRight - graphLeft;
      const graphH = graphBottom - graphTop;

      const minDataSlice =
        Math.ceil(((graphW + yAxisPdfW) * svgHeight) / graphH) - rightMarginW;
      const sliceDataW = Math.max(minDataSlice, 600);
      const totalPages = Math.ceil(plotWidth / sliceDataW);

      // console.log(`[PDF] pages=${totalPages} sliceW=${sliceDataW}`);

      // ── Use lower pixel ratio to reduce per-canvas memory ──
      const PIXEL_RATIO = 1.5; // was 2 — saves ~44% memory per canvas
      const JPEG_Q = 0.85; // was 0.92

      // Pre-parse the SVG string so we can do targeted string replacements
      // instead of cloning the DOM every iteration (much cheaper)
      const parser = new DOMParser();

      for (let page = 0; page < totalPages; page++) {
        setPdfProgress(Math.round((page / totalPages) * 100));

        // Yield to browser every 5 pages so UI can update and GC can run
        if (page % 5 === 0) await new Promise((r) => setTimeout(r, 0));

        const dataOffsetX = page * sliceDataW;
        const thisDataW = Math.min(sliceDataW, plotWidth - dataOffsetX);
        const viewBoxX = plotX + dataOffsetX;
        const viewBoxW = thisDataW + rightMarginW;

        // Parse fresh each time from the serialized string (avoids DOM clone memory leak)
        const svgDoc = parser.parseFromString(rawSvgStr, "image/svg+xml");
        const svgClone = svgDoc.documentElement;

        svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svgClone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        svgClone.setAttribute("width", String(viewBoxW));
        svgClone.setAttribute("height", String(svgHeight));
        svgClone.setAttribute(
          "viewBox",
          `${viewBoxX} 0 ${viewBoxW} ${svgHeight}`,
        );

        svgClone
          .querySelectorAll("[clip-path]")
          .forEach((el) => el.removeAttribute("clip-path"));

        const yAxisEl = svgClone.querySelector(".recharts-yAxis");
        if (yAxisEl) yAxisEl.setAttribute("display", "none");

        const bgRect = svgDoc.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        bgRect.setAttribute("x", String(viewBoxX));
        bgRect.setAttribute("y", "0");
        bgRect.setAttribute("width", String(viewBoxW + 10));
        bgRect.setAttribute("height", String(svgHeight));
        bgRect.setAttribute("fill", "#12161c");
        svgClone.insertBefore(bgRect, svgClone.firstChild);

        const svgString = new XMLSerializer().serializeToString(svgClone);
        const base64 = btoa(unescape(encodeURIComponent(svgString)));
        const dataUrl = `data:image/svg+xml;base64,${base64}`;

        // ── Create canvas, draw, extract, then IMMEDIATELY destroy
        const cW = Math.ceil(viewBoxW * PIXEL_RATIO);
        const cH = Math.ceil(svgHeight * PIXEL_RATIO);

        const imgData = await new Promise((resolve, reject) => {
          const canvas = document.createElement("canvas");
          canvas.width = cW;
          canvas.height = cH;
          const ctx = canvas.getContext("2d");
          ctx.scale(PIXEL_RATIO, PIXEL_RATIO);
          ctx.fillStyle = "#12161c";
          ctx.fillRect(0, 0, viewBoxW, svgHeight);

          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, viewBoxW, svgHeight);
            const data = canvas.toDataURL("image/jpeg", JPEG_Q);

            // ── FREE MEMORY immediately after extraction ──
            ctx.clearRect(0, 0, cW, cH);
            canvas.width = 1; // forces browser to release GPU texture
            canvas.height = 1;

            resolve(data);
          };
          img.onerror = reject;
          img.src = dataUrl;
        });

        if (page > 0) pdf.addPage();

        // ── Background ──
        pdf.setFillColor(18, 22, 28);
        pdf.rect(outerMargin, graphTop, pdfW - outerMargin * 2, graphH, "F");

        // ── Header ──

        pdf.setTextColor(40, 107, 206);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text(
          `KAVACH REPORT GENERATION SYSTEM - GRAPH ANALYSIS`,
          outerMargin,
          outerMargin - 5,
        );

        pdf.addImage(
          areaLogo,
          "PNG",
          pdfW - outerMargin - 80,
          outerMargin - 18,
          60,
          30,
        );

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 220);
        pdf.text(
          `${graphType}   |   Loco: ${locoId}   |   Direction: ${direction}   |   Page ${page + 1} of ${totalPages}`,
          outerMargin,
          outerMargin + 10,
        );
        // ── Graph image ──
        pdf.addImage(imgData, "JPEG", graphLeft, graphTop, graphW, graphH);

        // ── Y axis (drawn by jsPDF)
        const yAxisRight = outerMargin + yAxisPdfW;
        pdf.setFillColor(15, 18, 26);
        pdf.rect(outerMargin, graphTop, yAxisPdfW, graphH, "F");
        pdf.setDrawColor(60, 60, 90);
        pdf.setLineWidth(0.5);
        pdf.line(yAxisRight, graphTop, yAxisRight, graphBottom);
        pdf.setFontSize(8);
        pdf.setTextColor(160, 160, 210);
        pdf.text(
          yAxisLabel,
          outerMargin + yAxisPdfW / 2,
          graphTop + graphH / 2,
          { angle: 90, align: "center" },
        );

        yTicks.forEach(({ value, label }) => {
          const pdfPlotTop = graphTop + (plotY / svgHeight) * graphH;
          const pdfPlotH = (plotHeight / svgHeight) * graphH;
          const ratio = 1 - (value - yMin) / (yMax - yMin);
          const tickY = pdfPlotTop + ratio * pdfPlotH;
          pdf.setDrawColor(40, 45, 65);
          pdf.setLineWidth(0.3);
          pdf.line(yAxisRight, tickY, graphRight, tickY);
          pdf.setDrawColor(80, 85, 120);
          pdf.setLineWidth(0.5);
          pdf.line(yAxisRight - 4, tickY, yAxisRight, tickY);
          pdf.setFontSize(isModeGraph ? 5.5 : 7);
          pdf.setTextColor(180, 185, 220);
          pdf.text(label, yAxisRight - 6, tickY + 1.5, { align: "right" });
        });

        // ── X axis label ──
        pdf.setFontSize(8);
        pdf.setTextColor(160, 160, 210);
        pdf.text(xAxisLabel, graphLeft + graphW / 2, graphBottom + 18, {
          align: "center",
        });

        // ── Data range ──
        const startPct = ((dataOffsetX / plotWidth) * 100).toFixed(1);
        const endPct = (
          (Math.min(dataOffsetX + thisDataW, plotWidth) / plotWidth) *
          100
        ).toFixed(1);
        pdf.setFontSize(6.5);
        pdf.setTextColor(90, 95, 130);
        pdf.text(
          `Data: ${startPct}% – ${endPct}%`,
          graphRight - 2,
          graphBottom + 18,
          { align: "right" },
        );

        // --- CONFIDENTIAL FOOTER ---
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);

        const footerText =
          "This document is confidential. Using it any purpose without permission of Areca Embedded Systems Pvt. Ltd. is strictly prohibited.";
        pdf.text(footerText, outerMargin, pdfH - outerMargin + 10);

        const timeText = `Generated at: ${new Date().toLocaleString()}`;
        pdf.text(timeText, pdfW - outerMargin - 160, pdfH - outerMargin + 10);

        // // ── Footer progress bar ──
        // const barY = pdfH - outerMargin - 8;
        // const barFill = ((page + 1) / totalPages) * (pdfW - outerMargin * 2);
        // pdf.setFillColor(25, 28, 48);
        // pdf.roundedRect(outerMargin, barY, pdfW - outerMargin * 2, 5, 2, 2, "F");
        // pdf.setFillColor(99, 102, 241);
        // pdf.roundedRect(outerMargin, barY, barFill, 5, 2, 2, "F");
        // pdf.setFontSize(6.5);
        // pdf.setTextColor(110, 115, 160);
        // pdf.text(`${page + 1} / ${totalPages}`, pdfW - outerMargin - 2, barY + 9, { align: "right" });
      }

      setPdfProgress(100);
      pdf.save(`Graph_${locoId}_${graphType.replace(/\s+/g, "_")}_Full.pdf`);
    } catch (err) {
      console.error("[PDF Export Error]", err);
    } finally {
      setTimeout(() => {
        setPdfExporting(false);
        setPdfProgress(0);
      }, 800);
    }
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

  const locDivOptions = [
    100,
    200,
    400,
    600,
    800,
    1000,
    ...Array.from({ length: (10000 - 1000) / 500 }, (_, i) => 1500 + i * 500),
  ];
  return (
    <Box
      sx={{ width: "100%", p: { xs: 1, md: 0.5 } }}
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* REPLACEMENT FOR OLD HEADER */}
      {/* <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          mb: 2, p: 1.5, borderRadius: "12px",
          bgcolor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(10px)"
        }}
      > */}
      {/* <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ p: 1, borderRadius: "10px", bgcolor: alpha(theme.palette.primary.main, 0.1), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, display: 'flex' }}>
            <ShowChartIcon sx={{ color: theme.palette.primary.light, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#fff", lineHeight: 1.2, letterSpacing: 0.5 }}>
              GRAPH ANALYSIS
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", textTransform: 'uppercase', letterSpacing: 1 }}>
              Real-time Telemetry Visualization
            </Typography>
          </Box>
        </Stack> */}
      {/* </Stack> */}

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
        disableGenerate={bgColor === fgColor}
      />

      {/* CONFIG */}
      <Card
        sx={{
          mb: 1.5,
          borderRadius: "6px",
          bgcolor: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundImage: "none",
          px: 1,
          py: 1,
        }}
      >
        {/* <CardContent> */}
        {/* <Stack direction="row" spacing={0.5} mb={0.5} alignItems="center">
            <TuneIcon fontSize="small" sx={{ color: theme.palette.primary.light }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "rgba(255,255,255,0.8)" }}>
              CONFIGURATION
            </Typography>
          </Stack> */}
        <Divider sx={{ my: 0.3 }} />
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={2}>
            <Tooltip title="Adjust line thickness">
              <Select
                fullWidth
                size="small"
                value={lineWidth}
                onChange={(e) => setLineWidth(e.target.value)}
                sx={selectStyle}
                MenuProps={menuProps}
              >
                {[1, 2, 3, 4, 5].map((w) => (
                  <MenuItem key={w} value={w}>
                    {`Line Width ${w}`}
                  </MenuItem>
                ))}
              </Select>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Tooltip title="Select loco ID automatically fetch from uploaded file">
              <Select
                fullWidth
                size="small"
                value={locoId}
                onChange={(e) => setLocoId(e.target.value)}
                displayEmpty
                sx={selectStyle}
                MenuProps={menuProps}
              >
                <MenuItem value="">Loco Id</MenuItem>
                {meta.locos.map((l) => (
                  <MenuItem key={l} value={l}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </Tooltip>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Tooltip title="Select available movement direction">
              <Select
                fullWidth
                size="small"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                displayEmpty
                sx={selectStyle}
                MenuProps={menuProps}
              >
                <MenuItem value="">Direction</MenuItem>
                {meta.directions.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </Tooltip>
          </Grid>

          <Tooltip title="Open graph customization settings">
            <Chip
              label="Update Graph Properties"
              onClick={() => setOpenProps(true)}
              sx={{
                height: 38,
                fontSize: "0.85rem",

                bgcolor: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#fff",

                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  bgcolor: "rgba(255,255,255,0.08)",
                },

                "& .MuiChip-icon": {
                  color: "rgba(255,255,255,0.7)",
                },
              }}
            />
          </Tooltip>

          <Grid item xs={12} sm={4}>
            <Tooltip title="Select graph type">
              <Select
                fullWidth
                size="small"
                value={graphType}
                onChange={(e) => setGraphType(e.target.value)}
                displayEmpty
                sx={selectStyle}
                MenuProps={menuProps}
              >
                {meta.graphTypes.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
            </Tooltip>
          </Grid>

          {/* <Grid item xs={12} sm={4}>
            <input
              type="time"
              value={timeStart}
              onChange={(e) => setTimeStart(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
                borderRadius: "8px"
              }}
            />
          </Grid>


          <Grid item xs={12} sm={4}>
            <input
              type="time"
              value={timeEnd}
              onChange={(e) => setTimeEnd(e.target.value)}
              style={{
                width: "100%", padding: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "white", borderRadius: "8px"
              }}
            />
          </Grid> */}
        </Grid>

        {error && (
          <Typography color="error" mt={0.5}>
            {error}
          </Typography>
        )}
        {noData && (
          <Typography color="warning.main" mt={0.5}>
            No graph data available.
          </Typography>
        )}
        {/* </CardContent> */}
      </Card>
      <Stack direction="row" spacing={2} mb={2}>
        <Chip
          label="Zoom +"
          onClick={() => setZoom((z) => z + 0.2)}
          sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "#fff" }}
        />

        <Chip
          label="Zoom -"
          onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
          sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "#fff" }}
        />

        <Chip
          label="Grid"
          color={showGrid ? "primary" : "default"}
          onClick={() => setShowGrid((v) => !v)}
          sx={{ color: "#fff" }}
        />
      </Stack>

      {(loading || metaLoading) && (
        <Box py={10} textAlign="center">
          <LinearProgress
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              "& .MuiLinearProgress-bar": {
                boxShadow: `0 0 10px ${theme.palette.primary.main}`,
              },
            }}
          />
          <Typography
            sx={{
              mt: 2,
              display: "block",
              color: "rgba(255,255,255,0.5)",
              fontWeight: 800,
              fontSize: "0.8rem",
              letterSpacing: 2,
            }}
          >
            FETCHING TELEMETRY DATA...
          </Typography>
        </Box>
      )}

      {/* GRAPH */}
      {!loading && graphData.length > 0 && (
        <Card
          ref={graphRef}
          component={motion.div}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          sx={{
            borderRadius: "20px",
            bgcolor: bgColor,
            color: fgColor,
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundImage: "none",
            p: 2.5,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={1} mb={2}>
              <Chip
                label={`Loco: ${locoId}`}
                sx={{
                  fontSize: "0.85rem",
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />

              <Chip
                label={`Direction: ${direction}`}
                sx={{
                  fontSize: "0.85rem",
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
            </Stack>

            <Typography
              sx={{
                fontWeight: 900,
                fontSize: "1rem",
                color: "#fff",
                letterSpacing: 1,
              }}
            >
              {graphType}
            </Typography>

            <Box sx={{ overflowX: "auto" }}>
              <Box
                sx={{ minWidth: Math.max(graphData.length * 12 * zoom, 1400) }}
              >
                {graphType === "Location Vs Speed" && (
                  <AreaChart
                    width={Math.max(graphData.length * 12 * zoom, 1400)}
                    height={530}
                    data={getFilteredByTime()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 50 }}
                  >
                    <defs>
                      <linearGradient
                        id="speedGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={nominalColor}
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor={nominalColor}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    {showGrid && (
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={fgColor}
                      />
                    )}

                    <XAxis
                      dataKey={(d) => Math.floor(d.x / locDiv) * locDiv}
                      tickLine={false}
                      axisLine={{ stroke: fgColor }}
                      tick={{ fontSize: 12, fill: fgColor }}
                      minTickGap={30}
                    >
                      <Label value="Location" position="bottom" offset={20} />
                    </XAxis>

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: fgColor }}
                      domain={[
                        0,
                        Math.ceil(Math.max(...graphData.map((d) => d.y)) / 10) *
                          10 +
                          10,
                      ]}
                    >
                      <Label
                        value="Speed (km/h)"
                        angle={-90}
                        position="insideLeft"
                      />
                    </YAxis>

                    <Tooltip
                      content={<GraphTooltip graphType={graphType} />}
                      cursor={{ stroke: "#3949ab", strokeWidth: 2 }}
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
                      stroke={nominalColor}
                      strokeWidth={lineWidth}
                      fill="transparent"
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0, fill: "#1a237e" }}
                    />
                  </AreaChart>
                )}
                {graphType === "Time Vs Speed" && (
                  <AreaChart
                    width={Math.max(graphData.length * 12 * zoom, 1400)}
                    height={530}
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
                        Math.ceil(Math.max(...graphData.map((d) => d.y)) / 10) *
                          10,
                      ]}
                    >
                      <Label
                        value="Speed (km/h)"
                        angle={-90}
                        position="insideLeft"
                      />
                    </YAxis>

                    <Tooltip content={<GraphTooltip graphType={graphType} />} />
                    <Area
                      type="monotone"
                      dataKey="y"
                      stroke={
                        direction === "Nominal" ? nominalColor : reverseColor
                      }
                      fill={
                        direction === "Nominal" ? nominalColor : reverseColor
                      }
                      fillOpacity={0.3}
                      // stroke={direction === "Nominal" ? nominalColor : reverseColor}
                      // fill={direction === "Nominal" ? nominalColor : reverseColor}
                    />
                  </AreaChart>
                )}

                {graphType === "Location Vs Mode" && (
                  <ComposedChart
                    width={Math.max(graphData.length * 12 * zoom, 1400)}
                    height={550}
                    data={getFilteredByTime()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    {showGrid && (
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={fgColor}
                      />
                    )}

                    <defs>
                      <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={nominalColor}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={nominalColor}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey={(d) => Math.floor(d.x / locDiv) * locDiv}
                      tick={{ fill: fgColor, fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: fgColor }}
                    >
                      <Label value="Location" position="bottom" offset={20} />
                    </XAxis>

                    <YAxis
                      domain={[0, 12]}
                      ticks={Object.keys(MODE_LEGEND).map(Number)}
                      tickFormatter={(value) => MODE_LEGEND[value] || value}
                      tick={{ fill: fgColor, fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    >
                      <Label value="Mode" angle={-90} position="insideLeft" />
                    </YAxis>

                    <Tooltip
                      content={<GraphTooltip graphType={graphType} />}
                      cursor={{ stroke: "#8e24aa", strokeWidth: 1 }}
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
                      stroke={nominalColor}
                      strokeWidth={4}
                      dot={false}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </ComposedChart>
                )}
                {graphType === "Time Vs Mode" && (
                  <ComposedChart
                    width={Math.max(graphData.length * 12 * zoom, 1400)}
                    height={550}
                    data={getFilteredByTime()}
                    margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
                  >
                    <defs>
                      {/* A soft, premium indigo-to-transparent wash */}
                      <linearGradient
                        id="premiumWash"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={nominalColor}
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="100%"
                          stopColor={nominalColor}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    {/* Remove standard grid for a 'Blank Canvas' feel */}
                    {showGrid && (
                      <CartesianGrid
                        vertical={false}
                        stroke={nominalColor}
                        strokeDasharray="0"
                      />
                    )}

                    <XAxis
                      dataKey="x"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: fgColor, fontSize: 11, fontWeight: 600 }}
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
                      tick={{ fill: fgColor, fontSize: 11 }}
                      dx={-10}
                    >
                      <Label value="Mode" angle={-90} position="insideLeft" />
                    </YAxis>

                    <Tooltip
                      cursor={{ stroke: "#e2e8f0", strokeWidth: 2 }}
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
                      stroke={nominalColor}
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
                            <circle
                              cx={cx}
                              cy={cy}
                              r={5}
                              fill="#fff"
                              stroke={nominalColor}
                              strokeWidth={1}
                            />
                            {/* The inner solid core */}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={2.5}
                              fill={nominalColor}
                            />
                          </g>
                        );
                      }}
                    />

                    {/* The 'Cap': A subtle highlight line at the very top of the mode height */}
                    <Line
                      type="stepAfter"
                      dataKey="y"
                      stroke={nominalColor}
                      strokeWidth={3}
                      strokeLinecap="round"
                      dot={false}
                      activeDot={{
                        r: 6,
                        fill: "#4f46e5",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </ComposedChart>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
      {/* PDF Export Overlay */}
      {pdfExporting && (
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            bgcolor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
          }}
        >
          <Box
            sx={{
              bgcolor: "#0f0f1a",
              border: "1px solid rgba(99,102,241,0.4)",
              borderRadius: "16px",
              p: 4,
              minWidth: 340,
              textAlign: "center",
              boxShadow: "0 0 40px rgba(99,102,241,0.3)",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: "#fff", mb: 0.5, letterSpacing: 1 }}
            >
              Exporting PDF
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.4)",
                letterSpacing: 2,
                display: "block",
                mb: 3,
              }}
            >
              PROCESSING {pdfProgress}% COMPLETE
            </Typography>

            {/* Animated progress bar */}
            <Box
              sx={{
                width: "100%",
                height: 8,
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: 4,
                overflow: "hidden",
                mb: 2,
              }}
            >
              <Box
                component={motion.div}
                animate={{ width: `${pdfProgress}%` }}
                transition={{ duration: 0.3 }}
                sx={{
                  height: "100%",
                  bgcolor: "#6366f1",
                  borderRadius: 4,
                  boxShadow: "0 0 12px rgba(99,102,241,0.8)",
                }}
              />
            </Box>

            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.3)" }}
            >
              {pdfProgress < 100
                ? `Rendering pages... please wait`
                : "✓ Saving file..."}
            </Typography>
          </Box>
        </Box>
      )}

      <GraphPropertiesPopup
        open={openProps}
        onClose={() => setOpenProps(false)}
        current={graphConfig}
        onApply={handleApplyProps}
      />
    </Box>
  );
}
