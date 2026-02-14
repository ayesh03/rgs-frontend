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
  Tooltip,
} from "@mui/material";
import SensorsIcon from '@mui/icons-material/Sensors';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function TagInfoTable({ rows = [] }) {
  return (
    <TableContainer 
      component={Paper} 
      elevation={0} 
      sx={{ 
        borderRadius: 3, 
        border: "1px solid #e0e0e0",
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)" 
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 700 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ fontSize: 16 }} />
                TIMESTAMP
              </Box>
            </TableCell>
            <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 700 }}>
              FRAME NO
            </TableCell>
            <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 700 }}>
              STATION
            </TableCell>
            <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 700 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SensorsIcon sx={{ fontSize: 16 }} />
                TAG ID
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <TableRow 
                key={index} 
                hover
                sx={{ '&:nth-of-type(even)': { bgcolor: alpha('#1976d2', 0.02) } }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{row.date}</Typography>
                  <Typography variant="caption" color="text.secondary">{row.time}</Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'Monospace', color: 'text.secondary' }}>
                    {row.frameNo}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>{row.station}</Typography>
                </TableCell>
                
                <TableCell>
                  <Tooltip title="RFID Tag Reference">
                    <Box 
                      sx={{ 
                        display: 'inline-block',
                        bgcolor: alpha('#1976d2', 0.1),
                        color: '#1976d2',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontFamily: 'Monospace',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        border: '1px solid',
                        borderColor: alpha('#1976d2', 0.2)
                      }}
                    >
                      {row.tagId}
                    </Box>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                <Typography variant="body2" color="text.disabled">
                  No RFID tag sequence recorded in this frame.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}