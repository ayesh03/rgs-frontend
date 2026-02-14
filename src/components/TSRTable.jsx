import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, Typography, alpha, Chip } from "@mui/material";
import CampaignIcon from '@mui/icons-material/Campaign';

const columns = [
  { field: "date", headerName: "Date", width: 110, headerClassName: 'super-app-theme--header' },
  { field: "time", headerName: "Time", width: 100 },
  { field: "frameNo", headerName: "Frame", width: 100, align: 'center', 
    renderCell: (params) => <Typography variant="caption" sx={{ fontFamily: 'Monospace' }}>{params.value}</Typography>
  },
  { field: "station", headerName: "Station", width: 110, cellClassName: 'font-weight-bold' },
  { field: "locoId", headerName: "Loco ID", width: 100 },
  { field: "rfid", headerName: "RFID Loc", width: 100 },
  { field: "tsrId", headerName: "TSR ID", width: 90, 
    renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" sx={{ borderRadius: 1, height: 20, fontSize: '0.65rem' }} />
  },
  { field: "distance", headerName: "Dist (m)", type: 'number', width: 100 },
  { field: "length", headerName: "Len (m)", type: 'number', width: 100 },
  { field: "type", headerName: "Type", width: 90 },
  // Speed Supervision Group
  { field: "vu", headerName: "VU", type: 'number', width: 70, description: 'Upper Limit Speed' },
  { field: "va", headerName: "VA", type: 'number', width: 70, description: 'Authority Speed' },
  { field: "vb", headerName: "VB", type: 'number', width: 70, description: 'Braking Curve' },
  { field: "vc", headerName: "VC", type: 'number', width: 70, description: 'Caution Speed' },
  { 
    field: "whistle", 
    headerName: "Whistle", 
    width: 110,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: params.value === 'ON' ? 'primary.main' : 'text.disabled' }}>
        <CampaignIcon sx={{ fontSize: 16 }} />
        <Typography variant="caption" fontWeight="bold">{params.value}</Typography>
      </Box>
    )
  },
];

export default function TSRTable({ rows }) {
  return (
    <Box 
      sx={{ 
        height: 600, 
        width: "100%",
        '& .super-app-theme--header': { bgcolor: alpha('#1976d2', 0.05) },
        '& .font-weight-bold': { fontWeight: 700 },
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        density="compact"
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        pageSizeOptions={[50, 100, 500]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 50, page: 0 },
          },
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 800, fontSize: '0.7rem', color: 'text.secondary' },
          '& .MuiDataGrid-cell': { borderBottom: `1px solid ${alpha('#000', 0.04)}` },
        }}
        disableRowSelectionOnClick
      />
    </Box>
  );
}