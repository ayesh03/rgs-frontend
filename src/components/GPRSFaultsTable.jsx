import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  alpha,
} from "@mui/material";
import WifiOffIcon from '@mui/icons-material/WifiOff';

export default function GPRSFaultsTable({ rows = [], visibleKeys = [] }) {

  // Logic to style the status badge based on severity
  const getStatusChip = (status) => {
    const s = status?.toUpperCase();
    if (s === "ACTIVE") return <Chip label={status} size="small" color="error" sx={{ fontWeight: 700, borderRadius: 1 }} />;
    if (s === "RESOLVED") return <Chip label={status} size="small" color="success" sx={{ fontWeight: 700, borderRadius: 1 }} />;
    return <Chip label={status} size="small" variant="outlined" />;
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        overflowX: "auto",
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #eee'
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow sx={{ '& th': { bgcolor: '#f8f9fa', fontWeight: 800 } }}>
            {visibleKeys.includes("date") && <TableCell>Date & Time</TableCell>}
            {visibleKeys.includes("station") && <TableCell>Station</TableCell>}
            {visibleKeys.includes("locoId") && <TableCell>Loco ID</TableCell>}
            {visibleKeys.includes("faultCode") && <TableCell>Fault Code</TableCell>}
            {visibleKeys.includes("description") && <TableCell>Description</TableCell>}
            {visibleKeys.includes("status") && <TableCell>Status</TableCell>}
          </TableRow>
        </TableHead>


        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <TableRow
                key={index}
                sx={{ '&:hover': { bgcolor: alpha('#d32f2f', 0.02) } }}
              >
                {visibleKeys.includes("date") && (
                  <TableCell>
                    <Typography variant="body2">{row.date}</Typography>
                    <Typography variant="caption">{row.time}</Typography>
                  </TableCell>
                )}

                {visibleKeys.includes("station") && (
                  <TableCell>{row.station}</TableCell>
                )}

                {visibleKeys.includes("locoId") && (
                  <TableCell>{row.locoId}</TableCell>
                )}

                {visibleKeys.includes("faultCode") && (
                  <TableCell>{row.faultCode}</TableCell>
                )}

                {visibleKeys.includes("description") && (
                  <TableCell>{row.description}</TableCell>
                )}

                {visibleKeys.includes("status") && (
                  <TableCell>{getStatusChip(row.status)}</TableCell>
                )}

              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={visibleKeys.length || 1}
                align="center" sx={{ py: 8 }}>
                <WifiOffIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No GPRS fault logs recorded for this period.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}