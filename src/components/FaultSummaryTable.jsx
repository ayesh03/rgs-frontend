import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  alpha,
} from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function FaultSummaryTable({ rows = [] }) {
  // Helper to determine background intensity for "Heatmap" effect
  const getIntensityStyle = (value, color) => {
    if (!value) return {};
    const opacity = Math.min(value / 10, 0.15); // Scale opacity by value
    return {
      backgroundColor: alpha(color, opacity),
      fontWeight: value > 5 ? 700 : 400,
      color: value > 5 ? color : 'inherit',
    };
  };

  // Calculate Column Totals for the footer
  const totals = rows.reduce(
    (acc, row) => ({
      loco: acc.loco + (row.locoFaults || 0),
      gprs: acc.gprs + (row.gprsFaults || 0),
      rfcom: acc.rfcom + (row.rfcomFaults || 0),
      total: acc.total + (row.total || 0),
    }),
    { loco: 0, gprs: 0, rfcom: 0, total: 0 }
  );

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow sx={{ '& th': { bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' } }}>
            <TableCell>Station</TableCell>
            <TableCell align="right">Loco Faults</TableCell>
            <TableCell align="right">GPRS Faults</TableCell>
            <TableCell align="right">RFCOM Faults</TableCell>
            <TableCell align="right">Aggregate Total</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, index) => (
            <TableRow 
              key={index} 
              sx={{ '&:hover': { bgcolor: alpha('#1976d2', 0.02) }, transition: 'background 0.2s' }}
            >
              <TableCell sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 16, color: 'primary.main', opacity: 0.7 }} />
                  <Typography variant="body2" fontWeight="700">{row.station}</Typography>
                </Box>
              </TableCell>
              
              <TableCell align="right" sx={getIntensityStyle(row.locoFaults, '#1976d2')}>
                {row.locoFaults || 0}
              </TableCell>
              
              <TableCell align="right" sx={getIntensityStyle(row.gprsFaults, '#d32f2f')}>
                {row.gprsFaults || 0}
              </TableCell>
              
              <TableCell align="right" sx={getIntensityStyle(row.rfcomFaults, '#ed6c02')}>
                {row.rfcomFaults || 0}
              </TableCell>
              
              <TableCell align="right" sx={{ bgcolor: alpha('#2e7d32', 0.03) }}>
                <Typography variant="body2" fontWeight="800" color="success.dark">
                  {row.total}
                </Typography>
              </TableCell>
            </TableRow>
          ))}

          {/* Totals Footer Row */}
          <TableRow sx={{ bgcolor: alpha('#000', 0.04) }}>
            <TableCell sx={{ fontWeight: 900 }}>NETWORK TOTAL</TableCell>
            <TableCell align="right" sx={{ fontWeight: 900 }}>{totals.loco}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 900 }}>{totals.gprs}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 900 }}>{totals.rfcom}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 900, color: 'success.main' }}>{totals.total}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}