const REGION_H_MESSAGES = {
  1: "System Fault, Isolate or Restart KAVACH",
  2: "Ack Block Stop, SOS Generates in XX s",
  3: "Emergency Brake Bypassed (EB Cock Closed), No Traction",
  4: "Train Tripped, Select P_Trip",
  5: "Brake Applied, Dead End Detected",
  6: "Brake Applied,Movement in Statnd By Mode",
  7: "Brake applied,Rollback Detected",
  8: "REV Movement Not Allowed, Use REV mode",
  9: "Stand By mode- CAB input is not Active",
  10: "Ack SR mode, KAVACH Territory Exit",
  11: "Ack SR mode, Station Radio Comm Fail with station",
  12: "Ack SR Mode, No Track Profile Info",
  13: "Ack SR mode, Tags missing",
  14: "Ack SR mode, Direction Unknown",
  15: "Ack SR mode, GPS Fail",
  16: "Ack LS mode, Radio Comm Fail with Station",
  17: "Ack SR mode, TSR Link Fail",
  18: "Head On Collision with Loco XXXXX in YYYY m",
  19: "Rear End Collision with Loco XXXXX in YYYY m",
  20: "Override selected, Pass Signal in XXXs",
  21: "Reverse Mode Expires in XXXXm or YYYs",
  22: "Manned LC Gate XXXX in YYYYm",
  23: "Unmanned LC Gate XXXX in YYYYm",
  24: "LS mode Waiting for Radio Comm with Station",
  25: "LS mode Waiting for Track Profile Info",
  26: "Both Leading & Non-leading Inputs are Active",
  27: "Train Length Computation in Progress",
  28: "Train Length Computation Success (XXXXm)",
  29: "Train Length Computation Fail (XXXXm)",
  30: "Train Length Computation Aborted",
  31: "TurnOut in XXXXm with Speed Limit YYYkmph",
  32: "TSR in XXXXm with Speed Limit YYYkmph",
  33: "PSR in XXXXm with Speed Limit YYYkmph",
  34: "End of Authority in XXXXm",
  35: "KAVACH Territory Entry",
  36: "System Self Test in Progress",
  37: "System Self Test Success",
  38: "System Self Test Fail - XXXX",
  39: "Brakes Test Waiting for MR X.YY (X.YY)Kg/cm²",
  40: "Brakes Test Waiting for BP X.YY (X.YY)Kg/cm²",
  41: "Brakes Test NSB Applied, BP-X.YYKg/cm²",
  42: "Brakes Test FSB Applied, BP-X.YYKg/cm²",
  43: "Brakes Test EB Applied, BP-X.YYKg/cm²",
  44: "Brakes Test LE Brake Applied, BCX.YYKg/cm²",
  45: "Brakes Testing Success",
  46: "Brakes Testing Fail (NSB, FSB, EB)",
  47: "Brakes Testing Fail, Press ACK for Retest Brakes",
  48: "Select Train Configuration, Press 'CONFIG' Button",
  49: "Select Staff Responsible or Shunt Mode",
  50: "Approaching Radio Hole in XXXX m",
  51: "ACK OS Mode",
  52: "Train is in Fouling Zone, Normalize the Reverser",
  53: "SR/SH Mode - ETCS Territory Entry",
  54: "FS Mode - ETCS Full Supervision Mode",
  55: "ACK SR Mode - ETCS Territory Exit",
  56: "Ballise Default telegram received",
  57: "Waiting for Traction Command",
  58: "Traction cut-off Command fail",
  59: "Fouling Mark Entry",
  60: "Fouling Mark Clear",
  61: "Neutral Section approaching in XXX m",
  62: "Braking system malfunction",
  63: "Forward Movememnt not allowed in REVERSE mode",
  64: "ACK SR Mode - SR Authorization Received",
  65: "ACK SR Mode - Slip/Skid Detected",
  66: "ACK SR mode- Foreign Tag Detected",
  67: "Ack for SR mode - Odo Error detected",
  68: "Brake Applied- Shunting limits exceeded",
  69: "Brake Applied- Station General SoS",
  70: "Brake Applied-SPAD detected",
};

const REGION_I_MESSAGES = {
  1: "SOS - Self Loco (Manual)",
  2: "SOS - Self Loco (Stopped in Block section)",
  3: "SOS - Self Loco (Train Parted)",
  4: "SOS - From Loco XXXXXX (Manual)",
  5: "SOS - From Loco XXXXXX (Stopped in Block section)",
  6: "SOS - From Loco XXXXXX (Train Parted)",
  7: "SOS - From Station XXXXX (SOS to All Locos)",
  8: "SOS - From Station XXXXX (SOS to This Loco)",
  9: "Over Speed, Please Reduce Speed",
  10: "Brake Applied, Speed Limit Exceeded",
  11: "FSB will be applied in YYYS",
  12: "EB will be applied in YYYS",
  13: "BIU Isolated",
  14: "XXXXXXX Train Type selected",
};

const LP_ACK_MESSAGES = {
  1: "SOS - Self Loco (Manual)",
  2: "SOS - Self Loco (Stopped in Block section)",
  3: "SOS - Self Loco (Train Parted)",
  4: "SOS - From Loco XXXXXX (Manual)",
  5: "SOS - From Loco XXXXXX (Stopped in Block section)",
  6: "SOS - From Loco XXXXXX (Train Parted)",
  7: "SOS - From Station XXXXX (SOS to All Locos)",
  8: "SOS - From Station XXXXX (SOS to This Loco)",
  9: "Over-Speed, Please Reduce Speed",
  10: "Brake Applied, Speed Limit Exceeded",
  11: "FSB will be applied in YYYS",
  12: "EB will be applied in YYYS",
};

/* ================= EVENT NAME ================= */

export const decodeDMIEventName = (id) => {
  switch (Number(id)) {
    case 1:
      return "Train Type Selection";
    case 2:
      return "Region H Message";
    case 3:
      return "Region I Message";
    case 4:
      return "LP Acknowledgement";
    default:
      if (id >= 5 && id <= 254) return "Reserved";
      return "Invalid";
  }
};

/* ================= EVENT DESCRIPTION ================= */

export const decodeDMIEventDescription = (row) => {
  const id = Number(row.event_id);
  const data = row.event_data;

  if (!data) return "-";

  const bytes = data.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || [];

  /* ================= EVENT 1 ================= */
  if (id === 1 && bytes.length >= 8) {
    const B0 = bytes[0];
    const B1 = bytes[1];
    const B2 = bytes[2];
    const B3 = bytes[3];
    const B4 = bytes[4];
    const B5 = bytes[5];
    const B6 = bytes[6];
    const B7 = bytes[7];

    const trainTypeMap = {
      1: "LE",
      2: "LE Multi",
      3: "Empty Goods",
      4: "Loaded Goods",
      5: "Passenger (ICF)",
      6: "Passenger (LHB)",
      7: "EMU",
      8: "Train Set",
      9: "Parcel",
    };

    const trainLength = (B3 << 8) | B2;
    const brakeCRC = (B7 << 24) | (B6 << 16) | (B5 << 8) | B4;

    return `
Train Type: ${trainTypeMap[B0] || B0}
Coach Count: ${B1}
Train Length: ${trainLength}
Brake CRC: ${brakeCRC}
    `.trim();
  }

  /* ================= EVENT 2 ================= */
  if (id === 2 && bytes.length >= 6) {
    const B0 = bytes[0];
    const B1 = bytes[1];
    const B2 = bytes[2];
    const B3 = bytes[3];
    const B4 = bytes[4];
    const B5 = bytes[5];

    const targetDistance = (B3 << 8) | B2;
    const targetSpeed = (B5 << 8) | B4;

    return `Region H: ${REGION_H_MESSAGES[B0] || "Unknown"} | Time:${B1} | Dist:${targetDistance} | Speed:${targetSpeed}`;
  }

  /* ================= EVENT 3 ================= */
  if (id === 3 && bytes.length >= 1) {
    const B0 = bytes[0];

    return `Region I: ${REGION_I_MESSAGES[B0] || "Unknown"} | Code:${B0}`;
  }

  /* ================= EVENT 4 ================= */
  if (id === 4 && bytes.length >= 1) {
    const B0 = bytes[0];

    return `LP Ack: ${LP_ACK_MESSAGES[B0] || "Unknown"} | Code:${B0}`;
  }

  /* ================= RESERVED ================= */
  if (id >= 5 && id <= 254) {
    return `Reserved Event → Raw: ${data}`;
  }

  return "-";
};
/* ================= MAIN FORMATTER ================= */

export const formatDMICellValue = (row, key) => {
  const v = row[key];

  switch (key) {
    case "event_name":
      return decodeDMIEventName(row.event_id);

    case "event_description":
      return decodeDMIEventDescription(row);

    case "system_version":
      return Number(v) === 1 ? "KAVACH 4.0" : v;

    case "event_time":
      return v === "invalid" ? "Invalid" : (v ?? "-");

    case "packet_time":
      return v === "invalid" ? "Invalid" : (v ?? "-");

    default:
      return v ?? "-";
  }
};
