import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Stack,
    useTheme,
    useMediaQuery,
    alpha,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import DirectionsRailwayIcon from "@mui/icons-material/DirectionsRailway";
import SpeedIcon from "@mui/icons-material/Speed";
import EngineeringIcon from '@mui/icons-material/Engineering';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", damping: 12, stiffness: 100 }
    },
};

const MotionCard = motion(Card);

const Dashboard = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { fromDate, toDate } = useAppContext();
    const { selectedFile } = useOutletContext();
    const { dashboardData, setDashboardData } = useAppContext();

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/api/dashboard/summary?from=${fromDate}&to=${toDate}`,
                    {
                        method: "POST",
                        body: selectedFile
                    }
                );

                const json = await res.json();
                if (json.success) {
                    setDashboardData(json.summary);
                }
            } catch (err) {
                console.error("Dashboard fetch error", err);
            }
        };

        if (fromDate && toDate && selectedFile) {
            fetchSummary();
        }
    }, [fromDate, toDate, selectedFile, setDashboardData]);

    const summary = [
        {
            title: "TOTAL MOVEMENT",
            value: dashboardData?.total_movement ?? 0,
            icon: <DirectionsRailwayIcon sx={{ fontSize: 38 }} />,
            color: "#4dabf7", // Electric Blue
            route: "loco",
            autoGenerate: true
        },
        {
            title: "ONBOARD EMERGENCY",
            value: dashboardData?.onboard_emergency ?? 0,
            icon: <WarningAmberIcon sx={{ fontSize: 38 }} />,
            color: "#ff5252", // Neon Red
            route: "loco",
            autoGenerate: true,
            filter: { field: "emergency_status", value: [1, 2, 3, 4, 5, 6] }
        },
        {
            title: "STATION EMERGENCY",
            value: dashboardData?.station_emergency || 0,
            icon: <WarningAmberIcon sx={{ fontSize: 38 }} />,
            color: "#ff1744",
            route: "StationaryKavachInfo",
            autoGenerate: true,
            tab: 2
        },
        {
            title: "LOCO FAULTS",
            value: dashboardData?.loco_faults ?? 0,
            icon: <EngineeringIcon sx={{ fontSize: 38 }} />,
            color: "#ffd740",
            route: "faults",
            autoGenerate: true,
            tab: 1
        },
        {
            title: "STATION FAULTS",
            value: dashboardData?.station_faults ?? 0,
            icon: <EngineeringIcon sx={{ fontSize: 38 }} />,
            color: "#ffab00",
            route: "faults",
            autoGenerate: true,
            tab: 0
        },
        {
            title: "SYSTEM FAILURE MODE",
            value: dashboardData?.system_failure_mode ?? 0,
            icon: <HealthAndSafetyIcon sx={{ fontSize: 38 }} />,
            color: "#f44336",
            route: "loco",
            autoGenerate: true,
            filter: { field: "loco_mode", value: ["12"] }
        },
        {
            title: "EMERGENCY BRAKE",
            value: dashboardData?.emergency_brake ?? 0,
            icon: <SpeedIcon sx={{ fontSize: 38 }} />,
            color: "#e040fb", // Purple Neon
            route: "loco",
            autoGenerate: true,
            filter: { field: "brake_applied_status", value: ["3"] }
        },
        {
            title: "STATION HEALTH",
            value: dashboardData?.station_health_count ?? 0,
            icon: <HealthAndSafetyIcon sx={{ fontSize: 38 }} />,
            color: "#00e5ff",
            route: "health",
            autoGenerate: true,
            tab: 0
        },
        {
            title: "ONBOARD HEALTH",
            value: dashboardData?.onboard_health_count ?? 0,
            icon: <HealthAndSafetyIcon sx={{ fontSize: 38 }} />,
            color: "#1de9b6",
            route: "health",
            autoGenerate: true,
            tab: 1
        },
    ];

    const handleNavigate = (item) => {
    navigate(`/app/${item.route}`, {
        state: {
            autoGenerate: item.autoGenerate || false,
            dashboardFilter: item.filter || null,
            targetTab: item.tab ?? null
        }
    });
};

    return (
        <Box
            component={motion.div}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            sx={{
                minHeight: "75vh",
                p: isMobile ? 2 : 3,
                background: `radial-gradient(circle at 50% -20%, ${alpha("#0b4dbb", 0.15)}, transparent 80%)`,
                backgroundColor: "#0a0c10", // Consistent Deep Dark
                borderRadius: '16px'
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4, px: 1 }}>
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={900}
                        sx={{
                            letterSpacing: -1,
                            color: "#fff",
                            textTransform: "uppercase"
                        }}
                    >
                        Dashboard <Box component="span" sx={{ color: "#4dabf7", ml: 1 }}>Overview</Box>
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={3}>
                <AnimatePresence>
                    {summary.map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={4} xl={3} key={index}>
                            <MotionCard
                                variants={itemVariants}
                                whileHover={{
                                    y: -8,
                                    scale: 1.03,
                                    boxShadow: `0 20px 40px -15px ${alpha(item.color, 0.4)}`,
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleNavigate(item)}
                                sx={{
                                    cursor: "pointer",
                                    borderRadius: '20px',
                                    position: "relative",
                                    background: "rgba(255, 255, 255, 0.03)",
                                    backdropFilter: "blur(10px)",
                                    border: `1px solid ${alpha(item.color, 0.2)}`,
                                    overflow: 'hidden',
                                    height: '100%'
                                }}
                            >
                                {/* Gradient Glow Line at Top */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '3px',
                                    background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
                                }} />

                                <CardContent sx={{ p: 5 }}>
                                    <Stack spacing={2.5}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 72,
                                                height: 72,
                                                borderRadius: '14px',
                                                backgroundColor: alpha(item.color, 0.1),
                                                color: item.color,
                                                border: `1px solid ${alpha(item.color, 0.2)}`,
                                                boxShadow: `0 0 15px ${alpha(item.color, 0.1)}`,
                                            }}
                                        >
                                            {item.icon}
                                        </Box>

                                        <Box>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "rgba(255,255,255,0.5)",
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 1.2,
                                                    fontSize: '0.8rem',
                                                    display: 'block',
                                                    mb: 0.5
                                                }}
                                            >
                                                {item.title}
                                            </Typography>
                                            <Typography
                                                variant="h3"
                                                sx={{
                                                    fontWeight: 800,
                                                    color: "#ffffff",
                                                    fontSize: '2.8rem',
                                                    fontFamily: '"JetBrains Mono", "Roboto Mono", monospace'
                                                }}
                                            >
                                                {item.value}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    ))}
                </AnimatePresence>
            </Grid>
        </Box>
    );
};

export default Dashboard;