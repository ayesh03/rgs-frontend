import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Select,
  MenuItem,
  Stack,
  Box,
  Divider,
  Grid,
  alpha,
} from "@mui/material";
import PrintIcon from '@mui/icons-material/Print';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';

export default function PrintDialog({
  open,
  onClose,
  columns,
  selectedColumns,
  setSelectedColumns,
}) {
  const [orientation, setOrientation] = useState("landscape"); // Default to landscape for wide logs
  const [fontSize, setFontSize] = useState(10); // Default smaller for railway tables

  const toggleColumn = (col) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handlePrint = () => {
    // Applying CSS print rules dynamically
    const style = document.createElement('style');
    style.innerHTML = `
      @page { size: ${orientation}; margin: 10mm; }
      body { font-size: ${fontSize}pt !important; }
      .no-print { display: none !important; }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    // Cleanup after dialog closes
    setTimeout(() => document.head.removeChild(style), 1000);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ bgcolor: alpha('#1976d2', 0.03), pb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <PrintIcon color="primary" />
          <Typography variant="h6" fontWeight="700">Configure Print Report</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* Layout Settings */}
        <Box mb={4}>
          <Typography variant="overline" color="text.secondary" fontWeight="700">
            Page Configuration
          </Typography>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                  <TextFieldsIcon fontSize="inherit" /> Font Size (pt)
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                >
                  {[8, 9, 10, 11, 12, 14].map((s) => (
                    <MenuItem key={s} value={s}>Size {s}</MenuItem>
                  ))}
                </Select>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                  <ScreenRotationIcon fontSize="inherit" /> Orientation
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                >
                  <MenuItem value="portrait">Portrait (A4 Vertical)</MenuItem>
                  <MenuItem value="landscape">Landscape (A4 Horizontal)</MenuItem>
                </Select>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Column Selection */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" color="text.secondary" fontWeight="700">
              Columns to Include
            </Typography>
            <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }} onClick={() => setSelectedColumns(columns)}>
              Select All
            </Typography>
          </Stack>
          
          <Box sx={{ p: 2, bgcolor: alpha('#000', 0.02), borderRadius: 2, border: '1px solid #eee' }}>
            <Grid container>
              {columns.map((col) => (
                <Grid item xs={6} key={col}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedColumns.includes(col)}
                        onChange={() => toggleColumn(col)}
                      />
                    }
                    label={<Typography variant="body2">{col}</Typography>}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: alpha('#000', 0.01) }}>
        <Button onClick={onClose} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          Cancel
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button 
          variant="contained" 
          onClick={handlePrint} 
          startIcon={<PrintIcon />}
          sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}
        >
          Generate & Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}