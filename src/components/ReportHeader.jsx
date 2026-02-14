import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  Divider,
  alpha,
  Paper,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import {
  Select,
  MenuItem,
} from "@mui/material";

export default function ReportHeader({
  tableType,
  onTableTypeChange,
  stage = "FILTER", // FILTER | ENGINE | PREVIEW
  onGenerate,
  showAdvancedSearch = true,
  showException = false,
  onClear,
  onPrint,
  onSave,
  onSaveAll,
  onColumns,
  onSearch,
  showSaveAll = true,
  showColumns = true,
  showTableType = true,
}) {
  const isFilter = stage === "FILTER";
  const isEngine = stage === "ENGINE";
  const isPreview = stage === "PREVIEW";
  const canExport = isPreview || isEngine;


  return (
    <Paper
      elevation={0}
      sx={{
        p: 1,
        mb: 0.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: alpha("#f8f9fa", 0.5),
      }}
    >


      {/* ===== CONTROLS BAR ===== */}
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
        {showAdvancedSearch && (
          <TextField
            size="small"
            placeholder=""
            sx={{ width: 220, bgcolor: "background.paper" }}
            onChange={(e) => onSearch?.(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="disabled" />
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
      bgcolor: "background.paper",
      borderRadius: 2,
    }}
  >
    <MenuItem value="onboard">Onboard</MenuItem>
    <MenuItem value="access">Access</MenuItem>
  </Select>
)}


        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onGenerate}
          disabled={isEngine}
          sx={{ borderRadius: 2, px: 3, fontWeight: "bold" }}
        >
          Generate
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<SaveIcon />} onClick={onSave} disabled={!canExport}>
            Save
          </Button>

          {showSaveAll && (
            <Button variant="outlined" onClick={onSaveAll} disabled={!canExport}>
              Save All
            </Button>
          )}

          {showColumns && (
            <Button
              variant="outlined"
              startIcon={<ViewColumnIcon />}
              onClick={onColumns}
            >
              Column
            </Button>
          )}
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<FilterListOffIcon />}
            onClick={onClear}
          >
            Clear
          </Button>

          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={onPrint}
            disabled={!canExport}
          >
            Print
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
