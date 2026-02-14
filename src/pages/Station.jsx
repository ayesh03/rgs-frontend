import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  alpha,
  Tooltip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion"; // Modern animation engine
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from '@mui/icons-material/Business'; // Station/Building Icon

export default function Station() {
  const [stations, setStations] = useState([
    { code: "STN001", name: "Station One", active: true },
    { code: "STN002", name: "Station Two", active: true },
    { code: "STN003", name: "Station Three", active: false },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ code: "", name: "" });

  const openAddDialog = () => {
    setEditIndex(null);
    setForm({ code: "", name: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (index) => {
    setEditIndex(index);
    setForm(stations[index]);
    setDialogOpen(true);
  };

  const saveStation = () => {
    if (!form.code || !form.name) return;

    if (editIndex !== null) {
      const updated = [...stations];
      updated[editIndex] = { ...updated[editIndex], ...form };
      setStations(updated);
    } else {
      setStations([...stations, { ...form, active: true }]);
    }
    setDialogOpen(false);
  };

  const toggleActive = (index) => {
    const updated = [...stations];
    updated[index].active = !updated[index].active;
    setStations(updated);
  };

  return (
    <Box p={3} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* Title with Thematic Icon */}
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Box sx={{ bgcolor: 'primary.main', p: 1, borderRadius: 2, display: 'flex' }}>
          <BusinessIcon sx={{ color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: -1 }}>
            Station Master
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure and monitor trackside station nodes
          </Typography>
        </Box>
      </Stack>

      {/* Global Actions Bar */}
      <Card sx={{ mb: 1, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight="600">
              Total Stations: <Chip label={stations.length} size="small" color="primary" sx={{ ml: 1 }} />
            </Typography>

            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={openAddDialog}
              sx={{ borderRadius: 2, px: 3, fontWeight: 'bold', textTransform: 'none' }}
            >
              Add New Station
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Modern Data Table */}
      <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha('#f5f7fb', 0.8) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: '800', py: 2 }}>STATION CODE</TableCell>
              <TableCell sx={{ fontWeight: '800' }}>STATION NAME</TableCell>
              <TableCell sx={{ fontWeight: '800' }} align="center">STATUS</TableCell>
              <TableCell sx={{ fontWeight: '800' }} align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {stations.map((stn, index) => (
                <TableRow 
                  key={stn.code}
                  component={motion.tr}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Typography fontWeight="700" color="primary">{stn.code}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">{stn.name}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <Typography variant="caption" fontWeight="bold" color={stn.active ? "success.main" : "text.disabled"}>
                        {stn.active ? "OPERATIONAL" : "OFFLINE"}
                      </Typography>
                      <Switch
                        size="small"
                        checked={stn.active}
                        onChange={() => toggleActive(index)}
                        color="success"
                      />
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Details">
                      <IconButton 
                        onClick={() => openEditDialog(index)}
                        sx={{ bgcolor: alpha('#1976d2', 0.05), '&:hover': { bgcolor: alpha('#1976d2', 0.1) } }}
                      >
                        <EditIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </Card>

      {/* Enhanced Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, p: 1, width: '100%', maxWidth: 400 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="800">
            {editIndex !== null ? "Modify Station" : "Create New Station"}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter the unique identifier and name for the trackside node.
          </Typography>
          <Stack spacing={3}>
            <TextField
              label="Station Code"
              fullWidth
              variant="filled"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
            />
            <TextField
              label="Station Name"
              fullWidth
              variant="filled"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ fontWeight: 'bold' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={saveStation}
            disabled={!form.code || !form.name}
            sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}