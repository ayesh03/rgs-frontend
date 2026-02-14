import { Stack, IconButton, Select, MenuItem, Typography, Box, alpha } from "@mui/material";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export default function PaginationControls({
  page,
  setPage,
  totalPages = 1,
}) {
  // Ensure totalPages is at least 1 to prevent empty dropdowns
  const safeTotalPages = Math.max(1, totalPages);

  return (
    <Box 
      sx={{ 
        py: 0.2, 
        px: 1.5, 
        bgcolor: alpha('#f4f6f8', 0.8), 
        borderRadius: 1,
        border: '1px solid #e0e4e8',
        display: 'inline-block' // Keep it centered and only as wide as content
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        alignItems="center"
      >
        {/* Navigation Left */}
        <Stack direction="row" spacing={0}>
          <IconButton 
            size="small" 
            onClick={() => setPage(1)} 
            disabled={page === 1}
            sx={{ p: 0.4 }}
          >
            <FirstPageIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            sx={{ p: 0.4 }}
          >
            <NavigateBeforeIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>

        {/* Page Selector */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'text.secondary' }}>
            PAGE
          </Typography>
          
          <Select
            size="small"
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
            variant="standard"
            disableUnderline
            sx={{ 
              height: 24, 
              minWidth: 40, 
              fontSize: '0.75rem', 
              fontWeight: 900,
              bgcolor: 'background.paper',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              textAlign: 'center',
              '& .MuiSelect-select': { py: 0, px: 1 }
            }}
          >
            {Array.from({ length: safeTotalPages }).map((_, i) => (
              <MenuItem key={i + 1} value={i + 1} sx={{ fontSize: '0.75rem' }}>
                {i + 1}
              </MenuItem>
            ))}
          </Select>

          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'text.secondary' }}>
            OF {safeTotalPages}
          </Typography>
        </Stack>

        {/* Navigation Right */}
        <Stack direction="row" spacing={0}>
          <IconButton
            size="small"
            onClick={() => setPage((p) => Math.min(p + 1, safeTotalPages))}
            disabled={page === safeTotalPages}
            sx={{ p: 0.4 }}
          >
            <NavigateNextIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => setPage(safeTotalPages)}
            disabled={page === safeTotalPages}
            sx={{ p: 0.4 }}
          >
            <LastPageIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}