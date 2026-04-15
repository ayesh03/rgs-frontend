export const decodeDirection = (dir) => {
    if (dir === null || dir === undefined) return "-";
    switch (Number(dir)) {
        case 0: return "unidentified";
        case 1: return "Nominal";
        case 2: return "Reverse";
        case 3: return "Future Use";
        default: return "-";
    }
};
export const decodeLocoHealth = (value, frameNumber) => {
    if (value === null || value === undefined) return "-";

    const faults = [
        "System Internal Fault",                    // B0
        "Speed Sensor1 Fault",                      // B1
        "EB Drive Fault",                           // B2
        "EB Application (Feedback) Fault",          // B3
        "RFID Reader1 Link Fail",                   // B4
        "RFID Reader2 Link Fail",                   // B5
        "Radio1 Link Fail",                         // B6
        "Radio2 Link Fail",                         // B7
        "LP-OCIP (DMI)1 Link Fail",                 // B8
        "LP-OCIP (DMI)2 Link Fail",                 // B9
        "GPS1/PPS1 Fail",                           // B10
        "GPS2/PPS2 Fail",                           // B11
        "GPS1 view not available since 2 hrs",      // B12
        "GPS2 view not available since 2 hrs",      // B13
        "Tag linking incorrect",                    // B14
        "GSM1 Fault",                               // B15
        "GSM2 Fault",                               // B16
        "Radio 1 RSSI Weak",                        // B17
        "Radio 2 RSSI Weak",                        // B18
        "Session Key Mismatch",                     // B19
        "Remaining keys < 5",                       // B20
        "BIU connectivity fault",                   // B21
        "Speed Sensor 2 fault",                     // B22
        "Cab Input fault"                           // B23
    ];

    const num = Number(value);
    if (isNaN(num) || num === 0) return "-";

    const mod = Number(frameNumber) % 10;


    let blockIndex = -1;

    if (mod === 1 ) blockIndex = 0;//| mod === 2
    else if (mod === 2 ) blockIndex = 1;//|| mod === 4
    else if (mod === 3 ) blockIndex = 2;
    else if (mod === 4 ) blockIndex = 3;
    else return "-";

    const offset = blockIndex * 6;

    const active = [];
    //   console.log("Frame:", frameNumber);
    // console.log("Mod:", Number(frameNumber) % 10);
    // console.log("Health Value:", num);

    for (let i = 0; i < 6; i++) {
        if (num & (1 << i)) {
            active.push(faults[offset + i]);
        }
    }
    if (active.length === 0) return "-";
    return active.join(", ");

}

export const decodeTIN = (tin) => {
    if (tin === null || tin === undefined) return "-";

    const value = Number(tin);
    if (isNaN(value)) return "-";

    if (value === 0) return "Ignore";
    if (value >= 1 && value <= 250) return `Track ID ${value}`;
    if (value === 251) return "Onboard Shed TIN";
    if (value >= 252 && value <= 511) return "Reserved for Future Use";

    return "-";
};
export const decodeLocoMode = (mode) => {
    if (mode === null || mode === undefined) return "-";
    const modes = {
        0: "None",
        1: "STANDBY",
        2: "STAFF RESPONSIBLE",
        3: "LIMITED SUPERVISION",
        4: "FULL SUPERVISION",
        5: "OVERRIDE",
        6: "ONSIGHT",
        7: "TRIP",
        8: "POST TRIP",
        9: "NON LEADING",
        10: "REVERSE",
        11: "SHUNT",
        12: "SYSTEM FAILURE",
        13: "ISOLATION",
    };
    return modes[Number(mode)] || "unknown";
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
        case 1: return "UNUSUAL STOPPAGE";
        case 2: return "SOS";
        case 3: return "ROLL BACK";
        case 4: return "HEAD-ON COLLISION";
        case 5: return "REAR-END COLLISION";
        case 6: return "PARTING SOS";
        case 7: return "SPARE";
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
    const val = Number(v);

    switch (val) {
        case 0: return "NO OVERSPEED, NO BRAKE";
        case 1: return "OVERSPEED, NO BRAKE";

        case 2: return "NORMAL SERVICE BRAKE";   
        case 3: return "FULL SERVICE BRAKE";     

        case 4: return "EMERGENCY BRAKE";        

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


export const formatRFID = (val) => {
    if (val === null || val === undefined || val === "") return "-";

    const num = Number(val);
    if (isNaN(num)) return val;

    return `R-${num}`;
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

        case "tin":
            return decodeTIN(row[key]);

        case "tag_link_information":
            return decodeTagLinkInfo(row[key]);

        case "new_ma_reply_status":
            return decodeNewMAReply(row[key]);

        // case "last_ref_profile_number":
        //     return decodeLastRefProfile(row[key]);

        case "info_ack_status":
            return decodeInfoAck(row[key]);

        case "tag_duplicate_status":
            return decodeRfidDuplicate(row[key]);

        case "loco_health_status":
            return decodeLocoHealth(row[key], row.frame_number);

        default:
            return row[key] ?? "-";
    }
};
