import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Box,
  Typography,
  Divider,
  alpha
} from "@mui/material";
import { useState, useEffect } from "react";
import FilterAltIcon from '@mui/icons-material/FilterAlt';

export default function FilterDialog({
  open,
  onClose,
  title = "Filter Data",
  values = [],
  selectedValues,
  setSelectedValues,
}) {
  // Local state buffer so "Cancel" doesn't save changes
  const [tempSelected, setTempSelected] = useState(selectedValues);

  // Sync buffer with actual state when dialog opens
  useEffect(() => {
    if (open) setTempSelected(selectedValues);
  }, [open, selectedValues]);

  const toggle = (val) => {
    setTempSelected(prev => 
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const handleApply = () => {
    setSelectedValues(tempSelected);
    onClose();
  };

  const selectAll = () => setTempSelected(values);
  const clearAll = () => setTempSelected([]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterAltIcon color="primary" fontSize="small" />
          <Typography variant="h6" fontWeight="700">{title}</Typography>
        </Stack>
      </DialogTitle>

      <Box sx={{ px: 3, pb: 1 }}>
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={selectAll} sx={{ textTransform: 'none' }}>Select All</Button>
          <Button size="small" color="inherit" onClick={clearAll} sx={{ textTransform: 'none' }}>Clear</Button>
        </Stack>
      </Box>

      <Divider />

      <DialogContent sx={{ maxHeight: 400 }}>
        <Stack spacing={0.5}>
          {values.length > 0 ? (
            values.map((v) => (
              <Box 
                key={v}
                sx={{
                  borderRadius: 2,
                  px: 1,
                  '&:hover': { bgcolor: alpha('#1976d2', 0.04) }
                }}
              >
                <FormControlLabel
                  sx={{ width: '100%', mr: 0 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={tempSelected.includes(v)}
                      onChange={() => toggle(v)}
                    />
                  }
                  label={<Typography variant="body2">{v}</Typography>}
                />
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" py={4}>
              No values available to filter.
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary', fontWeight: 700 }}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleApply}
          sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
        >
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
}