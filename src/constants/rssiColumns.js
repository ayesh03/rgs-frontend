export const RSSI_COLUMNS = [
  { key: "event_time", label: "Date / Time" },
  { key: "loco_kavach_id", label: "Loco ID" },
  { key: "stationary_kavach_id", label: "Stationary ID" },
  // { key: "frequency_channel", label: "Frequency Channel" },
  // { key: "d_ref_rfid", label: "Distance (m)" },
  { key: "nms_system_id", label: "NMS ID" },
  { key: "system_version", label: "System Version" },
  { key: "rssi1_sample_count", label: "Radio1 Count" },
  { key: "rssi2_sample_count", label: "Radio2 Count" },
];

export const RSSI_EXPORT_COLUMNS = [
  { key: "event_time", label: "Date / Time" },
  { key: "loco_kavach_id", label: "Loco ID" },
  { key: "stationary_kavach_id", label: "Stationary ID" },

  { key: "frequency_channel", label: "Frequency Channel" },
  { key: "nms_system_id", label: "NMS ID" },

  { key: "d_ref_rfid", label: "Distance (m)" },

  // counts
  { key: "rssi1_sample_count", label: "Radio1 Count" },
  { key: "rssi2_sample_count", label: "Radio2 Count" },

  // sample data (NOT in UI filter)
  { key: "radio", label: "Radio" },
  { key: "rfid", label: "RFID" },
  { key: "abs_location", label: "ABS Location" },
  { key: "rssi_dbm", label: "RSSI (dBm)" },
];

export const decodeSystemVersion = (v) => {
  const version = parseInt(v);

  if (version === 0) return "KAVACH 3.2";
  if (version === 1) return "KAVACH 4.0";
  return "-";
};