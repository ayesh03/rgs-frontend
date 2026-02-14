import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Grid,
  LinearProgress,
  Divider,
  alpha,
  Paper,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { motion } from "framer-motion";
import MapIcon from "@mui/icons-material/Map";
import ChecklistIcon from "@mui/icons-material/Checklist";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useAppContext } from "../context/AppContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function TrackProfileReport() {
  const { fromDate, toDate, logDir, isDateRangeValid } = useAppContext();

  /* ================= STATE ================= */
  const [stations, setStations] = useState([]);
  const [selectedStations, setSelectedStations] = useState([]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [error, setError] = useState("");
  const [noData, setNoData] = useState(false);
  const [showTable, setShowTable] = useState(false);

  /* ================= RESET REPORT ON DATE / LOGDIR CHANGE ================= */
  useEffect(() => {
    setRows([]);
    setShowTable(false);
    setNoData(false);
    setError("");
  }, [fromDate, toDate, logDir]);


  const normalizeDate = (d) => d?.split("T")[0];

  /* ================= LOAD STATIONS (META) ================= */
  useEffect(() => {
  if (!logDir || !fromDate || !toDate || !isDateRangeValid) return;


    const loadStations = async () => {
      try {
        setMetaLoading(true);
        setError("");

        const res = await fetch(
          `${API_BASE}/api/track-profile/stations`
        );

        const json = await res.json();
        if (!json.success) throw new Error("Station API failed");

        // IMPORTANT: store full objects
        setStations(json.stations || []);

        // select all by default (desktop behavior)
        setSelectedStations(
          (json.stations || []).map(s => s.stationId)
        );

      } catch (err) {
        console.error("[TRACK PROFILE STATIONS]", err);
        setError("Failed to load station list");
      } finally {
        setMetaLoading(false);
      }
    };

    loadStations();
  }, [logDir, fromDate, toDate, isDateRangeValid]);


  /* ================= SELECTION ================= */
  const toggleStation = (stationId) => {
    setSelectedStations((prev) =>
      prev.includes(stationId)
        ? prev.filter((s) => s !== stationId)
        : [...prev, stationId]
    );
  };


  const selectAll = () =>
    setSelectedStations(stations.map(s => s.stationId));


  // UPDATED: Clear button now also clears and closes the table
  const clearAll = () => {
    setSelectedStations([]);
    setRows([]);
    setShowTable(false);
    setNoData(false);
    setError("");
  };

  /* ================= GENERATE ================= */
  const handleGenerate = async () => {
    setError("");
    setNoData(false);
    setRows([]);
    setShowTable(false); // Reset before generating

    if (selectedStations.length === 0) {
      setError("Please select at least one station");
      return;
    }

    if (!fromDate || !toDate || !logDir || !isDateRangeValid) {
      setError("Invalid global date range or log directory");
      return;
    }

    const payload = {
      stations: selectedStations,
      fromDate: normalizeDate(fromDate),
      toDate: normalizeDate(toDate),
      logDir,
      include: {
        gradient: true,
        curvature: true,
        speedRestriction: true,
      },
    };

    try {
      setLoading(true);

      const url =
        `${API_BASE}/api/track-profile/report` +
        `?from=${normalizeDate(fromDate)}` +
        `&to=${normalizeDate(toDate)}` +
        `&logDir=${encodeURIComponent(logDir)}`;

      const res = await fetch(url);


      const json = await res.json();

      console.log("TRACK PROFILE REPORT RESPONSE:", json);

      if (!json.success) {
        throw new Error(json.error || "Report API failed");
      }

      if (!json.hasData || !json.rows?.length) {
        setNoData(true);
        return;
      }

      setRows(json.rows);
      setShowTable(true);
    } catch (err) {
      console.error("[TRACK PROFILE REPORT]", err);
      setError(err.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GROUP BY STATION ================= */
  const groupedByStation = rows.reduce((acc, row) => {
    if (!acc[row.stationId]) acc[row.stationId] = [];
    acc[row.stationId].push(row);
    return acc;
  }, {});


  const handleExportExcel = () => {
    if (!rows.length) return;

    const wb = XLSX.utils.book_new();

    Object.keys(groupedByStation).forEach((stationId) => {
  const station = stations.find(s => s.stationId === stationId);
  const stationCode = station?.stationCode || stationId;

  const data = groupedByStation[stationId].map((r) => ({
    Date: r.date,
    Time: r.time,
    "Frame No": r.frameNumber,
    "Loco ID": r.locoId,
    "Profile ID": r.profileId,
    "Sub Profile Count": r.subProfileCount,
    "Profile Length": r.profileLength,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, stationCode);

});




    XLSX.writeFile(
      wb,
      `Track_Profile_Report_${fromDate}_${toDate}.xlsx`
    );
  };

  const handleExportPDF = () => {
    if (!rows.length) return;

    const pdf = new jsPDF("l", "pt", "a4");

    Object.keys(groupedByStation).forEach((station, index) => {
      if (index > 0) pdf.addPage();

      pdf.setFontSize(16);
      pdf.text("TRACK PROFILE REPORT", 40, 40);

      pdf.setFontSize(10);
      pdf.text(
        `Station: ${station} | Date: ${fromDate} to ${toDate}`,
        40,
        60
      );

      autoTable(pdf, {
        startY: 80,
        head: [[
          "Date",
          "Time",
          "Frame No",
          "Loco ID",
          "Profile ID",
          "Sub Profile Count",
          "Profile Length"
        ]],

        body: groupedByStation[station].map((r) => [
          r.date,
          r.time,
          r.frameNumber,
          r.locoId,
          r.profileId,
          r.subProfileCount,
          r.profileLength,
        ]),

        styles: {
          fontSize: 9,
        },
        headStyles: {
          fillColor: [22, 160, 133],
        },
      });
    });

    pdf.save(`Track_Profile_Report_${fromDate}_${toDate}.pdf`);
  };


  /* ================= UI ================= */
  return (
    <Box p={3} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* HEADER */}
      <Stack direction="row" spacing={2} alignItems="center" mb={4}>
        <Box sx={{ bgcolor: "secondary.main", p: 1, borderRadius: 2 }}>
          <AltRouteIcon sx={{ color: "white" }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="800">
            Track Profile Report
          </Typography>


        </Box>
      </Stack>

      {/* CONTROL BAR */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <ChecklistIcon />
              <Typography fontWeight={700}>
                Selection:{" "}
                <Box component="span" color="primary.main">
                  {selectedStations.length}
                </Box>{" "}
                / {stations.length}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Button size="small" onClick={selectAll}>Select All</Button>
              <Button size="small" color="inherit" onClick={clearAll}>Clear</Button>

              <Divider orientation="vertical" flexItem />

              <Button
                variant="contained"
                onClick={handleGenerate}
                disabled={loading || selectedStations.length === 0}
              >
                Generate Report
              </Button>

              <Button
                size="small"
                disabled={!showTable}
                onClick={handleExportExcel}
              >
                Export Excel
              </Button>

              <Button
                size="small"
                disabled={!showTable}
                onClick={handleExportPDF}
              >
                Export PDF
              </Button>
            </Stack>

          </Stack>
        </CardContent>
      </Card>

      {/* LOADING */}
      {(loading || metaLoading) && (
        <Paper sx={{ mb: 4, p: 4, textAlign: "center" }}>
          <Typography fontWeight={700} mb={2}>
            Processing Track Profile Data
          </Typography>
          <LinearProgress />
        </Paper>
      )}

      {error && <Typography color="error">{error}</Typography>}
      {noData && (
        <Typography color="warning.main">
          No Track Profile data available.
        </Typography>
      )}

      {/* ================= REPORT TABLE  ================= */}
      {/* {showTable && Object.keys(groupedByStation).map((station) => (
        <Card key={station} sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} mb={2}>
              Station : {station}
            </Typography>

            <TableContainer
              sx={{
                maxHeight: 360,
                overflowY: "auto",
                border: "1px solid #eee",
                borderRadius: 1,
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Frame No</TableCell>
                    <TableCell>Loco ID</TableCell>
                    <TableCell>Profile ID</TableCell>
                    <TableCell>Sub Profile Count</TableCell>
                    <TableCell>Profile Length</TableCell>
                  </TableRow>

                </TableHead>

                <TableBody>
                  {groupedByStation[station].map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>{r.time}</TableCell>
                      <TableCell>{r.frameNumber}</TableCell>
                      <TableCell>{r.locoId}</TableCell>
                      <TableCell>{r.profileId}</TableCell>
                      <TableCell>{r.subProfileCount}</TableCell>
                      <TableCell>{r.profileLength}</TableCell>
                    </TableRow>

                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))} */}

      {/* ================= STATION SELECTION GRID ================= */}
      <Typography
        variant="overline"
        fontWeight="800"
        color="text.secondary"
        sx={{ mt: 4, mb: 1, display: "block" }}
      >
        Trackside Node Selection
      </Typography>

      <Grid container spacing={2}>
        {stations.map((station) => {
          const isSelected = selectedStations.includes(station.stationId);

          return (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={2.4}
              key={station.stationId}
            >
              <Card
                onClick={() => toggleStation(station.stationId)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 3,
                  border: "2px solid",
                  borderColor: isSelected ? "primary.main" : "transparent",
                  bgcolor: isSelected
                    ? alpha("#1976d2", 0.05)
                    : "background.paper",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <MapIcon
                    sx={{
                      fontSize: 40,
                      color: isSelected ? "primary.main" : "text.disabled",
                    }}
                  />

                  {/* SHOW STATION CODE */}
                  <Typography fontWeight={800}>
                    {station.stationCode}
                  </Typography>

                  <Checkbox
                    checked={isSelected}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          );
        })}

      </Grid>
    </Box>
  );
}