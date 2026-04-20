export const TAG_ALL_COLUMNS = [
  { key: "event_time", label: "Event Time" },
  { key: "kavach_id", label: "Kavach ID" },
  { key: "nms_id", label: "NMS ID" },
  { key: "message_sequence", label: "Sequence" },
  { key: "version", label: "Version" },

  { key: "tag_type", label: "Tag Type" },
  { key: "tag_type_raw", label: "Tag Type Raw" },
  { key: "tag_version", label: "Tag Version" },

  { key: "rfid_tag_id", label: "RFID Tag ID" },
  { key: "absolute_location", label: "Absolute Location" },

  { key: "lc_gate_applicability", label: "LC Gate Applicability" },
  { key: "direction", label: "Direction" },
  { key: "gate_id", label: "Gate ID" },
  { key: "gate_alpha", label: "Gate Alpha" },
  { key: "gate_type", label: "Gate Type" },
  { key: "distance_to_gate", label: "Distance (m)" },
  { key: "auto_whistle", label: "Auto Whistle" },
  { key: "whistle_type", label: "Whistle Type" },
  { key: "fill_zeros", label: "Fill Zeros" },

  { key: "tin_nominal", label: "TIN Nominal" },
  { key: "tin_reverse", label: "TIN Reverse" },

  { key: "station_id_nominal", label: "Station Nominal" },
  { key: "station_id_reverse", label: "Station Reverse" },

  { key: "section_nominal", label: "Section Nominal" },
  { key: "section_reverse", label: "Section Reverse" },

  { key: "tag_placement", label: "Placement" },
  { key: "tag_duplication", label: "Duplication" },

  { key: "comm_nominal", label: "Comm Nominal" },
  { key: "comm_reverse", label: "Comm Reverse" },

  { key: "tag_crc", label: "Tag CRC" },

  { key: "adjacent_tin_1", label: "Adj TIN 1" },
  { key: "adjacent_tin_2", label: "Adj TIN 2" },
  { key: "adjacent_tin_3", label: "Adj TIN 3" },
  { key: "adjacent_tin_4", label: "Adj TIN 4" },
  { key: "adjacent_tin_5", label: "Adj TIN 5" },

  { key: "abs_location_1", label: "Abs Loc 1" },
  { key: "abs_location_2", label: "Abs Loc 2" },

  { key: "tin_1", label: "TIN 1" },
  { key: "tin_2", label: "TIN 2" },

  { key: "dir_corr_1", label: "Dir Corr 1" },
  { key: "dir_corr_2", label: "Dir Corr 2" },

  { key: "section_1", label: "Section 1" },
  { key: "section_2", label: "Section 2" },

  { key: "loc_correction_type", label: "Loc Corr Type" },
  { key: "loc_correction_flag", label: "Loc Corr Flag" },

  { key: "reserved_future_use", label: "Reserved" },

  //   { key: "tag_raw", label: "Raw Tag" }
];

export const TAG_TYPE_COLUMNS = {
  NORMAL: [
    "tag_type",
    "tag_version",

    "rfid_tag_id",
    "absolute_location",

    "tin_nominal",
    "tin_reverse",

    "station_id_nominal",
    "station_id_reverse",

    "section_nominal",
    "section_reverse",

    "tag_placement",

    "tag_duplication",
    "comm_nominal",
    "comm_reverse",
  ],

  ADJACENT: [
    "tag_type",
    "tag_version",

    "rfid_tag_id",
    "absolute_location",

    "tin_nominal",
    "tin_reverse",

    "adjacent_tin_1",
    "adjacent_tin_2",
    "adjacent_tin_3",
    "adjacent_tin_4",
    "adjacent_tin_5",

    "tag_duplication",

    "fill_zeros",
  ],

  LC: [
    "tag_type",
    "tag_version",

    "rfid_tag_id",
    "absolute_location",

    "tin_nominal",
    "tin_reverse",

    "section_nominal",
    "section_reverse",

    "tag_placement",

    "lc_gate_applicability",
    "direction",

    "gate_id",
    "gate_alpha",
    "gate_type",

    "distance_to_gate",

    "auto_whistle",
    "whistle_type",

    "fill_zeros",

    "tag_duplication",
    "comm_nominal",
    "comm_reverse",
  ],

  JUNCTION: [
    "tag_type",
    "tag_version",

    "rfid_tag_id",

    "abs_location_1",

    "tin_1",
    "tin_2",

    "abs_location_2",

    "dir_corr_1",
    "dir_corr_2",

    "loc_correction_type",
    "loc_correction_flag",

    "section_1",
    "section_2",

    "reserved_future_use",

    "tag_duplication",

    "comm_nominal",
    "comm_reverse",
  ],
};
