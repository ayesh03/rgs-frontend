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
  LinearProgress,
} from "@mui/material";
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import StraightenIcon from '@mui/icons-material/Straighten';

export default function TSRSummaryTable({ rows = [] }) {
  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: 3, 
        border: "1px solid #e0e0e0",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)" 
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow sx={{ "& th": { bgcolor: "#f5f5f5", fontWeight: 800, color: "text.secondary" } }}>
            <TableCell>STATION</TableCell>
            <TableCell align="center">TSR COUNT</TableCell>
            <TableCell>SPEED RANGE (KM/H)</TableCell>
            <TableCell align="right">TOTAL LENGTH</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <TableRow 
                key={index} 
                hover
                sx={{ '&:hover': { bgcolor: alpha('#f57c00', 0.02) } }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={700} color="primary.dark">
                    {row.station}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Box 
                    sx={{ 
                      display: 'inline-block', 
                      px: 1.5, 
                      py: 0.2, 
                      borderRadius: 10, 
                      bgcolor: alpha('#f57c00', 0.1), 
                      color: '#ef6c00',
                      fontWeight: 800,
                      fontSize: '0.75rem'
                    }}
                  >
                    {row.tsrCount}
                  </Box>
                </TableCell>

                <TableCell sx={{ minWidth: 200 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="caption" fontWeight="bold" color="error.main">
                      {row.minSpeed}
                    </Typography>
                    <Box sx={{ flexGrow: 1, position: 'relative', height: 6, bgcolor: alpha('#000', 0.05), borderRadius: 3 }}>
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          left: `${(row.minSpeed / 160) * 100}%`,
                          right: `${100 - (row.maxSpeed / 160) * 100}%`,
                          height: '100%',
                          bgcolor: 'warning.main',
                          borderRadius: 3
                        }}
                      />
                    </Box>
                    <Typography variant="caption" fontWeight="bold" color="text.primary">
                      {row.maxSpeed}
                    </Typography>
                    <SlowMotionVideoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  </Box>
                </TableCell>

                <TableCell align="right">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2" fontWeight="800">
                        {row.totalLength.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">m</Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((row.totalLength / 5000) * 100, 100)} 
                      sx={{ width: 60, height: 3, borderRadius: 1, mt: 0.5, bgcolor: alpha('#000', 0.05) }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                <Typography variant="body2" color="text.disabled">
                  No active Temporary Speed Restrictions found in this division.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}