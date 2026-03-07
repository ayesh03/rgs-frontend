import { Box, Typography, Stack, alpha, Button } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { motion } from "framer-motion";

export default function NoResult({
  text = "No records found",
  subtext = "Try adjusting your filters or selecting a different date range.",
  onClearFilters,
}) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      sx={{
        height: 420,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
      }}
    >
      {/* Icon */}
      <Box
        component={motion.div}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        sx={{
          mb: 3,
          p: 3,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.03)",
          border: "1px dashed rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
        }}
      >
        <SearchOffIcon
          sx={{
            fontSize: 60,
            color: "rgba(255,255,255,0.35)",
          }}
        />
      </Box>

      <Stack spacing={1} alignItems="center">
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "18px",
            color: "#ffffff",
            letterSpacing: "0.3px",
          }}
        >
          {text}
        </Typography>

        <Typography
          sx={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.55)",
            maxWidth: 320,
            mb: 2,
          }}
        >
          {subtext}
        </Typography>

        {onClearFilters && (
          <Button
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            variant="outlined"
            size="small"
            startIcon={<FilterListOffIcon />}
            onClick={onClearFilters}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              color: "#e0e0e0",
              borderColor: "rgba(255,255,255,0.2)",
              px: 2,
              py: 0.5,
              "&:hover": {
                borderColor: "#4dabf7",
                bgcolor: alpha("#4dabf7", 0.08),
              },
            }}
          >
            Clear Filters
          </Button>
        )}
      </Stack>
    </Box>
  );
}