import { Stack, Typography, TextField, MenuItem } from "@mui/material";
import { useState } from "react";

export default function RowsPerPageControl({
  rowsPerPage,
  setRowsPerPage,
  setPage
}) {
  const presetOptions = [10, 20, 50, 100, 200, 300, 500 ,1000 ,5000];
  const [customValue, setCustomValue] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const handleChange = (value) => {
    if (value === "custom") {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      setRowsPerPage(Number(value));
      setPage(1);
    }
  };

  const handleCustomKeyDown = (e) => {
    if (e.key === "Enter") {
      const val = Number(customValue);
      if (val > 0) {
        setRowsPerPage(val);
        setPage(1);
        setIsCustom(false);
        setCustomValue("");
      }
    }
  };

  //  Ensure dropdown shows custom value if not preset
  const dropdownOptions = presetOptions.includes(rowsPerPage)
    ? presetOptions
    : [...presetOptions, rowsPerPage];

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="flex-end"
      sx={{ mb: 1 }}
    >
      <Typography variant="caption" fontWeight={600}>
        Rows:
      </Typography>

      {!isCustom ? (
        <TextField
          select
          size="small"
          value={rowsPerPage}
          onChange={(e) => handleChange(e.target.value)}
          sx={{ width: 140 }}
        >
          {dropdownOptions
            .sort((a, b) => a - b)
            .map((num) => (
              <MenuItem key={num} value={num}>
                {num}
              </MenuItem>
            ))}

          <MenuItem value="custom">Custom..</MenuItem>
        </TextField>
      ) : (
        <TextField
          size="small"
          autoFocus
          placeholder="Enter number"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={handleCustomKeyDown}
          sx={{ width: 140 }}
        />
      )}
    </Stack>
  );
}
