import {
  Stack,
  IconButton,
  Select,
  MenuItem,
  Typography,
  Box,
  alpha,
  Tooltip,
} from "@mui/material";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export default function PaginationControls({ page, setPage, totalPages = 1 }) {
  const safeTotalPages = Math.max(1, totalPages);

  // Common Icon Styling
  const iconButtonStyle = {
    p: 0.5,
    color: "rgba(255, 255, 255, 0.7)",
    "&.Mui-disabled": { color: "rgba(255, 255, 255, 0.15)" },
    "&:hover": { bgcolor: "rgba(77, 171, 247, 0.1)", color: "#4dabf7" },
  };

  return (
    <Box
      sx={{
        py: 0.5,
        px: 2,
        bgcolor: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(8px)",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        display: "inline-block",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="center"
      >
        {/* Navigation Left */}
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => setPage(1)}
            disabled={page === 1}
            sx={iconButtonStyle}
          >
            <FirstPageIcon sx={{ fontSize: 20 }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            sx={iconButtonStyle}
          >
            <NavigateBeforeIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>

        {/* Page Selector */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography
            sx={{
              fontSize: "0.8rem",
              fontWeight: 900,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: 1,
            }}
          >
            PAGE
          </Typography>

          <Tooltip title="Select Page">
            <Select
              size="small"
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
              variant="standard"
              disableUnderline
              sx={{
                height: 28,
                minWidth: 45,
                fontSize: "0.9rem",
                fontWeight: 800,
                color: "#4dabf7",
                bgcolor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(77, 171, 247, 0.3)",
                borderRadius: "6px",
                textAlign: "center",
                fontFamily: "'JetBrains Mono', monospace",
                "& .MuiSelect-select": { py: 0, px: 1 },
                "& .MuiSvgIcon-root": { display: "none" }, // Hide arrow for cleaner look
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: "#12161c",
                    border: "1px solid rgba(255,255,255,0.1)",
                    maxHeight: 200,
                    "& .MuiMenuItem-root": {
                      fontSize: "0.9rem",
                      color: "#fff",
                      justifyContent: "center",
                      "&:hover": { bgcolor: "rgba(77, 171, 247, 0.1)" },
                    },
                  },
                },
              }}
            >
              {Array.from({ length: safeTotalPages }).map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {i + 1}
                </MenuItem>
              ))}
            </Select>
          </Tooltip>

          <Typography
            sx={{
              fontSize: "0.9rem",
              fontWeight: 900,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: 1,
            }}
          >
            OF {safeTotalPages}
          </Typography>
        </Stack>

        {/* Navigation Right */}
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => setPage((p) => Math.min(p + 1, safeTotalPages))}
            disabled={page === safeTotalPages}
            sx={iconButtonStyle}
          >
            <NavigateNextIcon sx={{ fontSize: 20 }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => setPage(safeTotalPages)}
            disabled={page === safeTotalPages}
            sx={iconButtonStyle}
          >
            <LastPageIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
