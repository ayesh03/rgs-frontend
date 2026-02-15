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
import { INTERLOCKING_COLUMNS } from "../constants/interlockingColumns";

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

const hexFields = [
  "message_length",
  "message_sequence",
  "stationary_kavach_id"
];

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
          <TableRow>
            {visibleKeys.map((key) => (
              <TableCell key={key} sx={{ fontWeight: 700 }}>
                {INTERLOCKING_COLUMNS.find(c => c.key === key)?.label || key}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {visibleKeys.map((key) => (
                <TableCell key={key}>
                  {key === "status" ? (
                    <Chip
                      label={getStatusStyle(row.status).label}
                      size="small"
                      color={getStatusStyle(row.status).color}
                    />
                  ) : (
                    row[key]

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