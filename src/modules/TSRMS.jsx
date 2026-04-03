import { useState, useRef, forwardRef, useEffect } from "react";
import { Box, Paper, Select, MenuItem, alpha } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

import ReportHeader from "../components/ReportHeader";
import useExport from "../hooks/useExport";

// 👉 You will create this next (like Stationarykavachinfo.jsx)
import TSRMSPage from "../pages/TSRMSPage";

/* ================= WRAPPER COMPONENTS ================= */

// 0x11
const TSRInformation = forwardRef((props, ref) => (
    <TSRMSPage ref={ref} tableType="tsr_info" />
));

// 0x12
const TSRDiagnostic = forwardRef((props, ref) => (
    <TSRMSPage ref={ref} tableType="tsr_diagnostic" />
));

// 0x13
const TSRFault = forwardRef((props, ref) => (
    <TSRMSPage ref={ref} tableType="tsr_fault" />
));

// 0x0201 / 0x0202
const PDIVersionCheck = forwardRef((props, ref) => (
    <TSRMSPage ref={ref} tableType="pdi_version" />
));

// 0x0203
const AllTSRInfo = forwardRef((props, ref) => (
    <TSRMSPage ref={ref} tableType="all_tsr_info" />
));

// 0x0204
const GetTSRInfo = forwardRef((props, ref) => (
    <TSRMSPage ref={ref} tableType="get_tsr_info" />
));

// 0x0205
const SKAVACHTSRData = forwardRef((props, ref) => (
    <TSRMSPage ref={ref} tableType="skavach_tsr_data" />
));

// 0x0206
const TSRIntegrity = forwardRef((props, ref) => (
    <TSRMSPage ref={ref} tableType="tsr_integrity" />
));

// 0x0207
const SKAVACHAck = forwardRef((props, ref) => (
    <TSRMSPage ref={ref} tableType="skavach_ack" />
));

/* ================= MAIN MODULE ================= */

export default function TSRMS() {
    const [tab, setTab] = useState(0);
    const [stage, setStage] = useState("FILTER");
    const { exportExcel, exportPDF } = useExport();

    const infoRef = useRef();
    const diagRef = useRef();
    const faultRef = useRef();
    const pdiRef = useRef();
    const allInfoRef = useRef();
    const getInfoRef = useRef();
    const skavachRef = useRef();
    const integrityRef = useRef();
    const ackRef = useRef();

    const location = useLocation();

    const tabRefs = {
        0: infoRef,
        1: diagRef,
        2: faultRef,
        3: pdiRef,
        4: allInfoRef,
        5: getInfoRef,
        6: skavachRef,
        7: integrityRef,
        8: ackRef,
    };

    /* ================= DASHBOARD AUTO GENERATE ================= */
    useEffect(() => {
        const state = location.state;
        if (!state?.autoGenerate) return;

        const tabIndex = state.targetTab ?? 0;
        setTab(tabIndex);

        const run = async () => {
            const tryGenerate = () => {
                const ref = tabRefs[tabIndex]?.current;
                if (!ref) {
                    setTimeout(tryGenerate, 100);
                    return;
                }

                setStage("ENGINE");
                ref.generate().then(() => setStage("PREVIEW"));
            };

            tryGenerate();
        };

        const timer = setTimeout(run, 200);
        return () => clearTimeout(timer);
    }, [location.state]);

    const getCurrentRef = () => tabRefs[tab]?.current;

    const getTableType = () => {
        switch (tab) {
            case 1: return "tsr_diagnostic";
            case 2: return "tsr_fault";
            case 3: return "pdi_version";
            case 4: return "all_tsr_info";
            case 5: return "get_tsr_info";
            case 6: return "skavach_tsr_data";
            case 7: return "tsr_integrity";
            case 8: return "skavach_ack";
            default: return "tsr_info";
        }
    };

    /* ================= ACTIONS ================= */

    const handleGenerate = async () => {
        const ref = getCurrentRef();
        if (!ref) return;

        setStage("ENGINE");
        await ref.generate();
        setStage("PREVIEW");
    };

    const handleClear = () => {
        const ref = getCurrentRef();
        if (!ref) return;

        ref.clear();
        setStage("FILTER");
    };

    const processExport = (exportFn, type = "filtered") => {
        const ref = getCurrentRef();
        if (!ref) return;

        const rows =
            type === "all" ? ref.getAllRows() : ref.getFilteredRows();

        let cols = ref.getVisibleColumns();

        if (rows && cols) {
            exportFn(rows, cols, getTableType());
        }
    };

    /* ================= UI ================= */

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <ReportHeader
                stage={stage}
                showTableType={false}
                onGenerate={handleGenerate}
                onClear={handleClear}
                onColumns={() => getCurrentRef()?.openColumnDialog?.()}
                onSave={() => processExport(exportExcel)}
                onSaveAll={() => processExport(exportExcel, "all")}
                onPrint={() => processExport(exportPDF)}
                onSearch={(value) =>
                    getCurrentRef()?.searchByTSR?.(value)
                }

                rightContent={
                        <Select
                            value={tab}
                            onChange={(e) => setTab(e.target.value)}
                            size="small"
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        background: "rgba(30, 30, 30, 0.95)",
                                        backdropFilter: "blur(10px)",
                                        color: "#fff",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                    },
                                },
                            }}
                            sx={{
                                color: "#fff",
                                fontWeight: 700,
                                borderRadius: "8px",
                                background: "rgba(255,255,255,0.03)",
                                backdropFilter: "blur(8px)",

                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "rgba(255,255,255,0.2)",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#4dabf7",
                                },
                                "& .MuiSvgIcon-root": {
                                    color: "#4dabf7",
                                },
                            }}
                        >
                            <MenuItem value={0}>TSR Information Message</MenuItem>
                            <MenuItem value={1}>TSR Diagnostic Message</MenuItem>
                            <MenuItem value={2}>TSR Fault Message</MenuItem>

                            <MenuItem value={3}>PDI Version Check(201)</MenuItem>
                            <MenuItem value={3}>PDI Version Check(202)</MenuItem>
                            <MenuItem value={4}>All TSR Information(203)</MenuItem>
                            <MenuItem value={5}>Get TSR Information(204)</MenuItem>
                            <MenuItem value={6}>TSR Data Message(205)</MenuItem>
                            <MenuItem value={7}>TSR Data Integrity Test(206)</MenuItem>
                            <MenuItem value={8}>Acknowledge Message(207)</MenuItem>
                        </Select>
                }
            />

            {/* ================= TAB CONTENT ================= */}
            <Box sx={{ mt: 1.5 }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {tab === 0 && <TSRInformation ref={infoRef} />}
                        {tab === 1 && <TSRDiagnostic ref={diagRef} />}
                        {tab === 2 && <TSRFault ref={faultRef} />}

                        {tab === 3 && <PDIVersionCheck ref={pdiRef} />}
                        {tab === 4 && <AllTSRInfo ref={allInfoRef} />}
                        {tab === 5 && <GetTSRInfo ref={getInfoRef} />}
                        {tab === 6 && <SKAVACHTSRData ref={skavachRef} />}
                        {tab === 7 && <TSRIntegrity ref={integrityRef} />}
                        {tab === 8 && <SKAVACHAck ref={ackRef} />}
                    </motion.div>
                </AnimatePresence>
            </Box>
        </Box>
    );
}