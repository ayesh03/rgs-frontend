import { Box, Card, Typography, Stack } from "@mui/material";

export default function DataPreview({ rows = [], title }) {
  const locos = new Set(rows.map(r => r.locoId || r.loco_id));
  const stations = new Set(rows.map(r => r.station || r.station_code));

  return (
    <Card sx={{ mb: 1, p: 1.5, bgcolor: "#f9fafb", borderRadius: 2 }}>
      <Typography variant="caption" fontWeight={700}>
        {title}
      </Typography>

      <Stack direction="row" spacing={3} mt={0.5}>
        <Typography variant="caption">Records: {rows.length}</Typography>
        <Typography variant="caption">Locos: {locos.size}</Typography>
        <Typography variant="caption">Stations: {stations.size}</Typography>
      </Stack>
    </Card>
  );
}
