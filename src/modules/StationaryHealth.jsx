import { useState, useRef, useCallback, useEffect } from "react";
import { Box, Tabs, Tab, Paper, alpha, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ReportHeader from "../components/ReportHeader";
import StationaryHealth from "../pages/Stationaryhealth";
import useExport from "../hooks/useExport";
import { useLocation } from "react-router-dom";

export default function Health() {
    const theme = useTheme();
    const [tab, setTab] = useState(0);
    const { exportExcel, exportPDF } = useExport();

    const stationaryRef = useRef();
    const onboardRef = useRef();

    const [stage, setStage] = useState("FILTER");
    const location = useLocation();

    const tabRefs = {
        0: stationaryRef,
        1: onboardRef,
    };

    /* ===================== AUTO-GENERATE LOGIC ===================== */
    useEffect(() => {
        const state = location.state;
        if (!state?.autoGenerate) return;

        if (state.tabIndex !== null && state.tabIndex !== undefined) {
            setTab(state.tabIndex);
        }

        const run = async () => {
            const currentTab = state.tabIndex ?? tab;
            const ref = tabRefs[currentTab]?.current;
            if (!ref) return;

            setStage("ENGINE");
            await ref.generate();
            setStage("PREVIEW");
        };

        const timer = setTimeout(run, 200);
        return () => clearTimeout(timer);
    }, [location.state]);

    /* ===================== ACTION HANDLERS ===================== */
    const handleAction = useCallback(async (actionType) => {
        const currentRef = tabRefs[tab]?.current;
        if (!currentRef) return;

        if (actionType === "generate") {
            setStage("ENGINE");
            await currentRef.generate();
            setStage("PREVIEW");
        }

        if (actionType === "clear") {
            currentRef.clear();
            setStage("FILTER");
        }
    }, [tab]);

    const handleExport = (format, all = false) => {
        const currentRef = tabRefs[tab]?.current;
        const rows = all ? currentRef?.getAllRows?.() : currentRef?.getFilteredRows?.();
        const cols = currentRef?.getVisibleColumns?.();
        const fileName = tab === 0 ? "health_stationary" : "health_onboard";

        if (rows && cols) {
            format === "excel" 
                ? exportExcel(rows, cols, fileName) 
                : exportPDF(rows, cols, fileName);
        }
    };

    return (
        <Box 
            sx={{ p: { xs: 1, md: 0.5 } }}
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <ReportHeader
                stage={stage}
                showTableType={false}
                showException={false}
                onGenerate={() => handleAction("generate")}
                onClear={() => handleAction("clear")}
                onColumns={() => tabRefs[tab]?.current?.openColumnDialog?.()}
                onSave={() => handleExport("excel", false)}
                onSaveAll={() => handleExport("excel", true)}
                onPrint={() => handleExport("pdf", false)}
            />

            {/* ===== GLASSMORPHISM TABS ===== */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: "12px",
                    mb: 0.1,
                    p: 0.5,
                    bgcolor: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(e, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 40,
                        "& .MuiTab-root": { 
                            fontWeight: 800, 
                            fontSize: "0.75rem",
                            px: 4,
                            color: "rgba(255,255,255,0.4)",
                            transition: "0.3s",
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            "&:hover": { color: "#fff" }
                        },
                        "& .Mui-selected": { 
                            color: theme.palette.primary.light + " !important" 
                        },
                        "& .MuiTabs-indicator": {
                            height: 3,
                            borderRadius: "3px 3px 0 0",
                            bgcolor: theme.palette.primary.light,
                            boxShadow: `0px 0px 10px ${theme.palette.primary.light}`,
                        },
                    }}
                >
                    <Tab label="Stationary Health" />
                    <Tab label="Onboard Health" />
                </Tabs>
            </Paper>

            {/* ===== CONTENT AREA ===== */}
            <Box sx={{ mt: 0.1 }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 10, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.99 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {tab === 0 && (
                            <StationaryHealth
                                ref={stationaryRef}
                                healthType="STATIONARY"
                            />
                        )}
                        {tab === 1 && (
                            <StationaryHealth
                                ref={onboardRef}
                                healthType="ONBOARD"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </Box>
        </Box>
    );
}