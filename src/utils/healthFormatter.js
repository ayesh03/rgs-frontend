/* ===================== HELPERS ===================== */

const signed8 = (v) => (v & 0x80 ? v - 0x100 : v);

const formatTemp = (v) => `${signed8(v)} °C`;
const formatVolt = (v) => `${v} V`;
const formatAmp = (v) => `${(v / 10).toFixed(1)} A`;
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

/* =========================================================
   ===================== 0x17 STATIONARY ===================
========================================================= */

export function formatStationaryHealth(eventId, value) {

  const map = {

    1: { name: "System Temperature", desc: formatTemp(value) },
    2: { name: "Active Radio Number", desc: ["Not Used","Radio 1","Radio 2","Both Radio Active"][value] || value },

    3: { name: "Radio-1 Health", desc: radioHealth[value] || value },
    4: { name: "Radio-2 Health", desc: radioHealth[value] || value },

    5: { name: "Radio-1 Input Supply", desc: formatVolt(value) },
    6: { name: "Radio-2 Input Supply", desc: formatVolt(value) },

    7: { name: "Radio-1 Temperature", desc: formatTemp(value) },
    8: { name: "Radio-2 Temperature", desc: formatTemp(value) },

    9: { name: "Radio-1 PA Temperature", desc: `${value} °C` },
    10:{ name: "Radio-2 PA Temperature", desc: `${value} °C` },

    11:{ name: "Radio-1 PA Supply Voltage", desc: formatVolt(value) },
    12:{ name: "Radio-2 PA Supply Voltage", desc: formatVolt(value) },

    13:{ name: "Radio-1 Tx PA Current", desc: formatAmp(value) },
    14:{ name: "Radio-2 Tx PA Current", desc: formatAmp(value) },

    15:{ name: "Radio-1 Reverse Power", desc: formatWatt(value) },
    16:{ name: "Radio-2 Reverse Power", desc: formatWatt(value) },

    17:{ name: "Radio-1 Forward Power", desc: formatWatt(value) },
    18:{ name: "Radio-2 Forward Power", desc: formatWatt(value) },

    19:{ name: "Current Running Key", desc: value === 0 ? "Default Key Set" : `KMS Key Set ${value}` },
    20:{ name: "Remaining Number of Keys", desc: value === 0 ? "No Keys" : `${value} Keys Remaining` },

    21:{ name: "Session Key Checksum", desc: hex16(value) },

    22:{ name: "Allocated Time Slot for New Loco", desc: value },

    23:{ name: "New Loco Regular Packet Time Offset", desc: formatMs(value) },

    24:{ name: "Loco Count", desc: value },

    25:{ name: "Radio-1 Rx Packet Count", desc: value },
    26:{ name: "Radio-2 Rx Packet Count", desc: value },

    27:{ name: "Active GPS Number", desc: ["No Active GPS","GPS 1","GPS 2","Both GPS"][value] || value },

    28:{ name: "GPS-1 View", desc: gpsView[value] || value },
    29:{ name: "GPS-2 View", desc: gpsView[value] || value },

    30:{ name: "GPS-1 Seconds", desc: `${value} sec` },
    31:{ name: "GPS-2 Seconds", desc: `${value} sec` },

    32:{ name: "GPS-1 Satellites in View", desc: value },
    33:{ name: "GPS-1 CNO (Max)", desc: value },

    34:{ name: "GPS-2 Satellites in View", desc: value },
    35:{ name: "GPS-2 CNO (Max)", desc: value },

    36:{ name: "GSM-1 RSSI", desc: value },
    37:{ name: "GSM-2 RSSI", desc: value },

    38:{ name: "Missing RFID", desc: `Tag: ${value}` },
    39:{ name: "Invalid RFID", desc: `Tag: ${value}` },
    40:{ name: "Conflict Route RFID", desc: `Tag: ${value}` },
    41:{ name: "Conflicting TIN", desc: value },
    42:{ name: "Missing TIN", desc: value }
  };

  if (map[eventId]) return map[eventId];

  if (eventId === 43) {
    const loco = extractLocoId3B(value);
    const code = extractLastByte(value);
    const sosMap = {
      1:"Wrong Route Tag",
      2:"Collision Detection",
      3:"Shunt Limits Violation",
      4:"Invalid Position Report",
      5:"Signal Set to Conflicting Route"
    };
    return { name:"Loco Specific SoS", desc:`Loco ${loco} – ${sosMap[code] || code}` };
  }

  if (eventId === 44) {
    const loco = extractLocoId3B(value);
    const code = extractLastByte(value);
    const exitMap = {
      1:"Unknown Direction SR/SB",
      2:"Out of Station Boundary",
      3:"Specific Mode (IS/NL)",
      4:"Authentication Failure",
      5:"Communication Timeout",
      6:"Train Handover",
      7:"Handover Cancellation"
    };
    return { name:"Train Exit Mode", desc:`Loco ${loco} – ${exitMap[code] || code}` };
  }

  if (eventId === 45) {
    return {
      name:"Station Modules Health",
      desc:`Module ${extractModuleId(value)} – ${moduleHealth[extractModuleHealth(value)]}`
    };
  }

  if (eventId >= 46 && eventId <= 199)
    return { name:"Reserved", desc:"Reserved Field" };

  if (eventId >= 200 && eventId <= 254)
    return { name:"Firm Specific Event", desc:value };

  if (eventId === 255)
    return { name:"Invalid", desc:"Not to be used" };

  return { name:`Unknown Event ${eventId}`, desc:value };
}

/* =========================================================
   ===================== 0x18 ONBOARD ======================
========================================================= */

export function formatOnboardHealth(eventId, value) {

  /* 1–16 Radio */
  if (eventId >= 1 && eventId <= 16)
    return formatStationaryHealth(eventId, value);

  if (eventId === 17)
    return { name:"Stationary Regular Packet Time Offset", desc:formatMs(value) };

  if (eventId === 18)
    return { name:"Active GPS Number", desc:["No Active GPS","GPS 1","GPS 2","Both GPS"][value] || value };

  if (eventId === 19)
    return { name:"GPS-1 View Status", desc:gpsView[value] || value };

  if (eventId === 20)
    return { name:"GPS-2 View Status", desc:gpsView[value] || value };

  if (eventId >= 21 && eventId <= 26)
    return { name:[
      "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "", "", "", "", "",
      "GPS-1 Seconds","GPS-2 Seconds","GPS-1 Satellites in View",
      "GPS-1 CNO (Max)","GPS-2 Satellites in View","GPS-2 CNO (Max)"
    ][eventId], desc:value };

  if (eventId === 27)
    return { name:"GPS-1 Link Status", desc:gpsLinkStatus[value] };

  if (eventId === 28)
    return { name:"GPS-2 Link Status", desc:gpsLinkStatus[value] };

  if (eventId === 29)
    return { name:"GSM-1 RSSI", desc:value };

  if (eventId === 30)
    return { name:"GSM-2 RSSI", desc:value };

  if (eventId === 31)
    return { name:"Current Running Key", desc:value === 0 ? "Default Key Set" : `KMS Key Set ${value}` };

  if (eventId === 32)
    return { name:"Remaining Number of Keys", desc:value === 0 ? "No Keys" : `${value} Keys Remaining` };

  if (eventId === 33)
    return { name:"Session Key Checksum", desc:hex16(value) };

  if (eventId === 34)
    return { name:"DMI-1 Link Status", desc:value === 1 ? "OK" : "NOT OK" };

  if (eventId === 35)
    return { name:"DMI-2 Link Status", desc:value === 1 ? "OK" : "NOT OK" };

  if (eventId === 36)
    return { name:"RFID Reader-1 Link Status", desc:value === 1 ? "OK" : "NOT OK" };

  if (eventId === 37)
    return { name:"RFID Reader-2 Link Status", desc:value === 1 ? "OK" : "NOT OK" };

  if (eventId === 38)
    return { name:"Duplicate Missing RFID Tag", desc:`Tag: ${value}` };

  if (eventId === 39) {
    const tag = value >>> 8;
    const direction = value & 0xFF;
    return { name:"Missing Linked RFID Tag", desc:`Tag ${tag}, Direction ${direction}` };
  }

  if (eventId === 40) {
    const station = (value >>> 16) & 0xFFFF;
    const tlmValue = value & 0x0FFF;
    const tlmStatus = (value >>> 12) & 0x0F;
    const tlmMap = {0:"TLM Failed",1:"TLM Updated",2:"TLM Timeout"};
    return { name:"Computed TLM Status", desc:`Station ${station}, ${tlmMap[tlmStatus]}, Value ${tlmValue}` };
  }

  if (eventId === 41)
    return { name:"Train Configuration Change", desc:value === 1 ? "Yes" : "No" };

  if (eventId === 42)
    return { name:"Bootup Sequence Error", desc:value === 0 ? "Brake Test Failed" : "MR Not Available" };

  if (eventId === 48) {
    const loco = extractLocoId3B(value);
    const code = extractLastByte(value);
    const collisionMap = {
      1:"Manual SoS Received",
      2:"Manual SoS Cancelled",
      3:"Unusual Stoppage Detected",
      4:"Unusual Stoppage End",
      5:"Head-on Collision Detected",
      6:"Head-on Collision End",
      7:"Rear-end Collision Detected",
      8:"Rear-end Collision End",
      9:"Train Parting Detected",
      10:"Train Parting End"
    };
    return { name:"Collision Detection", desc:`Loco ${loco} – ${collisionMap[code] || code}` };
  }

  if (eventId === 49) {
    const selfMap = {
      1:"Manual SoS",
      2:"Manual SoS End",
      3:"Unusual Stoppage Start",
      4:"Unusual Stoppage End"
    };
    return { name:"Loco Self SoS", desc:selfMap[value] || value };
  }

  if (eventId === 50)
    return { name:"KAVACH Connection", desc:value === 1 ? "KAVACH Isolated" : "KAVACH Connected" };

  if (eventId === 51)
    return { name:"BIU Status", desc:value === 1 ? "BIU Isolated" : "BIU Connected" };

  if (eventId === 52)
    return { name:"EB Status", desc:value === 1 ? "EB Connected" : "EB Bypassed" };

  if (eventId === 53)
    return { name:"KAVACH Territory", desc:["","KAVACH Entry","KAVACH Exit","ETCS Entry","ETCS Exit"][value] };

  if (eventId === 54)
    return { name:"Brake Interface Error", desc:["IRAB","CCB","E70"][value] || value };

  if (eventId === 55)
    return { name:"Onboard Modules Health", desc:`Module ${extractModuleId(value)} – ${moduleHealth[extractModuleHealth(value)]}` };

  if (eventId === 56)
    return { name:"Conflict Route RFID", desc:`Tag: ${value}` };

  if (eventId === 57)
    return { name:"Train Configuration Data Checksum", desc:hex32(value) };

  if (eventId >= 58 && eventId <= 199)
    return { name:"Reserved", desc:"Reserved Field" };

  if (eventId >= 200 && eventId <= 254)
    return { name:"Firm Specific Event", desc:value };

  if (eventId === 255)
    return { name:"Invalid", desc:"Not to be used" };

  return { name:`Unknown Event ${eventId}`, desc:value };
}
