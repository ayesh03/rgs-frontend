import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button
} from "@mui/material";

export default function ColumnSelector({ open, columns, selected, onChange, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Columns</DialogTitle>
      <DialogContent>
        <FormGroup>
          {columns.map(col => (
            <FormControlLabel
              key={col.key}
              control={
                <Checkbox
                  checked={selected.includes(col.key)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selected, col.key]
                      : selected.filter(k => k !== col.key);
                    onChange(next);
                  }}
                />
              }
              label={col.label}
            />
          ))}
        </FormGroup>

        <Button onClick={onClose} sx={{ mt: 2 }} variant="contained">
          Apply
        </Button>
      </DialogContent>
    </Dialog>
  );
}
