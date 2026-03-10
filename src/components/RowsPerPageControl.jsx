import { Stack, Typography, TextField, MenuItem, alpha ,Box ,Divider} from "@mui/material";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RowsPerPageControl({
  rowsPerPage,
  setRowsPerPage,
  setPage
}) {
  const presetOptions = [10, 20, 50, 100, 200, 300, 500, 1000, 5000];
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

  const dropdownOptions = presetOptions.includes(rowsPerPage)
    ? presetOptions
    : [...presetOptions, rowsPerPage];

  // Shared styles for the dark theme inputs
  const inputStyles = {
    width: 100,
    "& .MuiOutlinedInput-root": {
      fontSize: "1rem",
      fontWeight: 700,
      color: "#fff",
      bgcolor: "rgba(255, 255, 255, 0.05)",
      borderRadius: "8px",
      fontFamily: "'JetBrains Mono', monospace",
      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
      "&:hover fieldset": { borderColor: "#4dabf7" },
      "&.Mui-focused fieldset": { borderColor: "#4dabf7", borderWidth: "1px" },
    },
    "& .MuiSelect-icon": { color: "rgba(255, 255, 255, 0.5)" },
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="flex-end"
    >
      <Typography 
        variant="caption" 
        sx={{ 
          fontWeight: 800, 
          color: "rgba(255, 255, 255, 0.5)", 
          textTransform: "uppercase",
          letterSpacing: 1,
          fontSize: "1rem"
        }}
      >
        Rows:
      </Typography>

      <AnimatePresence mode="wait">
        {!isCustom ? (
          <Box
            key="select"
            component={motion.div}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
          >
            <TextField
              select
              size="small"
              value={rowsPerPage}
              onChange={(e) => handleChange(e.target.value)}
              sx={inputStyles}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: "#1a1f26",
                      backgroundImage: "none",
                      border: "1px solid rgba(255,255,255,0.1)",
                      "& .MuiMenuItem-root": {
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.8)",
                        "&:hover": { bgcolor: "rgba(77, 171, 247, 0.1)" },
                        "&.Mui-selected": { bgcolor: alpha("#4dabf7", 0.2), color: "#4dabf7" },
                      },
                    },
                  },
                },
              }}
            >
              {dropdownOptions
                .sort((a, b) => a - b)
                .map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.05)" }} />
              <MenuItem value="custom" sx={{ color: "#4dabf7 !important", fontWeight: 700 }}>
                CUSTOM...
              </MenuItem>
            </TextField>
          </Box>
        ) : (
          <Box
            key="input"
            component={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <TextField
              size="small"
              autoFocus
              placeholder="Enter..."
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={handleCustomKeyDown}
              onBlur={() => setIsCustom(false)}
              sx={inputStyles}
            />
          </Box>
        )}
      </AnimatePresence>
    </Stack>
  );
}