import { Box, Typography, Stack, alpha, Button } from "@mui/material";
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import { motion } from "framer-motion";

export default function NoResult({ 
  text = "No records found", 
  subtext = "Try adjusting your filters or selecting a different date range.",
  onClearFilters 
}) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      sx={{
        height: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
      }}
    >
      {/* Decorative Icon Container */}
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: "50%",
          bgcolor: alpha("#9e9e9e", 0.05),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed",
          borderColor: alpha("#9e9e9e", 0.2),
        }}
      >
        <SearchOffIcon sx={{ fontSize: 60, color: "text.disabled", opacity: 0.5 }} />
      </Box>

      <Stack spacing={1} alignItems="center">
        <Typography 
          variant="h6" 
          fontWeight="700" 
          color="text.primary"
          sx={{ letterSpacing: -0.5 }}
        >
          {text}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ maxWidth: 300, mb: 2 }}
        >
          {subtext}
        </Typography>

        {onClearFilters && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterListOffIcon />}
            onClick={onClearFilters}
            sx={{ 
              borderRadius: 2, 
              textTransform: "none", 
              fontWeight: "bold",
              mt: 1 
            }}
          >
            Clear All Filters
          </Button>
        )}
      </Stack>
    </Box>
  );
}