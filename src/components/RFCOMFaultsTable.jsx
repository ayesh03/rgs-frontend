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
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function RFCOMFaultsTable({ rows = [], visibleKeys = [] }) {

 

  // Custom status renderer for radio link issues
  const getStatusIndicator = (status) => {
    const s = status?.toUpperCase();
    const isActive = s === "ACTIVE" || s === "FAILED";

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <FiberManualRecordIcon
          sx={{
            fontSize: 10,
            color: isActive ? 'error.main' : 'success.main',
            filter: isActive ? 'drop-shadow(0 0 2px rgba(211, 47, 47, 0.5))' : 'none'
          }}
        />
        <Typography variant="caption" fontWeight="700" color={isActive ? "error.main" : "success.main"}>
          {s}
        </Typography>
      </Box>
    );
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        border: "1px solid #e0e6ed",
        overflowX: "auto"
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
  <TableRow>
    {visibleKeys.includes("date") && <TableCell>TIMESTAMP</TableCell>}
    {visibleKeys.includes("locoId") && <TableCell>LOCO / STATION</TableCell>}
    {visibleKeys.includes("faultCode") && <TableCell>FAULT CODE</TableCell>}
    {visibleKeys.includes("description") && <TableCell>DESCRIPTION</TableCell>}
    {visibleKeys.includes("status") && <TableCell>LINK STATUS</TableCell>}
  </TableRow>
</TableHead>


        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <TableRow
                key={index}
                sx={{ "&:hover": { bgcolor: alpha("#ed6c02", 0.02) } }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{row.date}</Typography>
                  <Typography variant="caption" color="text.secondary">{row.time}</Typography>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsInputAntennaIcon sx={{ fontSize: 16, color: 'orange' }} />
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{row.locoId}</Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: -0.5 }}>
                        STN: {row.station}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Monospace',
                      bgcolor: alpha('#ed6c02', 0.1),
                      color: '#c2410c',
                      px: 1,
                      borderRadius: 1,
                      display: 'inline-block',
                      fontWeight: 700
                    }}
                  >
                    {row.faultCode}
                  </Typography>
                </TableCell>

                <TableCell sx={{ maxWidth: 280 }}>
                  <Typography variant="body2" color="text.primary">
                    {row.description}
                  </Typography>
                </TableCell>

                <TableCell>
                  {getStatusIndicator(row.status)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                <Typography variant="body2" color="text.disabled">No RFCOM faults reported for this sector.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}