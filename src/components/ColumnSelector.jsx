import {Dialog,DialogTitle,DialogContent,FormGroup,FormControlLabel,Checkbox,Button,Box,Typography,IconButton,Divider} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";

export default function ColumnSelector({ open, columns, selected, onChange, onClose }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "rgba(20, 20, 20, 0.85)", // Deep dark glass
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          backgroundImage: "none", // Remove MUI default overlay gradient
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography sx={{ 
          fontWeight: 800, 
          fontSize: '1rem', 
          color: '#fff', 
          letterSpacing: 1,
          textTransform: 'uppercase' 
        }}>
          Configure View
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "rgba(255,255,255,0.5)" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: 3 }} />

      <DialogContent sx={{ mt: 1 }}>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", mb: 2, display: 'block' }}>
          SELECT THE COLUMNS YOU WISH TO DISPLAY IN THE NMS DASHBOARD
        </Typography>
        
        <FormGroup sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', // Two column layout for better use of space
          gap: 0.5 
        }}>
          {columns.map((col, index) => (
            <Box 
              key={col.key}
              component={motion.div}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selected.includes(col.key)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selected, col.key]
                        : selected.filter(k => k !== col.key);
                      onChange(next);
                    }}
                    sx={{
                      color: "rgba(255,255,255,0.2)",
                      "&.Mui-checked": {
                        color: "#00e5ff", // Neon accent
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ 
                    fontSize: '0.8rem', 
                    color: selected.includes(col.key) ? "#fff" : "rgba(255,255,255,0.6)",
                    fontWeight: selected.includes(col.key) ? 600 : 400
                  }}>
                    {col.label}
                  </Typography>
                }
              />
            </Box>
          ))}
        </FormGroup>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button 
            onClick={onClose} 
            sx={{ 
              color: "rgba(255,255,255,0.6)",
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={onClose} 
            variant="contained"
            sx={{ 
              bgcolor: "#00a3ff",
              "&:hover": { bgcolor: "#0086d1" },
              borderRadius: "8px",
              px: 4,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: "0 4px 14px 0 rgba(0, 163, 255, 0.39)"
            }}
          >
            Apply Changes
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}