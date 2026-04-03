import { useState, useRef, forwardRef, useEffect } from "react";
import { Box, Select, MenuItem } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

import ReportHeader from "../components/ReportHeader";
import useExport from "../hooks/useExport";

import AdjacentKavachInfoPage from "../pages/AdjacentKavachInfoPage";

/* ================= WRAPPERS ================= */

const PDIRequest = forwardRef((p, ref) => (
    <AdjacentKavachInfoPage ref={ref} tableType="pdi_req" />
));

const PDIResponse = forwardRef((p, ref) => (
    <AdjacentKavachInfoPage ref={ref} tableType="pdi_res" />
));

const HeartBeat = forwardRef((p, ref) => (
    <AdjacentKavachInfoPage ref={ref} tableType="heartbeat" />
));

const HandoverRequest = forwardRef((p, ref) => (
    <AdjacentKavachInfoPage ref={ref} tableType="handover_req" />
));

const RRI = forwardRef((p, ref) => (
    <AdjacentKavachInfoPage ref={ref} tableType="rri" />
));

const TakenOver = forwardRef((p, ref) => (
    <AdjacentKavachInfoPage ref={ref} tableType="taken_over" />
));

const Cancel = forwardRef((p, ref) => (
    <AdjacentKavachInfoPage ref={ref} tableType="cancel" />
));

const LengthInfo = forwardRef((p, ref) => (
    <AdjacentKavachInfoPage ref={ref} tableType="length_info" />
));

const LengthAck = forwardRef((p, ref) => (
    <AdjacentKavachInfoPage ref={ref} tableType="length_ack" />
));

const TSLRequest = forwardRef((p, ref) => (
    <AdjacentKavachInfoPage ref={ref} tableType="tsl_req" />
));

const TSLAuth = forwardRef((p, ref) => (
    <AdjacentKavachInfoPage ref={ref} tableType="tsl_auth" />
));

const FieldReq = forwardRef((p, ref) => (
    <AdjacentKavachInfoPage ref={ref} tableType="field_req" />
));

const FieldStatus = forwardRef((p, ref) => (
    <AdjacentKavachInfoPage ref={ref} tableType="field_status" />
));

const CancelAck = forwardRef((p, ref) => (
    <AdjacentKavachInfoPage ref={ref} tableType="cancel_ack" />
));

/* ================= MAIN ================= */

export default function AdjacentKavachInfo() {
    const [tab, setTab] = useState(0);
    const [stage, setStage] = useState("FILTER");
    const { exportExcel, exportPDF } = useExport();

    const refs = Array.from({ length: 14 }, () => useRef());

    const location = useLocation();

    useEffect(() => {
        const state = location.state;
        if (!state?.autoGenerate) return;

        const tabIndex = state.targetTab ?? 0;
        setTab(tabIndex);

        const run = () => {
            const ref = refs[tabIndex]?.current;
            if (!ref) return setTimeout(run, 100);

            setStage("ENGINE");
            ref.generate().then(() => setStage("PREVIEW"));
        };

        setTimeout(run, 200);
    }, [location.state]);

    const getCurrentRef = () => refs[tab]?.current;

    const getTableType = () => {
        const types = [
            "pdi_req","pdi_res","heartbeat","handover_req","rri","taken_over",
            "cancel","length_info","length_ack","tsl_req","tsl_auth",
            "field_req","field_status","cancel_ack"
        ];
        return types[tab];
    };

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

    const processExport = (fn, type = "filtered") => {
        const ref = getCurrentRef();
        if (!ref) return;

        const rows = type === "all" ? ref.getAllRows() : ref.getFilteredRows();
        const cols = ref.getVisibleColumns();

        if (rows && cols) fn(rows, cols, getTableType());
    };

    const components = [
        PDIRequest, PDIResponse, HeartBeat, HandoverRequest, RRI,
        TakenOver, Cancel, LengthInfo, LengthAck, TSLRequest,
        TSLAuth, FieldReq, FieldStatus, CancelAck
    ];

    const labels = [
        "PDI Version Req (0101)",
        "PDI Version Res (0102)",
        "Heart Beat (0103)",
        "Train Handover Req (0104)",
        "Train RRI (0105)",
        "Train Taken Over (0106)",
        "Handover Cancel (0107)",
        "Train Length Info (0108)",
        "Train Length Ack (0109)",
        "TSL Request (010A)",
        "TSL Authority (010B)",
        "Field Status Req (010C)",
        "Field Status (010D)",
        "Cancel Ack (010E)"
    ];

    const ActiveComponent = components[tab];

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ReportHeader
                stage={stage}
                showTableType={false}
                onGenerate={handleGenerate}
                onClear={handleClear}
                onColumns={() => getCurrentRef()?.openColumnDialog?.()}
                onSave={() => processExport(exportExcel)}
                onSaveAll={() => processExport(exportExcel, "all")}
                onPrint={() => processExport(exportPDF)}
                onSearch={(v) => getCurrentRef()?.searchById?.(v)}
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
                        {labels.map((l, i) => (
                            <MenuItem key={i} value={i}>{l}</MenuItem>
                        ))}
                    </Select>
                }
            />

            <Box sx={{ mt: 1.5 }}>
                <AnimatePresence mode="wait">
                    <motion.div key={tab}>
                        <ActiveComponent ref={refs[tab]} />
                    </motion.div>
                </AnimatePresence>
            </Box>
        </Box>
    );
}