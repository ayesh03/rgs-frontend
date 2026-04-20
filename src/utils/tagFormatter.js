export const formatTagCellValue = (row, key) => {
  const v = row[key];

  if (v === undefined || v === null) return "-";

  // ================= COMMON =================
  if (key.includes("time")) {
    return v === "invalid" ? "Invalid" : v;
  }
  if (key === "version") {
    return v === 0 ? "KAVACH 3.2" : v === 1 ? "KAVACH 4.0" : "Reserved";
  }
  // ================= TAG TYPE =================
  if (key === "tag_type") {
    const map = {
      9: "NORMAL",
      10: "LC",
      11: "ADJACENT",
      12: "JUNCTION",
    };
    return map[v] || `UNKNOWN (${v})`;
  }

  // ================= VERSION =================
  if (key === "tag_version") {
    return v === 0 ? "KAVACH 3.2" : v === 1 ? "KAVACH 4.0" : "Reserved";
  }

  // ================= SECTION TYPE =================
  if (key.includes("section")) {
    const map = {
      0: "Station Section",
      1: "Absolute Block",
      2: "Automatic Section",
      3: "Virtual Block",
    };
    return map[v] || v;
  }

  // ================= TAG PLACEMENT =================
  if (key === "tag_placement") {
    const map = {
      0: "IN Line Section",
      1: "Signal Foot In Nominal Dir",
      2: "Signal Foot In Reverse Dir",
      3: "Turnout",
      4: "Exit in Nominal Dir",
      5: "Exit in Reverese Dir",
      6: "Signal foot in Both Dir",
      7: "Exit in Both Dir",
      8: "Dead Stop in Nominal Dir",
      9: "Dead Stop in Reverse Dir",
    };
    return map[v] || `Reserved (${v})`;
  }

  // ================= DUPLICATION =================
  if (key === "tag_duplication") {
    return v === 0 ? "Main Tag" : "Duplicate Tag";
  }

  // ================= COMMUNICATION =================
  if (key === "comm_nominal" || key === "comm_reverse") {
    return v === 0 ? "Required" : "Not Required";
  }

  // ================= LC TAG =================
  if (key === "direction") {
    return v === 0 ? "Nominal" : "Reverse";
  }

  if (key === "gate_type") {
    return v === 0 ? "Manned" : "Unmanned";
  }

  if (key === "auto_whistle") {
    return v === 0 ? "No" : "Yes";
  }

  if (key === "whistle_type") {
    return v === 0
      ? "Distance Based Auto Whistling"
      : "Time Based Auto whistling";
  }

  if (key === "gate_alpha") {
    const map = {
      0: "None",
      1: "a",
      2: "b",
      3: "c",
      4: "d",
      5: "e",
      6: "Out of Range",
    };
    return map[v] || "Spare";
  }

  if (key === "lc_gate_applicability") {
    const map = {
      0: "KAVACH",
      1: "Non-KAVACH First",
      2: "Non-KAVACH Second",
      3: "Spare",
    };
    return map[v] || v;
  }

  // ================= ADJACENT =================
  if (key.startsWith("adjacent_tin")) {
    return v === 0 ? "No Line" : v;
  }

  // ================= JUNCTION =================
  if (key === "dir_corr_1" || key === "dir_corr_2") {
    const map = {
      0: "Reset Unknown",
      1: "Nominal(Loco Dir) → Nominal(Next Tag)",
      2: "Nominal(Loco Dir) → Reverse(Next Tag)",
      3: "Reverse(Loco Dir) → Nominal(Next Tag)",
      4: "Reverse(Loco Dir) → Reverse(Next Tag)",
    };
    return map[v] || "Reserved";
  }

  // ================= JUNCTION =================
  if (key === "loc_correction_flag") {
    const map = {
      0: "Adjustment",
      1: "Reset",
    };
    return map[v] || "Reserved";
  }

  // ================= CRC =================
  if (key === "tag_crc") {
    return "0x" + Number(v).toString(16).toUpperCase();
  }

  // ================= DEFAULT =================
  return v;
};
