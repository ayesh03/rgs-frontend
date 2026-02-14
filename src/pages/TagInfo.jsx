import { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    Select,
    MenuItem,
    CircularProgress,
    Divider,
    alpha,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SensorsIcon from '@mui/icons-material/Sensors'; // RFID/Tag Icon
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveAltIcon from '@mui/icons-material/SaveAlt';

import TagInfoTable from "../components/TagInfoTable";
import NoResult from "../components/NoResult";
import PaginationControls from "../components/PaginationControls";

export default function TagInfo() {
    const [loading, setLoading] = useState(false);
    const [station, setStation] = useState("");
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);

    const stations = ["STN001", "STN002", "STN003"];

    const handleGenerate = () => {
        setLoading(true);
        setRows([]); // Reset for animation

        setTimeout(() => {
            setRows([
                { id: 1, date: "18/10/2017", time: "10:10:10", frameNo: "FR123", station: "STN001", tagId: "TAG-456" },
            ]);
            setLoading(false);
        }, 1200);
    };

    return (
        <Box p={3} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            
            {/* Header Section */}
            <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                >
                    <SensorsIcon color="primary" sx={{ fontSize: 36 }} />
                </motion.div>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: -1 }}>
                        Tag Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        RFID Asset tracking and frame synchronization logs.
                    </Typography>
                </Box>
            </Stack>

            {/* Precision Toolbar */}
            <Card sx={{ 
                mb: 1, 
                borderRadius: 4, 
                boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
                border: "1px solid",
                borderColor: alpha("#1976d2", 0.1),
                background: alpha("#fff", 0.8),
                backdropFilter: "blur(8px)"
            }}>
                <CardContent sx={{ py: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Select
                                size="small"
                                value={station}
                                onChange={(e) => setStation(e.target.value)}
                                displayEmpty
                                sx={{ 
                                    width: 180, 
                                    borderRadius: 2,
                                    bgcolor: "background.paper"
                                }}
                            >
                                <MenuItem value="">All Stations</MenuItem>
                                {stations.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </Select>

                            <Button 
                                variant="contained" 
                                startIcon={<PlayArrowIcon />}
                                onClick={handleGenerate}
                                disabled={loading}
                                sx={{ borderRadius: 2, fontWeight: "bold", textTransform: "none" }}
                            >
                                Fetch Data
                            </Button>
                        </Stack>

                        <Stack direction="row" spacing={1.5}>
                            <Button 
                                variant="outlined" 
                                startIcon={<SaveIcon />}
                                disabled={!rows.length || loading}
                                sx={{ borderRadius: 2, textTransform: "none" }}
                            >
                                Save
                            </Button>
                            <Button 
                                variant="outlined" 
                                startIcon={<SaveAltIcon />}
                                disabled={!rows.length || loading}
                                sx={{ borderRadius: 2, textTransform: "none" }}
                            >
                                Save All
                            </Button>
                            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                            <Button 
                                variant="outlined" 
                                color="secondary"
                                startIcon={<PrintIcon />}
                                disabled={!rows.length || loading}
                                sx={{ borderRadius: 2, textTransform: "none" }}
                            >
                                Print
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {/* Data Viewport */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Card sx={{ borderRadius: 4, textAlign: "center", py: 10 }}>
                            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                                <CircularProgress size={80} thickness={2} />
                                <Box sx={{
                                    top: 0, left: 0, bottom: 0, right: 0, position: 'absolute',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <SensorsIcon color="primary" />
                                </Box>
                            </Box>
                            <Typography variant="h6" fontWeight="600" className="shimmer-text">
                                Scanning RFID Tags...
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Synchronizing frame numbers with trackside database
                            </Typography>
                        </Card>
                    </motion.div>
                ) : rows.length > 0 ? (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                            <CardContent sx={{ p: 0 }}>
                                <TagInfoTable rows={rows} />
                                <Box p={3} sx={{ bgcolor: alpha("#000", 0.01) }}>
                                    <PaginationControls page={page} setPage={setPage} totalPages={5} />
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <NoResult />
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
}