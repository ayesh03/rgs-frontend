import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  InputAdornment,
  Box,
  Typography,
  alpha,
  Divider,
} from "@mui/material";
import { useState, useEffect } from "react";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';

export default function ColumnFilterDialog({
  open,
  column,
  values,
  selectedValues,
  onClose,
  onApply,
}) {
  const [localSelected, setLocalSelected] = useState([]);

  // Sync when dialog opens
  useEffect(() => {
    if (open) {
      setLocalSelected(selectedValues);
    }
  }, [open, selectedValues]);

  const toggleValue = (val) => {
    setLocalSelected((prev) =>
      prev.includes(val)
        ? prev.filter((v) => v !== val)
        : [...prev, val]
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select {column}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={0.5}>
          {values.map((val) => (
            <FormControlLabel
              key={val}
              control={
                <Checkbox
                  size="small"
                  checked={localSelected.includes(val)}
                  onChange={() => toggleValue(val)}
                />
              }
              label={val}
            />
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => onApply(localSelected)}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
