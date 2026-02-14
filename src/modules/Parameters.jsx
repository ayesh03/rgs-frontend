import { useState, useRef } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  alpha,
  Typography,
  Stack,
} from "@mui/material";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";

import ReportHeader from "../components/ReportHeader";
import ParametersPage from "../pages/Parameter";

export default function Parameters() {
  const [tab, setTab] = useState(0);
  const paramsRef = useRef(null);

  
  const [stage, setStage] = useState("FILTER");

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      {/* ===== REPORT HEADER ===== */}
      <ReportHeader
        stage={stage}                 
        showAdvancedSearch={false}
        onGenerate={() => paramsRef.current?.generate()}
        onClear={() => paramsRef.current?.clear()}
        onSave={() => paramsRef.current?.save()}
        onSaveAll={() => paramsRef.current?.saveAll()}
        onPrint={() => paramsRef.current?.print()}
      />

      {/* ===== SUB-HEADER ===== */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2} px={1}>
        <SettingsSuggestIcon color="primary" sx={{ fontSize: 20 }} />
        <Typography variant="subtitle2" fontWeight="800" color="text.secondary">
          VITAL SYSTEM CONFIGURATION & THRESHOLDS
        </Typography>
      </Stack>

      {/* ===== TABS ===== */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          mb: 1,
          bgcolor: alpha("#455a64", 0.03),
          border: "1px solid",
          borderColor: alpha("#455a64", 0.1),
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{
            px: 2,
            "& .MuiTab-root": { fontWeight: "bold", textTransform: "none" },
            "& .Mui-selected": { color: "primary.main" },
          }}
        >
          <Tab label="System Parameters" />
        </Tabs>
      </Paper>

      {/* ===== PAGE CONTENT ===== */}
      <Box
        sx={{
          minHeight: "60vh",
          animation: "fadeIn 0.4s ease-out",
        }}
      >
        {tab === 0 && (
          <ParametersPage
            ref={paramsRef}
            onStageChange={setStage}   
          />
        )}
      </Box>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            filter: blur(4px);
          }
          to {
            opacity: 1;
            filter: blur(0);
          }
        }
      `}</style>
    </Box>
  );
}
