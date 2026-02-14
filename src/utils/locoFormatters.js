export const decodeDirection = (dir) => {
    if (dir === null || dir === undefined) return "-";
    switch (Number(dir)) {
        case 0: return "UP";
        case 1: return "DOWN";
        case 2: return "UNKNOWN";
        default: return "-";
    }
};

export const decodeLocoMode = (mode) => {
    if (mode === null || mode === undefined) return "-";
    const modes = {
        0: "STANDBY",
        1: "STAFF RESPONSIBLE",
        2: "LIMITED SUPERVISION",
        3: "FULL SUPERVISION",
        4: "OVERRIDE",
        5: "ONSIGHT",
        6: "TRIP",
        7: "POST TRIP",
        8: "NON LEADING",
        9: "REVERSE",
        10: "SHUNT",
        11: "SYSTEM FAILURE",
        12: "ISOLATION",
    };
    return modes[Number(mode)] || "-";
};

export const formatDateTime = (row) =>
    row.date && row.time ? `${row.date} ${row.time}` : "-";
/* ================= LOCO VERSION ================= */
export const decodeLocoVersion = (v) => {
    switch (Number(v)) {
        case 1: return "KAVACH 3.2";
        case 2: return "KAVACH 4.0";
        default: return "-";
    }
};

/* ================= EMERGENCY ================= */
export const decodeEmergency = (v) => {
    switch (Number(v)) {
        case 0: return "NO EMERGENCY";
        case 1: return "SOS";
        case 2: return "HEAD-ON COLLISION";
        case 3: return "REAR-END COLLISION";
        case 4: return "SIDE COLLISION";
        case 5: return "PARTING SOS";
        default: return "-";
    }
};

/* ================= TRAIN INTEGRITY ================= */
export const decodeTrainIntegrity = (v) => {
    switch (Number(v)) {
        case 0: return "NO INFO";
        case 1: return "CONFIRMED BY DEVICE";
        case 2: return "CONFIRMED BY LP";
        default: return "-";
    }
};

/* ================= BRAKE APPLIED ================= */
export const decodeBrakeApplied = (v) => {
    switch (Number(v)) {
        case 0: return "NO BRAKE";
        case 1: return "NORMAL SERVICE";
        case 2: return "FULL SERVICE";
        case 3: return "EMERGENCY BRAKE";
        default: return "-";
    }
};

export const decodeTagLinkInfo = (v) => {
    switch (Number(v)) {
        case 0: return "NO LINK";
        case 1: return "LINK OK";
        case 2: return "LINK MISSING";
        case 3: return "LINK MISMATCH";
        case 4: return "LINK DUPLICATE";
        default: return "-";
    }
};

export const decodeNewMAReply = (v) => {
    switch (Number(v)) {
        case 0: return "NO";
        case 1: return "ACCEPTED";
        case 2: return "REJECTED";
        case 3: return "TIMEOUT";
        default: return "-";
    }
};


/* ================= SIGNAL OVERRIDE ================= */
export const decodeSignalOverride = (v) =>
    Number(v) === 1 ? "ACTIVE" : "INACTIVE";

// export const decodeLastRefProfile = (v) => {
//     if (v === null || v === undefined) return "-";
//     if (Number(v) === 0) return "NO PROFILE";
//     if (Number(v) >= 1 && Number(v) <= 14) return `PROFILE-${v}`;
//     return "RESERVED";
// };
export const decodeInfoAck = (v) => {
    switch (Number(v)) {
        case 0: return "NO";
        case 1: return "ACK RECEIVED";
        case 2: return "ACK PENDING";
        case 3: return "ACK FAILED";
        default: return "-";
    }
};

/* ================= HEALTH BYTE (BASIC) ================= */
export const decodeHealthByte = (v) => {
    if (v === null || v === undefined) return "-";

    const faults = [];
    const val = Number(v);

    if (val & 0x01) faults.push("GPS FAULT");
    if (val & 0x02) faults.push("ODO FAULT");
    if (val & 0x04) faults.push("RFID FAULT");
    if (val & 0x08) faults.push("RADIO FAULT");
    if (val & 0x10) faults.push("CPU FAULT");
    if (val & 0x20) faults.push("MEMORY FAULT");
    if (val & 0x40) faults.push("POWER FAULT");

    return faults.length ? faults.join(", ") : "ALL OK";
};

export const decodeRfidDuplicate = (v) => {
    switch (Number(v)) {
        case 0: return "NO";
        case 1: return "DUPLICATE TAG";
        default: return "-";
    }
};



export const formatCellValue = (row, key) => {
    switch (key) {
        case "movement_direction":
            return decodeDirection(row[key]);

        case "loco_mode":
            return decodeLocoMode(row[key]);

        case "source_loco_version":
            return decodeLocoVersion(row[key]);

        case "emergency_status":
            return decodeEmergency(row[key]);

        case "train_integrity_status":
            return decodeTrainIntegrity(row[key]);

        case "brake_applied_status":
            return decodeBrakeApplied(row[key]);

        case "signal_override_status":
            return decodeSignalOverride(row[key]);

        case "onboard_health_byte_1":
            return decodeHealthByte(row[key]);

        case "date":
            return formatDateTime(row);

        case "tag_link_information":
            return decodeTagLinkInfo(row[key]);

        case "new_ma_reply_status":
            return decodeNewMAReply(row[key]);

        // case "last_ref_profile_number":
        //     return decodeLastRefProfile(row[key]);

        case "info_ack_status":
            return decodeInfoAck(row[key]);

        case "onboard_health_byte_1":
            return decodeHealthByte(row[key]);

        case "tag_duplicate_status":
            return decodeRfidDuplicate(row[key]);


        default:
            return row[key] ?? "-";
    }
};
