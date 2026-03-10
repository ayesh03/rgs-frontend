const normalizeNumber = (v) => {
  if (v === null || v === undefined) return null;
  if (v === "-" || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};


/* ================= DATE / TIME ================= */

export const formatDateTime = (row) =>
  row.event_time
    ? new Date(row.event_time).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    : "-";

/* ================= PACKET TYPE ================= */

export const decodePacketType = (v) => {
  if (Number(v) === 0x19 || Number(v) === 25) return "0x19";
  return "-";
};


/* ================= SUBSYSTEM TYPE ================= */

export const decodeSubsystemType = (v) => {
  if (!v) return "-";

  // Convert string hex like "11" to real hex number
  const hexValue = parseInt(v, 16);

  switch (hexValue) {
    case 0x11: return "STATIONARY";
    case 0x22: return "ONBOARD";
    case 0x33: return "TSRMS";
    default: return "UNKNOWN";
  }
};


/* ================= SYSTEM VERSION ================= */

export const decodeSystemVersion = (v) => {
  switch (Number(v)) {
    case 1: return "KAVACH 3.2";
    case 2: return "KAVACH 4.0";
    default: return "-";
  }
};

/* ================= FAULT TYPE ================= */

export const decodeFaultType = (v) => {
  if (!v) return "-";

  const s = String(v).toUpperCase();

  if (s === "01") return "FAULT";
  if (s === "02") return "RECOVERY";

  if (s === "FAULT") return "FAULT";
  if (s === "RECOVERY") return "RECOVERY";

  return "-";
};

export const decodeFaultMessage = (row) => {

  let code = String(row.fault_code || "").toUpperCase().trim();
  let type = String(row.fault_type || "").toUpperCase().trim();



  // If backend already sends HEX like "0240"
  if (code.length === 3) code = code.padStart(4, "0");

  // Convert HEX type to readable
  if (type === "01") type = "FAULT";
  if (type === "02") type = "RECOVERY";



  if (!faultMessageMap[code]) {

    return "-";
  }

  return faultMessageMap[code][type] || "-";
};
export const decodeLocoMode = (v) => {
  const n = normalizeNumber(v);
  if (n === null || n < 0) return "-";

  let mode = n;
  while (mode > 15) mode >>= 1;

  switch (mode) {
    case 0: return "Unknown (0)";
    case 1: return "Stand By";
    case 2: return "Staff Responsible Mode";
    case 3: return "Limited Supervision";
    case 4: return "Full Supervision";
    case 5: return "Override";
    case 6: return "On Sight";
    case 7: return "Trip";
    case 8: return "Post Trip";
    case 9: return "Reverse";
    case 10: return "Shunting";
    case 11: return "Non Leading";
    case 12: return "System Failure";
    case 13: return "Isolation";
    default: return `Unknown (${n})`;
  }
};


/* ================= EMERGENCY STATUS ================= */

export const decodeEmergencyStatus = (v) => {
  const n = normalizeNumber(v);
  if (n === null || n < 0) return "-";

  switch (n) {
    case 0: return "No Emergency";
    case 1: return "Unusual Stoppage";
    case 2: return "SoS";
    case 3: return "Roll Back Detected";
    case 4: return "Head On Collision";
    case 5: return "Rear End Collision";
    case 6: return "Parting SoS";
    default: return `Unknown (${n})`;
  }
};

export const kavachSubsystemMap = {
  "601": "AMSA  (601)",
  "602": "AMSB  (602)",

  "1037": "SFM",
  "1038": "FAL",
  "1039": "BUD",
  "1040": "TMX-SHNR",
  "1041": "BDL",
  "1042": "UMD",
  "1072": "JUL",
  "1044": "TIM",
  "1045": "SHAD",
  "1047": "BLN",
  "1049": "GOLPAL",
  "1050": "JADCHERLA",
  "1051": "DIVI",
  "1052": "MAHNAGAR",
  "1054": "MANYAM",
  "1055": "DEVARKAD",
  "1056": "KAUKUN",
  "1057": "WANAP",
};

export const decodeKavachSubsystem = (v) => {
  if (!v) return "-";
  const key = String(v);
  return kavachSubsystemMap[key] || key;
};

/* ================= MAIN FORMATTER ================= */

export const formatFaultCellValue = (row, key) => {
  const v = row[key];

  switch (key) {
    case "event_time":
      return formatDateTime(row);

    case "packet_type":
      return decodePacketType(v);

    case "subsystem_type":
      return decodeSubsystemType(v);

    case "system_version":
      return decodeSystemVersion(v);

    case "fault_type":
      return decodeFaultType(v);

    case "fault_message":
      return decodeFaultMessage(row);

    case "kavach_subsystem_id":
      return decodeKavachSubsystem(v);

    default:
      return v ?? "-";
  }
};


export const faultMessageMap = {
  "0000": {
    FAULT: "GPS gets Disconnected in TSRMS Server"
  },
  "0001": {
    FAULT: "GSM Gets Disconnected in TSRMS Server"
  },
  "0002": {
    FAULT: "Connection with SKAVACH gets Disconnected with TSRMS"
  },
  "0003": {
    FAULT: "Connection With Adjacent TSRMS gets Disconnected"
  },
  "0004": {
    FAULT: "TSRMS Database Connection gets Disconnected"
  },
  "0010": {
    FAULT: "VPM-1 MCU-1 Fail",
    RECOVERY: "VPM-1 MCU-1 Recovery"
  },
  "0020": {
    FAULT: "VPM-1 MCU-2 Fail",
    RECOVERY: "VPM-1 MCU-2 Recovery"
  },
  "0030": {
    FAULT: "VIC-1AMCU-1 Fail",
    RECOVERY: "VIC-1AMCU-1 Recovery"
  },
  "0040": {
    FAULT: "VIC-1AMCU-2 Fail",
    RECOVERY: "VIC-1AMCU-2 Recovery"
  },
  "0050": {
    FAULT: "VIC-1AMCU-3 Fail",
    RECOVERY: "VIC-1AMCU-3 Recovery"
  },
  "0060": {
    FAULT: "VIC-1AMCU-4 Fail",
    RECOVERY: "VIC-1AMCU-4 Recovery"
  },
  "0070": {
    FAULT: "VIC-1BMCU-1 Fail",
    RECOVERY: "VIC-1BMCU-1 Recovery"
  },
  "0080": {
    FAULT: "VIC-1BMCU-2 Fail",
    RECOVERY: "VIC-1BMCU-2 Recovery"
  },
  "0090": {
    FAULT: "VIC-1BMCU-3 Fail",
    RECOVERY: "VIC-1BMCU-3 Recovery"
  },
  "00A0": {
    FAULT: "VIC-1BMCU-4 Fail",
    RECOVERY: "VIC-1BMCU-4 Recovery"
  },
  "00B0": {
    FAULT: "VIC-1CMCU-1 Fail",
    RECOVERY: "VIC-1CMCU-1 Recovery"
  },
  "00C0": {
    FAULT: "VIC-1CMCU-2 Fail",
    RECOVERY: "VIC-1CMCU-2 Recovery"
  },
  "00D0": {
    FAULT: "VIC-1CMCU-3 Fail",
    RECOVERY: "VIC-1CMCU-3 Recovery"
  },
  "00E0": {
    FAULT: "VIC-1CMCU-4 Fail",
    RECOVERY: "VIC-1CMCU-4 Recovery"
  },
  "00F0": {
    FAULT: "VPM-2MCU-1 Fail",
    RECOVERY: "VPM-2MCU-1 Recovery"
  },
  "0100": {
    FAULT: "VPM-2MCU-2 Fail",
    RECOVERY: "VPM-2MCU-2 Recovery"
  },
  "0110": {
    FAULT: "VIC-2AMCU-1 Fail",
    RECOVERY: "VIC-2AMCU-1 Recovery"
  },
  "0120": {
    FAULT: "VIC-2AMCU-2 Fail",
    RECOVERY: "VIC-2AMCU-2 Recovery"
  },
  "0130": {
    FAULT: "VIC-2AMCU-3 Fail",
    RECOVERY: "VIC-2AMCU-3 Recovery"
  },
  "0140": {
    FAULT: "VIC-2AMCU-4 Fail",
    RECOVERY: "VIC-2AMCU-4 Recovery"
  },
  "0150": {
    FAULT: "VIC-2BMCU-1 Fail",
    RECOVERY: "VIC-2BMCU-1 Recovery"
  },
  "0160": {
    FAULT: "VIC-2BMCU-2 Fail",
    RECOVERY: "VIC-2BMCU-2 Recovery"
  },
  "0170": {
    FAULT: "VIC-2BMCU-3 Fail",
    RECOVERY: "VIC-2BMCU-3 Recovery"
  },
  "0180": {
    FAULT: "VIC-2BMCU-4 Fail",
    RECOVERY: "VIC-2BMCU-4 Recovery"
  },
  "0190": {
    FAULT: "VIC-2C MCU-1 Fail",
    RECOVERY: "VIC-2C MCU-1 Recovery"
  },
  "01A0": {
    FAULT: "VIC-2C MCU-2 Fail",
    RECOVERY: "VIC-2C MCU-2 Recovery"
  },
  "01B0": {
    FAULT: "VIC-2C MCU-3 Fail",
    RECOVERY: "VIC-2C MCU-3 Recovery"
  },
  "01C0": {
    FAULT: "VIC-2C MCU-4 Fail",
    RECOVERY: "VIC-2C MCU-4 Recovery"
  },
  "01D0": {
    FAULT: "ADL MCU-1 Fail",
    RECOVERY: "ADL MCU-1 Recovery"
  },
  "01E0": {
    FAULT: "ADL MCU-2 Fail",
    RECOVERY: "ADL MCU-2 Recovery"
  },
  "01F0": {
    FAULT: "ADL MCU-3 Fail",
    RECOVERY: "ADL MCU-3 Recovery"
  },
  "0200": {
    FAULT: "Radio -1 Fail",
    RECOVERY: "Radio -1 Recovery"
  },
  "0210": {
    FAULT: "Radio -2 Fail",
    RECOVERY: "Radio -2 Recovery"
  },
  "0220": {
    FAULT: "GPS -1 Fail",
    RECOVERY: "GPS -1 Recovery"
  },
  "0230": {
    FAULT: "GPS -2 Fail",
    RECOVERY: "GPS -2 Recovery"
  },
  "0240": {
    FAULT: "SMOCIP link -1 Fail",
    RECOVERY: "SMOCI link -1 Recovery"
  },
  "0250": {
    FAULT: "SMOCIP link -2 Fail",
    RECOVERY: "SMOCIP link -2 Recovery"
  },
  "0260": {
    FAULT: "TSRMS server link status(Blue) Fail",
    RECOVERY: "TSRMS server link status(Blue) Recovery"
  },
  "0270": {
    FAULT: "TSRMS server link status(Red) Fail",
    RECOVERY: "TSRMS server link status(Red) Recovery"
  },
  "0280": {
    FAULT: "SK-SK DIR-1 link status(Blue) Fail",
    RECOVERY: "SK-SK DIR-1 link status(Blue) Recovery"
  },
  "0290": {
    FAULT: "SK-SK DIR-2 link status(Blue) Fail",
    RECOVERY: "SK-SK DIR-2 link status(Blue) Recovery"
  },
  "02A0": {
    FAULT: "SK-SK DIR-3 link status(Blue) Fail",
    RECOVERY: "SK-SK DIR-3 link status(Blue) Recovery"
  },
  "02B0": {
    FAULT: "SK-SK DIR-4 link status(Blue) Fail",
    RECOVERY: "SK-SK DIR-4 link status(Blue) Recovery"
  },
  "02C0": {
    FAULT: "SK-SK DIR-5 link status(Blue) Fail",
    RECOVERY: "SK-SK DIR-5 link status(Blue) Recovery"
  },
  "02D0": {
    FAULT: "SK-SK DIR-6 link status(Blue) Fail",
    RECOVERY: "SK-SK DIR-6 link status(Blue) Recovery"
  },
  "02E0": {
    FAULT: "SK-SK DIR-1 link status(Red) Fail",
    RECOVERY: "SK-SK DIR-1 link status(Red) Recovery"
  },
  "02F0": {
    FAULT: "SK-SK DIR-2 link status(red) Fail",
    RECOVERY: "SK-SK DIR-2 link status(red) Recovery"
  },
  "0300": {
    FAULT: "SK-SK DIR-3 link status(red) Fail",
    RECOVERY: "SK-SK DIR-3 link status(red) Recovery"
  },
  "0310": {
    FAULT: "SK-SK DIR-4 link status(red) Fail",
    RECOVERY: "SK-SK DIR-4 link status(red) Recovery"
  },
  "0320": {
    FAULT: "SK-SK DIR-5 link status(red) Fail",
    RECOVERY: "SK-SK DIR-5 link status(red) Recovery"
  },
  "0330": {
    FAULT: "SK-SK DIR-6 link status(red) Fail",
    RECOVERY: "SK-SK DIR-6 link status(red) Recovery"
  },
  "0340": {
    FAULT: "NMS link status Fail",
    RECOVERY: "NMS link status Recovery"
  },
  "0350": {
    FAULT: "GSM -1 status Fail",
    RECOVERY: "GSM -1 status Recovery"
  },
  "0360": {
    FAULT: "GSM -2 status Fail",
    RECOVERY: "GSM -2 status Recovery"
  },
  "0370": {
    FAULT: "KMS-1 Status Fail",
    RECOVERY: "KMS-1 Status Recovery"
  },
  "0380": {
    FAULT: "KMS-2 Status Fail",
    RECOVERY: "KMS-2 Status Recovery"
  },
  "0390": {
    FAULT: "Dir-1 , RIU 01  Fail",
    RECOVERY: "Dir-1 , RIU 01  Recovery"
  },
  "03A0": {
    FAULT: "Dir-1 , RIU 01 , VIC1  Fail",
    RECOVERY: "Dir-1 , RIU 01 , VIC1  Recovery"
  },
  "03B0": {
    FAULT: "Dir-1 , RIU 01 , VIC2  Fail",
    RECOVERY: "Dir-1 , RIU 01 , VIC2  Recovery"
  },
  "03C0": {
    FAULT: "Dir-1 , RIU 01 , VIM1A  Fail",
    RECOVERY: "Dir-1 , RIU 01 , VIM1A  Recovery"
  },
  "03D0": {
    FAULT: "Dir-1 , RIU 01 , VIM1B  Fail",
    RECOVERY: "Dir-1 , RIU 01 , VIM1B  Recovery"
  },
  "03E0": {
    FAULT: "Dir-1 , RIU 01 , VIM2A  Fail",
    RECOVERY: "Dir-1 , RIU 01 , VIM2A  Recovery"
  },
  "03F0": {
    FAULT: "Dir-1 , RIU 01 , VIM2B  Fail",
    RECOVERY: "Dir-1 , RIU 01 , VIM2B  Recovery"
  },
  "0400": {
    FAULT: "Dir-1 , RIU 01 , VIM3A  Fail",
    RECOVERY: "Dir-1 , RIU 01 , VIM3A  Recovery"
  },
  "0410": {
    FAULT: "Dir-1 , RIU 01 , VIM3B  Fail",
    RECOVERY: "Dir-1 , RIU 01 , VIM3B  Recovery"
  },
  "0420": {
    FAULT: "Dir-1 , RIU 01 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-1 , RIU 01 , Charger 1 AC i/p  Recovery"
  },
  "0430": {
    FAULT: "Dir-1 , RIU 01 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-1 , RIU 01 , Charger 2AC i/p  Recovery"
  },
  "0440": {
    FAULT: "Dir-1 , RIU 01 , Charger 1o/p  Fail",
    RECOVERY: "Dir-1 , RIU 01 , Charger 1o/p  Recovery"
  },
  "0450": {
    FAULT: "Dir-1 , RIU 01 , Charger 2o/p  Fail",
    RECOVERY: "Dir-1 , RIU 01 , Charger 2o/p  Recovery"
  },
  "0460": {
    FAULT: "Dir-1 , RIU 01 , Low battery  Fail",
    RECOVERY: "Dir-1 , RIU 01 , Low battery  Recovery"
  },
  "0470": {
    FAULT: "Dir-1 , RIU 01 , primay ofc link  Fail",
    RECOVERY: "Dir-1 , RIU 01 , primay ofc link  Recovery"
  },
  "0480": {
    FAULT: "Dir-1 , RIU 01 , Secondary ofc link  Fail",
    RECOVERY: "Dir-1 , RIU 01 , Secondary ofc link  Recovery"
  },
  "0490": {
    FAULT: "Dir-1 , RIU 02  Fail",
    RECOVERY: "Dir-1 , RIU 02  Recovery"
  },
  "04A0": {
    FAULT: "Dir-1 , RIU 02 , VIC1  Fail",
    RECOVERY: "Dir-1 , RIU 02 , VIC1  Recovery"
  },
  "04B0": {
    FAULT: "Dir-1 , RIU 02 , VIC2  Fail",
    RECOVERY: "Dir-1 , RIU 02 , VIC2  Recovery"
  },
  "04C0": {
    FAULT: "Dir-1 , RIU 02 , VIM1A  Fail",
    RECOVERY: "Dir-1 , RIU 02 , VIM1A  Recovery"
  },
  "04D0": {
    FAULT: "Dir-1 , RIU 02 , VIM1B  Fail",
    RECOVERY: "Dir-1 , RIU 02 , VIM1B  Recovery"
  },
  "04E0": {
    FAULT: "Dir-1 , RIU 02 , VIM2A  Fail",
    RECOVERY: "Dir-1 , RIU 02 , VIM2A  Recovery"
  },
  "04F0": {
    FAULT: "Dir-1 , RIU 02 , VIM2B  Fail",
    RECOVERY: "Dir-1 , RIU 02 , VIM2B  Recovery"
  },
  "0500": {
    FAULT: "Dir-1 , RIU 02 , VIM3A  Fail",
    RECOVERY: "Dir-1 , RIU 02 , VIM3A  Recovery"
  },
  "0510": {
    FAULT: "Dir-1 , RIU 02 , VIM3B  Fail",
    RECOVERY: "Dir-1 , RIU 02 , VIM3B  Recovery"
  },
  "0520": {
    FAULT: "Dir-1 , RIU 02 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-1 , RIU 02 , Charger 1 AC i/p  Recovery"
  },
  "0530": {
    FAULT: "Dir-1 , RIU 02 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-1 , RIU 02 , Charger 2AC i/p  Recovery"
  },
  "0540": {
    FAULT: "Dir-1 , RIU 02 , Charger 1o/p  Fail",
    RECOVERY: "Dir-1 , RIU 02 , Charger 1o/p  Recovery"
  },
  "0550": {
    FAULT: "Dir-1 , RIU 02 , Charger 2o/p  Fail",
    RECOVERY: "Dir-1 , RIU 02 , Charger 2o/p  Recovery"
  },
  "0560": {
    FAULT: "Dir-1 , RIU 02 , Low battery  Fail",
    RECOVERY: "Dir-1 , RIU 02 , Low battery  Recovery"
  },
  "0570": {
    FAULT: "Dir-1 , RIU 02 , primay ofc link  Fail",
    RECOVERY: "Dir-1 , RIU 02 , primay ofc link  Recovery"
  },
  "0580": {
    FAULT: "Dir-1 , RIU 02 , Secondary ofc link  Fail",
    RECOVERY: "Dir-1 , RIU 02 , Secondary ofc link  Recovery"
  },
  "0590": {
    FAULT: "Dir-1 , RIU 03  Fail",
    RECOVERY: "Dir-1 , RIU 03  Recovery"
  },
  "05A0": {
    FAULT: "Dir-1 , RIU 03 , VIC1  Fail",
    RECOVERY: "Dir-1 , RIU 03 , VIC1  Recovery"
  },
  "05B0": {
    FAULT: "Dir-1 , RIU 03 , VIC2  Fail",
    RECOVERY: "Dir-1 , RIU 03 , VIC2  Recovery"
  },
  "05C0": {
    FAULT: "Dir-1 , RIU 03 , VIM1A  Fail",
    RECOVERY: "Dir-1 , RIU 03 , VIM1A  Recovery"
  },
  "05D0": {
    FAULT: "Dir-1 , RIU 03 , VIM1B  Fail",
    RECOVERY: "Dir-1 , RIU 03 , VIM1B  Recovery"
  },
  "05E0": {
    FAULT: "Dir-1 , RIU 03 , VIM2A  Fail",
    RECOVERY: "Dir-1 , RIU 03 , VIM2A  Recovery"
  },
  "05F0": {
    FAULT: "Dir-1 , RIU 03 , VIM2B  Fail",
    RECOVERY: "Dir-1 , RIU 03 , VIM2B  Recovery"
  },
  "0600": {
    FAULT: "Dir-1 , RIU 03 , VIM3A  Fail",
    RECOVERY: "Dir-1 , RIU 03 , VIM3A  Recovery"
  },
  "0610": {
    FAULT: "Dir-1 , RIU 03 , VIM3B  Fail",
    RECOVERY: "Dir-1 , RIU 03 , VIM3B  Recovery"
  },
  "0620": {
    FAULT: "Dir-1 , RIU 03 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-1 , RIU 03 , Charger 1 AC i/p  Recovery"
  },
  "0630": {
    FAULT: "Dir-1 , RIU 03 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-1 , RIU 03 , Charger 2AC i/p  Recovery"
  },
  "0640": {
    FAULT: "Dir-1 , RIU 03 , Charger 1o/p  Fail",
    RECOVERY: "Dir-1 , RIU 03 , Charger 1o/p  Recovery"
  },
  "0650": {
    FAULT: "Dir-1 , RIU 03 , Charger 2o/p  Fail",
    RECOVERY: "Dir-1 , RIU 03 , Charger 2o/p  Recovery"
  },
  "0660": {
    FAULT: "Dir-1 , RIU 03 , Low battery  Fail",
    RECOVERY: "Dir-1 , RIU 03 , Low battery  Recovery"
  },
  "0670": {
    FAULT: "Dir-1 , RIU 03 , primay ofc link  Fail",
    RECOVERY: "Dir-1 , RIU 03 , primay ofc link  Recovery"
  },
  "0680": {
    FAULT: "Dir-1 , RIU 03 , Secondary ofc link  Fail",
    RECOVERY: "Dir-1 , RIU 03 , Secondary ofc link  Recovery"
  },
  "0690": {
    FAULT: "Dir-1 , RIU 04  Fail",
    RECOVERY: "Dir-1 , RIU 04  Recovery"
  },
  "06A0": {
    FAULT: "Dir-1 , RIU 04 , VIC1  Fail",
    RECOVERY: "Dir-1 , RIU 04 , VIC1  Recovery"
  },
  "06B0": {
    FAULT: "Dir-1 , RIU 04 , VIC2  Fail",
    RECOVERY: "Dir-1 , RIU 04 , VIC2  Recovery"
  },
  "06C0": {
    FAULT: "Dir-1 , RIU 04 , VIM1A  Fail",
    RECOVERY: "Dir-1 , RIU 04 , VIM1A  Recovery"
  },
  "06D0": {
    FAULT: "Dir-1 , RIU 04 , VIM1B  Fail",
    RECOVERY: "Dir-1 , RIU 04 , VIM1B  Recovery"
  },
  "06E0": {
    FAULT: "Dir-1 , RIU 04 , VIM2A  Fail",
    RECOVERY: "Dir-1 , RIU 04 , VIM2A  Recovery"
  },
  "06F0": {
    FAULT: "Dir-1 , RIU 04 , VIM2B  Fail",
    RECOVERY: "Dir-1 , RIU 04 , VIM2B  Recovery"
  },
  "0700": {
    FAULT: "Dir-1 , RIU 04 , VIM3A  Fail",
    RECOVERY: "Dir-1 , RIU 04 , VIM3A  Recovery"
  },
  "0710": {
    FAULT: "Dir-1 , RIU 04 , VIM3B  Fail",
    RECOVERY: "Dir-1 , RIU 04 , VIM3B  Recovery"
  },
  "0720": {
    FAULT: "Dir-1 , RIU 04 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-1 , RIU 04 , Charger 1 AC i/p  Recovery"
  },
  "0730": {
    FAULT: "Dir-1 , RIU 04 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-1 , RIU 04 , Charger 2AC i/p  Recovery"
  },
  "0740": {
    FAULT: "Dir-1 , RIU 04 , Charger 1o/p  Fail",
    RECOVERY: "Dir-1 , RIU 04 , Charger 1o/p  Recovery"
  },
  "0750": {
    FAULT: "Dir-1 , RIU 04 , Charger 2o/p  Fail",
    RECOVERY: "Dir-1 , RIU 04 , Charger 2o/p  Recovery"
  },
  "0760": {
    FAULT: "Dir-1 , RIU 04 , Low battery  Fail",
    RECOVERY: "Dir-1 , RIU 04 , Low battery  Recovery"
  },
  "0770": {
    FAULT: "Dir-1 , RIU 04 , primay ofc link  Fail",
    RECOVERY: "Dir-1 , RIU 04 , primay ofc link  Recovery"
  },
  "0780": {
    FAULT: "Dir-1 , RIU 04 , Secondary ofc link  Fail",
    RECOVERY: "Dir-1 , RIU 04 , Secondary ofc link  Recovery"
  },
  "0790": {
    FAULT: "Dir-1 , RIU 05  Fail",
    RECOVERY: "Dir-1 , RIU 05  Recovery"
  },
  "07A0": {
    FAULT: "Dir-1 , RIU 05 , VIC1  Fail",
    RECOVERY: "Dir-1 , RIU 05 , VIC1  Recovery"
  },
  "07B0": {
    FAULT: "Dir-1 , RIU 05 , VIC2  Fail",
    RECOVERY: "Dir-1 , RIU 05 , VIC2  Recovery"
  },
  "07C0": {
    FAULT: "Dir-1 , RIU 05 , VIM1A  Fail",
    RECOVERY: "Dir-1 , RIU 05 , VIM1A  Recovery"
  },
  "07D0": {
    FAULT: "Dir-1 , RIU 05 , VIM1B  Fail",
    RECOVERY: "Dir-1 , RIU 05 , VIM1B  Recovery"
  },
  "07E0": {
    FAULT: "Dir-1 , RIU 05 , VIM2A  Fail",
    RECOVERY: "Dir-1 , RIU 05 , VIM2A  Recovery"
  },
  "07F0": {
    FAULT: "Dir-1 , RIU 05 , VIM2B  Fail",
    RECOVERY: "Dir-1 , RIU 05 , VIM2B  Recovery"
  },
  "0800": {
    FAULT: "Dir-1 , RIU 05 , VIM3A  Fail",
    RECOVERY: "Dir-1 , RIU 05 , VIM3A  Recovery"
  },
  "0810": {
    FAULT: "Dir-1 , RIU 05 , VIM3B  Fail",
    RECOVERY: "Dir-1 , RIU 05 , VIM3B  Recovery"
  },
  "0820": {
    FAULT: "Dir-1 , RIU 05 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-1 , RIU 05 , Charger 1 AC i/p  Recovery"
  },
  "0830": {
    FAULT: "Dir-1 , RIU 05 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-1 , RIU 05 , Charger 2AC i/p  Recovery"
  },
  "0840": {
    FAULT: "Dir-1 , RIU 05 , Charger 1o/p  Fail",
    RECOVERY: "Dir-1 , RIU 05 , Charger 1o/p  Recovery"
  },
  "0850": {
    FAULT: "Dir-1 , RIU 05 , Charger 2o/p  Fail",
    RECOVERY: "Dir-1 , RIU 05 , Charger 2o/p  Recovery"
  },
  "0860": {
    FAULT: "Dir-1 , RIU 05 , Low battery  Fail",
    RECOVERY: "Dir-1 , RIU 05 , Low battery  Recovery"
  },
  "0870": {
    FAULT: "Dir-1 , RIU 05 , primay ofc link  Fail",
    RECOVERY: "Dir-1 , RIU 05 , primay ofc link  Recovery"
  },
  "0880": {
    FAULT: "Dir-1 , RIU 05 , Secondary ofc link  Fail",
    RECOVERY: "Dir-1 , RIU 05 , Secondary ofc link  Recovery"
  },
  "0890": {
    FAULT: "Dir-1 , RIU 06  Fail",
    RECOVERY: "Dir-1 , RIU 06  Recovery"
  },
  "08A0": {
    FAULT: "Dir-1 , RIU 06 , VIC1  Fail",
    RECOVERY: "Dir-1 , RIU 06 , VIC1  Recovery"
  },
  "08B0": {
    FAULT: "Dir-1 , RIU 06 , VIC2  Fail",
    RECOVERY: "Dir-1 , RIU 06 , VIC2  Recovery"
  },
  "08C0": {
    FAULT: "Dir-1 , RIU 06 , VIM1A  Fail",
    RECOVERY: "Dir-1 , RIU 06 , VIM1A  Recovery"
  },
  "08D0": {
    FAULT: "Dir-1 , RIU 06 , VIM1B  Fail",
    RECOVERY: "Dir-1 , RIU 06 , VIM1B  Recovery"
  },
  "08E0": {
    FAULT: "Dir-1 , RIU 06 , VIM2A  Fail",
    RECOVERY: "Dir-1 , RIU 06 , VIM2A  Recovery"
  },
  "08F0": {
    FAULT: "Dir-1 , RIU 06 , VIM2B  Fail",
    RECOVERY: "Dir-1 , RIU 06 , VIM2B  Recovery"
  },
  "0900": {
    FAULT: "Dir-1 , RIU 06 , VIM3A  Fail",
    RECOVERY: "Dir-1 , RIU 06 , VIM3A  Recovery"
  },
  "0910": {
    FAULT: "Dir-1 , RIU 06 , VIM3B  Fail",
    RECOVERY: "Dir-1 , RIU 06 , VIM3B  Recovery"
  },
  "0920": {
    FAULT: "Dir-1 , RIU 06 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-1 , RIU 06 , Charger 1 AC i/p  Recovery"
  },
  "0930": {
    FAULT: "Dir-1 , RIU 06 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-1 , RIU 06 , Charger 2AC i/p  Recovery"
  },
  "0940": {
    FAULT: "Dir-1 , RIU 06 , Charger 1o/p  Fail",
    RECOVERY: "Dir-1 , RIU 06 , Charger 1o/p  Recovery"
  },
  "0950": {
    FAULT: "Dir-1 , RIU 06 , Charger 2o/p  Fail",
    RECOVERY: "Dir-1 , RIU 06 , Charger 2o/p  Recovery"
  },
  "0960": {
    FAULT: "Dir-1 , RIU 06 , Low battery  Fail",
    RECOVERY: "Dir-1 , RIU 06 , Low battery  Recovery"
  },
  "0970": {
    FAULT: "Dir-1 , RIU 06 , primay ofc link  Fail",
    RECOVERY: "Dir-1 , RIU 06 , primay ofc link  Recovery"
  },
  "0980": {
    FAULT: "Dir-1 , RIU 06 , Secondary ofc link  Fail",
    RECOVERY: "Dir-1 , RIU 06 , Secondary ofc link  Recovery"
  },
  "0990": {
    FAULT: "Dir-2 , RIU 01  Fail",
    RECOVERY: "Dir-2 , RIU 01  Recovery"
  },
  "09A0": {
    FAULT: "Dir-2 , RIU 01 , VIC1  Fail",
    RECOVERY: "Dir-2 , RIU 01 , VIC1  Recovery"
  },
  "09B0": {
    FAULT: "Dir-2 , RIU 01 , VIC2  Fail",
    RECOVERY: "Dir-2 , RIU 01 , VIC2  Recovery"
  },
  "09C0": {
    FAULT: "Dir-2 , RIU 01 , VIM1A  Fail",
    RECOVERY: "Dir-2 , RIU 01 , VIM1A  Recovery"
  },
  "09D0": {
    FAULT: "Dir-2 , RIU 01 , VIM1B  Fail",
    RECOVERY: "Dir-2 , RIU 01 , VIM1B  Recovery"
  },
  "09E0": {
    FAULT: "Dir-2 , RIU 01 , VIM2A  Fail",
    RECOVERY: "Dir-2 , RIU 01 , VIM2A  Recovery"
  },
  "09F0": {
    FAULT: "Dir-2 , RIU 01 , VIM2B  Fail",
    RECOVERY: "Dir-2 , RIU 01 , VIM2B  Recovery"
  },
  "0A00": {
    FAULT: "Dir-2 , RIU 01 , VIM3A  Fail",
    RECOVERY: "Dir-2 , RIU 01 , VIM3A  Recovery"
  },
  "0A10": {
    FAULT: "Dir-2 , RIU 01 , VIM3B  Fail",
    RECOVERY: "Dir-2 , RIU 01 , VIM3B  Recovery"
  },
  "0A20": {
    FAULT: "Dir-2 , RIU 01 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-2 , RIU 01 , Charger 1 AC i/p  Recovery"
  },
  "0A30": {
    FAULT: "Dir-2 , RIU 01 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-2 , RIU 01 , Charger 2AC i/p  Recovery"
  },
  "0A40": {
    FAULT: "Dir-2 , RIU 01 , Charger 1o/p  Fail",
    RECOVERY: "Dir-2 , RIU 01 , Charger 1o/p  Recovery"
  },
  "0A50": {
    FAULT: "Dir-2 , RIU 01 , Charger 2o/p  Fail",
    RECOVERY: "Dir-2 , RIU 01 , Charger 2o/p  Recovery"
  },
  "0A60": {
    FAULT: "Dir-2 , RIU 01 , Low battery  Fail",
    RECOVERY: "Dir-2 , RIU 01 , Low battery  Recovery"
  },
  "0A70": {
    FAULT: "Dir-2 , RIU 01 , primay ofc link  Fail",
    RECOVERY: "Dir-2 , RIU 01 , primay ofc link  Recovery"
  },
  "0A80": {
    FAULT: "Dir-2 , RIU 01 , Secondary ofc link  Fail",
    RECOVERY: "Dir-2 , RIU 01 , Secondary ofc link  Recovery"
  },
  "0A90": {
    FAULT: "Dir-2 , RIU 02  Fail",
    RECOVERY: "Dir-2 , RIU 02  Recovery"
  },
  "0AA0": {
    FAULT: "Dir-2 , RIU 02 , VIC1  Fail",
    RECOVERY: "Dir-2 , RIU 02 , VIC1  Recovery"
  },
  "0AB0": {
    FAULT: "Dir-2 , RIU 02 , VIC2  Fail",
    RECOVERY: "Dir-2 , RIU 02 , VIC2  Recovery"
  },
  "0AC0": {
    FAULT: "Dir-2 , RIU 02 , VIM1A  Fail",
    RECOVERY: "Dir-2 , RIU 02 , VIM1A  Recovery"
  },
  "0AD0": {
    FAULT: "Dir-2 , RIU 02 , VIM1B  Fail",
    RECOVERY: "Dir-2 , RIU 02 , VIM1B  Recovery"
  },
  "0AE0": {
    FAULT: "Dir-2 , RIU 02 , VIM2A  Fail",
    RECOVERY: "Dir-2 , RIU 02 , VIM2A  Recovery"
  },
  "0AF0": {
    FAULT: "Dir-2 , RIU 02 , VIM2B  Fail",
    RECOVERY: "Dir-2 , RIU 02 , VIM2B  Recovery"
  },
  "0B00": {
    FAULT: "Dir-2 , RIU 02 , VIM3A  Fail",
    RECOVERY: "Dir-2 , RIU 02 , VIM3A  Recovery"
  },
  "0B10": {
    FAULT: "Dir-2 , RIU 02 , VIM3B  Fail",
    RECOVERY: "Dir-2 , RIU 02 , VIM3B  Recovery"
  },
  "0B20": {
    FAULT: "Dir-2 , RIU 02 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-2 , RIU 02 , Charger 1 AC i/p  Recovery"
  },
  "0B30": {
    FAULT: "Dir-2 , RIU 02 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-2 , RIU 02 , Charger 2AC i/p  Recovery"
  },
  "0B40": {
    FAULT: "Dir-2 , RIU 02 , Charger 1o/p  Fail",
    RECOVERY: "Dir-2 , RIU 02 , Charger 1o/p  Recovery"
  },
  "0B50": {
    FAULT: "Dir-2 , RIU 02 , Charger 2o/p  Fail",
    RECOVERY: "Dir-2 , RIU 02 , Charger 2o/p  Recovery"
  },
  "0B60": {
    FAULT: "Dir-2 , RIU 02 , Low battery  Fail",
    RECOVERY: "Dir-2 , RIU 02 , Low battery  Recovery"
  },
  "0B70": {
    FAULT: "Dir-2 , RIU 02 , primay ofc link  Fail",
    RECOVERY: "Dir-2 , RIU 02 , primay ofc link  Recovery"
  },
  "0B80": {
    FAULT: "Dir-2 , RIU 02 , Secondary ofc link  Fail",
    RECOVERY: "Dir-2 , RIU 02 , Secondary ofc link  Recovery"
  },
  "0B90": {
    FAULT: "Dir-2 , RIU 03  Fail",
    RECOVERY: "Dir-2 , RIU 03  Recovery"
  },
  "0BA0": {
    FAULT: "Dir-2 , RIU 03 , VIC1  Fail",
    RECOVERY: "Dir-2 , RIU 03 , VIC1  Recovery"
  },
  "0BB0": {
    FAULT: "Dir-2 , RIU 03 , VIC2  Fail",
    RECOVERY: "Dir-2 , RIU 03 , VIC2  Recovery"
  },
  "0BC0": {
    FAULT: "Dir-2 , RIU 03 , VIM1A  Fail",
    RECOVERY: "Dir-2 , RIU 03 , VIM1A  Recovery"
  },
  "0BD0": {
    FAULT: "Dir-2 , RIU 03 , VIM1B  Fail",
    RECOVERY: "Dir-2 , RIU 03 , VIM1B  Recovery"
  },
  "0BE0": {
    FAULT: "Dir-2 , RIU 03 , VIM2A  Fail",
    RECOVERY: "Dir-2 , RIU 03 , VIM2A  Recovery"
  },
  "0BF0": {
    FAULT: "Dir-2 , RIU 03 , VIM2B  Fail",
    RECOVERY: "Dir-2 , RIU 03 , VIM2B  Recovery"
  },
  "0C00": {
    FAULT: "Dir-2 , RIU 03 , VIM3A  Fail",
    RECOVERY: "Dir-2 , RIU 03 , VIM3A  Recovery"
  },
  "0C10": {
    FAULT: "Dir-2 , RIU 03 , VIM3B  Fail",
    RECOVERY: "Dir-2 , RIU 03 , VIM3B  Recovery"
  },
  "0C20": {
    FAULT: "Dir-2 , RIU 03 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-2 , RIU 03 , Charger 1 AC i/p  Recovery"
  },
  "0C30": {
    FAULT: "Dir-2 , RIU 03 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-2 , RIU 03 , Charger 2AC i/p  Recovery"
  },
  "0C40": {
    FAULT: "Dir-2 , RIU 03 , Charger 1o/p  Fail",
    RECOVERY: "Dir-2 , RIU 03 , Charger 1o/p  Recovery"
  },
  "0C50": {
    FAULT: "Dir-2 , RIU 03 , Charger 2o/p  Fail",
    RECOVERY: "Dir-2 , RIU 03 , Charger 2o/p  Recovery"
  },
  "0C60": {
    FAULT: "Dir-2 , RIU 03 , Low battery  Fail",
    RECOVERY: "Dir-2 , RIU 03 , Low battery  Recovery"
  },
  "0C70": {
    FAULT: "Dir-2 , RIU 03 , primay ofc link  Fail",
    RECOVERY: "Dir-2 , RIU 03 , primay ofc link  Recovery"
  },
  "0C80": {
    FAULT: "Dir-2 , RIU 03 , Secondary ofc link  Fail",
    RECOVERY: "Dir-2 , RIU 03 , Secondary ofc link  Recovery"
  },
  "0C90": {
    FAULT: "Dir-2 , RIU 04  Fail",
    RECOVERY: "Dir-2 , RIU 04  Recovery"
  },
  "0CA0": {
    FAULT: "Dir-2 , RIU 04 , VIC1  Fail",
    RECOVERY: "Dir-2 , RIU 04 , VIC1  Recovery"
  },
  "0CB0": {
    FAULT: "Dir-2 , RIU 04 , VIC2  Fail",
    RECOVERY: "Dir-2 , RIU 04 , VIC2  Recovery"
  },
  "0CC0": {
    FAULT: "Dir-2 , RIU 04 , VIM1A  Fail",
    RECOVERY: "Dir-2 , RIU 04 , VIM1A  Recovery"
  },
  "0CD0": {
    FAULT: "Dir-2 , RIU 04 , VIM1B  Fail",
    RECOVERY: "Dir-2 , RIU 04 , VIM1B  Recovery"
  },
  "0CE0": {
    FAULT: "Dir-2 , RIU 04 , VIM2A  Fail",
    RECOVERY: "Dir-2 , RIU 04 , VIM2A  Recovery"
  },
  "0CF0": {
    FAULT: "Dir-2 , RIU 04 , VIM2B  Fail",
    RECOVERY: "Dir-2 , RIU 04 , VIM2B  Recovery"
  },
  "0D00": {
    FAULT: "Dir-2 , RIU 04 , VIM3A  Fail",
    RECOVERY: "Dir-2 , RIU 04 , VIM3A  Recovery"
  },
  "0D10": {
    FAULT: "Dir-2 , RIU 04 , VIM3B  Fail",
    RECOVERY: "Dir-2 , RIU 04 , VIM3B  Recovery"
  },
  "0D20": {
    FAULT: "Dir-2 , RIU 04 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-2 , RIU 04 , Charger 1 AC i/p  Recovery"
  },
  "0D30": {
    FAULT: "Dir-2 , RIU 04 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-2 , RIU 04 , Charger 2AC i/p  Recovery"
  },
  "0D40": {
    FAULT: "Dir-2 , RIU 04 , Charger 1o/p  Fail",
    RECOVERY: "Dir-2 , RIU 04 , Charger 1o/p  Recovery"
  },
  "0D50": {
    FAULT: "Dir-2 , RIU 04 , Charger 2o/p  Fail",
    RECOVERY: "Dir-2 , RIU 04 , Charger 2o/p  Recovery"
  },
  "0D60": {
    FAULT: "Dir-2 , RIU 04 , Low battery  Fail",
    RECOVERY: "Dir-2 , RIU 04 , Low battery  Recovery"
  },
  "0D70": {
    FAULT: "Dir-2 , RIU 04 , primay ofc link  Fail",
    RECOVERY: "Dir-2 , RIU 04 , primay ofc link  Recovery"
  },
  "0D80": {
    FAULT: "Dir-2 , RIU 04 , Secondary ofc link  Fail",
    RECOVERY: "Dir-2 , RIU 04 , Secondary ofc link  Recovery"
  },
  "0D90": {
    FAULT: "Dir-2 , RIU 05  Fail",
    RECOVERY: "Dir-2 , RIU 05  Recovery"
  },
  "0DA0": {
    FAULT: "Dir-2 , RIU 05 , VIC1  Fail",
    RECOVERY: "Dir-2 , RIU 05 , VIC1  Recovery"
  },
  "0DB0": {
    FAULT: "Dir-2 , RIU 05 , VIC2  Fail",
    RECOVERY: "Dir-2 , RIU 05 , VIC2  Recovery"
  },
  "0DC0": {
    FAULT: "Dir-2 , RIU 05 , VIM1A  Fail",
    RECOVERY: "Dir-2 , RIU 05 , VIM1A  Recovery"
  },
  "0DD0": {
    FAULT: "Dir-2 , RIU 05 , VIM1B  Fail",
    RECOVERY: "Dir-2 , RIU 05 , VIM1B  Recovery"
  },
  "0DE0": {
    FAULT: "Dir-2 , RIU 05 , VIM2A  Fail",
    RECOVERY: "Dir-2 , RIU 05 , VIM2A  Recovery"
  },
  "0DF0": {
    FAULT: "Dir-2 , RIU 05 , VIM2B  Fail",
    RECOVERY: "Dir-2 , RIU 05 , VIM2B  Recovery"
  },
  "0E00": {
    FAULT: "Dir-2 , RIU 05 , VIM3A  Fail",
    RECOVERY: "Dir-2 , RIU 05 , VIM3A  Recovery"
  },
  "0E10": {
    FAULT: "Dir-2 , RIU 05 , VIM3B  Fail",
    RECOVERY: "Dir-2 , RIU 05 , VIM3B  Recovery"
  },
  "0E20": {
    FAULT: "Dir-2 , RIU 05 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-2 , RIU 05 , Charger 1 AC i/p  Recovery"
  },
  "0E30": {
    FAULT: "Dir-2 , RIU 05 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-2 , RIU 05 , Charger 2AC i/p  Recovery"
  },
  "0E40": {
    FAULT: "Dir-2 , RIU 05 , Charger 1o/p  Fail",
    RECOVERY: "Dir-2 , RIU 05 , Charger 1o/p  Recovery"
  },
  "0E50": {
    FAULT: "Dir-2 , RIU 05 , Charger 2o/p  Fail",
    RECOVERY: "Dir-2 , RIU 05 , Charger 2o/p  Recovery"
  },
  "0E60": {
    FAULT: "Dir-2 , RIU 05 , Low battery  Fail",
    RECOVERY: "Dir-2 , RIU 05 , Low battery  Recovery"
  },
  "0E70": {
    FAULT: "Dir-2 , RIU 05 , primay ofc link  Fail",
    RECOVERY: "Dir-2 , RIU 05 , primay ofc link  Recovery"
  },
  "0E80": {
    FAULT: "Dir-2 , RIU 05 , Secondary ofc link  Fail",
    RECOVERY: "Dir-2 , RIU 05 , Secondary ofc link  Recovery"
  },
  "0E90": {
    FAULT: "Dir-2 , RIU 06  Fail",
    RECOVERY: "Dir-2 , RIU 06  Recovery"
  },
  "0EA0": {
    FAULT: "Dir-2 , RIU 06 , VIC1  Fail",
    RECOVERY: "Dir-2 , RIU 06 , VIC1  Recovery"
  },
  "0EB0": {
    FAULT: "Dir-2 , RIU 06 , VIC2  Fail",
    RECOVERY: "Dir-2 , RIU 06 , VIC2  Recovery"
  },
  "0EC0": {
    FAULT: "Dir-2 , RIU 06 , VIM1A  Fail",
    RECOVERY: "Dir-2 , RIU 06 , VIM1A  Recovery"
  },
  "0ED0": {
    FAULT: "Dir-2 , RIU 06 , VIM1B  Fail",
    RECOVERY: "Dir-2 , RIU 06 , VIM1B  Recovery"
  },
  "0EE0": {
    FAULT: "Dir-2 , RIU 06 , VIM2A  Fail",
    RECOVERY: "Dir-2 , RIU 06 , VIM2A  Recovery"
  },
  "0EF0": {
    FAULT: "Dir-2 , RIU 06 , VIM2B  Fail",
    RECOVERY: "Dir-2 , RIU 06 , VIM2B  Recovery"
  },
  "0F00": {
    FAULT: "Dir-2 , RIU 06 , VIM3A  Fail",
    RECOVERY: "Dir-2 , RIU 06 , VIM3A  Recovery"
  },
  "0F10": {
    FAULT: "Dir-2 , RIU 06 , VIM3B  Fail",
    RECOVERY: "Dir-2 , RIU 06 , VIM3B  Recovery"
  },
  "0F20": {
    FAULT: "Dir-2 , RIU 06 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-2 , RIU 06 , Charger 1 AC i/p  Recovery"
  },
  "0F30": {
    FAULT: "Dir-2 , RIU 06 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-2 , RIU 06 , Charger 2AC i/p  Recovery"
  },
  "0F40": {
    FAULT: "Dir-2 , RIU 06 , Charger 1o/p  Fail",
    RECOVERY: "Dir-2 , RIU 06 , Charger 1o/p  Recovery"
  },
  "0F50": {
    FAULT: "Dir-2 , RIU 06 , Charger 2o/p  Fail",
    RECOVERY: "Dir-2 , RIU 06 , Charger 2o/p  Recovery"
  },
  "0F60": {
    FAULT: "Dir-2 , RIU 06 , Low battery  Fail",
    RECOVERY: "Dir-2 , RIU 06 , Low battery  Recovery"
  },
  "0F70": {
    FAULT: "Dir-2 , RIU 06 , primay ofc link  Fail",
    RECOVERY: "Dir-2 , RIU 06 , primay ofc link  Recovery"
  },
  "0F80": {
    FAULT: "Dir-2 , RIU 06 , Secondary ofc link  Fail",
    RECOVERY: "Dir-2 , RIU 06 , Secondary ofc link  Recovery"
  },
  "0F90": {
    FAULT: "Dir-3 , RIU 01  Fail",
    RECOVERY: "Dir-3 , RIU 01  Recovery"
  },
  "0FA0": {
    FAULT: "Dir-3 , RIU 01 , VIC1  Fail",
    RECOVERY: "Dir-3 , RIU 01 , VIC1  Recovery"
  },
  "0FB0": {
    FAULT: "Dir-3 , RIU 01 , VIC2  Fail",
    RECOVERY: "Dir-3 , RIU 01 , VIC2  Recovery"
  },
  "0FC0": {
    FAULT: "Dir-3 , RIU 01 , VIM1A  Fail",
    RECOVERY: "Dir-3 , RIU 01 , VIM1A  Recovery"
  },
  "0FD0": {
    FAULT: "Dir-3 , RIU 01 , VIM1B  Fail",
    RECOVERY: "Dir-3 , RIU 01 , VIM1B  Recovery"
  },
  "0FE0": {
    FAULT: "Dir-3 , RIU 01 , VIM2A  Fail",
    RECOVERY: "Dir-3 , RIU 01 , VIM2A  Recovery"
  },
  "0FF0": {
    FAULT: "Dir-3 , RIU 01 , VIM2B  Fail",
    RECOVERY: "Dir-3 , RIU 01 , VIM2B  Recovery"
  },
  "1000": {
    FAULT: "Dir-3 , RIU 01 , VIM3A  Fail",
    RECOVERY: "Dir-3 , RIU 01 , VIM3A  Recovery"
  },
  "1010": {
    FAULT: "Dir-3 , RIU 01 , VIM3B  Fail",
    RECOVERY: "Dir-3 , RIU 01 , VIM3B  Recovery"
  },
  "1020": {
    FAULT: "Dir-3 , RIU 01 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-3 , RIU 01 , Charger 1 AC i/p  Recovery"
  },
  "1030": {
    FAULT: "Dir-3 , RIU 01 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-3 , RIU 01 , Charger 2AC i/p  Recovery"
  },
  "1040": {
    FAULT: "Dir-3 , RIU 01 , Charger 1o/p  Fail",
    RECOVERY: "Dir-3 , RIU 01 , Charger 1o/p  Recovery"
  },
  "1050": {
    FAULT: "Dir-3 , RIU 01 , Charger 2o/p  Fail",
    RECOVERY: "Dir-3 , RIU 01 , Charger 2o/p  Recovery"
  },
  "1060": {
    FAULT: "Dir-3 , RIU 01 , Low battery  Fail",
    RECOVERY: "Dir-3 , RIU 01 , Low battery  Recovery"
  },
  "1070": {
    FAULT: "Dir-3 , RIU 01 , primay ofc link  Fail",
    RECOVERY: "Dir-3 , RIU 01 , primay ofc link  Recovery"
  },
  "1080": {
    FAULT: "Dir-3 , RIU 01 , Secondary ofc link  Fail",
    RECOVERY: "Dir-3 , RIU 01 , Secondary ofc link  Recovery"
  },
  "1090": {
    FAULT: "Dir-3 , RIU 02  Fail",
    RECOVERY: "Dir-3 , RIU 02  Recovery"
  },
  "10A0": {
    FAULT: "Dir-3 , RIU 02 , VIC1  Fail",
    RECOVERY: "Dir-3 , RIU 02 , VIC1  Recovery"
  },
  "10B0": {
    FAULT: "Dir-3 , RIU 02 , VIC2  Fail",
    RECOVERY: "Dir-3 , RIU 02 , VIC2  Recovery"
  },
  "10C0": {
    FAULT: "Dir-3 , RIU 02 , VIM1A  Fail",
    RECOVERY: "Dir-3 , RIU 02 , VIM1A  Recovery"
  },
  "10D0": {
    FAULT: "Dir-3 , RIU 02 , VIM1B  Fail",
    RECOVERY: "Dir-3 , RIU 02 , VIM1B  Recovery"
  },
  "10E0": {
    FAULT: "Dir-3 , RIU 02 , VIM2A  Fail",
    RECOVERY: "Dir-3 , RIU 02 , VIM2A  Recovery"
  },
  "10F0": {
    FAULT: "Dir-3 , RIU 02 , VIM2B  Fail",
    RECOVERY: "Dir-3 , RIU 02 , VIM2B  Recovery"
  },
  "1100": {
    FAULT: "Dir-3 , RIU 02 , VIM3A  Fail",
    RECOVERY: "Dir-3 , RIU 02 , VIM3A  Recovery"
  },
  "1110": {
    FAULT: "Dir-3 , RIU 02 , VIM3B  Fail",
    RECOVERY: "Dir-3 , RIU 02 , VIM3B  Recovery"
  },
  "1120": {
    FAULT: "Dir-3 , RIU 02 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-3 , RIU 02 , Charger 1 AC i/p  Recovery"
  },
  "1130": {
    FAULT: "Dir-3 , RIU 02 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-3 , RIU 02 , Charger 2AC i/p  Recovery"
  },
  "1140": {
    FAULT: "Dir-3 , RIU 02 , Charger 1o/p  Fail",
    RECOVERY: "Dir-3 , RIU 02 , Charger 1o/p  Recovery"
  },
  "1150": {
    FAULT: "Dir-3 , RIU 02 , Charger 2o/p  Fail",
    RECOVERY: "Dir-3 , RIU 02 , Charger 2o/p  Recovery"
  },
  "1160": {
    FAULT: "Dir-3 , RIU 02 , Low battery  Fail",
    RECOVERY: "Dir-3 , RIU 02 , Low battery  Recovery"
  },
  "1170": {
    FAULT: "Dir-3 , RIU 02 , primay ofc link  Fail",
    RECOVERY: "Dir-3 , RIU 02 , primay ofc link  Recovery"
  },
  "1180": {
    FAULT: "Dir-3 , RIU 02 , Secondary ofc link  Fail",
    RECOVERY: "Dir-3 , RIU 02 , Secondary ofc link  Recovery"
  },
  "1190": {
    FAULT: "Dir-3 , RIU 03  Fail",
    RECOVERY: "Dir-3 , RIU 03  Recovery"
  },
  "11A0": {
    FAULT: "Dir-3 , RIU 03 , VIC1  Fail",
    RECOVERY: "Dir-3 , RIU 03 , VIC1  Recovery"
  },
  "11B0": {
    FAULT: "Dir-3 , RIU 03 , VIC2  Fail",
    RECOVERY: "Dir-3 , RIU 03 , VIC2  Recovery"
  },
  "11C0": {
    FAULT: "Dir-3 , RIU 03 , VIM1A  Fail",
    RECOVERY: "Dir-3 , RIU 03 , VIM1A  Recovery"
  },
  "11D0": {
    FAULT: "Dir-3 , RIU 03 , VIM1B  Fail",
    RECOVERY: "Dir-3 , RIU 03 , VIM1B  Recovery"
  },
  "11E0": {
    FAULT: "Dir-3 , RIU 03 , VIM2A  Fail",
    RECOVERY: "Dir-3 , RIU 03 , VIM2A  Recovery"
  },
  "11F0": {
    FAULT: "Dir-3 , RIU 03 , VIM2B  Fail",
    RECOVERY: "Dir-3 , RIU 03 , VIM2B  Recovery"
  },
  "1200": {
    FAULT: "Dir-3 , RIU 03 , VIM3A  Fail",
    RECOVERY: "Dir-3 , RIU 03 , VIM3A  Recovery"
  },
  "1210": {
    FAULT: "Dir-3 , RIU 03 , VIM3B  Fail",
    RECOVERY: "Dir-3 , RIU 03 , VIM3B  Recovery"
  },
  "1220": {
    FAULT: "Dir-3 , RIU 03 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-3 , RIU 03 , Charger 1 AC i/p  Recovery"
  },
  "1230": {
    FAULT: "Dir-3 , RIU 03 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-3 , RIU 03 , Charger 2AC i/p  Recovery"
  },
  "1240": {
    FAULT: "Dir-3 , RIU 03 , Charger 1o/p  Fail",
    RECOVERY: "Dir-3 , RIU 03 , Charger 1o/p  Recovery"
  },
  "1250": {
    FAULT: "Dir-3 , RIU 03 , Charger 2o/p  Fail",
    RECOVERY: "Dir-3 , RIU 03 , Charger 2o/p  Recovery"
  },
  "1260": {
    FAULT: "Dir-3 , RIU 03 , Low battery  Fail",
    RECOVERY: "Dir-3 , RIU 03 , Low battery  Recovery"
  },
  "1270": {
    FAULT: "Dir-3 , RIU 03 , primay ofc link  Fail",
    RECOVERY: "Dir-3 , RIU 03 , primay ofc link  Recovery"
  },
  "1280": {
    FAULT: "Dir-3 , RIU 03 , Secondary ofc link  Fail",
    RECOVERY: "Dir-3 , RIU 03 , Secondary ofc link  Recovery"
  },
  "1290": {
    FAULT: "Dir-3 , RIU 04  Fail",
    RECOVERY: "Dir-3 , RIU 04  Recovery"
  },
  "12A0": {
    FAULT: "Dir-3 , RIU 04 , VIC1  Fail",
    RECOVERY: "Dir-3 , RIU 04 , VIC1  Recovery"
  },
  "12B0": {
    FAULT: "Dir-3 , RIU 04 , VIC2  Fail",
    RECOVERY: "Dir-3 , RIU 04 , VIC2  Recovery"
  },
  "12C0": {
    FAULT: "Dir-3 , RIU 04 , VIM1A  Fail",
    RECOVERY: "Dir-3 , RIU 04 , VIM1A  Recovery"
  },
  "12D0": {
    FAULT: "Dir-3 , RIU 04 , VIM1B  Fail",
    RECOVERY: "Dir-3 , RIU 04 , VIM1B  Recovery"
  },
  "12E0": {
    FAULT: "Dir-3 , RIU 04 , VIM2A  Fail",
    RECOVERY: "Dir-3 , RIU 04 , VIM2A  Recovery"
  },
  "12F0": {
    FAULT: "Dir-3 , RIU 04 , VIM2B  Fail",
    RECOVERY: "Dir-3 , RIU 04 , VIM2B  Recovery"
  },
  "1300": {
    FAULT: "Dir-3 , RIU 04 , VIM3A  Fail",
    RECOVERY: "Dir-3 , RIU 04 , VIM3A  Recovery"
  },
  "1310": {
    FAULT: "Dir-3 , RIU 04 , VIM3B  Fail",
    RECOVERY: "Dir-3 , RIU 04 , VIM3B  Recovery"
  },
  "1320": {
    FAULT: "Dir-3 , RIU 04 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-3 , RIU 04 , Charger 1 AC i/p  Recovery"
  },
  "1330": {
    FAULT: "Dir-3 , RIU 04 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-3 , RIU 04 , Charger 2AC i/p  Recovery"
  },
  "1340": {
    FAULT: "Dir-3 , RIU 04 , Charger 1o/p  Fail",
    RECOVERY: "Dir-3 , RIU 04 , Charger 1o/p  Recovery"
  },
  "1350": {
    FAULT: "Dir-3 , RIU 04 , Charger 2o/p  Fail",
    RECOVERY: "Dir-3 , RIU 04 , Charger 2o/p  Recovery"
  },
  "1360": {
    FAULT: "Dir-3 , RIU 04 , Low battery  Fail",
    RECOVERY: "Dir-3 , RIU 04 , Low battery  Recovery"
  },
  "1370": {
    FAULT: "Dir-3 , RIU 04 , primay ofc link  Fail",
    RECOVERY: "Dir-3 , RIU 04 , primay ofc link  Recovery"
  },
  "1380": {
    FAULT: "Dir-3 , RIU 04 , Secondary ofc link  Fail",
    RECOVERY: "Dir-3 , RIU 04 , Secondary ofc link  Recovery"
  },
  "1390": {
    FAULT: "Dir-3 , RIU 05  Fail",
    RECOVERY: "Dir-3 , RIU 05  Recovery"
  },
  "13A0": {
    FAULT: "Dir-3 , RIU 05 , VIC1  Fail",
    RECOVERY: "Dir-3 , RIU 05 , VIC1  Recovery"
  },
  "13B0": {
    FAULT: "Dir-3 , RIU 05 , VIC2  Fail",
    RECOVERY: "Dir-3 , RIU 05 , VIC2  Recovery"
  },
  "13C0": {
    FAULT: "Dir-3 , RIU 05 , VIM1A  Fail",
    RECOVERY: "Dir-3 , RIU 05 , VIM1A  Recovery"
  },
  "13D0": {
    FAULT: "Dir-3 , RIU 05 , VIM1B  Fail",
    RECOVERY: "Dir-3 , RIU 05 , VIM1B  Recovery"
  },
  "13E0": {
    FAULT: "Dir-3 , RIU 05 , VIM2A  Fail",
    RECOVERY: "Dir-3 , RIU 05 , VIM2A  Recovery"
  },
  "13F0": {
    FAULT: "Dir-3 , RIU 05 , VIM2B  Fail",
    RECOVERY: "Dir-3 , RIU 05 , VIM2B  Recovery"
  },
  "1400": {
    FAULT: "Dir-3 , RIU 05 , VIM3A  Fail",
    RECOVERY: "Dir-3 , RIU 05 , VIM3A  Recovery"
  },
  "1410": {
    FAULT: "Dir-3 , RIU 05 , VIM3B  Fail",
    RECOVERY: "Dir-3 , RIU 05 , VIM3B  Recovery"
  },
  "1420": {
    FAULT: "Dir-3 , RIU 05 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-3 , RIU 05 , Charger 1 AC i/p  Recovery"
  },
  "1430": {
    FAULT: "Dir-3 , RIU 05 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-3 , RIU 05 , Charger 2AC i/p  Recovery"
  },
  "1440": {
    FAULT: "Dir-3 , RIU 05 , Charger 1o/p  Fail",
    RECOVERY: "Dir-3 , RIU 05 , Charger 1o/p  Recovery"
  },
  "1450": {
    FAULT: "Dir-3 , RIU 05 , Charger 2o/p  Fail",
    RECOVERY: "Dir-3 , RIU 05 , Charger 2o/p  Recovery"
  },
  "1460": {
    FAULT: "Dir-3 , RIU 05 , Low battery  Fail",
    RECOVERY: "Dir-3 , RIU 05 , Low battery  Recovery"
  },
  "1470": {
    FAULT: "Dir-3 , RIU 05 , primay ofc link  Fail",
    RECOVERY: "Dir-3 , RIU 05 , primay ofc link  Recovery"
  },
  "1480": {
    FAULT: "Dir-3 , RIU 05 , Secondary ofc link  Fail",
    RECOVERY: "Dir-3 , RIU 05 , Secondary ofc link  Recovery"
  },
  "1490": {
    FAULT: "Dir-3 , RIU 06  Fail",
    RECOVERY: "Dir-3 , RIU 06  Recovery"
  },
  "14A0": {
    FAULT: "Dir-3 , RIU 06 , VIC1  Fail",
    RECOVERY: "Dir-3 , RIU 06 , VIC1  Recovery"
  },
  "14B0": {
    FAULT: "Dir-3 , RIU 06 , VIC2  Fail",
    RECOVERY: "Dir-3 , RIU 06 , VIC2  Recovery"
  },
  "14C0": {
    FAULT: "Dir-3 , RIU 06 , VIM1A  Fail",
    RECOVERY: "Dir-3 , RIU 06 , VIM1A  Recovery"
  },
  "14D0": {
    FAULT: "Dir-3 , RIU 06 , VIM1B  Fail",
    RECOVERY: "Dir-3 , RIU 06 , VIM1B  Recovery"
  },
  "14E0": {
    FAULT: "Dir-3 , RIU 06 , VIM2A  Fail",
    RECOVERY: "Dir-3 , RIU 06 , VIM2A  Recovery"
  },
  "14F0": {
    FAULT: "Dir-3 , RIU 06 , VIM2B  Fail",
    RECOVERY: "Dir-3 , RIU 06 , VIM2B  Recovery"
  },
  "1500": {
    FAULT: "Dir-3 , RIU 06 , VIM3A  Fail",
    RECOVERY: "Dir-3 , RIU 06 , VIM3A  Recovery"
  },
  "1510": {
    FAULT: "Dir-3 , RIU 06 , VIM3B  Fail",
    RECOVERY: "Dir-3 , RIU 06 , VIM3B  Recovery"
  },
  "1520": {
    FAULT: "Dir-3 , RIU 06 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-3 , RIU 06 , Charger 1 AC i/p  Recovery"
  },
  "1530": {
    FAULT: "Dir-3 , RIU 06 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-3 , RIU 06 , Charger 2AC i/p  Recovery"
  },
  "1540": {
    FAULT: "Dir-3 , RIU 06 , Charger 1o/p  Fail",
    RECOVERY: "Dir-3 , RIU 06 , Charger 1o/p  Recovery"
  },
  "1550": {
    FAULT: "Dir-3 , RIU 06 , Charger 2o/p  Fail",
    RECOVERY: "Dir-3 , RIU 06 , Charger 2o/p  Recovery"
  },
  "1560": {
    FAULT: "Dir-3 , RIU 06 , Low battery  Fail",
    RECOVERY: "Dir-3 , RIU 06 , Low battery  Recovery"
  },
  "1570": {
    FAULT: "Dir-3 , RIU 06 , primay ofc link  Fail",
    RECOVERY: "Dir-3 , RIU 06 , primay ofc link  Recovery"
  },
  "1580": {
    FAULT: "Dir-3 , RIU 06 , Secondary ofc link  Fail",
    RECOVERY: "Dir-3 , RIU 06 , Secondary ofc link  Recovery"
  },
  "1590": {
    FAULT: "Dir-4 , RIU 01  Fail",
    RECOVERY: "Dir-4 , RIU 01  Recovery"
  },
  "15A0": {
    FAULT: "Dir-4 , RIU 01 , VIC1  Fail",
    RECOVERY: "Dir-4 , RIU 01 , VIC1  Recovery"
  },
  "15B0": {
    FAULT: "Dir-4 , RIU 01 , VIC2  Fail",
    RECOVERY: "Dir-4 , RIU 01 , VIC2  Recovery"
  },
  "15C0": {
    FAULT: "Dir-4 , RIU 01 , VIM1A  Fail",
    RECOVERY: "Dir-4 , RIU 01 , VIM1A  Recovery"
  },
  "15D0": {
    FAULT: "Dir-4 , RIU 01 , VIM1B  Fail",
    RECOVERY: "Dir-4 , RIU 01 , VIM1B  Recovery"
  },
  "15E0": {
    FAULT: "Dir-4 , RIU 01 , VIM2A  Fail",
    RECOVERY: "Dir-4 , RIU 01 , VIM2A  Recovery"
  },
  "15F0": {
    FAULT: "Dir-4 , RIU 01 , VIM2B  Fail",
    RECOVERY: "Dir-4 , RIU 01 , VIM2B  Recovery"
  },
  "1600": {
    FAULT: "Dir-4 , RIU 01 , VIM3A  Fail",
    RECOVERY: "Dir-4 , RIU 01 , VIM3A  Recovery"
  },
  "1610": {
    FAULT: "Dir-4 , RIU 01 , VIM3B  Fail",
    RECOVERY: "Dir-4 , RIU 01 , VIM3B  Recovery"
  },
  "1620": {
    FAULT: "Dir-4 , RIU 01 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-4 , RIU 01 , Charger 1 AC i/p  Recovery"
  },
  "1630": {
    FAULT: "Dir-4 , RIU 01 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-4 , RIU 01 , Charger 2AC i/p  Recovery"
  },
  "1640": {
    FAULT: "Dir-4 , RIU 01 , Charger 1o/p  Fail",
    RECOVERY: "Dir-4 , RIU 01 , Charger 1o/p  Recovery"
  },
  "1650": {
    FAULT: "Dir-4 , RIU 01 , Charger 2o/p  Fail",
    RECOVERY: "Dir-4 , RIU 01 , Charger 2o/p  Recovery"
  },
  "1660": {
    FAULT: "Dir-4 , RIU 01 , Low battery  Fail",
    RECOVERY: "Dir-4 , RIU 01 , Low battery  Recovery"
  },
  "1670": {
    FAULT: "Dir-4 , RIU 01 , primay ofc link  Fail",
    RECOVERY: "Dir-4 , RIU 01 , primay ofc link  Recovery"
  },
  "1680": {
    FAULT: "Dir-4 , RIU 01 , Secondary ofc link  Fail",
    RECOVERY: "Dir-4 , RIU 01 , Secondary ofc link  Recovery"
  },
  "1690": {
    FAULT: "Dir-4 , RIU 02  Fail",
    RECOVERY: "Dir-4 , RIU 02  Recovery"
  },
  "16A0": {
    FAULT: "Dir-4 , RIU 02 , VIC1  Fail",
    RECOVERY: "Dir-4 , RIU 02 , VIC1  Recovery"
  },
  "16B0": {
    FAULT: "Dir-4 , RIU 02 , VIC2  Fail",
    RECOVERY: "Dir-4 , RIU 02 , VIC2  Recovery"
  },
  "16C0": {
    FAULT: "Dir-4 , RIU 02 , VIM1A  Fail",
    RECOVERY: "Dir-4 , RIU 02 , VIM1A  Recovery"
  },
  "16D0": {
    FAULT: "Dir-4 , RIU 02 , VIM1B  Fail",
    RECOVERY: "Dir-4 , RIU 02 , VIM1B  Recovery"
  },
  "16E0": {
    FAULT: "Dir-4 , RIU 02 , VIM2A  Fail",
    RECOVERY: "Dir-4 , RIU 02 , VIM2A  Recovery"
  },
  "16F0": {
    FAULT: "Dir-4 , RIU 02 , VIM2B  Fail",
    RECOVERY: "Dir-4 , RIU 02 , VIM2B  Recovery"
  },
  "1700": {
    FAULT: "Dir-4 , RIU 02 , VIM3A  Fail",
    RECOVERY: "Dir-4 , RIU 02 , VIM3A  Recovery"
  },
  "1710": {
    FAULT: "Dir-4 , RIU 02 , VIM3B  Fail",
    RECOVERY: "Dir-4 , RIU 02 , VIM3B  Recovery"
  },
  "1720": {
    FAULT: "Dir-4 , RIU 02 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-4 , RIU 02 , Charger 1 AC i/p  Recovery"
  },
  "1730": {
    FAULT: "Dir-4 , RIU 02 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-4 , RIU 02 , Charger 2AC i/p  Recovery"
  },
  "1740": {
    FAULT: "Dir-4 , RIU 02 , Charger 1o/p  Fail",
    RECOVERY: "Dir-4 , RIU 02 , Charger 1o/p  Recovery"
  },
  "1750": {
    FAULT: "Dir-4 , RIU 02 , Charger 2o/p  Fail",
    RECOVERY: "Dir-4 , RIU 02 , Charger 2o/p  Recovery"
  },
  "1760": {
    FAULT: "Dir-4 , RIU 02 , Low battery  Fail",
    RECOVERY: "Dir-4 , RIU 02 , Low battery  Recovery"
  },
  "1770": {
    FAULT: "Dir-4 , RIU 02 , primay ofc link  Fail",
    RECOVERY: "Dir-4 , RIU 02 , primay ofc link  Recovery"
  },
  "1780": {
    FAULT: "Dir-4 , RIU 02 , Secondary ofc link  Fail",
    RECOVERY: "Dir-4 , RIU 02 , Secondary ofc link  Recovery"
  },
  "1790": {
    FAULT: "Dir-4 , RIU 03  Fail",
    RECOVERY: "Dir-4 , RIU 03  Recovery"
  },
  "17A0": {
    FAULT: "Dir-4 , RIU 03 , VIC1  Fail",
    RECOVERY: "Dir-4 , RIU 03 , VIC1  Recovery"
  },
  "17B0": {
    FAULT: "Dir-4 , RIU 03 , VIC2  Fail",
    RECOVERY: "Dir-4 , RIU 03 , VIC2  Recovery"
  },
  "17C0": {
    FAULT: "Dir-4 , RIU 03 , VIM1A  Fail",
    RECOVERY: "Dir-4 , RIU 03 , VIM1A  Recovery"
  },
  "17D0": {
    FAULT: "Dir-4 , RIU 03 , VIM1B  Fail",
    RECOVERY: "Dir-4 , RIU 03 , VIM1B  Recovery"
  },
  "17E0": {
    FAULT: "Dir-4 , RIU 03 , VIM2A  Fail",
    RECOVERY: "Dir-4 , RIU 03 , VIM2A  Recovery"
  },
  "17F0": {
    FAULT: "Dir-4 , RIU 03 , VIM2B  Fail",
    RECOVERY: "Dir-4 , RIU 03 , VIM2B  Recovery"
  },
  "1800": {
    FAULT: "Dir-4 , RIU 03 , VIM3A  Fail",
    RECOVERY: "Dir-4 , RIU 03 , VIM3A  Recovery"
  },
  "1810": {
    FAULT: "Dir-4 , RIU 03 , VIM3B  Fail",
    RECOVERY: "Dir-4 , RIU 03 , VIM3B  Recovery"
  },
  "1820": {
    FAULT: "Dir-4 , RIU 03 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-4 , RIU 03 , Charger 1 AC i/p  Recovery"
  },
  "1830": {
    FAULT: "Dir-4 , RIU 03 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-4 , RIU 03 , Charger 2AC i/p  Recovery"
  },
  "1840": {
    FAULT: "Dir-4 , RIU 03 , Charger 1o/p  Fail",
    RECOVERY: "Dir-4 , RIU 03 , Charger 1o/p  Recovery"
  },
  "1850": {
    FAULT: "Dir-4 , RIU 03 , Charger 2o/p  Fail",
    RECOVERY: "Dir-4 , RIU 03 , Charger 2o/p  Recovery"
  },
  "1860": {
    FAULT: "Dir-4 , RIU 03 , Low battery  Fail",
    RECOVERY: "Dir-4 , RIU 03 , Low battery  Recovery"
  },
  "1870": {
    FAULT: "Dir-4 , RIU 03 , primay ofc link  Fail",
    RECOVERY: "Dir-4 , RIU 03 , primay ofc link  Recovery"
  },
  "1880": {
    FAULT: "Dir-4 , RIU 03 , Secondary ofc link  Fail",
    RECOVERY: "Dir-4 , RIU 03 , Secondary ofc link  Recovery"
  },
  "1890": {
    FAULT: "Dir-4 , RIU 04  Fail",
    RECOVERY: "Dir-4 , RIU 04  Recovery"
  },
  "18A0": {
    FAULT: "Dir-4 , RIU 04 , VIC1  Fail",
    RECOVERY: "Dir-4 , RIU 04 , VIC1  Recovery"
  },
  "18B0": {
    FAULT: "Dir-4 , RIU 04 , VIC2  Fail",
    RECOVERY: "Dir-4 , RIU 04 , VIC2  Recovery"
  },
  "18C0": {
    FAULT: "Dir-4 , RIU 04 , VIM1A  Fail",
    RECOVERY: "Dir-4 , RIU 04 , VIM1A  Recovery"
  },
  "18D0": {
    FAULT: "Dir-4 , RIU 04 , VIM1B  Fail",
    RECOVERY: "Dir-4 , RIU 04 , VIM1B  Recovery"
  },
  "18E0": {
    FAULT: "Dir-4 , RIU 04 , VIM2A  Fail",
    RECOVERY: "Dir-4 , RIU 04 , VIM2A  Recovery"
  },
  "18F0": {
    FAULT: "Dir-4 , RIU 04 , VIM2B  Fail",
    RECOVERY: "Dir-4 , RIU 04 , VIM2B  Recovery"
  },
  "1900": {
    FAULT: "Dir-4 , RIU 04 , VIM3A  Fail",
    RECOVERY: "Dir-4 , RIU 04 , VIM3A  Recovery"
  },
  "1910": {
    FAULT: "Dir-4 , RIU 04 , VIM3B  Fail",
    RECOVERY: "Dir-4 , RIU 04 , VIM3B  Recovery"
  },
  "1920": {
    FAULT: "Dir-4 , RIU 04 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-4 , RIU 04 , Charger 1 AC i/p  Recovery"
  },
  "1930": {
    FAULT: "Dir-4 , RIU 04 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-4 , RIU 04 , Charger 2AC i/p  Recovery"
  },
  "1940": {
    FAULT: "Dir-4 , RIU 04 , Charger 1o/p  Fail",
    RECOVERY: "Dir-4 , RIU 04 , Charger 1o/p  Recovery"
  },
  "1950": {
    FAULT: "Dir-4 , RIU 04 , Charger 2o/p  Fail",
    RECOVERY: "Dir-4 , RIU 04 , Charger 2o/p  Recovery"
  },
  "1960": {
    FAULT: "Dir-4 , RIU 04 , Low battery  Fail",
    RECOVERY: "Dir-4 , RIU 04 , Low battery  Recovery"
  },
  "1970": {
    FAULT: "Dir-4 , RIU 04 , primay ofc link  Fail",
    RECOVERY: "Dir-4 , RIU 04 , primay ofc link  Recovery"
  },
  "1980": {
    FAULT: "Dir-4 , RIU 04 , Secondary ofc link  Fail",
    RECOVERY: "Dir-4 , RIU 04 , Secondary ofc link  Recovery"
  },
  "1990": {
    FAULT: "Dir-4 , RIU 05  Fail",
    RECOVERY: "Dir-4 , RIU 05  Recovery"
  },
  "19A0": {
    FAULT: "Dir-4 , RIU 05 , VIC1  Fail",
    RECOVERY: "Dir-4 , RIU 05 , VIC1  Recovery"
  },
  "19B0": {
    FAULT: "Dir-4 , RIU 05 , VIC2  Fail",
    RECOVERY: "Dir-4 , RIU 05 , VIC2  Recovery"
  },
  "19C0": {
    FAULT: "Dir-4 , RIU 05 , VIM1A  Fail",
    RECOVERY: "Dir-4 , RIU 05 , VIM1A  Recovery"
  },
  "19D0": {
    FAULT: "Dir-4 , RIU 05 , VIM1B  Fail",
    RECOVERY: "Dir-4 , RIU 05 , VIM1B  Recovery"
  },
  "19E0": {
    FAULT: "Dir-4 , RIU 05 , VIM2A  Fail",
    RECOVERY: "Dir-4 , RIU 05 , VIM2A  Recovery"
  },
  "19F0": {
    FAULT: "Dir-4 , RIU 05 , VIM2B  Fail",
    RECOVERY: "Dir-4 , RIU 05 , VIM2B  Recovery"
  },
  "1A00": {
    FAULT: "Dir-4 , RIU 05 , VIM3A  Fail",
    RECOVERY: "Dir-4 , RIU 05 , VIM3A  Recovery"
  },
  "1A10": {
    FAULT: "Dir-4 , RIU 05 , VIM3B  Fail",
    RECOVERY: "Dir-4 , RIU 05 , VIM3B  Recovery"
  },
  "1A20": {
    FAULT: "Dir-4 , RIU 05 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-4 , RIU 05 , Charger 1 AC i/p  Recovery"
  },
  "1A30": {
    FAULT: "Dir-4 , RIU 05 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-4 , RIU 05 , Charger 2AC i/p  Recovery"
  },
  "1A40": {
    FAULT: "Dir-4 , RIU 05 , Charger 1o/p  Fail",
    RECOVERY: "Dir-4 , RIU 05 , Charger 1o/p  Recovery"
  },
  "1A50": {
    FAULT: "Dir-4 , RIU 05 , Charger 2o/p  Fail",
    RECOVERY: "Dir-4 , RIU 05 , Charger 2o/p  Recovery"
  },
  "1A60": {
    FAULT: "Dir-4 , RIU 05 , Low battery  Fail",
    RECOVERY: "Dir-4 , RIU 05 , Low battery  Recovery"
  },
  "1A70": {
    FAULT: "Dir-4 , RIU 05 , primay ofc link  Fail",
    RECOVERY: "Dir-4 , RIU 05 , primay ofc link  Recovery"
  },
  "1A80": {
    FAULT: "Dir-4 , RIU 05 , Secondary ofc link  Fail",
    RECOVERY: "Dir-4 , RIU 05 , Secondary ofc link  Recovery"
  },
  "1A90": {
    FAULT: "Dir-4 , RIU 06  Fail",
    RECOVERY: "Dir-4 , RIU 06  Recovery"
  },
  "1AA0": {
    FAULT: "Dir-4 , RIU 06 , VIC1  Fail",
    RECOVERY: "Dir-4 , RIU 06 , VIC1  Recovery"
  },
  "1AB0": {
    FAULT: "Dir-4 , RIU 06 , VIC2  Fail",
    RECOVERY: "Dir-4 , RIU 06 , VIC2  Recovery"
  },
  "1AC0": {
    FAULT: "Dir-4 , RIU 06 , VIM1A  Fail",
    RECOVERY: "Dir-4 , RIU 06 , VIM1A  Recovery"
  },
  "1AD0": {
    FAULT: "Dir-4 , RIU 06 , VIM1B  Fail",
    RECOVERY: "Dir-4 , RIU 06 , VIM1B  Recovery"
  },
  "1AE0": {
    FAULT: "Dir-4 , RIU 06 , VIM2A  Fail",
    RECOVERY: "Dir-4 , RIU 06 , VIM2A  Recovery"
  },
  "1AF0": {
    FAULT: "Dir-4 , RIU 06 , VIM2B  Fail",
    RECOVERY: "Dir-4 , RIU 06 , VIM2B  Recovery"
  },
  "1B00": {
    FAULT: "Dir-4 , RIU 06 , VIM3A  Fail",
    RECOVERY: "Dir-4 , RIU 06 , VIM3A  Recovery"
  },
  "1B10": {
    FAULT: "Dir-4 , RIU 06 , VIM3B  Fail",
    RECOVERY: "Dir-4 , RIU 06 , VIM3B  Recovery"
  },
  "1B20": {
    FAULT: "Dir-4 , RIU 06 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-4 , RIU 06 , Charger 1 AC i/p  Recovery"
  },
  "1B30": {
    FAULT: "Dir-4 , RIU 06 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-4 , RIU 06 , Charger 2AC i/p  Recovery"
  },
  "1B40": {
    FAULT: "Dir-4 , RIU 06 , Charger 1o/p  Fail",
    RECOVERY: "Dir-4 , RIU 06 , Charger 1o/p  Recovery"
  },
  "1B50": {
    FAULT: "Dir-4 , RIU 06 , Charger 2o/p  Fail",
    RECOVERY: "Dir-4 , RIU 06 , Charger 2o/p  Recovery"
  },
  "1B60": {
    FAULT: "Dir-4 , RIU 06 , Low battery  Fail",
    RECOVERY: "Dir-4 , RIU 06 , Low battery  Recovery"
  },
  "1B70": {
    FAULT: "Dir-4 , RIU 06 , primay ofc link  Fail",
    RECOVERY: "Dir-4 , RIU 06 , primay ofc link  Recovery"
  },
  "1B80": {
    FAULT: "Dir-4 , RIU 06 , Secondary ofc link  Fail",
    RECOVERY: "Dir-4 , RIU 06 , Secondary ofc link  Recovery"
  },
  "1B90": {
    FAULT: "Dir-5 , RIU 01  Fail",
    RECOVERY: "Dir-5 , RIU 01  Recovery"
  },
  "1BA0": {
    FAULT: "Dir-5 , RIU 01 , VIC1  Fail",
    RECOVERY: "Dir-5 , RIU 01 , VIC1  Recovery"
  },
  "1BB0": {
    FAULT: "Dir-5 , RIU 01 , VIC2  Fail",
    RECOVERY: "Dir-5 , RIU 01 , VIC2  Recovery"
  },
  "1BC0": {
    FAULT: "Dir-5 , RIU 01 , VIM1A  Fail",
    RECOVERY: "Dir-5 , RIU 01 , VIM1A  Recovery"
  },
  "1BD0": {
    FAULT: "Dir-5 , RIU 01 , VIM1B  Fail",
    RECOVERY: "Dir-5 , RIU 01 , VIM1B  Recovery"
  },
  "1BE0": {
    FAULT: "Dir-5 , RIU 01 , VIM2A  Fail",
    RECOVERY: "Dir-5 , RIU 01 , VIM2A  Recovery"
  },
  "1BF0": {
    FAULT: "Dir-5 , RIU 01 , VIM2B  Fail",
    RECOVERY: "Dir-5 , RIU 01 , VIM2B  Recovery"
  },
  "1C00": {
    FAULT: "Dir-5 , RIU 01 , VIM3A  Fail",
    RECOVERY: "Dir-5 , RIU 01 , VIM3A  Recovery"
  },
  "1C10": {
    FAULT: "Dir-5 , RIU 01 , VIM3B  Fail",
    RECOVERY: "Dir-5 , RIU 01 , VIM3B  Recovery"
  },
  "1C20": {
    FAULT: "Dir-5 , RIU 01 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-5 , RIU 01 , Charger 1 AC i/p  Recovery"
  },
  "1C30": {
    FAULT: "Dir-5 , RIU 01 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-5 , RIU 01 , Charger 2AC i/p  Recovery"
  },
  "1C40": {
    FAULT: "Dir-5 , RIU 01 , Charger 1o/p  Fail",
    RECOVERY: "Dir-5 , RIU 01 , Charger 1o/p  Recovery"
  },
  "1C50": {
    FAULT: "Dir-5 , RIU 01 , Charger 2o/p  Fail",
    RECOVERY: "Dir-5 , RIU 01 , Charger 2o/p  Recovery"
  },
  "1C60": {
    FAULT: "Dir-5 , RIU 01 , Low battery  Fail",
    RECOVERY: "Dir-5 , RIU 01 , Low battery  Recovery"
  },
  "1C70": {
    FAULT: "Dir-5 , RIU 01 , primay ofc link  Fail",
    RECOVERY: "Dir-5 , RIU 01 , primay ofc link  Recovery"
  },
  "1C80": {
    FAULT: "Dir-5 , RIU 01 , Secondary ofc link  Fail",
    RECOVERY: "Dir-5 , RIU 01 , Secondary ofc link  Recovery"
  },
  "1C90": {
    FAULT: "Dir-5 , RIU 02  Fail",
    RECOVERY: "Dir-5 , RIU 02  Recovery"
  },
  "1CA0": {
    FAULT: "Dir-5 , RIU 02 , VIC1  Fail",
    RECOVERY: "Dir-5 , RIU 02 , VIC1  Recovery"
  },
  "1CB0": {
    FAULT: "Dir-5 , RIU 02 , VIC2  Fail",
    RECOVERY: "Dir-5 , RIU 02 , VIC2  Recovery"
  },
  "1CC0": {
    FAULT: "Dir-5 , RIU 02 , VIM1A  Fail",
    RECOVERY: "Dir-5 , RIU 02 , VIM1A  Recovery"
  },
  "1CD0": {
    FAULT: "Dir-5 , RIU 02 , VIM1B  Fail",
    RECOVERY: "Dir-5 , RIU 02 , VIM1B  Recovery"
  },
  "1CE0": {
    FAULT: "Dir-5 , RIU 02 , VIM2A  Fail",
    RECOVERY: "Dir-5 , RIU 02 , VIM2A  Recovery"
  },
  "1CF0": {
    FAULT: "Dir-5 , RIU 02 , VIM2B  Fail",
    RECOVERY: "Dir-5 , RIU 02 , VIM2B  Recovery"
  },
  "1D00": {
    FAULT: "Dir-5 , RIU 02 , VIM3A  Fail",
    RECOVERY: "Dir-5 , RIU 02 , VIM3A  Recovery"
  },
  "1D10": {
    FAULT: "Dir-5 , RIU 02 , VIM3B  Fail",
    RECOVERY: "Dir-5 , RIU 02 , VIM3B  Recovery"
  },
  "1D20": {
    FAULT: "Dir-5 , RIU 02 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-5 , RIU 02 , Charger 1 AC i/p  Recovery"
  },
  "1D30": {
    FAULT: "Dir-5 , RIU 02 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-5 , RIU 02 , Charger 2AC i/p  Recovery"
  },
  "1D40": {
    FAULT: "Dir-5 , RIU 02 , Charger 1o/p  Fail",
    RECOVERY: "Dir-5 , RIU 02 , Charger 1o/p  Recovery"
  },
  "1D50": {
    FAULT: "Dir-5 , RIU 02 , Charger 2o/p  Fail",
    RECOVERY: "Dir-5 , RIU 02 , Charger 2o/p  Recovery"
  },
  "1D60": {
    FAULT: "Dir-5 , RIU 02 , Low battery  Fail",
    RECOVERY: "Dir-5 , RIU 02 , Low battery  Recovery"
  },
  "1D70": {
    FAULT: "Dir-5 , RIU 02 , primay ofc link  Fail",
    RECOVERY: "Dir-5 , RIU 02 , primay ofc link  Recovery"
  },
  "1D80": {
    FAULT: "Dir-5 , RIU 02 , Secondary ofc link  Fail",
    RECOVERY: "Dir-5 , RIU 02 , Secondary ofc link  Recovery"
  },
  "1D90": {
    FAULT: "Dir-5 , RIU 03  Fail",
    RECOVERY: "Dir-5 , RIU 03  Recovery"
  },
  "1DA0": {
    FAULT: "Dir-5 , RIU 03 , VIC1  Fail",
    RECOVERY: "Dir-5 , RIU 03 , VIC1  Recovery"
  },
  "1DB0": {
    FAULT: "Dir-5 , RIU 03 , VIC2  Fail",
    RECOVERY: "Dir-5 , RIU 03 , VIC2  Recovery"
  },
  "1DC0": {
    FAULT: "Dir-5 , RIU 03 , VIM1A  Fail",
    RECOVERY: "Dir-5 , RIU 03 , VIM1A  Recovery"
  },
  "1DD0": {
    FAULT: "Dir-5 , RIU 03 , VIM1B  Fail",
    RECOVERY: "Dir-5 , RIU 03 , VIM1B  Recovery"
  },
  "1DE0": {
    FAULT: "Dir-5 , RIU 03 , VIM2A  Fail",
    RECOVERY: "Dir-5 , RIU 03 , VIM2A  Recovery"
  },
  "1DF0": {
    FAULT: "Dir-5 , RIU 03 , VIM2B  Fail",
    RECOVERY: "Dir-5 , RIU 03 , VIM2B  Recovery"
  },
  "1E00": {
    FAULT: "Dir-5 , RIU 03 , VIM3A  Fail",
    RECOVERY: "Dir-5 , RIU 03 , VIM3A  Recovery"
  },
  "1E10": {
    FAULT: "Dir-5 , RIU 03 , VIM3B  Fail",
    RECOVERY: "Dir-5 , RIU 03 , VIM3B  Recovery"
  },
  "1E20": {
    FAULT: "Dir-5 , RIU 03 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-5 , RIU 03 , Charger 1 AC i/p  Recovery"
  },
  "1E30": {
    FAULT: "Dir-5 , RIU 03 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-5 , RIU 03 , Charger 2AC i/p  Recovery"
  },
  "1E40": {
    FAULT: "Dir-5 , RIU 03 , Charger 1o/p  Fail",
    RECOVERY: "Dir-5 , RIU 03 , Charger 1o/p  Recovery"
  },
  "1E50": {
    FAULT: "Dir-5 , RIU 03 , Charger 2o/p  Fail",
    RECOVERY: "Dir-5 , RIU 03 , Charger 2o/p  Recovery"
  },
  "1E60": {
    FAULT: "Dir-5 , RIU 03 , Low battery  Fail",
    RECOVERY: "Dir-5 , RIU 03 , Low battery  Recovery"
  },
  "1E70": {
    FAULT: "Dir-5 , RIU 03 , primay ofc link  Fail",
    RECOVERY: "Dir-5 , RIU 03 , primay ofc link  Recovery"
  },
  "1E80": {
    FAULT: "Dir-5 , RIU 03 , Secondary ofc link  Fail",
    RECOVERY: "Dir-5 , RIU 03 , Secondary ofc link  Recovery"
  },
  "1E90": {
    FAULT: "Dir-5 , RIU 04  Fail",
    RECOVERY: "Dir-5 , RIU 04  Recovery"
  },
  "1EA0": {
    FAULT: "Dir-5 , RIU 04 , VIC1  Fail",
    RECOVERY: "Dir-5 , RIU 04 , VIC1  Recovery"
  },
  "1EB0": {
    FAULT: "Dir-5 , RIU 04 , VIC2  Fail",
    RECOVERY: "Dir-5 , RIU 04 , VIC2  Recovery"
  },
  "1EC0": {
    FAULT: "Dir-5 , RIU 04 , VIM1A  Fail",
    RECOVERY: "Dir-5 , RIU 04 , VIM1A  Recovery"
  },
  "1ED0": {
    FAULT: "Dir-5 , RIU 04 , VIM1B  Fail",
    RECOVERY: "Dir-5 , RIU 04 , VIM1B  Recovery"
  },
  "1EE0": {
    FAULT: "Dir-5 , RIU 04 , VIM2A  Fail",
    RECOVERY: "Dir-5 , RIU 04 , VIM2A  Recovery"
  },
  "1EF0": {
    FAULT: "Dir-5 , RIU 04 , VIM2B  Fail",
    RECOVERY: "Dir-5 , RIU 04 , VIM2B  Recovery"
  },
  "1F00": {
    FAULT: "Dir-5 , RIU 04 , VIM3A  Fail",
    RECOVERY: "Dir-5 , RIU 04 , VIM3A  Recovery"
  },
  "1F10": {
    FAULT: "Dir-5 , RIU 04 , VIM3B  Fail",
    RECOVERY: "Dir-5 , RIU 04 , VIM3B  Recovery"
  },
  "1F20": {
    FAULT: "Dir-5 , RIU 04 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-5 , RIU 04 , Charger 1 AC i/p  Recovery"
  },
  "1F30": {
    FAULT: "Dir-5 , RIU 04 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-5 , RIU 04 , Charger 2AC i/p  Recovery"
  },
  "1F40": {
    FAULT: "Dir-5 , RIU 04 , Charger 1o/p  Fail",
    RECOVERY: "Dir-5 , RIU 04 , Charger 1o/p  Recovery"
  },
  "1F50": {
    FAULT: "Dir-5 , RIU 04 , Charger 2o/p  Fail",
    RECOVERY: "Dir-5 , RIU 04 , Charger 2o/p  Recovery"
  },
  "1F60": {
    FAULT: "Dir-5 , RIU 04 , Low battery  Fail",
    RECOVERY: "Dir-5 , RIU 04 , Low battery  Recovery"
  },
  "1F70": {
    FAULT: "Dir-5 , RIU 04 , primay ofc link  Fail",
    RECOVERY: "Dir-5 , RIU 04 , primay ofc link  Recovery"
  },
  "1F80": {
    FAULT: "Dir-5 , RIU 04 , Secondary ofc link  Fail",
    RECOVERY: "Dir-5 , RIU 04 , Secondary ofc link  Recovery"
  },
  "1F90": {
    FAULT: "Dir-5 , RIU 05  Fail",
    RECOVERY: "Dir-5 , RIU 05  Recovery"
  },
  "1FA0": {
    FAULT: "Dir-5 , RIU 05 , VIC1  Fail",
    RECOVERY: "Dir-5 , RIU 05 , VIC1  Recovery"
  },
  "1FB0": {
    FAULT: "Dir-5 , RIU 05 , VIC2  Fail",
    RECOVERY: "Dir-5 , RIU 05 , VIC2  Recovery"
  },
  "1FC0": {
    FAULT: "Dir-5 , RIU 05 , VIM1A  Fail",
    RECOVERY: "Dir-5 , RIU 05 , VIM1A  Recovery"
  },
  "1FD0": {
    FAULT: "Dir-5 , RIU 05 , VIM1B  Fail",
    RECOVERY: "Dir-5 , RIU 05 , VIM1B  Recovery"
  },
  "1FE0": {
    FAULT: "Dir-5 , RIU 05 , VIM2A  Fail",
    RECOVERY: "Dir-5 , RIU 05 , VIM2A  Recovery"
  },
  "1FF0": {
    FAULT: "Dir-5 , RIU 05 , VIM2B  Fail",
    RECOVERY: "Dir-5 , RIU 05 , VIM2B  Recovery"
  },
  "2000": {
    FAULT: "Dir-5 , RIU 05 , VIM3A  Fail",
    RECOVERY: "Dir-5 , RIU 05 , VIM3A  Recovery"
  },
  "2010": {
    FAULT: "Dir-5 , RIU 05 , VIM3B  Fail",
    RECOVERY: "Dir-5 , RIU 05 , VIM3B  Recovery"
  },
  "2020": {
    FAULT: "Dir-5 , RIU 05 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-5 , RIU 05 , Charger 1 AC i/p  Recovery"
  },
  "2030": {
    FAULT: "Dir-5 , RIU 05 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-5 , RIU 05 , Charger 2AC i/p  Recovery"
  },
  "2040": {
    FAULT: "Dir-5 , RIU 05 , Charger 1o/p  Fail",
    RECOVERY: "Dir-5 , RIU 05 , Charger 1o/p  Recovery"
  },
  "2050": {
    FAULT: "Dir-5 , RIU 05 , Charger 2o/p  Fail",
    RECOVERY: "Dir-5 , RIU 05 , Charger 2o/p  Recovery"
  },
  "2060": {
    FAULT: "Dir-5 , RIU 05 , Low battery  Fail",
    RECOVERY: "Dir-5 , RIU 05 , Low battery  Recovery"
  },
  "2070": {
    FAULT: "Dir-5 , RIU 05 , primay ofc link  Fail",
    RECOVERY: "Dir-5 , RIU 05 , primay ofc link  Recovery"
  },
  "2080": {
    FAULT: "Dir-5 , RIU 05 , Secondary ofc link  Fail",
    RECOVERY: "Dir-5 , RIU 05 , Secondary ofc link  Recovery"
  },
  "2090": {
    FAULT: "Dir-5 , RIU 06  Fail",
    RECOVERY: "Dir-5 , RIU 06  Recovery"
  },
  "20A0": {
    FAULT: "Dir-5 , RIU 06 , VIC1  Fail",
    RECOVERY: "Dir-5 , RIU 06 , VIC1  Recovery"
  },
  "20B0": {
    FAULT: "Dir-5 , RIU 06 , VIC2  Fail",
    RECOVERY: "Dir-5 , RIU 06 , VIC2  Recovery"
  },
  "20C0": {
    FAULT: "Dir-5 , RIU 06 , VIM1A  Fail",
    RECOVERY: "Dir-5 , RIU 06 , VIM1A  Recovery"
  },
  "20D0": {
    FAULT: "Dir-5 , RIU 06 , VIM1B  Fail",
    RECOVERY: "Dir-5 , RIU 06 , VIM1B  Recovery"
  },
  "20E0": {
    FAULT: "Dir-5 , RIU 06 , VIM2A  Fail",
    RECOVERY: "Dir-5 , RIU 06 , VIM2A  Recovery"
  },
  "20F0": {
    FAULT: "Dir-5 , RIU 06 , VIM2B  Fail",
    RECOVERY: "Dir-5 , RIU 06 , VIM2B  Recovery"
  },
  "2100": {
    FAULT: "Dir-5 , RIU 06 , VIM3A  Fail",
    RECOVERY: "Dir-5 , RIU 06 , VIM3A  Recovery"
  },
  "2110": {
    FAULT: "Dir-5 , RIU 06 , VIM3B  Fail",
    RECOVERY: "Dir-5 , RIU 06 , VIM3B  Recovery"
  },
  "2120": {
    FAULT: "Dir-5 , RIU 06 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-5 , RIU 06 , Charger 1 AC i/p  Recovery"
  },
  "2130": {
    FAULT: "Dir-5 , RIU 06 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-5 , RIU 06 , Charger 2AC i/p  Recovery"
  },
  "2140": {
    FAULT: "Dir-5 , RIU 06 , Charger 1o/p  Fail",
    RECOVERY: "Dir-5 , RIU 06 , Charger 1o/p  Recovery"
  },
  "2150": {
    FAULT: "Dir-5 , RIU 06 , Charger 2o/p  Fail",
    RECOVERY: "Dir-5 , RIU 06 , Charger 2o/p  Recovery"
  },
  "2160": {
    FAULT: "Dir-5 , RIU 06 , Low battery  Fail",
    RECOVERY: "Dir-5 , RIU 06 , Low battery  Recovery"
  },
  "2170": {
    FAULT: "Dir-5 , RIU 06 , primay ofc link  Fail",
    RECOVERY: "Dir-5 , RIU 06 , primay ofc link  Recovery"
  },
  "2180": {
    FAULT: "Dir-5 , RIU 06 , Secondary ofc link  Fail",
    RECOVERY: "Dir-5 , RIU 06 , Secondary ofc link  Recovery"
  },
  "2190": {
    FAULT: "Dir-6 , RIU 01  Fail",
    RECOVERY: "Dir-6 , RIU 01  Recovery"
  },
  "21A0": {
    FAULT: "Dir-6 , RIU 01 , VIC1  Fail",
    RECOVERY: "Dir-6 , RIU 01 , VIC1  Recovery"
  },
  "21B0": {
    FAULT: "Dir-6 , RIU 01 , VIC2  Fail",
    RECOVERY: "Dir-6 , RIU 01 , VIC2  Recovery"
  },
  "21C0": {
    FAULT: "Dir-6 , RIU 01 , VIM1A  Fail",
    RECOVERY: "Dir-6 , RIU 01 , VIM1A  Recovery"
  },
  "21D0": {
    FAULT: "Dir-6 , RIU 01 , VIM1B  Fail",
    RECOVERY: "Dir-6 , RIU 01 , VIM1B  Recovery"
  },
  "21E0": {
    FAULT: "Dir-6 , RIU 01 , VIM2A  Fail",
    RECOVERY: "Dir-6 , RIU 01 , VIM2A  Recovery"
  },
  "21F0": {
    FAULT: "Dir-6 , RIU 01 , VIM2B  Fail",
    RECOVERY: "Dir-6 , RIU 01 , VIM2B  Recovery"
  },
  "2200": {
    FAULT: "Dir-6 , RIU 01 , VIM3A  Fail",
    RECOVERY: "Dir-6 , RIU 01 , VIM3A  Recovery"
  },
  "2210": {
    FAULT: "Dir-6 , RIU 01 , VIM3B  Fail",
    RECOVERY: "Dir-6 , RIU 01 , VIM3B  Recovery"
  },
  "2220": {
    FAULT: "Dir-6 , RIU 01 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-6 , RIU 01 , Charger 1 AC i/p  Recovery"
  },
  "2230": {
    FAULT: "Dir-6 , RIU 01 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-6 , RIU 01 , Charger 2AC i/p  Recovery"
  },
  "2240": {
    FAULT: "Dir-6 , RIU 01 , Charger 1o/p  Fail",
    RECOVERY: "Dir-6 , RIU 01 , Charger 1o/p  Recovery"
  },
  "2250": {
    FAULT: "Dir-6 , RIU 01 , Charger 2o/p  Fail",
    RECOVERY: "Dir-6 , RIU 01 , Charger 2o/p  Recovery"
  },
  "2260": {
    FAULT: "Dir-6 , RIU 01 , Low battery  Fail",
    RECOVERY: "Dir-6 , RIU 01 , Low battery  Recovery"
  },
  "2270": {
    FAULT: "Dir-6 , RIU 01 , primay ofc link  Fail",
    RECOVERY: "Dir-6 , RIU 01 , primay ofc link  Recovery"
  },
  "2280": {
    FAULT: "Dir-6 , RIU 01 , Secondary ofc link  Fail",
    RECOVERY: "Dir-6 , RIU 01 , Secondary ofc link  Recovery"
  },
  "2290": {
    FAULT: "Dir-6 , RIU 02  Fail",
    RECOVERY: "Dir-6 , RIU 02  Recovery"
  },
  "22A0": {
    FAULT: "Dir-6 , RIU 02 , VIC1  Fail",
    RECOVERY: "Dir-6 , RIU 02 , VIC1  Recovery"
  },
  "22B0": {
    FAULT: "Dir-6 , RIU 02 , VIC2  Fail",
    RECOVERY: "Dir-6 , RIU 02 , VIC2  Recovery"
  },
  "22C0": {
    FAULT: "Dir-6 , RIU 02 , VIM1A  Fail",
    RECOVERY: "Dir-6 , RIU 02 , VIM1A  Recovery"
  },
  "22D0": {
    FAULT: "Dir-6 , RIU 02 , VIM1B  Fail",
    RECOVERY: "Dir-6 , RIU 02 , VIM1B  Recovery"
  },
  "22E0": {
    FAULT: "Dir-6 , RIU 02 , VIM2A  Fail",
    RECOVERY: "Dir-6 , RIU 02 , VIM2A  Recovery"
  },
  "22F0": {
    FAULT: "Dir-6 , RIU 02 , VIM2B  Fail",
    RECOVERY: "Dir-6 , RIU 02 , VIM2B  Recovery"
  },
  "2300": {
    FAULT: "Dir-6 , RIU 02 , VIM3A  Fail",
    RECOVERY: "Dir-6 , RIU 02 , VIM3A  Recovery"
  },
  "2310": {
    FAULT: "Dir-6 , RIU 02 , VIM3B  Fail",
    RECOVERY: "Dir-6 , RIU 02 , VIM3B  Recovery"
  },
  "2320": {
    FAULT: "Dir-6 , RIU 02 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-6 , RIU 02 , Charger 1 AC i/p  Recovery"
  },
  "2330": {
    FAULT: "Dir-6 , RIU 02 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-6 , RIU 02 , Charger 2AC i/p  Recovery"
  },
  "2340": {
    FAULT: "Dir-6 , RIU 02 , Charger 1o/p  Fail",
    RECOVERY: "Dir-6 , RIU 02 , Charger 1o/p  Recovery"
  },
  "2350": {
    FAULT: "Dir-6 , RIU 02 , Charger 2o/p  Fail",
    RECOVERY: "Dir-6 , RIU 02 , Charger 2o/p  Recovery"
  },
  "2360": {
    FAULT: "Dir-6 , RIU 02 , Low battery  Fail",
    RECOVERY: "Dir-6 , RIU 02 , Low battery  Recovery"
  },
  "2370": {
    FAULT: "Dir-6 , RIU 02 , primay ofc link  Fail",
    RECOVERY: "Dir-6 , RIU 02 , primay ofc link  Recovery"
  },
  "2380": {
    FAULT: "Dir-6 , RIU 02 , Secondary ofc link  Fail",
    RECOVERY: "Dir-6 , RIU 02 , Secondary ofc link  Recovery"
  },
  "2390": {
    FAULT: "Dir-6 , RIU 03  Fail",
    RECOVERY: "Dir-6 , RIU 03  Recovery"
  },
  "23A0": {
    FAULT: "Dir-6 , RIU 03 , VIC1  Fail",
    RECOVERY: "Dir-6 , RIU 03 , VIC1  Recovery"
  },
  "23B0": {
    FAULT: "Dir-6 , RIU 03 , VIC2  Fail",
    RECOVERY: "Dir-6 , RIU 03 , VIC2  Recovery"
  },
  "23C0": {
    FAULT: "Dir-6 , RIU 03 , VIM1A  Fail",
    RECOVERY: "Dir-6 , RIU 03 , VIM1A  Recovery"
  },
  "23D0": {
    FAULT: "Dir-6 , RIU 03 , VIM1B  Fail",
    RECOVERY: "Dir-6 , RIU 03 , VIM1B  Recovery"
  },
  "23E0": {
    FAULT: "Dir-6 , RIU 03 , VIM2A  Fail",
    RECOVERY: "Dir-6 , RIU 03 , VIM2A  Recovery"
  },
  "23F0": {
    FAULT: "Dir-6 , RIU 03 , VIM2B  Fail",
    RECOVERY: "Dir-6 , RIU 03 , VIM2B  Recovery"
  },
  "2400": {
    FAULT: "Dir-6 , RIU 03 , VIM3A  Fail",
    RECOVERY: "Dir-6 , RIU 03 , VIM3A  Recovery"
  },
  "2410": {
    FAULT: "Dir-6 , RIU 03 , VIM3B  Fail",
    RECOVERY: "Dir-6 , RIU 03 , VIM3B  Recovery"
  },
  "2420": {
    FAULT: "Dir-6 , RIU 03 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-6 , RIU 03 , Charger 1 AC i/p  Recovery"
  },
  "2430": {
    FAULT: "Dir-6 , RIU 03 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-6 , RIU 03 , Charger 2AC i/p  Recovery"
  },
  "2440": {
    FAULT: "Dir-6 , RIU 03 , Charger 1o/p  Fail",
    RECOVERY: "Dir-6 , RIU 03 , Charger 1o/p  Recovery"
  },
  "2450": {
    FAULT: "Dir-6 , RIU 03 , Charger 2o/p  Fail",
    RECOVERY: "Dir-6 , RIU 03 , Charger 2o/p  Recovery"
  },
  "2460": {
    FAULT: "Dir-6 , RIU 03 , Low battery  Fail",
    RECOVERY: "Dir-6 , RIU 03 , Low battery  Recovery"
  },
  "2470": {
    FAULT: "Dir-6 , RIU 03 , primay ofc link  Fail",
    RECOVERY: "Dir-6 , RIU 03 , primay ofc link  Recovery"
  },
  "2480": {
    FAULT: "Dir-6 , RIU 03 , Secondary ofc link  Fail",
    RECOVERY: "Dir-6 , RIU 03 , Secondary ofc link  Recovery"
  },
  "2490": {
    FAULT: "Dir-6 , RIU 04  Fail",
    RECOVERY: "Dir-6 , RIU 04  Recovery"
  },
  "24A0": {
    FAULT: "Dir-6 , RIU 04 , VIC1  Fail",
    RECOVERY: "Dir-6 , RIU 04 , VIC1  Recovery"
  },
  "24B0": {
    FAULT: "Dir-6 , RIU 04 , VIC2  Fail",
    RECOVERY: "Dir-6 , RIU 04 , VIC2  Recovery"
  },
  "24C0": {
    FAULT: "Dir-6 , RIU 04 , VIM1A  Fail",
    RECOVERY: "Dir-6 , RIU 04 , VIM1A  Recovery"
  },
  "24D0": {
    FAULT: "Dir-6 , RIU 04 , VIM1B  Fail",
    RECOVERY: "Dir-6 , RIU 04 , VIM1B  Recovery"
  },
  "24E0": {
    FAULT: "Dir-6 , RIU 04 , VIM2A  Fail",
    RECOVERY: "Dir-6 , RIU 04 , VIM2A  Recovery"
  },
  "24F0": {
    FAULT: "Dir-6 , RIU 04 , VIM2B  Fail",
    RECOVERY: "Dir-6 , RIU 04 , VIM2B  Recovery"
  },
  "2500": {
    FAULT: "Dir-6 , RIU 04 , VIM3A  Fail",
    RECOVERY: "Dir-6 , RIU 04 , VIM3A  Recovery"
  },
  "2510": {
    FAULT: "Dir-6 , RIU 04 , VIM3B  Fail",
    RECOVERY: "Dir-6 , RIU 04 , VIM3B  Recovery"
  },
  "2520": {
    FAULT: "Dir-6 , RIU 04 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-6 , RIU 04 , Charger 1 AC i/p  Recovery"
  },
  "2530": {
    FAULT: "Dir-6 , RIU 04 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-6 , RIU 04 , Charger 2AC i/p  Recovery"
  },
  "2540": {
    FAULT: "Dir-6 , RIU 04 , Charger 1o/p  Fail",
    RECOVERY: "Dir-6 , RIU 04 , Charger 1o/p  Recovery"
  },
  "2550": {
    FAULT: "Dir-6 , RIU 04 , Charger 2o/p  Fail",
    RECOVERY: "Dir-6 , RIU 04 , Charger 2o/p  Recovery"
  },
  "2560": {
    FAULT: "Dir-6 , RIU 04 , Low battery  Fail",
    RECOVERY: "Dir-6 , RIU 04 , Low battery  Recovery"
  },
  "2570": {
    FAULT: "Dir-6 , RIU 04 , primay ofc link  Fail",
    RECOVERY: "Dir-6 , RIU 04 , primay ofc link  Recovery"
  },
  "2580": {
    FAULT: "Dir-6 , RIU 04 , Secondary ofc link  Fail",
    RECOVERY: "Dir-6 , RIU 04 , Secondary ofc link  Recovery"
  },
  "2590": {
    FAULT: "Dir-6 , RIU 05  Fail",
    RECOVERY: "Dir-6 , RIU 05  Recovery"
  },
  "25A0": {
    FAULT: "Dir-6 , RIU 05 , VIC1  Fail",
    RECOVERY: "Dir-6 , RIU 05 , VIC1  Recovery"
  },
  "25B0": {
    FAULT: "Dir-6 , RIU 05 , VIC2  Fail",
    RECOVERY: "Dir-6 , RIU 05 , VIC2  Recovery"
  },
  "25C0": {
    FAULT: "Dir-6 , RIU 05 , VIM1A  Fail",
    RECOVERY: "Dir-6 , RIU 05 , VIM1A  Recovery"
  },
  "25D0": {
    FAULT: "Dir-6 , RIU 05 , VIM1B  Fail",
    RECOVERY: "Dir-6 , RIU 05 , VIM1B  Recovery"
  },
  "25E0": {
    FAULT: "Dir-6 , RIU 05 , VIM2A  Fail",
    RECOVERY: "Dir-6 , RIU 05 , VIM2A  Recovery"
  },
  "25F0": {
    FAULT: "Dir-6 , RIU 05 , VIM2B  Fail",
    RECOVERY: "Dir-6 , RIU 05 , VIM2B  Recovery"
  },
  "2600": {
    FAULT: "Dir-6 , RIU 05 , VIM3A  Fail",
    RECOVERY: "Dir-6 , RIU 05 , VIM3A  Recovery"
  },
  "2610": {
    FAULT: "Dir-6 , RIU 05 , VIM3B  Fail",
    RECOVERY: "Dir-6 , RIU 05 , VIM3B  Recovery"
  },
  "2620": {
    FAULT: "Dir-6 , RIU 05 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-6 , RIU 05 , Charger 1 AC i/p  Recovery"
  },
  "2630": {
    FAULT: "Dir-6 , RIU 05 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-6 , RIU 05 , Charger 2AC i/p  Recovery"
  },
  "2640": {
    FAULT: "Dir-6 , RIU 05 , Charger 1o/p  Fail",
    RECOVERY: "Dir-6 , RIU 05 , Charger 1o/p  Recovery"
  },
  "2650": {
    FAULT: "Dir-6 , RIU 05 , Charger 2o/p  Fail",
    RECOVERY: "Dir-6 , RIU 05 , Charger 2o/p  Recovery"
  },
  "2660": {
    FAULT: "Dir-6 , RIU 05 , Low battery  Fail",
    RECOVERY: "Dir-6 , RIU 05 , Low battery  Recovery"
  },
  "2670": {
    FAULT: "Dir-6 , RIU 05 , primay ofc link  Fail",
    RECOVERY: "Dir-6 , RIU 05 , primay ofc link  Recovery"
  },
  "2680": {
    FAULT: "Dir-6 , RIU 05 , Secondary ofc link  Fail",
    RECOVERY: "Dir-6 , RIU 05 , Secondary ofc link  Recovery"
  },
  "2690": {
    FAULT: "Dir-6 , RIU 06  Fail",
    RECOVERY: "Dir-6 , RIU 06  Recovery"
  },
  "26A0": {
    FAULT: "Dir-6 , RIU 06 , VIC1  Fail",
    RECOVERY: "Dir-6 , RIU 06 , VIC1  Recovery"
  },
  "26B0": {
    FAULT: "Dir-6 , RIU 06 , VIC2  Fail",
    RECOVERY: "Dir-6 , RIU 06 , VIC2  Recovery"
  },
  "26C0": {
    FAULT: "Dir-6 , RIU 06 , VIM1A  Fail",
    RECOVERY: "Dir-6 , RIU 06 , VIM1A  Recovery"
  },
  "26D0": {
    FAULT: "Dir-6 , RIU 06 , VIM1B  Fail",
    RECOVERY: "Dir-6 , RIU 06 , VIM1B  Recovery"
  },
  "26E0": {
    FAULT: "Dir-6 , RIU 06 , VIM2A  Fail",
    RECOVERY: "Dir-6 , RIU 06 , VIM2A  Recovery"
  },
  "26F0": {
    FAULT: "Dir-6 , RIU 06 , VIM2B  Fail",
    RECOVERY: "Dir-6 , RIU 06 , VIM2B  Recovery"
  },
  "2700": {
    FAULT: "Dir-6 , RIU 06 , VIM3A  Fail",
    RECOVERY: "Dir-6 , RIU 06 , VIM3A  Recovery"
  },
  "2710": {
    FAULT: "Dir-6 , RIU 06 , VIM3B  Fail",
    RECOVERY: "Dir-6 , RIU 06 , VIM3B  Recovery"
  },
  "2720": {
    FAULT: "Dir-6 , RIU 06 , Charger 1 AC i/p  Fail",
    RECOVERY: "Dir-6 , RIU 06 , Charger 1 AC i/p  Recovery"
  },
  "2730": {
    FAULT: "Dir-6 , RIU 06 , Charger 2AC i/p  Fail",
    RECOVERY: "Dir-6 , RIU 06 , Charger 2AC i/p  Recovery"
  },
  "2740": {
    FAULT: "Dir-6 , RIU 06 , Charger 1o/p  Fail",
    RECOVERY: "Dir-6 , RIU 06 , Charger 1o/p  Recovery"
  },
  "2750": {
    FAULT: "Dir-6 , RIU 06 , Charger 2o/p  Fail",
    RECOVERY: "Dir-6 , RIU 06 , Charger 2o/p  Recovery"
  },
  "2760": {
    FAULT: "Dir-6 , RIU 06 , Low battery  Fail",
    RECOVERY: "Dir-6 , RIU 06 , Low battery  Recovery"
  },
  "2770": {
    FAULT: "Dir-6 , RIU 06 , primay ofc link  Fail",
    RECOVERY: "Dir-6 , RIU 06 , primay ofc link  Recovery"
  },
  "2780": {
    FAULT: "Dir-6 , RIU 06 , Secondary ofc link  Fail",
    RECOVERY: "Dir-6 , RIU 06 , Secondary ofc link  Recovery"
  },
  "2790": {
    FAULT: "Direction - 1 Blue Ring Fail",
    RECOVERY: "Direction - 1 Blue Ring Recovery"
  },
  "27A0": {
    FAULT: "Direction - 1 Red Ring Fail",
    RECOVERY: "Direction - 1 Red Ring Recovery"
  },
  "27B0": {
    FAULT: "Direction - 2 Blue Ring Fail",
    RECOVERY: "Direction - 2 Blue Ring Recovery"
  },
  "27C0": {
    FAULT: "Direction - 2 Red Ring Fail",
    RECOVERY: "Direction - 2 Red Ring Recovery"
  },
  "27D0": {
    FAULT: "Direction - 3 Blue Ring Fail",
    RECOVERY: "Direction - 3 Blue Ring Recovery"
  },
  "27E0": {
    FAULT: "Direction - 3 Red Ring Fail",
    RECOVERY: "Direction - 3 Red Ring Recovery"
  },
  "27F0": {
    FAULT: "Direction - 4 Blue Ring Fail",
    RECOVERY: "Direction - 4 Blue Ring Recovery"
  },
  "2800": {
    FAULT: "Direction - 4 Red Ring Fail",
    RECOVERY: "Direction - 4 Red Ring Recovery"
  },
  "2810": {
    FAULT: "Direction - 5 Blue Ring Fail",
    RECOVERY: "Direction - 5 Blue Ring Recovery"
  },
  "2820": {
    FAULT: "Direction - 5 Red Ring Fail",
    RECOVERY: "Direction - 5 Red Ring Recovery"
  },
  "2830": {
    FAULT: "Direction - 6 Blue Ring Fail",
    RECOVERY: "Direction - 6 Blue Ring Recovery"
  },
  "2840": {
    FAULT: "Direction - 6 Red Ring Fail",
    RECOVERY: "Direction - 6 Red Ring Recovery"
  },
  "2850": {
    FAULT: "VIM -1A  Fail",
    RECOVERY: "VIM -1A  Recovery"
  },
  "2860": {
    FAULT: "VIM -1B  Fail",
    RECOVERY: "VIM -1B  Recovery"
  },
  "2870": {
    FAULT: "VIM -2A  Fail",
    RECOVERY: "VIM -2A  Recovery"
  },
  "2880": {
    FAULT: "VIM -2B  Fail",
    RECOVERY: "VIM -2B  Recovery"
  },
  "2890": {
    FAULT: "VIM -3A  Fail",
    RECOVERY: "VIM -3A  Recovery"
  },
  "28A0": {
    FAULT: "VIM -3B  Fail",
    RECOVERY: "VIM -3B  Recovery"
  },
  "28B0": {
    FAULT: "VIM -4A  Fail",
    RECOVERY: "VIM -4A  Recovery"
  },
  "28C0": {
    FAULT: "VIM -4B  Fail",
    RECOVERY: "VIM -4B  Recovery"
  },
  "28D0": {
    FAULT: "VIM -5A  Fail",
    RECOVERY: "VIM -5A  Recovery"
  },
  "28E0": {
    FAULT: "VIM -5B  Fail",
    RECOVERY: "VIM -5B  Recovery"
  },
  "28F0": {
    FAULT: "VIM -6A  Fail",
    RECOVERY: "VIM -6A  Recovery"
  },
  "2900": {
    FAULT: "VIM -6B  Fail",
    RECOVERY: "VIM -6B  Recovery"
  },
  "2910": {
    FAULT: "VIM -7A  Fail",
    RECOVERY: "VIM -7A  Recovery"
  },
  "2920": {
    FAULT: "VIM -7B  Fail",
    RECOVERY: "VIM -7B  Recovery"
  },
  "2930": {
    FAULT: "VIM -8A  Fail",
    RECOVERY: "VIM -8A  Recovery"
  },
  "2940": {
    FAULT: "VIM -8B  Fail",
    RECOVERY: "VIM -8B  Recovery"
  },
  "2950": {
    FAULT: "VIM -9A  Fail",
    RECOVERY: "VIM -9A  Recovery"
  },
  "2960": {
    FAULT: "VIM -9B  Fail",
    RECOVERY: "VIM -9B  Recovery"
  },
  "2970": {
    FAULT: "VIM -10A  Fail",
    RECOVERY: "VIM -10A  Recovery"
  },
  "2980": {
    FAULT: "VIM -10B  Fail",
    RECOVERY: "VIM -10B  Recovery"
  },
  "2990": {
    FAULT: "VIM -11A  Fail",
    RECOVERY: "VIM -11A  Recovery"
  },
  "29A0": {
    FAULT: "VIM -11B  Fail",
    RECOVERY: "VIM -11B  Recovery"
  },
  "29B0": {
    FAULT: "VIM -12A  Fail",
    RECOVERY: "VIM -12A  Recovery"
  },
  "29C0": {
    FAULT: "VIM -12B  Fail",
    RECOVERY: "VIM -12B  Recovery"
  },
  "29D0": {
    FAULT: "VIM -13A  Fail",
    RECOVERY: "VIM -13A  Recovery"
  },
  "29E0": {
    FAULT: "VIM -13B  Fail",
    RECOVERY: "VIM -13B  Recovery"
  },
  "29F0": {
    FAULT: "VIM -14A  Fail",
    RECOVERY: "VIM -14A  Recovery"
  },
  "2A00": {
    FAULT: "VIM -14B  Fail",
    RECOVERY: "VIM -14B  Recovery"
  },
  "2A10": {
    FAULT: "VIM -15A  Fail",
    RECOVERY: "VIM -15A  Recovery"
  },
  "2A20": {
    FAULT: "VIM -15B  Fail",
    RECOVERY: "VIM -15B  Recovery"
  },
  "2A30": {
    FAULT: "VIM -16A  Fail",
    RECOVERY: "VIM -16A  Recovery"
  },
  "2A40": {
    FAULT: "VIM -16B  Fail",
    RECOVERY: "VIM -16B  Recovery"
  },
  "2A50": {
    FAULT: "VIM -17A  Fail",
    RECOVERY: "VIM -17A  Recovery"
  },
  "2A60": {
    FAULT: "VIM -17B  Fail",
    RECOVERY: "VIM -17B  Recovery"
  },
  "2A70": {
    FAULT: "VIM -18A  Fail",
    RECOVERY: "VIM -18A  Recovery"
  },
  "2A80": {
    FAULT: "VIM -18B  Fail",
    RECOVERY: "VIM -18B  Recovery"
  },
  "2A90": {
    FAULT: "VIM -19A  Fail",
    RECOVERY: "VIM -19A  Recovery"
  },
  "2AA0": {
    FAULT: "VIM -19B  Fail",
    RECOVERY: "VIM -19B  Recovery"
  },
  "2AB0": {
    FAULT: "VIM -20A  Fail",
    RECOVERY: "VIM -20A  Recovery"
  },
  "2AC0": {
    FAULT: "VIM -20B  Fail",
    RECOVERY: "VIM -20B  Recovery"
  },
  "2AD0": {
    FAULT: "VIM -21A  Fail",
    RECOVERY: "VIM -21A  Recovery"
  },
  "2AE0": {
    FAULT: "VIM -21B  Fail",
    RECOVERY: "VIM -21B  Recovery"
  },
  "2AF0": {
    FAULT: "VIM -22A  Fail",
    RECOVERY: "VIM -22A  Recovery"
  },
  "2B00": {
    FAULT: "VIM -22B  Fail",
    RECOVERY: "VIM -22B  Recovery"
  },
  "2B10": {
    FAULT: "VIM -23A  Fail",
    RECOVERY: "VIM -23A  Recovery"
  },
  "2B20": {
    FAULT: "VIM -23B  Fail",
    RECOVERY: "VIM -23B  Recovery"
  },
  "2B30": {
    FAULT: "VIM -24A  Fail",
    RECOVERY: "VIM -24A  Recovery"
  },
  "2B40": {
    FAULT: "VIM -24B  Fail",
    RECOVERY: "VIM -24B  Recovery"
  },
  "2B50": {
    FAULT: "VIM -25A  Fail",
    RECOVERY: "VIM -25A  Recovery"
  },
  "2B60": {
    FAULT: "VIM -25B  Fail",
    RECOVERY: "VIM -25B  Recovery"
  },
  "2B70": {
    FAULT: "VIM -26A  Fail",
    RECOVERY: "VIM -26A  Recovery"
  },
  "2B80": {
    FAULT: "VIM -26B  Fail",
    RECOVERY: "VIM -26B  Recovery"
  },
  "2B90": {
    FAULT: "VIM -27A  Fail",
    RECOVERY: "VIM -27A  Recovery"
  },
  "2BA0": {
    FAULT: "VIM -27B  Fail",
    RECOVERY: "VIM -27B  Recovery"
  },
  "2BB0": {
    FAULT: "VIM -28A  Fail",
    RECOVERY: "VIM -28A  Recovery"
  },
  "2BC0": {
    FAULT: "VIM -28B  Fail",
    RECOVERY: "VIM -28B  Recovery"
  },
  "2BD0": {
    FAULT: "VIM -29A  Fail",
    RECOVERY: "VIM -29A  Recovery"
  },
  "2BE0": {
    FAULT: "VIM -29B  Fail",
    RECOVERY: "VIM -29B  Recovery"
  },
  "2BF0": {
    FAULT: "VIM -30A  Fail",
    RECOVERY: "VIM -30A  Recovery"
  },
  "2C00": {
    FAULT: "VIM -30B  Fail",
    RECOVERY: "VIM -30B  Recovery"
  },
  "2C10": {
    FAULT: "VIM -31A  Fail",
    RECOVERY: "VIM -31A  Recovery"
  },
  "2C20": {
    FAULT: "VIM -31B  Fail",
    RECOVERY: "VIM -31B  Recovery"
  },
  "2C30": {
    FAULT: "VIM -32A  Fail",
    RECOVERY: "VIM -32A  Recovery"
  },
  "2C40": {
    FAULT: "VIM -32B  Fail",
    RECOVERY: "VIM -32B  Recovery"
  },
  "2C50": {
    FAULT: "VIM -33A  Fail",
    RECOVERY: "VIM -33A  Recovery"
  },
  "2C60": {
    FAULT: "VIM -33B  Fail",
    RECOVERY: "VIM -33B  Recovery"
  },
  "2C70": {
    FAULT: "VIM -34A  Fail",
    RECOVERY: "VIM -34A  Recovery"
  },
  "2C80": {
    FAULT: "VIM -34B  Fail",
    RECOVERY: "VIM -34B  Recovery"
  },
  "2C90": {
    FAULT: "VIM -35A  Fail",
    RECOVERY: "VIM -35A  Recovery"
  },
  "2CA0": {
    FAULT: "VIM -35B  Fail",
    RECOVERY: "VIM -35B  Recovery"
  },
  "2CB0": {
    FAULT: "VIM -36A  Fail",
    RECOVERY: "VIM -36A  Recovery"
  },
  "2CC0": {
    FAULT: "VIM -36B  Fail",
    RECOVERY: "VIM -36B  Recovery"
  },
  "2CD0": {
    FAULT: "VIM -37A  Fail",
    RECOVERY: "VIM -37A  Recovery"
  },
  "2CE0": {
    FAULT: "VIM -37B  Fail",
    RECOVERY: "VIM -37B  Recovery"
  },
  "2CF0": {
    FAULT: "VIM -38A  Fail",
    RECOVERY: "VIM -38A  Recovery"
  },
  "2D00": {
    FAULT: "VIM -38B  Fail",
    RECOVERY: "VIM -38B  Recovery"
  },
  "2D10": {
    FAULT: "VIM -39A  Fail",
    RECOVERY: "VIM -39A  Recovery"
  },
  "2D20": {
    FAULT: "VIM -39B  Fail",
    RECOVERY: "VIM -39B  Recovery"
  },
  "2D30": {
    FAULT: "VIM -40A  Fail",
    RECOVERY: "VIM -40A  Recovery"
  },
  "2D40": {
    FAULT: "VIM -40B  Fail",
    RECOVERY: "VIM -40B  Recovery"
  },
  "2D50": {
    FAULT: "VIM -41A  Fail",
    RECOVERY: "VIM -41A  Recovery"
  },
  "2D60": {
    FAULT: "VIM -41B  Fail",
    RECOVERY: "VIM -41B  Recovery"
  },
  "2D70": {
    FAULT: "VIM -42A  Fail",
    RECOVERY: "VIM -42A  Recovery"
  },
  "2D80": {
    FAULT: "VIM -42B  Fail",
    RECOVERY: "VIM -42B  Recovery"
  },
  "2D90": {
    FAULT: "VIM -43A  Fail",
    RECOVERY: "VIM -43A  Recovery"
  },
  "2DA0": {
    FAULT: "VIM -43B  Fail",
    RECOVERY: "VIM -43B  Recovery"
  },
  "2DB0": {
    FAULT: "VIM -44A  Fail",
    RECOVERY: "VIM -44A  Recovery"
  },
  "2DC0": {
    FAULT: "VIM -44B  Fail",
    RECOVERY: "VIM -44B  Recovery"
  },
  "2DD0": {
    FAULT: "VIM -45A  Fail",
    RECOVERY: "VIM -45A  Recovery"
  },
  "2DE0": {
    FAULT: "VIM -45B  Fail",
    RECOVERY: "VIM -45B  Recovery"
  },
  "2DF0": {
    FAULT: "VIM -46A  Fail",
    RECOVERY: "VIM -46A  Recovery"
  },
  "2E00": {
    FAULT: "VIM -46B  Fail",
    RECOVERY: "VIM -46B  Recovery"
  },
  "2E10": {
    FAULT: "VIM -47A  Fail",
    RECOVERY: "VIM -47A  Recovery"
  },
  "2E20": {
    FAULT: "VIM -47B  Fail",
    RECOVERY: "VIM -47B  Recovery"
  },
  "2E30": {
    FAULT: "VIM -48A  Fail",
    RECOVERY: "VIM -48A  Recovery"
  },
  "2E40": {
    FAULT: "VIM -48B  Fail",
    RECOVERY: "VIM -48B  Recovery"
  },
  "2E50": {
    FAULT: "VIM -49A  Fail",
    RECOVERY: "VIM -49A  Recovery"
  },
  "2E60": {
    FAULT: "VIM -49B  Fail",
    RECOVERY: "VIM -49B  Recovery"
  },
  "2E70": {
    FAULT: "VIM -50A  Fail",
    RECOVERY: "VIM -50A  Recovery"
  },
  "2E80": {
    FAULT: "VIM -50B  Fail",
    RECOVERY: "VIM -50B  Recovery"
  },
  "2E90": {
    FAULT: "VIM -51A  Fail",
    RECOVERY: "VIM -51A  Recovery"
  },
  "2EA0": {
    FAULT: "VIM -51B  Fail",
    RECOVERY: "VIM -51B  Recovery"
  },
  "2EB0": {
    FAULT: "VIM -52A  Fail",
    RECOVERY: "VIM -52A  Recovery"
  },
  "2EC0": {
    FAULT: "VIM -52B  Fail",
    RECOVERY: "VIM -52B  Recovery"
  },
  "2ED0": {
    FAULT: "VIM -53A  Fail",
    RECOVERY: "VIM -53A  Recovery"
  },
  "2EE0": {
    FAULT: "VIM -53B  Fail",
    RECOVERY: "VIM -53B  Recovery"
  },
  "2EF0": {
    FAULT: "VIM -54A  Fail",
    RECOVERY: "VIM -54A  Recovery"
  },
  "2F00": {
    FAULT: "VIM -54B  Fail",
    RECOVERY: "VIM -54B  Recovery"
  },
  "2F10": {
    FAULT: "VIM -55A  Fail",
    RECOVERY: "VIM -55A  Recovery"
  },
  "2F20": {
    FAULT: "VIM -55B  Fail",
    RECOVERY: "VIM -55B  Recovery"
  },
  "2F30": {
    FAULT: "VIM -56A  Fail",
    RECOVERY: "VIM -56A  Recovery"
  },
  "2F40": {
    FAULT: "VIM -56B  Fail",
    RECOVERY: "VIM -56B  Recovery"
  },
  "2F50": {
    FAULT: "VIM -57A  Fail",
    RECOVERY: "VIM -57A  Recovery"
  },
  "2F60": {
    FAULT: "VIM -57B  Fail",
    RECOVERY: "VIM -57B  Recovery"
  },
  "2F70": {
    FAULT: "VIM -58A  Fail",
    RECOVERY: "VIM -58A  Recovery"
  },
  "2F80": {
    FAULT: "VIM -58B  Fail",
    RECOVERY: "VIM -58B  Recovery"
  },
  "2F90": {
    FAULT: "VIM -59A  Fail",
    RECOVERY: "VIM -59A  Recovery"
  },
  "2FA0": {
    FAULT: "VIM -59B  Fail",
    RECOVERY: "VIM -59B  Recovery"
  },
  "2FB0": {
    FAULT: "VIM -60A  Fail",
    RECOVERY: "VIM -60A  Recovery"
  },
  "2FC0": {
    FAULT: "VIM -60B  Fail",
    RECOVERY: "VIM -60B  Recovery"
  },
  "2FD0": {
    FAULT: "VIM -61A  Fail",
    RECOVERY: "VIM -61A  Recovery"
  },
  "2FE0": {
    FAULT: "VIM -61B  Fail",
    RECOVERY: "VIM -61B  Recovery"
  },
  "2FF0": {
    FAULT: "VIM -62A  Fail",
    RECOVERY: "VIM -62A  Recovery"
  },
  "3000": {
    FAULT: "VIM -62B  Fail",
    RECOVERY: "VIM -62B  Recovery"
  },
  "3010": {
    FAULT: "VIM -63A  Fail",
    RECOVERY: "VIM -63A  Recovery"
  },
  "3020": {
    FAULT: "VIM -63B  Fail",
    RECOVERY: "VIM -63B  Recovery"
  },
};