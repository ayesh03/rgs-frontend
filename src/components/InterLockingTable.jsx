import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  alpha,
  Chip,
} from "@mui/material";
import HubIcon from '@mui/icons-material/Hub';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function InterlockingTable({ rows = [], visibleKeys = [] }) {


  // Logic to color-code Relay Status (Pick/Drop or Active/Inactive)
  const getStatusStyle = (status) => {
  const s = status?.toString().toUpperCase();

  if (s === "PICKED UP" || s === "PICKED" || s === "ON" || s === "1") {
    return {
      label: "PICKED",
      color: "success",
      bgcolor: alpha("#2e7d32", 0.1),
    };
  }

  return {
    label: "DROPPED",
    color: "error",
    bgcolor: alpha("#d32f2f", 0.1),
  };
};


  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        border: "1px solid #e0e0e0"
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow sx={{ "& th": { bgcolor: "#f5f7f9", fontWeight: 800, color: "text.secondary" } }}>
            {visibleKeys.includes("date") && <TableCell sx={{ width: 180 }}>Timestamp</TableCell>}
            {visibleKeys.includes("frameNo") && <TableCell>Frame No</TableCell>}
            {visibleKeys.includes("station") && <TableCell>Station</TableCell>}
            {visibleKeys.includes("relayId") && <TableCell>Relay ID</TableCell>}
            {visibleKeys.includes("status") && <TableCell align="center">Interlocking Status</TableCell>}

          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, index) => {
            const status = getStatusStyle(row.status);

            return (
              <TableRow
                key={index}
                sx={{ "&:hover": { bgcolor: alpha("#1976d2", 0.02) } }}
              >
                {visibleKeys.includes("date") && (
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {row.date}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.time}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                )}

                {visibleKeys.includes("frameNo") && (
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "Monospace", color: "text.secondary" }}
                    >
                      {row.frameNo}
                    </Typography>
                  </TableCell>
                )}

                {visibleKeys.includes("station") && (
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>
                      {row.station}
                    </Typography>
                  </TableCell>
                )}

                {visibleKeys.includes("relayId") && (
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <HubIcon sx={{ fontSize: 16, color: "primary.main" }} />
                      <Typography variant="body2" fontWeight={600} color="primary.dark">
                        {row.relayId}
                      </Typography>
                    </Box>
                  </TableCell>
                )}

                {visibleKeys.includes("status") && (
                  <TableCell align="center">
                    <Chip
                      label={status.label}
                      size="small"
                      color={status.color}
                      sx={{
                        fontWeight: 900,
                        fontSize: "0.65rem",
                        height: 20,
                        borderRadius: 1,
                        minWidth: 70,
                      }}
                    />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>


      </Table>
    </TableContainer>
  );
}