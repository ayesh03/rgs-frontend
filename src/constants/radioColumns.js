/* ===================== COMMON ===================== */

export const RADIO_COMMON_COLUMNS = [
  { key: "event_time", label: "Event Time" },
  { key: "msg_type", label: "Message Type" },
];

/* ===================== LOCO REGULAR ===================== */

export const LOCO_COLUMNS = [
  { key: "frame_number", label: "Frame No" },
  { key: "source_loco_id", label: "Loco ID" },
  { key: "source_loco_version", label: "Version" },
  { key: "absolute_loco_location", label: "Location" },
  { key: "train_speed_kmph", label: "Speed" },
  { key: "movement_direction", label: "Direction" },
  { key: "loco_mode", label: "Mode" },
];

/* ===================== ACCESS REQUEST ===================== */

export const ACCESS_REQ_COLUMNS = [
  { key: "frame_number", label: "Frame No" },
  { key: "source_loco_id", label: "Loco ID" },
  { key: "train_speed", label: "Speed" },
  { key: "approaching_station_id", label: "Approaching Station" },
];

/* ===================== STATION HEADER ===================== */

export const STATION_HEADER_COLUMNS = [
  { key: "frame_number", label: "Frame No" },
  { key: "source_stn_id", label: "Station ID" },
  { key: "dest_loco_id", label: "Loco ID" },
  { key: "pkt_direction", label: "Direction" },
];

/* ===================== MA ===================== */

export const MA_COLUMNS = [
  { key: "authority_type", label: "Authority Type" },
  { key: "ma_distance_m", label: "MA Distance" },
  { key: "sig_type", label: "Signal Type" },
];

/* ===================== SSP ===================== */

export const SSP_COLUMNS = [
  { key: "distance_m", label: "Distance" },
  { key: "speed_class", label: "Speed Class" },
];

/* ===================== GRADIENT ===================== */

export const GRADIENT_COLUMNS = [
  { key: "distance_m", label: "Distance" },
  { key: "gradient_raw", label: "Gradient" },
];

/* ===================== LC ===================== */

export const LC_COLUMNS = [
  { key: "distance_m", label: "Distance" },
  { key: "lc_id_numeric", label: "LC ID" },
];

/* ===================== TURNOUT ===================== */

export const TURNOUT_COLUMNS = [
  { key: "turnout_speed_code", label: "Speed" },
  { key: "start_distance_m", label: "Start Distance" },
];

/* ===================== TAG ===================== */

export const TAG_COLUMNS = [
  { key: "rfid_tag_id", label: "RFID" },
  { key: "dist_next_rfid_m", label: "Next Distance" },
];

/* ===================== TRACK ===================== */

export const TRACK_COLUMNS = [
  { key: "track_condition_type", label: "Condition" },
  { key: "length_m", label: "Length" },
];

/* ===================== TSR ===================== */

export const TSR_COLUMNS = [
  { key: "tsr_id", label: "TSR ID" },
  { key: "tsr_distance_m", label: "Distance" },
];

export const getRadioColumns = (rows = []) => {
  if (!rows.length) return RADIO_COMMON_COLUMNS;

  const sample = rows[0];

  // ================= LOCO =================
  if (sample.packet === "LOCO_REGULAR") {
    return [...RADIO_COMMON_COLUMNS, ...LOCO_COLUMNS];
  }

  // ================= ACCESS REQUEST =================
  if (sample.packet === "ACCESS_REQUEST") {
    return [...RADIO_COMMON_COLUMNS, ...ACCESS_REQ_COLUMNS];
  }

  // ================= STATION =================
  if (sample.packet === "STATION_REGULAR") {
    // detect sub packet type
    if ("authority_type" in sample) {
      return [...RADIO_COMMON_COLUMNS, ...STATION_HEADER_COLUMNS, ...MA_COLUMNS];
    }

    if ("speed_class" in sample) {
      return [...RADIO_COMMON_COLUMNS, ...STATION_HEADER_COLUMNS, ...SSP_COLUMNS];
    }

    if ("gradient_raw" in sample) {
      return [...RADIO_COMMON_COLUMNS, ...STATION_HEADER_COLUMNS, ...GRADIENT_COLUMNS];
    }

    if ("lc_id_numeric" in sample) {
      return [...RADIO_COMMON_COLUMNS, ...STATION_HEADER_COLUMNS, ...LC_COLUMNS];
    }

    if ("turnout_speed_code" in sample) {
      return [...RADIO_COMMON_COLUMNS, ...STATION_HEADER_COLUMNS, ...TURNOUT_COLUMNS];
    }

    if ("rfid_tag_id" in sample) {
      return [...RADIO_COMMON_COLUMNS, ...STATION_HEADER_COLUMNS, ...TAG_COLUMNS];
    }

    if ("track_condition_type" in sample) {
      return [...RADIO_COMMON_COLUMNS, ...STATION_HEADER_COLUMNS, ...TRACK_COLUMNS];
    }

    if ("tsr_id" in sample) {
      return [...RADIO_COMMON_COLUMNS, ...STATION_HEADER_COLUMNS, ...TSR_COLUMNS];
    }
  }

  return RADIO_COMMON_COLUMNS;
};