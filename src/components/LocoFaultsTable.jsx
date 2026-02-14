import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  Paper,
  alpha,
} from "@mui/material";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";


import { formatFaultCellValue } from "../utils/faultFormatter";

export default function LocoFaultsTable({
  rows = [],
  columns = [],
  visibleKeys = [],
}) {
  const visibleColumns = columns.filter(col =>
    visibleKeys.includes(col.key)
  );

  const renderFaultType = (rawValue) => {
  const label = formatFaultCellValue(
    { fault_type: rawValue },
    "fault_type"
  );

  const isFault = label === "FAULT";

  return (
    <Chip
      icon={
        isFault
          ? <WarningAmberIcon sx={{ fontSize: 14 }} />
          : <CheckCircleIcon sx={{ fontSize: 14 }} />
      }
      label={label}
      size="small"
      color={isFault ? "error" : "success"}
      sx={{
        fontSize: "0.6rem",
        fontWeight: 700,
        height: 20,
      }}
    />
  );
};


  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #eef2f6",
        overflowX: "auto",
      }}
    >
      <Table size="small">
        {/* ================= HEADER ================= */}
        <TableHead>
          <TableRow
            sx={{
              "& th": {
                bgcolor: "#f1f4f9",
                fontWeight: 900,
                fontSize: "0.65rem",
                color: "#455a64",
              },
            }}
          >
            {visibleColumns.map(col => (
              <TableCell key={col.key}>
                {col.label.toUpperCase()}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* ================= BODY ================= */}
        <TableBody>
          {rows.length ? (
            rows.map((row, i) => (
              <TableRow
                key={i}
                sx={{
                  "&:hover": {
                    bgcolor: alpha("#1976d2", 0.04),
                  },
                  transition: "background-color 0.2s",
                }}
              >
                {visibleColumns.map(col => (
                  <TableCell
                    key={col.key}
                    sx={{
                      py: 0.6,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {/* DATE / TIME */}
                    {col.key === "date" ? (
                      <Box>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 600 }}>
                          {row.date}
                        </Typography>
                        <Typography sx={{ fontSize: "0.6rem", color: "text.secondary" }}>
                          {row.time}
                        </Typography>
                      </Box>


                    ) : col.key === "fault_type" ? (
                      renderFaultType(row.fault_type)

                    ) : col.key === "kavach_subsystem_id" ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700 }}>
                          {formatFaultCellValue(row, col.key)}
                        </Typography>
                      </Box>
                    )
                      : (
                        <Typography sx={{ fontSize: "0.68rem" }}>
                          {formatFaultCellValue(row, col.key)}
                        </Typography>
                      )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={visibleColumns.length}
                align="center"
                sx={{ py: 6 }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", letterSpacing: 1 }}
                >
                  NO FAULT DATA AVAILABLE
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
