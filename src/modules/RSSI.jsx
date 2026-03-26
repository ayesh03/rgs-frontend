import { useState, useRef, useCallback, useEffect } from "react";
import { Box, Tabs, Tab, Paper, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ReportHeader from "../components/ReportHeader";
import useExport from "../hooks/useExport";
import { useLocation } from "react-router-dom";

import { RSSI_EXPORT_COLUMNS } from "../constants/rssiColumns";
import RSSIPage from "../pages/RSSIPage";

export default function RSSI() {
    const theme = useTheme();
    const [tab, setTab] = useState(0);
    const { exportExcel, exportPDF } = useExport();

    const locoRef = useRef();        // 0x20
    const stationaryRef = useRef();  // 0x21

    const [stage, setStage] = useState("FILTER");
    const location = useLocation();

    const tabRefs = {
        0: locoRef,
        1: stationaryRef,
    };

    /* ===================== AUTO-GENERATE ===================== */
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

    /* ===================== ACTIONS ===================== */
    const handleAction = useCallback(async (type) => {
        const currentRef = tabRefs[tab]?.current;
        if (!currentRef) return;

        if (type === "generate") {
            setStage("ENGINE");
            await currentRef.generate();
            setStage("PREVIEW");
        }

        if (type === "clear") {
            currentRef.clear();
            setStage("FILTER");
        }
    }, [tab]);

    const handleExport = (format, all = false) => {
        const currentRef = tabRefs[tab]?.current;
        const rows = all
            ? currentRef?.getAllRows?.()
            : currentRef?.getFilteredRows?.();

        const cols = RSSI_EXPORT_COLUMNS;

        const fileName =
            tab === 0 ? "rssi_loco" : "rssi_stationary";

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
                onSearch={(v) =>
                    tabRefs[tab]?.current?.searchByRSSI?.(v)
                }
            />

            {/* ===== TABS ===== */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: "12px",
                    mb: 0.1,
                    p: 0.5,
                    bgcolor: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.08)",
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
                            fontSize: "1.2rem",
                            px: 4,
                            color: "rgba(255,255,255,0.4)",
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
                        },
                    }}
                >
                    <Tab label="Loco RSSI" />         {/* 0x20 */}
                    <Tab label="Stationary RSSI" />   {/* 0x21 */}
                </Tabs>
            </Paper>

            {/* ===== CONTENT ===== */}
            <Box sx={{ mt: 0.1 }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {tab === 0 && (
                            <RSSIPage
                                ref={locoRef}
                                type="LOCO"   // 0x20
                            />
                        )}
                        {tab === 1 && (
                            <RSSIPage
                                ref={stationaryRef}
                                type="STATIONARY" // 0x21
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </Box>
        </Box>
    );
}