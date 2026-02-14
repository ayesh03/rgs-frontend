import { Grid, Card, CardContent, Typography, Box, Stack, alpha } from "@mui/material";
import { motion } from "framer-motion";
import TrainIcon from '@mui/icons-material/Train';
import RouterIcon from '@mui/icons-material/Router';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function FaultSummaryCards({ rows = [] }) {
  const totalLoco = rows.reduce((sum, r) => sum + (r.locoFaults || 0), 0);
  const totalGprs = rows.reduce((sum, r) => sum + (r.gprsFaults || 0), 0);
  const totalRfcom = rows.reduce((sum, r) => sum + (r.rfcomFaults || 0), 0);
  const totalAll = rows.reduce((sum, r) => sum + (r.total || 0), 0);

  const cardData = [
    { 
      label: "Loco Faults", 
      value: totalLoco, 
      color: "#1976d2", 
      icon: <TrainIcon />, 
      desc: "Onboard Unit Errors" 
    },
    { 
      label: "GPRS Faults", 
      value: totalGprs, 
      color: "#d32f2f", 
      icon: <RouterIcon />, 
      desc: "Network Comm Failures" 
    },
    { 
      label: "RFCOM Faults", 
      value: totalRfcom, 
      color: "#ed6c02", 
      icon: <RssFeedIcon />, 
      desc: "Radio Link Dropouts" 
    },
    { 
      label: "Total Faults", 
      value: totalAll, 
      color: "#2e7d32", 
      icon: <ErrorOutlineIcon />, 
      desc: "System-wide Events" 
    },
  ];

  return (
    <Grid container spacing={3}>
      {cardData.map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={item.label}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 4,
                boxShadow: `0 4px 20px ${alpha(item.color, 0.1)}`,
                border: "1px solid",
                borderColor: alpha(item.color, 0.1),
                height: "100%",
                background: `linear-gradient(135deg, #ffffff 0%, ${alpha(item.color, 0.02)} 100%)`,
              }}
            >
              {/* Visual Accent Strip */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '6px', 
                  height: '100%', 
                  bgcolor: item.color 
                }} 
              />
              
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography 
                      variant="overline" 
                      fontWeight="800" 
                      color="text.secondary" 
                      sx={{ letterSpacing: 1.2 }}
                    >
                      {item.label}
                    </Typography>
                    <Typography variant="h3" fontWeight={900} sx={{ color: item.color, my: 0.5 }}>
                      {item.value}
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 3, 
                      bgcolor: alpha(item.color, 0.1), 
                      color: item.color,
                      display: 'flex'
                    }}
                  >
                    {item.icon}
                  </Box>
                </Stack>
                
                <Typography variant="caption" color="text.secondary" fontWeight="500">
                  {item.desc}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
}