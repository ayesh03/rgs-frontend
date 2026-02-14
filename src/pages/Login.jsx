import {
  Button,
  Box,
  TextField,
  Typography,
  Card,
  InputAdornment,
  Stack,
  alpha
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TrainIcon from '@mui/icons-material/Train';
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const API_BASE = import.meta.env.VITE_API_BASE_URL;

const handleLogin = async () => {
  setError("");
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({
        username: data.username,
        role: data.role
      })
    );

    login({
      username: data.username,
      role: data.role
    });

    navigate("/app/loco", { replace: true });

  } catch (err) {
    setError("Backend not reachable");
  } finally {
    setLoading(false);
  }
};



  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        overflow: "hidden",
        // Cinematic Deep Blue Gradient
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%)",
      }}
    >
      {/* Decorative Floating Orbs */}
      <Box
        component={motion.div}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        sx={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <Box
        component={motion.div}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, -60, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        sx={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
      >
        <Card
          sx={{
            p: 6,
            width: { xs: '90vw', sm: 420 },
            borderRadius: 8,
            position: "relative",
            zIndex: 1,
            // Premium Glassmorphism
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Brand/Logo Area */}
          <Box textAlign="center" mb={5}>
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              style={{ display: "inline-block" }}
            >
              <Box sx={{
                p: 2,
                borderRadius: "20px",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                display: "inline-flex",
                mb: 2,
                boxShadow: "0 10px 20px rgba(37, 99, 235, 0.3)"
              }}>
                <TrainIcon sx={{ fontSize: 40, color: "#fff" }} />
              </Box>
            </motion.div>

            <Typography variant="h3" fontWeight="900" sx={{
              color: "#fff",
              letterSpacing: "-2px",
              textShadow: "0 2px 10px rgba(0,0,0,0.2)"
            }}>
              KAVACH
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
              Train Control & Asset Management
            </Typography>
          </Box>

          <Stack spacing={3}>
            {error && (
              <Typography color="error" textAlign="center">
                {error}
              </Typography>
            )}

            <TextField
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              variant="outlined"

              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: "rgba(255,255,255,0.4)" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: "#fff",
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.05)",
                  transition: "all 0.3s",
                  '& fieldset': { borderColor: "rgba(255,255,255,0.1)" },
                  '&:hover fieldset': { borderColor: "rgba(255,255,255,0.3)" },
                  '&.Mui-focused fieldset': { borderColor: "#3b82f6" },
                }
              }}
            />

            <TextField
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth

              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "rgba(255,255,255,0.4)" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: "#fff",
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.05)",
                  transition: "all 0.3s",
                  '& fieldset': { borderColor: "rgba(255,255,255,0.1)" },
                  '&:hover fieldset': { borderColor: "rgba(255,255,255,0.3)" },
                  '&.Mui-focused fieldset': { borderColor: "#3b82f6" },
                }
              }}
            />

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleLogin}
                disabled={loading}
                sx={{
                  py: 2,
                  borderRadius: 4,
                  fontWeight: 800,
                  fontSize: "1rem",
                  textTransform: "none",
                  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  boxShadow: "0 10px 25px rgba(37, 99, 235, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
                  }
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

            </motion.div>
          </Stack>

          <Box mt={6} textAlign="center">
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>
              SECURE ENTERPRISE GATEWAY v2.0.26
            </Typography>
          </Box>
        </Card>
      </motion.div>
    </Box>
  );
}