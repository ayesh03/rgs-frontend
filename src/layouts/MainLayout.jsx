import React, { useState } from "react";
import areaLogo from "../assets/arecaLogo.png";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  TextField,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  Popover,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SettingsIcon from '@mui/icons-material/Settings';
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import LogoutIcon from '@mui/icons-material/Logout';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../auth/AuthContext";
import AboutDialog from "../components/AboutDialog";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [aboutOpen, setAboutOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Separate anchors for from/to pickers
  const [fromAnchorEl, setFromAnchorEl] = useState(null);
  const [toAnchorEl, setToAnchorEl] = useState(null);

  const [tempFromDate, setTempFromDate] = useState("");
  const [tempFromTime, setTempFromTime] = useState("");
  const [tempToDate, setTempToDate] = useState("");
  const [tempToTime, setTempToTime] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    fromDate,
    toDate,
    logDir,
    setFromDate,
    setToDate,
    setLogDir,
    resetFilters,
  } = useAppContext();
  const handleLogoutClick = () => setLogoutConfirmOpen(true);
  const handleConfirmLogout = () => {
    resetFilters();
    logout();
    setLogoutConfirmOpen(false);
    navigate("/login", { replace: true });
  };
  const formatDateTimeForDisplay = (datetimeLocal) => {
    if (!datetimeLocal) return "Select Date & Time";
    const date = new Date(datetimeLocal);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };
  // HANDLERS FOR "FROM" POPOVER
  const handleFromOpen = (event) => {
    const [d, t] = (fromDate || "").split("T");
    setTempFromDate(d || "");
    setTempFromTime(t || "");
    setFromAnchorEl(event.currentTarget);
  };
  const handleFromClose = () => setFromAnchorEl(null);
  const handleFromApply = () => {
    if (tempFromDate && tempFromTime) {
      setFromDate(`${tempFromDate}T${tempFromTime}`);
      handleFromClose();
    }
  };
  // HANDLERS FOR "TO" POPOVER
  const handleToOpen = (event) => {
    const [d, t] = (toDate || "").split("T");
    setTempToDate(d || "");
    setTempToTime(t || "");
    setToAnchorEl(event.currentTarget);
  };
  const handleToClose = () => setToAnchorEl(null);
  const handleToApply = () => {
    if (tempToDate && tempToTime) {
      setToDate(`${tempToDate}T${tempToTime}`);
      handleToClose();
    }
  };
  const navItems = [
    { label: "Loco Movement", path: "loco" },
    { label: "Station Kavach Info", path: "StationaryKavachInfo" },
    { label: "Faults", path: "faults" },
    { label: "Interlocking", path: "interlocking" },
    { label: "Health", path: "health" },
    { label: "Graphs", path: "graphs" },
    // { label: "Track Profile Graph", path: "track-profile/graph" },
    // { label: "Track Profile", path: "track-profile" },
    // { label: "Parameters", path: "parameters" },
    // { label: "TSR", path: "tsr" },
    // { label: "Radio", path: "radio" }
  ];
  

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", minHeight: "100vh", background: "#f4f7fa" }}>

      <AppBar position="sticky" elevation={0} sx={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(12px)", color: "#1a2027", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}>
        <Toolbar sx={{ justifyContent: "space-between", minHeight: "56px !important", px: 2 }}>
          {/* LOGO SECTION */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box component="img" src={areaLogo} alt="Logo" sx={{ height: 24 }} />
            <Typography variant="caption" sx={{ mt: 0.7, fontWeight: 700, color: "#0b4dbb", fontSize: "20px" }}>
              KAVACH <Box component="span" sx={{ fontWeight: 200, color: "#444" }}>CIKMS</Box>
            </Typography>
          </Box>

          {/* FILTER BAR SECTION */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 0.5, px: 1.5, borderRadius: 2, bgcolor: "rgba(0,0,0,0.04)" }}>

            {/* FROM PICKER */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>From:</Typography>
              <Button
                id="from-button"
                size="small" variant="outlined"
                onClick={handleFromOpen}
                startIcon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
                sx={{ textTransform: "none", fontSize: "0.75rem", minWidth: 160, color: "#333", borderColor: "#ccc" }}
              >
                {formatDateTimeForDisplay(fromDate)}
              </Button>
              <Popover
                open={Boolean(fromAnchorEl)}
                anchorEl={fromAnchorEl}
                onClose={handleFromClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
              >
                <Box sx={{ p: 2, minWidth: 250 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Select Start Date/Time</Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Date"
                      type="date"
                      size="small"
                      fullWidth
                      value={tempFromDate}
                      onChange={(e) => setTempFromDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                      label="Time"
                      type="time"
                      size="small"
                      fullWidth
                      value={tempFromTime}
                      onChange={(e) => setTempFromTime(e.target.value)}
                      inputProps={{ step: 1 }}
                      InputLabelProps={{ shrink: true }}
                    />

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={handleFromClose}>Cancel</Button>
                      <Button size="small" variant="contained" onClick={handleFromApply}>Apply</Button>
                    </Stack>
                  </Stack>
                </Box>
              </Popover>
            </Stack>

            {/* TO PICKER */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>To:</Typography>
              <Button
                id="to-button"
                size="small" variant="outlined"
                onClick={handleToOpen}
                startIcon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
                sx={{ textTransform: "none", fontSize: "0.75rem", minWidth: 160, color: "#333", borderColor: "#ccc" }}
              >
                {formatDateTimeForDisplay(toDate)}
              </Button>
              <Popover
                open={Boolean(toAnchorEl)}
                anchorEl={toAnchorEl}
                onClose={handleToClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
              >
                <Box sx={{ p: 2, minWidth: 250 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Select End Date/Time</Typography>
                  <Stack spacing={2}>
                    <TextField label="Date" type="date" size="small" fullWidth value={tempToDate} onChange={(e) => setTempToDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    <TextField
                      label="Time"
                      type="time"
                      size="small"
                      fullWidth
                      value={tempToTime}
                      onChange={(e) => setTempToTime(e.target.value)}
                      inputProps={{ step: 1 }}
                      InputLabelProps={{ shrink: true }}
                    />

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={handleToClose}>Cancel</Button>
                      <Button size="small" variant="contained" onClick={handleToApply}>Apply</Button>
                    </Stack>
                  </Stack>
                </Box>
              </Popover>
            </Stack>

            {/* FILE UPLOAD */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>BIN:</Typography>

              <Button
                component="label"
                size="small"
                variant="outlined"
                startIcon={<FolderOpenIcon sx={{ fontSize: 14 }} />}
                sx={{ textTransform: "none", fontSize: "0.75rem" }}
              >
                {selectedFile ? selectedFile.name : "Select File"}
                <input
                  type="file"
                  hidden
                  accept=".bin"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </Button>
            </Stack>


            <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto' }} />

            {/* ACTIONS */}
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={() => setAboutOpen(true)}><SettingsIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={handleLogoutClick} sx={{ color: "#d32f2f" }}><LogoutIcon fontSize="small" /></IconButton>
            </Stack>
          </Box>
        </Toolbar>

        {/* NAVIGATION LINKS */}
        <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 1, overflowX: "auto" }}>
          {navItems.map((item) => {
            const isActive = location.pathname.endsWith(item.path);
            return (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  px: 1.5, py: 0.5, textTransform: "none", fontSize: "0.8rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#fff" : "#555",
                  bgcolor: isActive ? "#0b4dbb" : "transparent",
                  "&:hover": { bgcolor: isActive ? "#083a8d" : "rgba(0,0,0,0.05)" }
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
      </AppBar>

      {/* PAGE CONTENT */}
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, minHeight: "75vh", border: "1px solid #e0e4e8" }}>
              <Outlet context={{ selectedFile }} />
            </Paper>
          </motion.div>
        </AnimatePresence>
      </Box>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />

      {/* LOGOUT DIALOG */}
      <Dialog open={logoutConfirmOpen} onClose={() => setLogoutConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Logout</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to log out?</DialogContentText></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLogoutConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmLogout} variant="contained" color="error">Logout</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}