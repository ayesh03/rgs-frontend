import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Typography,
  Box,
  Chip,
  alpha,
} from "@mui/material";
import {
  decodeDirection,
  decodeLocoMode,
  formatCellValue,
  decodeTIN,
  decodeLocoHealth
} from "../utils/locoFormatters";

export default function LocoMovementTable({
  rows = [],
  columns = [],
  visibleKeys = [],
}) {
  const visibleColumns = columns.filter(col =>
    visibleKeys.includes(col.key)
  );

  const renderDirection = (dir) => {
    const d = decodeDirection(dir);
    return (
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#4dabf7" }}>
        {d}
      </Typography>
    );
  };

  const getModeChip = (mode) => {
    const modeText = decodeLocoMode(mode);
    return (
      <Chip
        label={modeText}
        size="small"
        sx={{
          height: 20,
          fontSize: "0.6rem",
          fontWeight: 800,
          textTransform: "uppercase",
          borderRadius: "6px",
          bgcolor: alpha("#4dabf7", 0.1),
          color: "#4dabf7",
          border: `1px solid ${alpha("#4dabf7", 0.3)}`,
          "& .MuiChip-label": { px: 1 }
        }}
      />
    );
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "transparent" }}>
      <TableContainer 
        sx={{ 
          width: "100%", 
          overflowX: "auto",
          maxHeight: "65vh", // Optional: adds scroll within the card
          "&::-webkit-scrollbar": { height: 8, width: 8 },
          "&::-webkit-scrollbar-thumb": { 
            backgroundColor: "rgba(255,255,255,0.1)", 
            borderRadius: 4 
          }
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            width: "100%",
            tableLayout: "auto",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <TableHead>
            <TableRow>
              {visibleColumns.map((col) => {
                const isApproaching = col.label.toLowerCase().includes("approaching");
                return (
                  <TableCell
                    key={col.key}
                    sx={{
                      px: 1.5,
                      py: 2,
                      fontSize: "0.65rem",
                      fontWeight: 900,
                      color: "rgba(255,255,255,0.7)",
                      bgcolor: "#12161c", // Dark solid background for sticky header
                      lineHeight: 1.2,
                      whiteSpace: isApproaching ? "normal" : "nowrap",
                      letterSpacing: 0.5,
                      borderBottom: "2px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    {isApproaching ? (
                      <>APPROACHING<br />STATION</>
                    ) : (
                      col.label.toUpperCase()
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length ? (
              rows.map((row, i) => (
                <TableRow
                  key={row.id || i}
                  sx={{
                    "&:hover": { 
                      backgroundColor: "rgba(77, 171, 247, 0.04)",
                    },
                    transition: "background-color 0.2s ease",
                    "& td": {
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }
                  }}
                >
                  {visibleColumns.map((col) => (
                    <TableCell
                      key={col.key}
                      sx={{
                        px: 1.5,
                        py: 1,
                        color: "rgba(255,255,255,0.85)",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {col.key === "loco_health_status" ? (
                        <Typography sx={{ fontSize: "0.68rem", color: "#1de9b6" }}>
                          {decodeLocoHealth(row[col.key], row.frame_number)}
                        </Typography>
                      ) : col.key === "tin" ? (
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, fontFamily: "JetBrains Mono, monospace" }}>
                          {decodeTIN(row[col.key])}
                        </Typography>
                      ) : col.key === "movement_direction" ? (
                        renderDirection(row[col.key])
                      ) : col.key === "loco_mode" ? (
                        getModeChip(row[col.key])
                      ) : col.key === "date" ? (
                        <Box>
                          <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#fff" }}>
                            {row.date}
                          </Typography>
                          <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)" }}>
                            {row.time}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 500 }}>
                          {formatCellValue(row, col.key)}
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} align="center" sx={{ py: 8 }}>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.2)", letterSpacing: 2, fontWeight: 700 }}>
                    NO LOGS AVAILABLE FOR THIS PERIOD
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}