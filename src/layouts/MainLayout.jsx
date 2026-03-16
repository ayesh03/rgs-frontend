import areaLogo from "../assets/arecaLogo.png";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import {AppBar,Toolbar,Button,Box,Typography,TextField,Paper,IconButton,Divider,Dialog,DialogTitle,DialogContent,DialogContentText,DialogActions,Stack,Popover,} from "@mui/material";
import Animatedtrain from "./AnimatedTrain"
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

  const [fromAnchorEl, setFromAnchorEl] = useState(null);
  const [toAnchorEl, setToAnchorEl] = useState(null);

  const [tempFromDate, setTempFromDate] = useState("");
  const [tempFromTime, setTempFromTime] = useState("");
  const [tempToDate, setTempToDate] = useState("");
  const [tempToTime, setTempToTime] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);

  useEffect(() => {
    if (tempFromDate) {
      setTempToDate(tempFromDate);
    }
  }, [tempFromDate]);

  const {
    fromDate,
    toDate,
    setFromDate,
    setToDate,
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

  // const handleFromOpen = (event) => {
  //   const [d, t] = (fromDate || "").split("T");
  //   setTempFromDate(d || "");
  //   setTempFromTime(t || "");
  //   setFromAnchorEl(event.currentTarget);
  // };
  const handleFromOpen = (event) => {
    const [d, t] = (fromDate || "").split("T");
    setTempFromDate(d || "");
    setTempFromTime(t || "00:00:00");
    setFromAnchorEl(event.currentTarget);

    setTimeout(() => {
      fromDateRef.current?.focus();
    }, 100);
  };
  const handleFromClose = () => setFromAnchorEl(null);
  // const handleFromApply = () => {
  //   if (tempFromDate && tempFromTime) {
  //     setFromDate(`${tempFromDate}T${tempFromTime}`);
  //     handleFromClose();
  //   }
  // };

  const handleFromApply = () => {
    if (tempFromDate && tempFromTime) {
      const from = `${tempFromDate}T${tempFromTime}`;
      const to = `${tempFromDate}T23:59:59`;

      setFromDate(from);
      setToDate(to);

      handleFromClose();
    }
  };

  // const handleToOpen = (event) => {
  //   const [d, t] = (toDate || "").split("T");
  //   setTempToDate(d || "");
  //   setTempToTime(t || "");
  //   setToAnchorEl(event.currentTarget);
  // };
  const handleToOpen = (event) => {
    const [d, t] = (toDate || "").split("T");
    setTempToDate(d || tempFromDate || "");
    setTempToTime(t || "23:59:59");
    setToAnchorEl(event.currentTarget);

    setTimeout(() => {
      toDateRef.current?.focus();
    }, 100);
  };

  const handleToClose = () => setToAnchorEl(null);
  const handleToApply = () => {
    if (tempToDate && tempToTime) {
      setToDate(`${tempToDate}T${tempToTime}`);
      handleToClose();
    }
  };

  const navItems = [
    { label: "Dashboard", path: "dashboard" },
    { label: "Loco Movement", path: "loco" },
    { label: "Station Kavach Info", path: "StationaryKavachInfo" },
    { label: "Faults", path: "faults" },
    { label: "Interlocking", path: "interlocking" },
    { label: "Health", path: "health" },
    { label: "Graphs", path: "graphs" },
  ];

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      width: "100%",
      minHeight: "100vh",
      background: "#0a0c10", // Deep dark background
      color: "#e0e0e0"
    }}>

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "rgba(18, 22, 28, 0.9)",
          backdropFilter: "blur(20px)",
          color: "#fff",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: "56px !important", px: 2 }}>
          {/* LOGO SECTION */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <a href="https://www.areca.in/" target="_blank" rel="noopener noreferrer">
              <Box component="img" src={areaLogo} alt="Logo" sx={{ height: 38, cursor: "pointer", filter: "brightness(0) invert(1)" }} />
            </a>

            <Typography
              component={motion.div}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              sx={{
                mt: 0.5,
                mb: 0.,
                fontWeight: 800,
                fontSize: "2.125rem",
                letterSpacing: -1,
                background: "linear-gradient(90deg,#4dabf7,#74c0fc,#4dabf7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 10px rgba(77,171,247,0.4)",

              }}
            >
              <motion.span
                animate={{ letterSpacing: ["1px", "2px", "1px"] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                KAVACH
              </motion.span>
              <Box
                component="span"
                sx={{
                  ml: 1,
                  fontWeight: 800,
                  color: "#fff",
                  WebkitTextFillColor: "#fff",
                  background: "none",
                  textShadow: "none",
                  fontSize: "2.125rem",
                  lineHeight: 1
                }}
              >
                REPORT GENERATION SYSTEM
              </Box>
            </Typography>
            <Box component="span" sx={{ display: "inline-flex", verticalAlign: "middle", mx: 0.5 }}>
              <Animatedtrain width={320} />
            </Box>
          </Box>


          {/* FILTER BAR SECTION */}
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 0.5,
            px: 0.5,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>

            {/* FROM PICKER */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#888" }}>From:</Typography>
              <Button
                size="small" variant="outlined"
                onClick={handleFromOpen}
                startIcon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
                sx={{
                  textTransform: "none", fontSize: "0.75rem", minWidth: 160,
                  color: "#eee", borderColor: "rgba(255,255,255,0.2)",
                  "&:hover": { borderColor: "rgba(255,255,255,0.4)", bgcolor: "rgba(255,255,255,0.05)" }
                }}
              >
                {formatDateTimeForDisplay(fromDate)}
              </Button>
              <Popover
                open={Boolean(fromAnchorEl)}
                anchorEl={fromAnchorEl}
                onClose={handleFromClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                PaperProps={{ sx: { bgcolor: "#1e2227", color: "#fff", border: "1px solid #333" } }}
              >
                <Box sx={{ p: 2, minWidth: 250 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Select Start Date/Time</Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Date" type="date" size="small" inputRef={fromDateRef} fullWidth
                      value={tempFromDate}
                      onChange={(e) => setTempFromDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ input: { color: "#fff" }, label: { color: "#888" }, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#444" } } }}
                    />
                    <TextField
                      label="Time" type="time" size="small" fullWidth
                      value={tempFromTime}
                      onChange={(e) => setTempFromTime(e.target.value)}
                      inputProps={{ step: 1 }}
                      InputLabelProps={{ shrink: true }}
                      sx={{ input: { color: "#fff" }, label: { color: "#888" }, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#444" } } }}
                    />
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={handleFromClose} sx={{ color: "#aaa" }}>Cancel</Button>
                      <Button size="small" variant="contained" onClick={handleFromApply} sx={{ bgcolor: "#0b4dbb" }}>Apply</Button>
                    </Stack>
                  </Stack>
                </Box>
              </Popover>
            </Stack>

            {/* TO PICKER */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#888" }}>To:</Typography>
              <Button
                size="small" variant="outlined"
                onClick={handleToOpen}
                startIcon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
                sx={{
                  textTransform: "none", fontSize: "0.75rem", minWidth: 160,
                  color: "#eee", borderColor: "rgba(255,255,255,0.2)",
                  "&:hover": { borderColor: "rgba(255,255,255,0.4)", bgcolor: "rgba(255,255,255,0.05)" }
                }}
              >
                {formatDateTimeForDisplay(toDate)}
              </Button>
              <Popover
                open={Boolean(toAnchorEl)}
                anchorEl={toAnchorEl}
                onClose={handleToClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                PaperProps={{ sx: { bgcolor: "#1e2227", color: "#fff", border: "1px solid #333" } }}
              >
                <Box sx={{ p: 2, minWidth: 250 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Select End Date/Time</Typography>
                  <Stack spacing={2}>
                    <TextField label="Date" type="date" size="small" inputRef={toDateRef} fullWidth value={tempToDate} onChange={(e) => setTempToDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ input: { color: "#fff" }, label: { color: "#888" }, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#444" } } }} />
                    <TextField
                      label="Time" type="time" size="small" fullWidth
                      value={tempToTime}
                      onChange={(e) => setTempToTime(e.target.value)}
                      inputProps={{ step: 1 }}
                      InputLabelProps={{ shrink: true }}
                      sx={{ input: { color: "#fff" }, label: { color: "#888" }, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#444" } } }}
                    />
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={handleToClose} sx={{ color: "#aaa" }}>Cancel</Button>
                      <Button size="small" variant="contained" onClick={handleToApply} sx={{ bgcolor: "#0b4dbb" }}>Apply</Button>
                    </Stack>
                  </Stack>
                </Box>
              </Popover>
            </Stack>

            {/* FILE UPLOAD */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#888" }}>BIN:</Typography>
              <Button
                component="label"
                size="small"
                variant="outlined"
                startIcon={<FolderOpenIcon sx={{ fontSize: 14 }} />}
                sx={{
                  textTransform: "none", fontSize: "0.75rem",
                  color: "#eee", borderColor: "rgba(255,255,255,0.2)"
                }}
              >
                {selectedFile ? selectedFile.name : "Select File"}
                <input type="file" hidden accept=".bin" onChange={(e) => setSelectedFile(e.target.files[0])} />
              </Button>
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto', borderColor: "rgba(255,255,255,0.1)" }} />

            {/* ACTIONS */}
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={() => setAboutOpen(true)} sx={{ color: "#aaa" }}><SettingsIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={handleLogoutClick} sx={{ color: "#ff5252" }}><LogoutIcon fontSize="small" /></IconButton>
            </Stack>
          </Box>
        </Toolbar>

        {/* NAVIGATION LINKS */}
        <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 1, overflowX: "auto" }}>
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  px: 1.5, py: 0.5, textTransform: "none", fontSize: "1.4rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#fff" : "#888",
                  bgcolor: isActive ? "#0b4dbb" : "transparent",
                  "&:hover": { bgcolor: isActive ? "#083a8d" : "rgba(255,255,255,0.05)" }
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
      </AppBar>

      {/* PAGE CONTENT */}
      <Box sx={{ flexGrow: 1, p: 0.5 }}>
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Paper elevation={0} sx={{
              p: 0.1,
              borderRadius: 2,
              minHeight: "75vh",
              bgcolor: "#12161c", // Dark paper background
              border: "1px solid rgba(255,255,255,0.05)",
              color: "#fff"
            }}>
              <Outlet context={{ selectedFile }} />
            </Paper>
          </motion.div>
        </AnimatePresence>
      </Box>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />

      {/* LOGOUT DIALOG */}
      <Dialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        PaperProps={{ sx: { bgcolor: "#1e2227", color: "#fff" } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Logout</DialogTitle>
        <DialogContent><DialogContentText sx={{ color: "#bbb" }}>Are you sure you want to log out?</DialogContentText></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLogoutConfirmOpen(false)} sx={{ color: "#aaa" }}>Cancel</Button>
          <Button onClick={handleConfirmLogout} variant="contained" color="error">Logout</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}