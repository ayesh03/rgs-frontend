/* ===================== HELPERS ===================== */

const signed8 = (v) => (v & 0x80 ? v - 0x100 : v);

const formatTemp = (v) => `${signed8(v)} °C`;
const formatVolt = (v) => `${v} V`;
const formatAmp = (v) => `${v} A`;
const formatWatt = (v) => `${(v / 10).toFixed(1)} W`;
const formatMs = (v) => `${v} ms`;

const hex16 = (v) => `0x${(v & 0xFFFF).toString(16).toUpperCase().padStart(4, "0")}`;
const hex32 = (v) => `0x${(v >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;

const extractLocoId3B = (v) => (v >>> 8);
const extractLastByte = (v) => (v & 0xFF);
const extractModuleId = (v) => (v >>> 4);
const extractModuleHealth = (v) => (v & 0x0F);

/* ===================== COMMON ENUMS ===================== */

const radioHealth = {
  1: "OK",
  2: "Diagnostic Link Fail",
  3: "Radio Fail"
};

const gpsView = {
  0: "No Data",
  1: "V",
  2: "A"
};

const gpsLinkStatus = {
  0: "GPS Link & PPS Fail",
  1: "GPS Link Fail, PPS OK",
  2: "GPS Link OK, PPS Fail",
  3: "GPS Link OK, PPS OK"
};

const moduleHealth = {
  0: "NOT OK",
  1: "OK"
};

export const decodeSystemVersion = (v) => {
  const version = parseInt(v);

  if (version === 0) return "KAVACH 3.2";
  if (version === 1) return "KAVACH 4.0";
  return "-";
};
/* =========================================================
   ===================== 0x17 STATIONARY ===================
========================================================= */

export function formatStationaryHealth(eventId, value) {

  const map = {

    1: { name: "System Temperature", desc: formatTemp(value) },
    2: { name: "Active Radio Number", desc: ["Not Used", "Radio 1", "Radio 2", "Both Radio Active"][value] || value },

    3: { name: "Radio-1 Health", desc: radioHealth[value] || value },
    4: { name: "Radio-2 Health", desc: radioHealth[value] || value },

    5: { name: "Radio-1 Input Supply", desc: formatVolt(value) },
    6: { name: "Radio-2 Input Supply", desc: formatVolt(value) },

    7: { name: "Radio-1 Temperature", desc: formatTemp(value) },
    8: { name: "Radio-2 Temperature", desc: formatTemp(value) },

    9: { name: "Radio-1 PA Temperature", desc: `${value} °C` },
    10: { name: "Radio-2 PA Temperature", desc: `${value} °C` },

    11: { name: "Radio-1 PA Supply Voltage", desc: formatVolt(value) },
    12: { name: "Radio-2 PA Supply Voltage", desc: formatVolt(value) },

    13: { name: "Radio-1 Tx PA Current", desc: formatAmp(value) },
    14: { name: "Radio-2 Tx PA Current", desc: formatAmp(value) },

    15: { name: "Radio-1 Reverse Power", desc: formatWatt(value) },
    16: { name: "Radio-2 Reverse Power", desc: formatWatt(value) },

    17: { name: "Radio-1 Forward Power", desc: formatWatt(value) },
    18: { name: "Radio-2 Forward Power", desc: formatWatt(value) },

    19: { name: "Current Running Key", desc: value === 0 ? "Default Key Set" : `KMS Key Set ${value}` },
    20: { name: "Remaining Number of Keys", desc: value === 0 ? "No Keys" : `${value} Keys Remaining` },

    21: { name: "Session Key Checksum", desc: hex16(value) },

    22: { name: "Allocated Time Slot for New Loco", desc: value },

    23: { name: "New Loco Regular Packet Time Offset", desc: formatMs(value) },

    24: { name: "Loco Count", desc: value },

    25: { name: "Radio-1 Rx Packet Count", desc: value },
    26: { name: "Radio-2 Rx Packet Count", desc: value },

    27: { name: "Active GPS Number", desc: ["No Active GPS", "GPS 1", "GPS 2", "Both GPS"][value] || value },

    28: { name: "GPS-1 View", desc: gpsView[value] || value },
    29: { name: "GPS-2 View", desc: gpsView[value] || value },

    30: { name: "GPS-1 Seconds", desc: `${value} sec` },
    31: { name: "GPS-2 Seconds", desc: `${value} sec` },

    32: { name: "GPS-1 Satellites in View", desc: value },
    33: { name: "GPS-1 CNO (Max)", desc: value },

    34: { name: "GPS-2 Satellites in View", desc: value },
    35: { name: "GPS-2 CNO (Max)", desc: value },

    36: { name: "GSM-1 RSSI", desc: value },
    37: { name: "GSM-2 RSSI", desc: value },

    38: { name: "Missing RFID", desc: `Tag: ${value}` },
    39: { name: "Invalid RFID", desc: `Tag: ${value}` },
    40: { name: "Conflict Route RFID", desc: `Tag: ${value}` },
    41: { name: "Conflicting TIN", desc: value },
    42: { name: "Missing TIN", desc: value }
  };

  if (map[eventId]) return map[eventId];

  if (eventId === 43) {
    const loco = extractLocoId3B(value);
    const code = extractLastByte(value);
    const sosMap = {
      1: "Wrong Route Tag",
      2: "Collision Detection",
      3: "Shunt Limits Violation",
      4: "Invalid Position Report",
      5: "Signal Set to Conflicting Route"
    };
    return { name: "Loco Specific SoS", desc: `Loco ${loco} – ${sosMap[code] || code}` };
  }

  if (eventId === 44) {
    const loco = extractLocoId3B(value);
    const code = extractLastByte(value);
    const exitMap = {
      1: "Unknown Direction SR/SB",
      2: "Out of Station Boundary",
      3: "Specific Mode (IS/NL)",
      4: "Authentication Failure",
      5: "Communication Timeout",
      6: "Train Handover",
      7: "Handover Cancellation"
    };
    return { name: "Train Exit Mode", desc: `Loco ${loco} – ${exitMap[code] || code}` };
  }

  if (eventId === 45) {
    return {
      name: "Station Modules Health",
      desc: `Module ${extractModuleId(value)} – ${moduleHealth[extractModuleHealth(value)]}`
    };
  }

  if (eventId >= 46 && eventId <= 199)
    return { name: "Reserved", desc: "Reserved Field" };

  if (eventId >= 200 && eventId <= 254)
    return { name: "Firm Specific Event", desc: value };

  if (eventId === 255)
    return { name: "Invalid", desc: "Not to be used" };

  return { name: `Unknown Event ${eventId}`, desc: value };
}

/* =========================================================
   ===================== 0x18 ONBOARD ======================
========================================================= */

export function formatOnboardHealth(eventId, value) {
  
  /* ===================== EVENT ID 1: Radio-2 Health ===================== */
  if (eventId === 1) {
    const radioHealthMap = {
      1: "OK",
      2: "Diagnostic Link Fail",
      3: "Radio Fail"
    };
    return { name: "Radio-2 Health", desc: radioHealthMap[value] || value };
  }

  /* ===================== EVENT ID 2: Radio-1 Input Supply ===================== */
  if (eventId === 2) {
    return { name: "Radio-1 Input Supply", desc: `${value}V (10V-30V)` };
  }

  /* ===================== EVENT ID 3: Radio-2 Input Supply ===================== */
  if (eventId === 3) {
    return { name: "Radio-2 Input Supply", desc: `${value}V (10V-30V)` };
  }

  /* ===================== EVENT ID 4: Radio-1 Temperature ===================== */
  if (eventId === 4) {
    const tempSigned = signed8(value);
    return { name: "Radio-1 Temperature", desc: `${tempSigned}°C (-30°C to 70°C)` };
  }

  /* ===================== EVENT ID 5: Radio-2 Temperature ===================== */
  if (eventId === 5) {
    const tempSigned = signed8(value);
    return { name: "Radio-2 Temperature", desc: `${tempSigned}°C (-30°C to 70°C)` };
  }

  /* ===================== EVENT ID 6: Radio-1 PA Temperature ===================== */
  if (eventId === 6) {
    return { name: "Radio-1 PA Temperature", desc: `${value}°C (20°C to 100°C)` };
  }

  /* ===================== EVENT ID 7: Radio-2 PA Temperature ===================== */
  if (eventId === 7) {
    return { name: "Radio-2 PA Temperature", desc: `${value}°C (20°C to 100°C)` };
  }

  /* ===================== EVENT ID 8: Radio-1 PA Supply Voltage ===================== */
  if (eventId === 8) {
    return { name: "Radio-1 PA Supply Voltage", desc: `${value}V (11V-13V)` };
  }

  /* ===================== EVENT ID 9: Radio-2 PA Supply Voltage ===================== */
  if (eventId === 9) {
    return { name: "Radio-2 PA Supply Voltage", desc: `${value}V (11V-13V)` };
  }

  /* ===================== EVENT ID 10: Radio-1 Tx PA Current ===================== */
  if (eventId === 10) {
    const ampValue = (value / 10).toFixed(1);
    return { name: "Radio-1 Tx PA Current", desc: `${ampValue}A (1.5A to 3.2A)` };
  }

  /* ===================== EVENT ID 11: Radio-2 Tx PA Current ===================== */
  if (eventId === 11) {
    const ampValue = (value / 10).toFixed(1);
    return { name: "Radio-2 Tx PA Current", desc: `${ampValue}A (1.5A to 3.2A)` };
  }

  /* ===================== EVENT ID 12: Radio-1 Reverse Power ===================== */
  if (eventId === 12) {
    const powerValue = (value / 10).toFixed(1);
    return { name: "Radio-1 Reverse Power", desc: `${powerValue}W (0x${value.toString(16).toUpperCase()})` };
  }

  /* ===================== EVENT ID 13: Radio-2 Reverse Power ===================== */
  if (eventId === 13) {
    const powerValue = (value / 10).toFixed(1);
    return { name: "Radio-2 Reverse Power", desc: `${powerValue}W (0x${value.toString(16).toUpperCase()})` };
  }

  /* ===================== EVENT ID 14: Radio-1 Forward Power ===================== */
  if (eventId === 14) {
    const powerValue = (value / 10).toFixed(1);
    return { name: "Radio-1 Forward Power", desc: `${powerValue}W (0x${value.toString(16).toUpperCase()})` };
  }

  /* ===================== EVENT ID 15: Radio-2 Forward Power ===================== */
  if (eventId === 15) {
    const powerValue = (value / 10).toFixed(1);
    return { name: "Radio-2 Forward Power", desc: `${powerValue}W (0x${value.toString(16).toUpperCase()})` };
  }

  /* ===================== EVENT ID 16: Stationary Regular Packet Received Time Offset ===================== */
  if (eventId === 16) {
    return { name: "Stationary Regular Packet Received Time Offset", desc: `${value}ms (0-2000ms)` };
  }

  /* ===================== EVENT ID 17: Active GPS Number ===================== */
  if (eventId === 17) {
    const gpsMap = {
      0: "No Active GPS",
      1: "GPS 1",
      2: "GPS 2",
      3: "Both GPS"
    };
    return { name: "Active GPS Number", desc: gpsMap[value] || value };
  }

  /* ===================== EVENT ID 18: GPS-1 View Status ===================== */
  if (eventId === 18) {
    const gpsViewMap = {
      0: "No Data",
      1: "V",
      2: "A"
    };
    return { name: "GPS-1 View Status", desc: gpsViewMap[value] || value };
  }

  /* ===================== EVENT ID 19: GPS-2 View Status ===================== */
  if (eventId === 19) {
    const gpsViewMap = {
      0: "No Data",
      1: "V",
      2: "A"
    };
    return { name: "GPS-2 View Status", desc: gpsViewMap[value] || value };
  }

  /* ===================== EVENT ID 20: GPS-1 Seconds ===================== */
  if (eventId === 20) {
    return { name: "GPS-1 Seconds", desc: `${value}s (0-59s)` };
  }

  /* ===================== EVENT ID 21: GPS-2 Seconds ===================== */
  if (eventId === 21) {
    return { name: "GPS-2 Seconds", desc: `${value}s (0-59s)` };
  }

  /* ===================== EVENT ID 22: GPS-1 Satellites in View ===================== */
  if (eventId === 22) {
    return { name: "GPS-1 Satellites in View", desc: `${value}` };
  }

  /* ===================== EVENT ID 23: GPS-1 CNO (Max) ===================== */
  if (eventId === 23) {
    return { name: "GPS-1 CNO (Max)", desc: `${value}` };
  }

  /* ===================== EVENT ID 24: GPS-2 Satellites in View ===================== */
  if (eventId === 24) {
    return { name: "GPS-2 Satellites in View", desc: `${value}` };
  }

  /* ===================== EVENT ID 25: GPS-2 CNO (Max) ===================== */
  if (eventId === 25) {
    return { name: "GPS-2 CNO (Max)", desc: `${value}` };
  }

  /* ===================== EVENT ID 26: GPS-1 Link Status ===================== */
  if (eventId === 26) {
    const gpsLinkMap = {
      0: "Both GPS link and PPS fail",
      1: "GPS link fail and PPS ok",
      2: "GPS link ok and PPS fail",
      3: "GPS link ok and PPS ok"
    };
    return { name: "GPS-1 Link Status", desc: gpsLinkMap[value] || value };
  }

  /* ===================== EVENT ID 27: GPS-2 Link Status ===================== */
  if (eventId === 27) {
    const gpsLinkMap = {
      0: "Both GPS link and PPS fail",
      1: "GPS link fail and PPS ok",
      2: "GPS link ok and PPS fail",
      3: "GPS link ok and PPS ok"
    };
    return { name: "GPS-2 Link Status", desc: gpsLinkMap[value] || value };
  }

  /* ===================== EVENT ID 28: GSM-1 RSSI ===================== */
  if (eventId === 28) {
    return { name: "GSM-1 RSSI", desc: `${value}` };
  }

  /* ===================== EVENT ID 29: GSM-2 RSSI ===================== */
  if (eventId === 29) {
    return { name: "GSM-2 RSSI", desc: `${value}` };
  }

  /* ===================== EVENT ID 30: Current Running Key ===================== */
  if (eventId === 30) {
    if (value === 0) {
      return { name: "Current Running Key", desc: "Default Key Set" };
    } else if (value >= 1 && value <= 30) {
      return { name: "Current Running Key", desc: `KMS Key Set ${value}` };
    }
    return { name: "Current Running Key", desc: value };
  }

  /* ===================== EVENT ID 31: Remaining Number of Keys ===================== */
  if (eventId === 31) {
    if (value === 0) {
      return { name: "Remaining Number of Keys", desc: "No Keys" };
    } else if (value >= 1 && value <= 30) {
      return { name: "Remaining Number of Keys", desc: `${value} Remaining KMS Key Sets` };
    }
    return { name: "Remaining Number of Keys", desc: value };
  }

  /* ===================== EVENT ID 32: Session Key Checksum ===================== */
  if (eventId === 32) {
    const hexValue = value.toString(16).toUpperCase().padStart(4, "0");
    return { name: "Session Key Checksum", desc: `0x${hexValue} (Checksum of 16 bytes session key)` };
  }

  /* ===================== EVENT ID 33: DMI-1 Link Status ===================== */
  if (eventId === 33) {
    const dmiStatusMap = {
      0: "NOT OK",
      1: "OK"
    };
    return { name: "DMI-1 Link Status", desc: dmiStatusMap[value] || value };
  }

  /* ===================== EVENT ID 34: DMI-2 Link Status ===================== */
  if (eventId === 34) {
    const dmiStatusMap = {
      0: "NOT OK",
      1: "OK"
    };
    return { name: "DMI-2 Link Status", desc: dmiStatusMap[value] || value };
  }

  /* ===================== EVENT ID 35: RFID Reader-1 Link Status ===================== */
  if (eventId === 35) {
    const rfidStatusMap = {
      0: "NOT OK",
      1: "OK"
    };
    return { name: "RFID Reader-1 Link Status", desc: rfidStatusMap[value] || value };
  }

  /* ===================== EVENT ID 36: RFID Reader-2 Link Status ===================== */
  if (eventId === 36) {
    const rfidStatusMap = {
      0: "NOT OK",
      1: "OK"
    };
    return { name: "RFID Reader-2 Link Status", desc: rfidStatusMap[value] || value };
  }

  /* ===================== EVENT ID 37: Duplicate Missing RFID Tag ===================== */
  if (eventId === 37) {
    return { name: "Duplicate Missing RFID Tag", desc: `Tag Number: ${value}` };
  }

  /* ===================== EVENT ID 38: Missing Linked RFID Tag ===================== */
  if (eventId === 38) {
    const linkedTag = (value >>> 8) & 0xFFFFFF;
    const linkingDirection = value & 0xFF;
    return { name: "Missing Linked RFID Tag", desc: `Linked RFID Tag: ${linkedTag}, Linking Direction: ${linkingDirection}` };
  }

  /* ===================== EVENT ID 39: Computed TLM Status ===================== */
  if (eventId === 39) {
    const stationId = (value >>> 16) & 0xFFFF;
    const tlmStatusBits = (value >>> 12) & 0x0F;
    const tlmValue = value & 0x0FFF;
    
    const tlmStatusMap = {
      0: "TLM Failed",
      1: "TLM Updated",
      2: "TLM Timeout"
    };
    
    return {
      name: "Computed TLM Status",
      desc: `Station ID: ${stationId}, TLM Status: ${tlmStatusMap[tlmStatusBits] || tlmStatusBits}, TLM Value: ${tlmValue}`
    };
  }

  /* ===================== EVENT ID 40: Train Configuration Change ===================== */
  if (eventId === 40) {
    const configMap = {
      0: "No",
      1: "Yes"
    };
    return { name: "Train Configuration Change", desc: configMap[value] || value };
  }

  /* ===================== EVENT ID 41: Bootup Sequence Error ===================== */
  if (eventId === 41) {
    const bootupMap = {
      0: "Brake Test Failed",
      1: "MR Not Available"
    };
    return { name: "Bootup Sequence Error", desc: bootupMap[value] || value };
  }

  /* ===================== EVENT ID 42: Selected Train Formation ===================== */
  if (eventId === 42) {
    const trainFormationMap = {
      1: "Light Engine (120kmph)",
      2: "Light Engine Multi (120kmph)",
      3: "Passenger Train 3-7 Coach (120kmph)",
      4: "Passenger Train 8-13 Coach (120kmph)",
      5: "Passenger Train 14-20 Coach (120kmph)",
      6: "Passenger Train 21-27 Coach (120kmph)",
      7: "Goods 59 BOXN Empty (1000-1999 Ton, 75kmph)",
      8: "Goods 59 BOXN Half Load (2000-3499 Ton, 75kmph)",
      9: "Goods 59 BOXN Full Load (3500-5500 Ton, 60kmph)",
      10: "Goods 42 BCN Empty (1000-1999 Ton, 75kmph)",
      11: "Goods 42 BCN Half Load (2000-3499 Ton, 75kmph)",
      12: "Goods 42 BCN Full Load (3500-5500 Ton, 60kmph)",
      13: "Light Engine WAP5 (170kmph)",
      14: "WAP5-8LHB Coaches (170kmph)",
      15: "Light Engine WAP7 (140kmph)"
    };
    return { name: "Selected Train Formation", desc: trainFormationMap[value] || value };
  }

  /* ===================== EVENT ID 43: Selected Cab ===================== */
  if (eventId === 43) {
    const cabMap = {
      0: "No Cab Selected",
      1: "Cab1 Selected",
      2: "Cab2 Selected",
      3: "Both Cabs Selected"
    };
    return { name: "Selected Cab", desc: cabMap[value] || value };
  }

  /* ===================== EVENT ID 44: Brake Application Reason ===================== */
  if (eventId === 44) {
    const brakeReasonMap = {
      0: "Not Used",
      1: "Reverse Movement Detected",
      2: "Unusual Stoppage Detected",
      3: "Overspeed",
      4: "Rollback Detected",
      5: "MBT Selected",
      6: "No LP Acknowledge",
      7: "MA Shortened",
      8: "Head-on Collision Detected",
      9: "Rear-end Collision Detected",
      10: "Loco Specific SoS Received",
      11: "Station General SoS Received"
    };
    return { name: "Brake Application Reason", desc: brakeReasonMap[value] || value };
  }

  /* ===================== EVENT ID 45: Station General SoS ===================== */
  if (eventId === 45) {
    const stationId = (value >>> 8) & 0xFFFF;
    const soSStatus = value & 0xFF;
    
    const sosMap = {
      1: "Received",
      2: "Cancelled"
    };
    
    return {
      name: "Station General SoS",
      desc: `Station ID: ${stationId}, General SoS Status: ${sosMap[soSStatus] || soSStatus}`
    };
  }

  /* ===================== EVENT ID 46: Station Loco Specific SoS ===================== */
  if (eventId === 46) {
    const stationId = (value >>> 8) & 0xFFFF;
    const soSStatus = value & 0xFF;
    
    const sosMap = {
      1: "Received",
      2: "Cancelled"
    };
    
    return {
      name: "Station Loco Specific SoS",
      desc: `Station ID: ${stationId}, Specific SoS Status: ${sosMap[soSStatus] || soSStatus}`
    };
  }

  /* ===================== EVENT ID 47: Collision Detection ===================== */
  if (eventId === 47) {
    const locoId = (value >>> 8) & 0xFFFFFF;
    const sosCode = value & 0xFF;
    
    const collisionMap = {
      1: "Manual SoS Received",
      2: "Manual SoS Cancelled",
      3: "Unusual Stoppage Detected",
      4: "Unusual Stoppage End",
      5: "Head-on Collision Detected",
      6: "Head-on Collision End",
      7: "Rear-end Collision Detected",
      8: "Rear-end Collision End",
      9: "Train Parting Detected",
      10: "Train Parting End"
    };
    
    return {
      name: "Collision Detection",
      desc: `Loco ID: ${locoId}, SoS Code: ${collisionMap[sosCode] || sosCode}`
    };
  }

  /* ===================== EVENT ID 48: Loco Self SoS ===================== */
  if (eventId === 48) {
    const selfSosMap = {
      1: "Manual SoS",
      2: "Manual SoS End",
      3: "Unusual Stoppage Start",
      4: "Unusual Stoppage End"
    };
    return { name: "Loco Self SoS", desc: selfSosMap[value] || value };
  }

  /* ===================== EVENT ID 49: KAVACH Connection ===================== */
  if (eventId === 49) {
    const kavachMap = {
      1: "KAVACH Isolated",
      2: "KAVACH Connected"
    };
    return { name: "KAVACH Connection", desc: kavachMap[value] || value };
  }

  /* ===================== EVENT ID 50: BIU Isolated ===================== */
  if (eventId === 50) {
    const biuMap = {
      1: "BIU Isolated",
      2: "BIU Connected"
    };
    return { name: "BIU Isolated", desc: biuMap[value] || value };
  }

  /* ===================== EVENT ID 51: EB Bypassed ===================== */
  if (eventId === 51) {
    const ebMap = {
      1: "EB Connected",
      2: "EB Bypassed"
    };
    return { name: "EB Bypassed", desc: ebMap[value] || value };
  }

  /* ===================== EVENT ID 52: KAVACH Territory ===================== */
  if (eventId === 52) {
    const territoryMap = {
      1: "KAVACH Entry",
      2: "KAVACH Exit",
      3: "ETCS Entry",
      4: "ETCS Exit"
    };
    return { name: "KAVACH Territory", desc: territoryMap[value] || value };
  }

  /* ===================== EVENT ID 53: Brake Interface Error ===================== */
  if (eventId === 53) {
    const brakeInterfaceMap = {
      0: "IRAB",
      1: "CCB",
      2: "E70"
    };
    return { name: "Brake Interface Error", desc: brakeInterfaceMap[value] || value };
  }

  /* ===================== EVENT ID 54: Onboard KAVACH Modules Health ===================== */
  if (eventId === 54) {
    const moduleId = (value >>> 4) & 0x0FFF;
    const moduleHealthStatus = value & 0x0F;
    
    const healthMap = {
      0: "NOT OK",
      1: "OK"
    };
    
    return {
      name: "Onboard KAVACH Modules Health",
      desc: `Module ID: ${moduleId}, Module Health: ${healthMap[moduleHealthStatus] || moduleHealthStatus}`
    };
  }

  /* ===================== EVENT ID 55: Conflict Route RFID ===================== */
  if (eventId === 55) {
    return { name: "Conflict Route RFID", desc: `Tag: ${value}` };
  }

  /* ===================== EVENT ID 56: Brake Configuration Checksum ===================== */
  if (eventId === 56) {
    const hexValue = value.toString(16).toUpperCase().padStart(8, "0");
    return { name: "Brake Configuration Checksum", desc: `0x${hexValue}` };
  }

  /* ===================== EVENT ID 57-199: Reserved ===================== */
  if (eventId >= 57 && eventId <= 199) {
    return { name: `Event ${eventId}`, desc: "Reserved" };
  }

  /* ===================== EVENT ID 200-254: Firm Specific Events ===================== */
  if (eventId >= 200 && eventId <= 254) {
    return { name: `Event ${eventId}`, desc: `Firm Specific Event: ${value}` };
  }

  /* ===================== EVENT ID 255: Invalid ===================== */
  if (eventId === 255) {
    return { name: "Event 255", desc: "Not to be used" };
  }

  /* ===================== DEFAULT: Unknown Event ===================== */
  return { name: `Unknown Event ${eventId}`, desc: `Value: ${value}` };
}
