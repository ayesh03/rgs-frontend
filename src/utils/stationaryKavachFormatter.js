
/* ============================================================
   GENERIC SAFE DECODER
============================================================ */

export const decode = (map, value) =>
  map?.[value] !== undefined ? map[value] : value;

/* ============================================================
   PACKET TYPE
============================================================ */

export const PKT_TYPE_MAP = {
  9: "Station → Onboard Regular",
  10: "Onboard → Station Regular",
  11: "Access Authority",
  12: "Additional Emergency",
};
/* ---------------- PKT DIR ---------------- */

export const PKT_DIR_MAP = {
  0: "Unidentified",
  1: "Nominal",
  2: "Reverse",
  3: "Spare",
};

/* ---------------- REF PROFILE ID ---------------- */

export const formatRefProfile = (v) => {
  if (v === 0) return "0000 (No Profile / Route Unknown)";
  if (v >= 1 && v <= 15) return `Profile ${v}`;
  return "Reserved";
};


/* ============================================================
   MOVEMENT AUTHORITY – FULL ANNEXURE-C DECODE
============================================================ */
/* ---------------- DEST LOCO SOS ---------------- */

export const DEST_LOCO_SOS_MAP = {
  0: "No SoS",
  1: "Foreign RFID",
  2: "Reserved",
  3: "Onboard Odo Error ≥120m",
  4: "SPAD",
  5: "Rear End Collision",
  6: "Head On Collision",
  7: "Shunting Limit Violation",
  8: "Station General SoS",
};

/* ---------------- TRAIN SECTION TYPE ---------------- */

export const TRAIN_SECTION_TYPE_MAP = {
  0: "Station Section",
  1: "Absolute Block",
  2: "Autoblock",
  3: "Reserved",
};

/* ---------------- AUTHORITY TYPE ---------------- */

export const AUTHORITY_TYPE_MAP = {
  0: "Unused",
  1: "OS Authority",
  2: "FS Authority",
  3: "SR Authority",
};

/* ---------------- REQUEST SHORTEN MA ---------------- */

export const REQ_SHORTEN_MA_MAP = {
  0: "No",
  1: "Yes",
};

/* ---------------- TRAIN LENGTH INFO STATUS ---------------- */

export const TRAIN_LEN_INFO_STATUS_MAP = {
  0: "Not Present",
  1: "Present",
};

/* ---------------- TRAIN LENGTH INFO TYPE ---------------- */

export const TRAIN_LEN_INFO_TYPE_MAP = {
  0: "Start Frame Reference",
  1: "End Frame Reference",
};

/* ---------------- NEXT STATION COMM ---------------- */

export const NEXT_STN_COMM_MAP = {
  0: "No Handover",
  1: "Handover Required",
};


/* ---------------- SUB PACKET TYPE ---------------- */

export const SUB_PKT_TYPE_MA_MAP = {
  0: "Movement Authority",
};

/* ---------------- SIGNAL STOP ---------------- */

export const SIGNAL_STOP_MAP = {
  0: "No",
  1: "Yes",
};

/* ---------------- SIGNAL OVERRIDE ---------------- */

export const SIGNAL_OVERRIDE_MAP = {
  0: "Override at Standstill",
  1: "Override while Running",
};

/* ---------------- SIGNAL LINE NAME ---------------- */

export const SIGNAL_LINE_NAME_MAP = {
  0: "Up Signal",
  1: "Down Signal",
  2: "Up Fast",
  3: "Down Fast",
  8: "Up Slow",
  9: "Down Slow",
  10: "Up Main",
  11: "Down Main",
  12: "Up Sub",
  13: "Down Sub",
  14: "Up Bi-Direction",
  15: "Down Bi-Direction",
};

/* ---------------- SIGNAL LINE NUMBER ---------------- */

export const formatSignalLineNo = (v) => {
  if (v === 0) return "NA";
  if (v === 31) return "Line > 30";
  if (v === 30) return "Goods Line";
  return `Line ${v}`;
};

/* ---------------- SIGNAL TYPE (FULL TABLE) ---------------- */

export const SIGNAL_TYPE_MAP = {
  0: "Undefined",

  // Distant / Auto
  16: "Distant Signal",
  17: "Inner Distant",
  18: "Gate Distant",
  19: "Gate Inner Distant",
  20: "IB Distant",
  21: "IB Inner Distant",
  22: "Auto Signal",
  23: "Semi-Auto (A Marker Lit)",
  36: "Semi-Auto (No A Marker)",

  // Home Signals
  24: "Main Home",
  25: "Main Home (Junction)",
  26: "Routing Home",
  27: "Routing Home (Junction)",

  // Starter Signals
  28: "Mainline Starter",
  29: "Loopline Starter",
  30: "Intermediate Starter",

  // Misc Signals
  1: "Advance Starter",
  2: "IB Stop",
  3: "Gate Stop",
  4: "Calling On",
  5: "Adv Starter-cum-Gate",
  6: "Gate-cum-Distant",
  7: "Adv Starter-cum-Distant",

  35: "Gate Stop (Auto Territory)",
  37: "Adv Starter-cum-Gate Inner Distant",
  38: "Gate-cum-Inner Distant",
  39: "Gate Inner Distant-cum-Distant",
  40: "IB-cum-Gate Distant",
  41: "IB-cum-Gate Inner Distant",
  42: "IB-cum-Distant",
  43: "Adv Starter-cum-IB Distant",
  44: "Starter-cum-IB Distant",
  45: "Stop Board / Buffer Stop",
  46: "Gate-cum-IB Distant",
  47: "Gate-cum-IB Inner Distant",
  48: "Adv Starter-cum-Gate Distant",
};

/* ---------------- SIGNAL ASPECT (FULL 6-BIT TABLE) ---------------- */

export const SIGNAL_ASPECT_MAP = {
  0: "Unidentified",
  1: "Red",
  2: "Yellow",
  3: "Yellow (Route Left-1)",
  4: "Yellow (Route Left-2)",
  5: "Yellow (Route Left-3)",
  6: "Yellow (Route Right-1)",
  7: "Yellow (Route Right-2)",
  8: "Yellow (Route Right-3)",
  10: "Double Yellow",
  11: "Green",
  12: "Double Yellow (Left Route)",
  13: "Double Yellow (Right Route)",
  14: "AG Marker OFF",
  15: "Red with Calling-On",
  24: "Stop Board / Buffer Stop",
};

/* ---------------- AUTHORIZED SPEED ---------------- */

export const formatAuthorizedSpeed = (v) => {
  if (v >= 1 && v <= 50) return `${v * 5} kmph`;
  if (v >= 51 && v <= 61) return "Reserved";
  if (v === 62) return "8 kmph";
  if (v === 63) return "Unknown";
  return "Reserved";
};



/* ============================================================
   STATIC SPEED PROFILE
============================================================ */

export const SPEED_CLASS_TYPE_MAP = {
  0: "Universal",
  1: "Classified (A/B/C)",
};

export const SPEED_VALUE_FORMAT = (v) => {
  if (v >= 1 && v <= 50) return `${v * 5} kmph`;
  if (v >= 51 && v <= 61) return "Reserved";
  if (v === 62) return "8 kmph";
  if (v === 63) return "Unknown";
  return "Reserved";
};


/* ============================================================
   GRADIENT
============================================================ */

export const GRADIENT_DIR_MAP = {
  0: "Down",
  1: "Up",
};

export const GRADIENT_VALUE_FORMAT = (v) => {
  if (v === 0) return "Level / <= 1 in 1000";

  if (v >= 1 && v <= 30) {
    return `Between 1 in ${Math.floor(1000 / v)} and 1 in ${Math.floor(
      1000 / (v + 1)
    )}`;
  }

  return "Reserved";
};


// //* ============================================================
//    LC GATE PROFILE – FULL ANNEXURE FORMAT
// ============================================================ */

/* ---------------- SUB PACKET TYPE ---------------- */

export const SUB_PKT_TYPE_LC_MAP = {
  3: "LC Gate Profile",
};

/* ---------------- LC ID NUMERIC ---------------- */

export const formatLCNumericId = (v) => {
  if (v === 0) return "Invalid";
  if (v >= 1 && v <= 1021) return `Gate ${v}`;
  if (v === 1022) return "Out of Range";
  if (v === 1023) return "Spare";
  return "Reserved";
};

/* ---------------- LC ID SUFFIX ---------------- */

export const LC_SUFFIX_MAP = {
  0: "No Suffix",
  1: "a",
  2: "b",
  3: "c",
  4: "d",
  5: "e",
  6: "Out of Range",
  7: "Spare",
};

/* ---------------- LC MANNING ---------------- */

export const LC_MANNING_MAP = {
  0: "Manned",
  1: "Unmanned",
};

/* ---------------- LC CLASS ---------------- */

export const LC_CLASS_MAP = {
  0: "Spl",
  1: "A",
  2: "B1",
  3: "B2",
  4: "B",
  5: "C",
  6: "D",
  7: "Spare",
};

/* ---------------- AUTO WHISTLE ENABLE ---------------- */

export const AUTO_WHISTLE_MAP = {
  0: "No",
  1: "Yes",
};

/* ---------------- AUTO WHISTLE TYPE ---------------- */

export const AUTO_WHISTLE_TYPE_MAP = {
  0: "Distance Based",
  1: "Time Based (Not Used)",
  2: "Configured Pattern Based (Not Used)",
  3: "Spare",
};

/* ---------------- DISTANCE FORMAT ---------------- */

export const formatLCDistance = (v) => {
  if (v >= 0 && v <= 32760)
    return `${(v / 1000).toFixed(3)} km`;

  return "Out of Range";
};


/* ============================================================
   TURNOUT
============================================================ */

export const TURNOUT_SPEED_FORMAT = (v) => {
  if (v === 0) return "Not Used";

  // 00001 (1) → 5 kmph
  // 00010 (2) → 10 kmph
  // ...
  // 10010 (18) → 90 kmph
  if (v >= 1 && v <= 18) return `Upto ${v * 5} kmph`;

  // 10011 (19) – 11110 (30)
  if (v >= 19 && v <= 30) return "Reserved";

  // 11111 (31)
  if (v === 31) return "Unrestricted";

  return "Reserved";
};


/* ============================================================
   TAG LINKING
============================================================ */

export const DUP_TAG_DIR_MAP = {
  0: "Nominal ",
  1: "Reverse ",
};

export const ABS_LOC_RESET_MAP = {
  0: "No Reset",
  1: "Reset Active",
};
export const formatDistDupTag = (v) => {
  if (v === 0) return "< 1 meter";
  if (v === 15) return "Invalid";
  return `${v} meters`;
};

export const ADJ_LOCO_DIR_MAP = {
  0: "Not Known",
  1: "Nominal",
  2: "Reverse",
  3: "Deduce from Tags",
};

/* ============================================================
   TRACK CONDITION
============================================================ */

export const TRACK_CONDITION_MAP = {
  0: "Not Used",
  1: "Dead Stop",
  2: "Radio Hole",
  3: "Non Stopping Area",
  4: "Tunnel Stopping Area",
  5: "Neutral Section",
  6: "Sound Horn",
  7: "Reversing Area",
  8: "Fouling Mark Location",
  9: "KAVACH Territory Exit",
  10: "Reserved",
  11: "Reserved",
  12: "Reserved",
  13: "Reserved",
  14: "Reserved",
  15: "Reserved",
};




/* ============================================================
   TSR
============================================================ */

export const TSR_STATUS_MAP = {
  0: "No TSR",
  1: "No Latest TSR (SR Mode)",
  2: "Latest TSR Available",
  3: "Reserved",
};


export const TSR_CLASS_MAP = {
  0: "Universal",
  1: "Classified",
};
export const TSR_SPEED_FORMAT = (v) => {
  if (v === 0) return "Dead Stop";
  if (v >= 1 && v <= 40) return `${v * 5} kmph`;
  if (v >= 41 && v <= 61) return "Reserved";
  if (v === 62) return "8 kmph";
  if (v === 63) return "Unknown";
  return "Reserved";
};
export const TSR_WHISTLE_MAP = {
  0: "No Whistle",
  1: "Whistle Blow",
  2: "Spare",
  3: "Spare",
};


/* ============================================================
   ACCESS AUTHORITY
============================================================ */
export const KAVACH_VERSION_MAP = {
  0: "Not Used",
  1: "Kavach Spec 3.2",
  2: "Kavach Spec 4.0",
  3: "Reserved",
  4: "Reserved",
  5: "Reserved",
  6: "Reserved",
  7: "Reserved",
};


export const TDMA_SLOT_FORMAT = (v) => {
  if (v === 0) return "Not Nominated";
  if (v >= 1 && v <= 68) return `Slot ${v}`;
  if (v >= 100 && v <= 125) return "Reserved";
  if (v === 126) return "LTE/4G/5G";
  if (v === 127) return "Invalid";
  return "Reserved";
};


export const FREQUENCY_FORMAT = (ch) => {
  if (ch >= 1 && ch <= 2560)
    return `${(406 + ch * 0.025).toFixed(3)} MHz`;

  if (ch >= 2561 && ch <= 4093) return "Reserved";
  if (ch === 4094) return "LTE/4G/5G";
  if (ch === 4095) return "Invalid";

  return "Reserved";
};


/* ============================================================
   ADDITIONAL EMERGENCY
============================================================ */

export const GEN_SOS_MAP = {
  0: "No Manual SoS",
  1: "General SoS Triggered",
};
