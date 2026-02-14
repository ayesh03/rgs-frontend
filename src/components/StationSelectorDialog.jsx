import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Box,
  Stack,
  InputAdornment,
  Typography,
  Grid,
  alpha
} from "@mui/material";
import { useState, useMemo } from "react";
import SearchIcon from '@mui/icons-material/Search';
import LocationCityIcon from '@mui/icons-material/LocationCity';

export default function StationSelectorDialog({
  open,
  stations = [],
  selectedStations = [],
  setSelectedStations,
  onClose,
}) {
  const [search, setSearch] = useState("");

  const filteredStations = useMemo(() => {
    return stations.filter((s) =>
      s.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, stations]);

  // Handle the logic for the "Select All" checkbox state
  const isAllSelected = stations.length > 0 && selectedStations.length === stations.length;
  const isSomeSelected = selectedStations.length > 0 && selectedStations.length < stations.length;

  const toggleStation = (station) => {
    setSelectedStations((prev) =>
      prev.includes(station)
        ? prev.filter((s) => s !== station)
        : [...prev, station]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedStations(checked ? [...stations] : []);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationCityIcon color="primary" />
        <Typography variant="h6" fontWeight="700">Station Inventory</Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Select one or more stations to include in the generated report.
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Filter stations by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ px: 1, mb: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            }
            label={
              <Typography variant="subtitle2" fontWeight="700">
                {isAllSelected ? "Deselect All" : "Select All Stations"} 
                <Typography component="span" variant="caption" sx={{ ml: 1, opacity: 0.6 }}>
                  ({selectedStations.length} selected)
                </Typography>
              </Typography>
            }
          />
        </Box>

        <Box
          sx={{
            maxHeight: 340,
            overflowY: "auto",
            border: "1px solid",
            borderColor: "divider",
            p: 2,
            borderRadius: 2,
            bgcolor: alpha('#000', 0.01)
          }}
        >
          <Grid container spacing={0}>
            {filteredStations.length > 0 ? (
              filteredStations.map((station) => (
                <Grid item xs={12} sm={6} key={station}>
                  <FormControlLabel
                    sx={{ width: '100%', mr: 0 }}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedStations.includes(station)}
                        onChange={() => toggleStation(station)}
                      />
                    }
                    label={<Typography variant="body2">{station}</Typography>}
                  />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.disabled" align="center" py={4}>
                  No stations found matching "{search}"
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: alpha('#000', 0.02) }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 'bold' }}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={onClose} 
          sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}
        >
          Apply Selection
        </Button>
      </DialogActions>
    </Dialog>
  );
}