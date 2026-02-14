/* ===================== ONBOARD ===================== */

export const ONBOARD_COLUMNS = [
  { key: "date", label: "Date / Time" },


  { key: "frame_number", label: "Frame No" },
  { key: "source_loco_id", label: "Loco ID" },
  { key: "source_loco_version", label: "Loco Version" },

  { key: "absolute_loco_location", label: "Absolute Location" },

  { key: "l_doubt_over", label: "L Doubt Over" },
  { key: "l_doubt_under", label: "L Doubt Under" },
  { key: "train_integrity_status", label: "Train Integrity" },

  { key: "train_length_m", label: "Train Length (m)" },
  { key: "train_speed_kmph", label: "Speed (kmph)" },

  { key: "movement_direction", label: "Direction" },
  { key: "loco_mode", label: "Loco Mode" },
  { key: "emergency_status", label: "Emergency" },

  { key: "last_rfid_tag_id", label: "Last RFID" },
  { key: "tag_duplicate_status", label: "RFID Duplicate" },
  { key: "tag_link_information", label: "Tag Link Info" },

  { key: "tin", label: "TIN" },

  { key: "brake_applied_status", label: "Brake Applied" },
  { key: "new_ma_reply_status", label: "New MA Reply" },
  { key: "last_ref_profile_number", label: "Last Ref Profile" },
  { key: "signal_override_status", label: "Signal Override" },
  { key: "info_ack_status", label: "Info Ack" },
  

  { key: "onboard_health_byte_1", label: "Health Byte 1" },
];

/* ===================== ACCESS ===================== */

export const ACCESS_COLUMNS = [
  { key: "date", label: "Date / Time" },

  { key: "frame_number", label: "Frame No" },
  { key: "source_loco_id", label: "Loco ID" },
  { key: "source_loco_version", label: "Loco Version" },

  { key: "absolute_loco_location", label: "Absolute Location" },
  { key: "train_length", label: "Train Length" },
  { key: "train_speed", label: "Speed" },

  { key: "movement_direction", label: "Direction" },
  { key: "loco_mode", label: "Loco Mode" },
  { key: "emergency_status", label: "Emergency" },

  { key: "approaching_station_id", label: "Approaching Station" },
  { key: "last_rfid_tag", label: "Last RFID" },
  { key: "tin", label: "TIN" },

  { key: "longitude", label: "Longitude" },
  { key: "latitude", label: "Latitude" },
  { key: "loco_random_number", label: "Loco Random No" },
];
