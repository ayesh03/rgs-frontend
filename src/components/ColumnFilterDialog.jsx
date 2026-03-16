import {Dialog,DialogTitle,DialogContent,DialogActions,Button,Checkbox,FormControlLabel,Stack,TextField,InputAdornment,Box,Typography,Divider,IconButton,} from "@mui/material";
import { useState, useEffect } from "react";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from "framer-motion";

export default function ColumnFilterDialog({
  open,
  column,
  values,
  selectedValues,
  onClose,
  onApply,
}) {
  const [localSelected, setLocalSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      setLocalSelected(selectedValues || []);
      setSearchTerm("");
    }
  }, [open, selectedValues]);

  const toggleValue = (val) => {
    setLocalSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const filteredValues = values.filter((val) =>
    val?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "rgba(22, 22, 22, 0.9)", // Dark background
          backdropFilter: "blur(12px)", // Glass effect
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          backgroundImage: "none",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }
      }}
    >
      <DialogTitle sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.9rem", letterSpacing: 1 }}>
          SELECT COLUMNS
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "rgba(255,255,255,0.5)" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search columns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "rgba(255,255,255,0.4)", fontSize: "1.1rem" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(255,255,255,0.05)",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "0.8rem",
              "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
            }
          }}
        />
      </Box>

      <DialogContent 
        sx={{ 
          maxHeight: 400, 
          py: 0,
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.1)", borderRadius: "10px" }
        }}
      >
        <Stack spacing={0}>
          {filteredValues.map((val, index) => (
            <Box
              key={val}
              component={motion.div}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <FormControlLabel
                sx={{ 
                  width: '100%',
                  m: 0,
                  p: 0.5,
                  borderRadius: "4px",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.03)" }
                }}
                control={
                  <Checkbox
                    size="small"
                    checked={localSelected.includes(val)}
                    onChange={() => toggleValue(val)}
                    sx={{
                      color: "rgba(255,255,255,0.3)",
                      "&.Mui-checked": { color: "#00e5ff" } // Neon Blue
                    }}
                  />
                }
                label={
                  <Typography sx={{ 
                    color: localSelected.includes(val) ? "#fff" : "rgba(255,255,255,0.6)", 
                    fontSize: "0.8rem",
                    fontWeight: localSelected.includes(val) ? 600 : 400 
                  }}>
                    {val}
                  </Typography>
                }
              />
            </Box>
          ))}
        </Stack>
      </DialogContent>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mt: 1 }} />

      <DialogActions sx={{ p: 2, bgcolor: "rgba(0,0,0,0.2)" }}>
        <Button 
          onClick={onClose} 
          sx={{ color: "rgba(255,255,255,0.5)", textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onApply(localSelected)}
          sx={{
            bgcolor: "#00a3ff",
            borderRadius: "6px",
            textTransform: 'none',
            px: 3,
            fontWeight: 700,
            "&:hover": { bgcolor: "#0087d6" },
            boxShadow: "0 0 15px rgba(0, 163, 255, 0.4)"
          }}
        >
          Apply View
        </Button>
      </DialogActions>
    </Dialog>
  );
}