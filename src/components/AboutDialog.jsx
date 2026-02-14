import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  DialogActions,
  Box,
  Stack,
  Chip,
  Avatar,
  alpha,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import TerminalIcon from '@mui/icons-material/Terminal';

export default function AboutDialog({ open, onClose }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, overflow: 'hidden' }
      }}
    >
      {/* Branding Header */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        p: 3, 
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{ position: 'absolute', right: -20, top: -20 }}
        >
          <SettingsInputAntennaIcon sx={{ fontSize: 140, color: alpha('#fff', 0.1) }} />
        </motion.div>

        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 56, height: 56 }}>
            <SettingsInputAntennaIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="800" lineHeight={1.2}>
              TCAS RGS
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 1 }}>
              REPORT GENERATION SYSTEM
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ mt: 1 }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Core Configuration
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip 
                icon={<VerifiedUserIcon style={{ fontSize: '1rem' }} />} 
                label="Version 2.4.0" 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="body2" color="text.primary" fontWeight="600">
              Technical Description
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5} lineHeight={1.6}>
              Centralized platform for the processing, visualization, and archival of 
              Train Collision Avoidance System (TCAS) logs. Developed for precision 
              monitoring of trackside and onboard signaling data.
            </Typography>
          </Box>

          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: alpha('#000', 0.03), 
            border: '1px solid #eee',
            textAlign: 'center'
          }}>
            <Typography variant="caption" fontWeight="700" color="text.secondary">
              © 2026 Areca Embedded Systems Pvt. Ltd.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: alpha('#000', 0.01) }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          fullWidth
          sx={{ borderRadius: 2, fontWeight: 'bold', py: 1 }}
        >
          Dismiss
        </Button>
      </DialogActions>
    </Dialog>
  );
}