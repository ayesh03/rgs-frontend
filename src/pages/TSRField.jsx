import { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    TextField,
    Select,
    MenuItem,
    alpha,
    Divider,
    Tooltip,
    Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import SpeedIcon from '@mui/icons-material/Speed';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

import StationSelectorDialog from "../components/StationSelectorDialog";
import TSRTable from "../components/TSRTable";
import PrintDialog from "../components/PrintDialog";

export default function TSRField() {
    const [stationDialogOpen, setStationDialogOpen] = useState(false);
    const [printOpen, setPrintOpen] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [selectedStations, setSelectedStations] = useState([]);

    const stations = ["STN001", "STN002", "STN003", "STN004"];
    
    const columns = [
        "Date", "Time", "Frame Number", "Station Code", "Loco ID",
        "RFID", "TSR ID", "Distance", "TSR Length", "Type",
        "VU", "VA", "VB", "VC", "Whistle",
    ];

    const mockRows = [
        {
            id: 1, date: "18/10/2017", time: "10:30:12", frameNo: "1234",
            station: "STN001", locoId: "L123", rfid: "RF45", tsrId: "TSR-01",
            distance: 1200, length: 300, type: "TEMP", vu: 40,
            va: 35, vb: 30, vc: 25, whistle: "YES",
        },
    ];

    // Initialize columns correctly on mount
    useEffect(() => {
        setSelectedColumns(columns);
    }, []);

    const handlePrintClick = () => {
        setPrintOpen(true);
    };

    return (
        <Box p={3} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            
            {/* Header */}
            <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                <Box sx={{ bgcolor: 'error.main', p: 1, borderRadius: 2, display: 'flex' }}>
                    <SpeedIcon sx={{ color: 'white' }} />
                </Box>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: -1 }}>
                        TSR Field Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Temporary Speed Restriction monitoring and synchronized trackside data.
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={3}>
                {/* Control Panel */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: alpha('#000', 0.1), boxShadow: 'none' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
                                
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Button
                                        variant="outlined"
                                        startIcon={<FilterAltIcon />}
                                        onClick={() => setStationDialogOpen(true)}
                                        sx={{ borderRadius: 2, fontWeight: 700 }}
                                    >
                                        Select Stations ({selectedStations.length})
                                    </Button>
                                    <Button variant="contained" sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}>
                                        Generate Report
                                    </Button>
                                </Stack>

                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Select size="small" displayEmpty value="" sx={{ width: 180, borderRadius: 2 }}>
                                        <MenuItem value="">Quick Jump to Station</MenuItem>
                                        {selectedStations.map((stn) => (
                                            <MenuItem key={stn} value={stn}>{stn}</MenuItem>
                                        ))}
                                    </Select>
                                    
                                    <Divider orientation="vertical" flexItem />

                                    <Tooltip title="Save Current View">
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40, p: 1, borderRadius: 2 }}>
                                            <SaveIcon fontSize="small" />
                                        </Button>
                                    </Tooltip>

                                    <Button 
                                        variant="contained" 
                                        color="secondary"
                                        startIcon={<PrintIcon />}
                                        onClick={handlePrintClick}
                                        sx={{ borderRadius: 2, fontWeight: 700 }}
                                    >
                                        Print
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Data Table */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>
                        <Box sx={{ px: 3, py: 2, bgcolor: alpha('#000', 0.02), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" fontWeight="800" color="text.secondary">
                                SYNCHRONIZED TSR RECORDS
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <TextField
                                    size="small"
                                    label="Records per page"
                                    select
                                    defaultValue={50}
                                    sx={{ width: 140, '& .MuiInputBase-root': { height: 32, fontSize: '0.75rem' } }}
                                >
                                    {["ALL", 50, 100, 500].map((v) => (
                                        <MenuItem key={v} value={v}>{v}</MenuItem>
                                    ))}
                                </TextField>
                                <Button size="small" startIcon={<DeleteSweepIcon />} color="error" sx={{ fontWeight: 700 }}>
                                    Clear Filter
                                </Button>
                            </Stack>
                        </Box>
                        <CardContent sx={{ p: 0 }}>
                            {mockRows.length > 0 ? (
                                <TSRTable rows={mockRows} />
                            ) : (
                                <Box textAlign="center" py={10}>
                                    <Typography variant="h6" color="text.disabled">No records within current station parameters.</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Dialogs */}
            <StationSelectorDialog
                open={stationDialogOpen}
                stations={stations}
                selectedStations={selectedStations}
                setSelectedStations={setSelectedStations}
                onClose={() => setStationDialogOpen(false)}
            />
            <PrintDialog
                open={printOpen}
                onClose={() => setPrintOpen(false)}
                columns={columns}
                selectedColumns={selectedColumns}
                setSelectedColumns={setSelectedColumns}
            />
        </Box>
    );
}