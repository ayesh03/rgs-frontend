import {Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Typography,Box,Chip,Paper,alpha,} from "@mui/material";
import { motion } from "framer-motion";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { formatFaultCellValue } from "../utils/faultFormatter";

export default function LocoFaultsTable({
  rows = [],
  columns = [],
  visibleKeys = [],
  formatter = formatFaultCellValue
}) {
  const visibleColumns = columns.filter(col =>
    visibleKeys.includes(col.key)
  );

  const renderFaultType = (rawValue) => {
    const label = formatFaultCellValue({ fault_type: rawValue }, "fault_type");
    const isFault = label === "FAULT";

    return (
      <Chip
        icon={
          isFault
            ? <WarningAmberIcon sx={{ fontSize: "12px !important", color: "#ff1744 !important" }} />
            : <CheckCircleIcon sx={{ fontSize: "12px !important", color: "#00e676 !important" }} />
        }
        label={label}
        size="small"
        sx={{
          fontSize: "0.8rem",
          fontWeight: 800,
          height: 28,
          bgcolor: isFault ? alpha("#ff1744", 0.1) : alpha("#00e676", 0.1),
          color: isFault ? "#ff8a80" : "#b9f6ca",
          border: `1px solid ${isFault ? alpha("#ff1744", 0.3) : alpha("#00e676", 0.3)}`,
          "& .MuiChip-label": { px: 1 }
        }}
      />
    );
  };

  return (
    <TableContainer
      component={Box}
      sx={{
        bgcolor: "transparent",
        overflowX: "auto",
        "&::-webkit-scrollbar": { height: "8px" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "rgba(255,255,255,0.1)",
          borderRadius: "10px"
        }
      }}
    >
      <Table size="small" stickyHeader>
        {/* ================= HEADER ================= */}
        <TableHead>
          <TableRow>
            {visibleColumns.map(col => (
              <TableCell
                key={col.key}
                sx={{
                  bgcolor: "#1a1a1a", // Solid dark for sticky header
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.4)",
                  borderBottom: "2px solid rgba(255,255,255,0.05)",
                  letterSpacing: "0.5px",
                  py: 2,
                  whiteSpace: "nowrap"
                }}
              >
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
                component={motion.tr}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                sx={{
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.03)",
                  },
                  "& td": {
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.8)"
                  },
                  transition: "background-color 0.2s",
                }}
              >
                {visibleColumns.map(col => (
                  <TableCell
                    key={col.key}
                    sx={{ py: 1.8, whiteSpace: "nowrap" }}
                  >
                    {/* DATE / TIME */}
                    {col.key === "date" ? (
                      <Box>
                        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
                          {row.date}
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>
                          {row.time}
                        </Typography>
                      </Box>

                    ) : col.key === "fault_type" ? (
                      renderFaultType(row.fault_type)

                    ) : col.key === "kavach_subsystem_id" ? (
                      <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#00e5ff" }}>
                        {formatter(row, col.key)}
                      </Typography>

                    ) : (
                      <Typography sx={{ fontSize: "0.95rem" }}>
                        {formatter(row, col.key)}
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
                sx={{ py: 10, borderBottom: "none" }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.2)", letterSpacing: 2, fontWeight: 700 }}
                >
                  NO FAULT TELEMETRY DETECTED
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}