import { Box, Typography, CircularProgress, Stack } from "@mui/material";
import { motion } from "framer-motion";
import areaLogo from "../assets/arecaLogo.png";

export default function Splash() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle, #1565c0 0%, #0b4dbb 100%)",
        color: "#fff",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ===== BACKGROUND LOGO (REPLACED ANTENNA) ===== */}
      <Box
        component={motion.img}
        src={areaLogo}
        alt="Company Background Logo"
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.12, 0.18, 0.12],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        sx={{
          position: "absolute",
          zIndex: 0,
          height: 420,          // same visual weight as antenna
          width: 420,
          objectFit: "contain",
          filter: "brightness(1.4) contrast(1.1) drop-shadow(0 0 60px rgba(255,255,255,0.35))",
        }}
      />

      {/* ===== FOREGROUND CONTENT ===== */}
      <Stack
        spacing={3}
        alignItems="center"
        sx={{ zIndex: 1 }}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* ===== MAIN LOGO ===== */}
        <Box
          component={motion.img}
          src={areaLogo}
          alt="Company Logo"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          sx={{
            height: 90,
            mb: 1,
            filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.35))",
          }}
        />

        {/* ===== TITLE ===== */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h2"
            fontWeight={900}
            sx={{
              letterSpacing: 4,
              textShadow: "0px 4px 10px rgba(0,0,0,0.3)",
            }}
          >
            KAVACH CIKMS
          </Typography>

          <Typography
            variant="overline"
            sx={{
              letterSpacing: 2,
              opacity: 0.8,
              fontWeight: 600,
              display: "block",
              mt: -1,
            }}
          >
            Report Generation System
          </Typography>
        </Box>

        {/* ===== LOADER ===== */}
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <CircularProgress
            size={60}
            thickness={2}
            sx={{ color: "rgba(255,255,255,0.3)" }}
          />
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: "#fff",
              position: "absolute",
              left: 0,
            }}
          />
        </Box>

        {/* ===== STATUS TEXT ===== */}
        <Stack spacing={0.5} alignItems="center">
          <Typography
            variant="body2"
            sx={{
              fontFamily: "monospace",
              opacity: 0.75,
              animation: "pulse 2s infinite",
            }}
          >
            INITIALIZING CORE MODULES...
          </Typography>

          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            © Indian Railways – S&T Division
          </Typography>
        </Stack>
      </Stack>

      {/* ===== ANIMATIONS ===== */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 0.9; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </Box>
  );
}
