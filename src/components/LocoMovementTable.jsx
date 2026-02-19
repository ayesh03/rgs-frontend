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
} from "@mui/material";
import {
  decodeDirection,
  decodeLocoMode,
  formatCellValue,
  decodeTIN,
  decodeLocoHealth
} from "../utils/locoFormatters";


import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";

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
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700 }}>
        {d}
      </Typography>
    );
  };


  const getModeChip = (mode) => (
    <Chip
      label={decodeLocoMode(mode)}
      size="small"
      variant="outlined"
      sx={{
        height: 18,
        fontSize: "0.55rem",
        fontWeight: 700,
        textTransform: "uppercase",
        borderRadius: "4px",
        borderColor: "divider"
      }}
    />
  );

  return (
    <Box sx={{ width: "100%" }}>
      <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
        <Table
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
                      px: 1.3,
                      py: 1.5,
                      fontSize: "0.65rem",
                      fontWeight: 900,
                      color: "text.primary",
                      lineHeight: 1.1,
                      whiteSpace: isApproaching ? "normal" : "nowrap",
                      verticalAlign: "bottom",
                      borderBottom: "1px solid",
                      borderColor: "divider",
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
                    "&:hover": { backgroundColor: "action.hover" },
                    transition: "background-color 0.2s"
                  }}
                >
                  {visibleColumns.map((col) => (
                    <TableCell
                      key={col.key}
                      sx={{
                        px: 1.3,
                        py: 0.3,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {col.key === "loco_health_status" ? (
                        <Typography>
                          {decodeLocoHealth(row[col.key], row.frame_number)}
                        </Typography>
                      ) :

                        col.key === "tin" ? (
                          <Typography sx={{ fontSize: "0.68rem", fontWeight: 600 }}>
                            {decodeTIN(row[col.key])}
                          </Typography>
                        ) : col.key === "movement_direction" ? (
                          renderDirection(row[col.key])
                        ) : col.key === "loco_mode" ? (
                          getModeChip(row[col.key])
                        ) : col.key === "date" ? (
                          <Box>
                            <Typography sx={{ fontSize: "0.68rem", fontWeight: 600 }}>
                              {row.date}
                            </Typography>
                            <Typography sx={{ fontSize: "0.6rem", color: "text.secondary" }}>
                              {row.time}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: "0.68rem" }}>
                            {formatCellValue(row, col.key)}
                          </Typography>
                        )
                      }


                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} align="center" sx={{ py: 5 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 1 }}>
                    NO DATA AVAILABLE
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