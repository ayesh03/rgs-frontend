import { Box, Button, Stack, TextField, alpha, Paper, InputAdornment, Select, MenuItem, } from "@mui/material";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

export default function ReportHeader({
  tableType,
  exceptionTab,
  exceptionType,
  onExceptionTypeChange,
  onTableTypeChange,
  stage = "FILTER", // FILTER | ENGINE | PREVIEW
  onGenerate,
  showAdvancedSearch = true,
  onClear,
  onPrint,
  onSave,
  onSaveAll,
  onColumns,
  onSearch,
  showSaveAll = true,
  showColumns = true,
  showTableType = true,
  rightContent,
  onAdvancedSearch,
}) {
  const isEngine = stage === "ENGINE";
  const isPreview = stage === "PREVIEW";
  const canExport = isPreview || isEngine;



  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      elevation={0}
      sx={{
        px: 4,
        py: 1,
        fontSize: "0.95rem",
        p: 1,
        mb: 0.5,
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
        {showAdvancedSearch && (
          <TextField
            size="small"
            placeholder="Search ID..."
            variant="outlined"
            onChange={(e) => onSearch?.(e.target.value)}
            sx={{
              width: 220,
              "& .MuiOutlinedInput-root": {
                bgcolor: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                fontSize: "0.85rem",
                borderRadius: "10px",
                py: 0.4,
                "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                "&:hover fieldset": { borderColor: "#4dabf7" },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "rgba(255,255,255,0.5)" }} />
                </InputAdornment>
              ),
            }}
          />
        )}

        {showTableType && (
          <Select
            size="small"
            value={tableType}
            onChange={(e) => onTableTypeChange?.(e.target.value)}
            sx={{
              width: 140,
              bgcolor: "rgba(255, 255, 255, 0.05)",
              color: "#fff",
              borderRadius: "6px",
              fontSize: "0.85rem",
              py: 0.4,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.1)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4dabf7" },
              "& .MuiSvgIcon-root": { color: "rgb(255, 255, 255)" }
            }}
          >
            <MenuItem value="onboard">Onboard</MenuItem>
            <MenuItem value="access">Access</MenuItem>
            <MenuItem value="route_rfid">Route RFID</MenuItem>
          </Select>
        )}

        {rightContent && (
          <Box sx={{ ml: 1 }}>
            {rightContent}
          </Box>
        )}
        {exceptionTab && (
          <Select
            size="small"
            value={exceptionType}
            onChange={(e) => onExceptionTypeChange?.(e.target.value)}
            sx={{
              width: 180,
              bgcolor: "rgba(255, 255, 255, 0.05)",
              color: "#fff",
              borderRadius: "6px",
              fontSize: "0.85rem",
              py: 0.4,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.1)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4dabf7" },
              "& .MuiSvgIcon-root": { color: "#fff" }
            }}
          >
            <MenuItem value="Emergency Brake">Emergency Brake</MenuItem>
            <MenuItem value="Loco SOS">Loco SOS</MenuItem>
            <MenuItem value="Override Mode">Override Mode</MenuItem>
            <MenuItem value="Trip Mode">Trip Mode</MenuItem>
          </Select>
        )}

        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onGenerate}
          disabled={isEngine}
          sx={{
            borderRadius: "6px",
            px: 4,
            py: 1,
            fontSize: "0.95rem",
            fontWeight: 800,
            textTransform: "none",
            background: "linear-gradient(45deg, #0b4dbb, #4dabf7)",
            boxShadow: "0 4px 14px 0 rgba(11, 77, 187, 0.39)",
            "&:hover": {
              background: "linear-gradient(45deg, #093d96, #3a96e0)",
            }
          }}
        >
          {isEngine ? "Generating..." : "Generate"}
        </Button>

        {onAdvancedSearch && (
          <Button
            variant="outlined"
            onClick={onAdvancedSearch}
            sx={{
              px: 2,
              py: 1,
              fontSize: "0.85rem",
              borderColor: "rgba(255,255,255,0.1)",
              color: "#eee",
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.05)" }
            }}
          >
            Advanced Search
          </Button>
        )}

        <Box sx={{ flexGrow: 1 }} />


        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={!canExport}
            sx={{
              px: 4,
              py: 1,
              fontSize: "0.95rem",
              borderColor: "rgba(255,255,255,0.1)",
              color: "#eee",
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.05)" }
            }}
          >
            Save
          </Button>

          {showSaveAll && (
            <Button
              variant="outlined"
              onClick={onSaveAll}
              disabled={!canExport}
              sx={{
                px: 4,
                py: 1,
                fontSize: "0.95rem",
                borderColor: "rgba(255,255,255,0.1)",
                color: "#eee",
                borderRadius: "10px",
                textTransform: "none",
                "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.05)" }
              }}
            >
              Save All
            </Button>
          )}

          {showColumns && (
            <Button
              variant="outlined"
              startIcon={<ViewColumnIcon />}
              onClick={onColumns}
              sx={{
                px: 4,
                py: 1,
                fontSize: "0.95rem",
                borderColor: "rgba(255,255,255,0.1)",
                color: "#eee",
                borderRadius: "10px",
                textTransform: "none",
                "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.05)" }
              }}
            >
              Columns
            </Button>
          )}

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<FilterListOffIcon />}
            onClick={onClear}
            sx={{
              px: 4,
              py: 1,
              fontSize: "0.95rem",
              borderColor: "rgba(255,255,255,0.1)",
              color: "#eee",
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.05)" }
            }}
          >
            Clear
          </Button>

          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={onPrint}
            disabled={!canExport}
            sx={{
              px: 4,
              py: 1,
              fontSize: "0.95rem",
              borderColor: "rgba(255,255,255,0.1)",
              color: "#eee",
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.05)" }
            }}
          >
            Print
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}