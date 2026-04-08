/* ================= EVENT NAME ================= */

export const decodeDMIEventName = (id) => {
  switch (Number(id)) {
    case 1: return "Train Type Selection";
    case 2: return "Region H Message";
    case 3: return "Region I Message";
    case 4: return "LP Acknowledgement";
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

  // EVENT 1 → Train Type
  if (id === 1) {
    const trainType = parseInt(data.substring(0, 2), 16);

    const map = {
      1: "LE",
      2: "LE Multi",
      3: "Empty Goods",
      4: "Loaded Goods",
      5: "Passenger (ICF)",
      6: "Passenger (LHB)",
      7: "EMU",
      8: "Train Set",
      9: "Parcel"
    };

    return map[trainType] || "Unknown Train Type";
  }

  // EVENT 3 → Region I
  if (id === 3) {
    return `Region I Message Code: ${parseInt(data, 16)}`;
  }

  // EVENT 4 → LP ACK
  if (id === 4) {
    const map = {
      1: "SOS Self",
      2: "SOS Block",
      3: "Train Parted",
      9: "Over Speed Warning",
      10: "Brake Applied",
    };

    const code = parseInt(data, 16);
    return map[code] || "Unknown LP Message";
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

    default:
      return v ?? "-";
  }
};