import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useAppContext } from "../context/AppContext";
import RowsPerPageControl from "../components/RowsPerPageControl";
import PaginationControls from "../components/PaginationControls";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ParametersPage = forwardRef(({ onStageChange }, ref) => {
  const { fromDate, toDate, logDir, isDateRangeValid } = useAppContext();

  /* ================= STATE ================= */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [page, setPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(10);


  const normalizeDate = (d) => d?.split("T")[0];

  /* ================= EXPOSE ACTIONS TO HEADER ================= */
  useImperativeHandle(ref, () => ({
    generate,
    clear,
    save,
    saveAll,
    print,
  }));

  /* ================= GENERATE ================= */
  async function generate() {
    onStageChange?.("ENGINE"); // disable exports immediately
    setError("");
    setRows([]);
    setShowTable(false);

    if (!fromDate || !toDate || !logDir || !isDateRangeValid) {
      setError("Invalid date range or log directory");
      onStageChange?.("FILTER");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/parameters/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromDate: normalizeDate(fromDate),
          toDate: normalizeDate(toDate),
          logDir,
        }),
      });

      const json = await res.json();

      if (!json.success || !json.hasData) {
        setError("No parameter data available");
        onStageChange?.("FILTER");
        return;
      }

      setRows(json.rows || []);
      setShowTable(true);
      setPage(1);
      onStageChange?.("PREVIEW"); // enable Save / Print
    } catch (err) {
      console.error("[PARAMETERS REPORT]", err);
      setError("Failed to load parameters report");
      onStageChange?.("FILTER");
    } finally {
      setLoading(false);
    }
  }

  /* ================= CLEAR ================= */
  function clear() {
    setRows([]);
    setShowTable(false);
    setError("");
    setPage(1);
    onStageChange?.("FILTER"); // disable exports again
  }

  /* ================= GROUP BY STATION ================= */
  const groupedByStation = rows.reduce((acc, r) => {
    if (!acc[r.station]) acc[r.station] = [];
    acc[r.station].push(r);
    return acc;
  }, {});

  /* ================= SAVE (EXCEL) ================= */
  function save() {
    if (!rows.length) return;

    const wb = XLSX.utils.book_new();

    Object.entries(groupedByStation).forEach(([station, stationRows]) => {
      const data = stationRows.map((r) => ({
        Parameter: r.parameter,
        Value: r.value,
        Status: r.status,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, `Station_${station}`);
    });

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `Parameters_${normalizeDate(fromDate)}_to_${normalizeDate(toDate)}.xlsx`
    );
  }

  /* ================= SAVE ALL ================= */
  function saveAll() {
    save(); // no pagination → same behavior
  }

  /* ================= PRINT (PDF) ================= */
  function print() {
  if (!rows.length) return;

  const pdf = new jsPDF("p", "pt", "a4");
  let firstPage = true;

  Object.entries(groupedByStation).forEach(([station, stationRows]) => {
    if (!firstPage) pdf.addPage();
    firstPage = false;

    pdf.setFontSize(14);
    pdf.text("INDIAN RAILWAYS – TCAS RGS", 40, 40);
    pdf.setFontSize(11);
    pdf.text(`System Parameters – Station ${station}`, 40, 60);

    const tableBody = stationRows.map((r) => [
      r.parameter,
      String(r.value),
      r.status,
    ]);

    autoTable(pdf, {
      startY: 80,
      head: [["Parameter", "Value", "Status"]],
      body: tableBody,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [25, 118, 210] },
      margin: { left: 40, right: 40 },
    });
  });

  pdf.save(
    `Parameters_${normalizeDate(fromDate)}_to_${normalizeDate(toDate)}.pdf`
  );
}

  /* ================= UI ================= */
  return (
    <Box p={1}>
      {loading && (
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography fontWeight={700} mb={2}>
            Loading Parameter Data
          </Typography>
          <LinearProgress />
        </Paper>
      )}

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {showTable &&
  Object.keys(groupedByStation).map((station) => {

    const stationRows = groupedByStation[station];

    const totalPages = Math.ceil(stationRows.length / rowsPerPage);

    const paginatedRows = stationRows.slice(
      (page - 1) * rowsPerPage,
      page * rowsPerPage
    );

    return (
      <Card key={station} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>

          {/* HEADER + DROPDOWN SAME LINE */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight={800}>
              Station : {station}
            </Typography>

            <RowsPerPageControl
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              setPage={setPage}
            />
          </Box>

          <TableContainer
            sx={{
              maxHeight: 360,
              border: "1px solid #eee",
              borderRadius: 1,
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Parameter
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Value
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedRows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.parameter}</TableCell>
                    <TableCell>{row.value}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PAGINATION CONTROLS */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              borderTop: "1px solid #eee",
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
    );
  })}

    </Box>
  );
});

export default ParametersPage;
