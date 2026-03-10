import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  alpha,
  Chip,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import HubIcon from '@mui/icons-material/Hub';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { INTERLOCKING_COLUMNS } from "../constants/interlockingColumns";

export default function InterlockingTable({ rows = [], visibleKeys = [] }) {
  const theme = useTheme();

  /* ===================== STATUS COLOR LOGIC ===================== */
  const getStatusStyle = (status) => {
    const s = status?.toString().toUpperCase() || "";
    const isPicked = ["PICKED UP", "PICKED", "ON", "1", "TRUE"].includes(s);

    return {
      label: isPicked ? "PICKED UP" : "DROPPED",
      color: isPicked ? "#00e676" : "#ff5252", // Neon Green : Neon Red
      glow: isPicked ? alpha("#00e676", 0.15) : alpha("#ff5252", 0.15),
      border: isPicked ? alpha("#00e676", 0.3) : alpha("#ff5252", 0.3),
    };
  };

  /* ===================== UI HELPERS ===================== */
  const hexFields = ["message_length", "message_sequence", "stationary_kavach_id"];

  return (
    <TableContainer
      sx={{
        bgcolor: "transparent",
        backgroundImage: "none",
        "&::-webkit-scrollbar": { height: "6px" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "rgba(255,255,255,0.1)",
          borderRadius: "10px"
        }
      }}
    >
      <Table size="small" stickyHeader sx={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
        {/* ================= HEADER ================= */}
        <TableHead>
          <TableRow>
            {visibleKeys.map((key) => (
              <TableCell
                key={key}
                sx={{
                  bgcolor: "#0a0a0a", // Solid dark for sticky compatibility
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.5)",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  letterSpacing: "0.8px",
                  py: 2,
                  textTransform: "uppercase"
                }}
              >
                {INTERLOCKING_COLUMNS.find(c => c.key === key)?.label || key}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* ================= BODY ================= */}
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={index}
              component={motion.tr}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02, duration: 0.3 }}
              sx={{
                transition: 'background 0.2s',
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.04)",
                },
                "& td": {
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  color: "rgba(255,255,255,0.85)"
                },
              }}
            >
              {visibleKeys.map((key) => (
                <TableCell key={key} sx={{ py: 1.6 }}>
                  {key === "status" ? (
                    <Chip
                      label={getStatusStyle(row.status).label}
                      size="small"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 900,
                        height: 24,
                        bgcolor: getStatusStyle(row.status).glow,
                        color: getStatusStyle(row.status).color,
                        border: `1px solid ${getStatusStyle(row.status).border}`,
                        "& .MuiChip-label": { px: 1 }
                      }}
                    />
                  ) : key === "date" ? (
                    <Box>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                        {row.date || "-"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                        {row.time || "-"}
                      </Typography>
                    </Box>) : key === "relay" ? (
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: theme.palette.primary.light }}>
                        {row[key]}
                      </Typography>
                    ) : hexFields.includes(key) ? (
                      <Typography sx={{
                        fontSize: "0.8rem",
                        fontFamily: "'Roboto Mono', monospace",
                        color: "rgba(255,255,255,0.5)"
                      }}>
                        0x{row[key]?.toString(16).toUpperCase().padStart(2, '0') || "00"}
                      </Typography>
                    ) : (
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      {row[key]}
                    </Typography>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}