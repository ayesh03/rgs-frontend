import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Stack,
  Typography,
  Divider,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
export default function AdvancedSearchDialog({
  open,
  onClose,
  onApply,
  locoOptions = [],
}) {
  /* ================= LOCO ================= */
  const [locoInput, setLocoInput] = useState("");
  const [locos, setLocos] = useState([]);
  const [selectedLocos, setSelectedLocos] = useState([]);
  const [eventType, setEventType] = useState("dynamic");

  const addLoco = () => {
    if (!locoInput) return;
    if (!locos.includes(locoInput)) {
      setLocos((prev) => [...prev, locoInput]);
    }
    setLocoInput("");
  };

  const toggleLoco = (id) => {
    setSelectedLocos((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const clearLocos = () => {
    setLocos([]);
    setSelectedLocos([]);
  };

  /* ================= EVENTS ================= */
  const dynamicEvents = locoOptions?.isStation
    ? locoOptions?.tableType === "station_emergency"
      ? [
          // COMMON
          "stationary_kavach_id",
          "nms_system_id",
          "source_version",
          "date_hex",
          "time",
          "station_active_radio_desc",

          // EMERGENCY ONLY
          "pkt_type",
          "pkt_length",
          "source_stn_id",
          "stn_location_m",
          "gen_sos_call",
        ]
      : locoOptions?.tableType === "station_access"
        ? [
            // COMMON
            "stationary_kavach_id",
            "nms_system_id",
            "source_version",
            "date_hex",
            "time",
            "station_active_radio_desc",

            // ACCESS ONLY
            "pkt_type",
            "pkt_length",
            "source_stn_id",
            "dest_loco_id",
            "stn_location_m",
            "uplink_freq_channel",
            "downlink_freq_channel",
            "tdma_timeslot",
            "stn_random_rs",
            "stn_tdma",
          ]
        : [
            // COMMON
            "stationary_kavach_id",
            "nms_system_id",
            "source_version",
            "date_hex",
            "time",
            "station_active_radio_desc",

            // RADIO
            "pkt_type",
            "pkt_length",
            "frame_number",
            "source_stn_id",
            "dest_loco_id",
            "ref_profile_id",
            "last_ref_rfid",
            "dist_pkt_start_m",
            "pkt_direction",

            // MA
            "sub_pkt_type_ma",
            "ma_frame_offset",
            "dest_loco_sos",
            "train_section_type",
            "cur_signal_aspect",
            "next_signal_aspect",
            "approaching_signal_dist_m",
            "authority_type",
            "authorized_speed",
            "ma_distance_m",
            "req_shorten_ma",
            "new_ma_distance_m",
            "trn_len_info_sts",
            "trn_len_info_type",
            "next_station_comm",
            "approaching_station_id",
            "ref_frame_num_tlm",
            "ref_offset_int_tlm",

            // SIGNAL BREAKDOWN
            "sig_stop",
            "sig_override",
            "sig_type",
            "sig_line_name",
            "sig_line_no",

            // SSP
            "speed_class",
            "lm_static_speed_value_raw",
            "universal_speed_kmph",
            "speed_A_kmph",
            "speed_B_kmph",
            "speed_C_kmph",

            // GRADIENT
            "direction",
            "gradient_raw",

            // LC
            "lc_id_numeric",
            "lc_id_suffix",
            "manning_type",
            "lc_class",
            "auto_whistling_enabled",
            "auto_whistling_type",

            // TURNOUT
            "turnout_speed_code",
            "start_distance_m",
            "release_distance_m",

            // TAG
            "rfid_tag_id",
            "dist_next_rfid_m",
            "dup_tag_dir",
            "abs_loc_reset",
            "adj_loco_dir",

            // TRACK
            "track_condition_type",
            "start_dist_m",
            "length_m",

            // TSR
            "tsr_status",
            "tsr_distance_m",
            "tsr_length_m",
            "tsr_class",
            "tsr_universal_speed_kmph",

            // ACCESS
            "stn_location_m",
            "uplink_freq_channel",
            "downlink_freq_channel",
            "tdma_timeslot",
            "stn_random_rs",
            "stn_tdma",

            // EMERGENCY
            "gen_sos_call",
          ]
    : [
        "date",
        "time",
        "loco_id",
        "packet_type",

        "frame_number",

        "absolute_location",
        "train_length",
        "speed",

        "loco_direction",
        "emergency_status",
        "loco_mode",

        "rfid",
        "tin",
        "brake_mode",

        "signal_type",
        "current_signal_aspect",
        "next_signal_aspect",

        "loco_random_number",
        "signal_override",
        "source_loco_version",
      ];

  const [selectedDynamic, setSelectedDynamic] = useState([]);

  const toggleDynamic = (e) => {
    setSelectedDynamic((prev) =>
      prev.includes(e) ? prev.filter((v) => v !== e) : [...prev, e],
    );
  };

  /* ================= STATIC ================= */
  const staticEvents = locoOptions?.isStation
    ? locoOptions?.tableType === "station_emergency"
      ? {
          source_version: ["KAVACH 3.2", "KAVACH 4.0"],

          station_active_radio_desc: ["Radio_1", "Radio_2"],

          gen_sos_call: ["No Manual SoS", "General SoS Triggered"],
        }
      : locoOptions?.tableType === "station_access"
        ? {
            source_version: ["Kavach Spec 3.2", "Kavach Spec 4.0"],

            station_active_radio_desc: ["Radio_1", "Radio_2"],

            tdma_timeslot: [
              "Not Nominated",
              ...Array.from({ length: 68 }, (_, i) => `Slot ${i + 1}`),
              "LTE/4G/5G",
              "Invalid",
            ],

            uplink_freq_channel: [
              "Valid Frequencies",
              "Reserved",
              "LTE/4G/5G",
              "Invalid",
            ],
            downlink_freq_channel: [
              "Valid Frequencies",
              "Reserved",
              "LTE/4G/5G",
              "Invalid",
            ],
          }
        : {
            // ===== COMMON / RADIO =====
            source_version: ["KAVACH 3.2", "KAVACH 4.0"],
            station_active_radio_desc: ["Radio_1", "Radio_2"],
            ref_profile_id: ["Profile 1", "Profile 2", "Profile 3"], // dynamic if needed
            pkt_direction: ["Nominal", "Reverse", "Unidentified"],

            // ===== MA =====
            dest_loco_sos: [
              "No SoS",
              "Foreign RFID",
              "Reserved",
              "SPAD",
              "Onboard Odo Error ≥120m",
              "Rear End Collision",
              "Head On Collision",
              "Shunting Limit Violation",
              "Station General SoS",
            ],
            train_section_type: [
              "Station Section",
              "Absolute Block",
              "Autoblock",
              "Reserved",
            ],
            cur_signal_aspect: ["Red", "Yellow", "Green"],
            next_signal_aspect: ["Red", "Yellow", "Green"],
            authority_type: [
              "Unused",
              "OS Authority",
              "FS Authority",
              "SR Authority",
            ],
            trn_len_info_sts: ["Present", "Not Present"],
            next_station_comm: ["Handover Required", "No Handover"],
            sig_override: ["Override at Standstill", "Override while Running"],
            sig_line_name: ["Up", "Down"],

            // ===== SSP =====
            speed_class: ["Universal", "Classified"],

            // ===== GRADIENT =====
            direction: ["UP", "DOWN"],

            // ===== LC =====
            manning_type: ["Manned", "Unmanned"],
            auto_whistling_enabled: ["Yes", "No"],
            auto_whistling_type: [
              "Distance Based",
              "Time Based (Not Used)",
              "Configured Pattern Based (Not Used)",
              "Spare",
            ],

            // ===== TAG =====
            dup_tag_dir: ["Nominal", "Reverse"],

            // ===== TRACK =====
            track_condition_type: [
              "Not Used",
              "Dead Stop",
              "Non Stopping Area",
              "Tunnel Stopping Area",
              "Sound Horn",
              "Radio Hole",
              "Neutral Section",
              "Reversing Area",
              "Fouling Mark Location",
              "KAVACH Territory Exit",
              "Reserved",
            ],

            // ===== TSR =====
            tsr_status: [
              "No TSR",
              "Latest TSR Available",
              "Latest TSR Available",
              "Reserved",
            ],
            tsr_class: ["Universal", "Classified"],
            tsr_whistle: ["Whistle Blow", "No Whistle", "Spare"],
          }
    : {
        loco_direction: ["Nominal", "Reverse"],

        emergency_status: [
          "NO EMERGENCY",
          "UNUSUAL STOPPAGE",
          "SOS",
          "ROLL BACK",
          "HEAD-ON COLLISION",
          "REAR-END COLLISION",
          "PARTING SOS",
          "SPARE",
        ],

        loco_mode: [
          "STANDBY",
          "STAFF RESPONSIBLE",
          "LIMITED SUPERVISION",
          "FULL SUPERVISION",
          "OVERRIDE",
          "ONSIGHT",
          "TRIP",
          "POST TRIP",
          "NON LEADING",
          "REVERSE",
          "SHUNT",
          "SYSTEM FAILURE",
          "ISOLATION",
        ],

        source_loco_version: ["KAVACH 3.2", "KAVACH 4.0"],

        brake_applied_status: [
          "NO OVERSPEED, NO BRAKE",
          "OVERSPEED, NO BRAKE",
          "NORMAL SERVICE BRAKE",
          "FULL SERVICE BRAKE",
          "EMERGENCY BRAKE",
        ],

        faults: [
          "System Internal Fault", // B0
          "Speed Sensor1 Fault", // B1
          "EB Drive Fault", // B2
          "EB Application (Feedback) Fault", // B3
          "RFID Reader1 Link Fail", // B4
          "RFID Reader2 Link Fail", // B5
          "Radio1 Link Fail", // B6
          "Radio2 Link Fail", // B7
          "LP-OCIP (DMI)1 Link Fail", // B8
          "LP-OCIP (DMI)2 Link Fail", // B9
          "GPS1/PPS1 Fail", // B10
          "GPS2/PPS2 Fail", // B11
          "GPS1 view not available since 2 hrs", // B12
          "GPS2 view not available since 2 hrs", // B13
          "Tag linking incorrect", // B14
          "GSM1 Fault", // B15
          "GSM2 Fault", // B16
          "Radio 1 RSSI Weak", // B17
          "Radio 2 RSSI Weak", // B18
          "Session Key Mismatch", // B19
          "Remaining keys < 5", // B20
          "BIU connectivity fault", // B21
          "Speed Sensor 2 fault", // B22
          "Cab Input fault", // B23
        ],
      };

  const [selectedStatic, setSelectedStatic] = useState({});

  const toggleStatic = (event, value) => {
    setSelectedStatic((prev) => {
      const arr = prev[event] || [];
      return {
        ...prev,
        [event]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  /* ================= COMM ================= */
  const [bothComm, setBothComm] = useState(false);

  /* ================= APPLY ================= */
  const handleApply = () => {
    onApply({
      locos: selectedLocos,
      eventType,
      dynamicEvents: selectedDynamic,
      staticEvents: selectedStatic,
      bothComm,
    });
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    if (locoOptions?.list?.length && locos.length === 0) {
      setLocos(locoOptions.list);
    }
  }, [open, locoOptions]);

  const filterBySubPacket = (events) => {
    const sub = locoOptions?.subPacket;

    if (locoOptions?.tableType === "station_emergency") return events;

    if (!sub) return events;

    const baseFields = [
      // ALWAYS VISIBLE (COMMON + RADIO)
      "stationary_kavach_id",
      "nms_system_id",
      "source_version",
      "date_hex",
      "time",
      "station_active_radio_desc",

      "pkt_type",
      "pkt_length",
      "frame_number",
      "source_stn_id",
      "dest_loco_id",
      "ref_profile_id",
      "last_ref_rfid",
      "dist_pkt_start_m",
      "pkt_direction",
    ];

    const map = {
      ma: [
        "authority_type",
        "authorized_speed",
        "ma_distance_m",
        "train_section_type",
        "cur_signal_aspect",
        "next_signal_aspect",
      ],
      ssp: ["speed_class", "universal_speed_kmph"],
      gradient: ["gradient_raw", "direction"],
      lc: ["lc_class", "auto_whistling_enabled"],
      turnout: ["turnout_speed_code"],
      tag: ["rfid_tag_id"],
      track: ["track_condition_type"],
      tsr: ["tsr_status", "tsr_distance_m"],
    };

    const allowed = map[sub] || [];

    return events.filter((e) => baseFields.includes(e) || allowed.includes(e));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Advanced Search</DialogTitle>

      <DialogContent>
        {/* ================= LOCO ================= */}
        <Typography fontWeight={700}>
          {locoOptions?.isStation ? "Station List" : "Loco List"}
        </Typography>

        <Stack direction="row" spacing={1} mb={1}>
          <Tooltip title="Enter ID and click Add">
            <TextField
              size="small"
              value={locoInput}
              onChange={(e) => setLocoInput(e.target.value)}
              placeholder={
                locoOptions?.isStation ? "Enter Station ID" : "Enter Loco ID"
              }
            />
          </Tooltip>
          <Tooltip title="Add ID to list">
            <Button onClick={addLoco} variant="contained">
              Add
            </Button>
          </Tooltip>
          <Tooltip title="Clear all IDs">
            <Button onClick={clearLocos}>Clear</Button>
          </Tooltip>
        </Stack>

        <Stack>
          {locos.map((l) => (
            <FormControlLabel
              key={l}
              control={
                <Checkbox
                  checked={selectedLocos.includes(l)}
                  onChange={() => toggleLoco(l)}
                />
              }
              label={l}
            />
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* ================= EVENTS ================= */}
        <Typography fontWeight={700}>Events</Typography>

        <Tooltip title="Switch event type">
          <ToggleButtonGroup
            value={eventType}
            exclusive
            onChange={(e, val) => val && setEventType(val)}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="dynamic">Dynamic</ToggleButton>
            <ToggleButton value="static">Static</ToggleButton>
          </ToggleButtonGroup>
        </Tooltip>

        {/* DYNAMIC */}
        {eventType === "dynamic" && (
          <Stack>
            {/*  ADD THIS BLOCK */}
            <Stack direction="row" spacing={1} mb={1}>
              <Tooltip title="Select all dynamic events">
                <Button
                  size="small"
                  onClick={() => setSelectedDynamic(dynamicEvents)}
                >
                  Select All
                </Button>
              </Tooltip>
              <Tooltip title="Clear selected dynamic events">
                <Button size="small" onClick={() => setSelectedDynamic([])}>
                  Clear
                </Button>
              </Tooltip>
            </Stack>

            {filterBySubPacket(dynamicEvents).map((e) => (
              <FormControlLabel
                key={e}
                control={
                  <Checkbox
                    checked={selectedDynamic.includes(e)}
                    onChange={() => toggleDynamic(e)}
                  />
                }
                label={e}
              />
            ))}
          </Stack>
        )}

        {/* STATIC */}
        {eventType === "static" && (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Select all static filters">
                <Button
                  size="small"
                  onClick={() => {
                    const all = {};
                    Object.entries(staticEvents).forEach(([k, v]) => {
                      all[k] = v;
                    });
                    setSelectedStatic(all);
                  }}
                >
                  Select All
                </Button>
              </Tooltip>

              <Tooltip title="Clear static filters">
                <Button size="small" onClick={() => setSelectedStatic({})}>
                  Clear
                </Button>
              </Tooltip>
            </Stack>
            {Object.entries(staticEvents)

              .filter(([k]) => {
                if (
                  locoOptions?.tableType === "station_access" ||
                  locoOptions?.tableType === "station_emergency"
                )
                  return true;
                const sub = locoOptions?.subPacket;
                if (!sub) return true;

                const map = {
                  ma: [
                    "source_version",
                    "station_active_radio_desc",
                    "ref_profile_id",
                    "pkt_direction",
                    "dest_loco_sos",
                    "train_section_type",
                    "cur_signal_aspect",
                    "next_signal_aspect",
                    "authority_type",
                    "trn_len_info_sts",
                    "next_station_comm",
                    "sig_override",
                    "sig_type",
                    "sig_line_name",
                  ],

                  ssp: [
                    "source_version",
                    "station_active_radio_desc",
                    "ref_profile_id",
                    "pkt_direction",
                    "speed_class",
                  ],

                  gradient: [
                    "source_version",
                    "station_active_radio_desc",
                    "ref_profile_id",
                    "pkt_direction",
                    "direction",
                  ],

                  lc: [
                    "source_version",
                    "station_active_radio_desc",
                    "ref_profile_id",
                    "pkt_direction",
                    "manning_type",
                    "auto_whistling_enabled",
                    "auto_whistling_type",
                  ],

                  turnout: [
                    "source_version",
                    "station_active_radio_desc",
                    "ref_profile_id",
                    "pkt_direction",
                  ],

                  tag: [
                    "source_version",
                    "station_active_radio_desc",
                    "ref_profile_id",
                    "pkt_direction",
                    "dup_tag_dir",
                  ],

                  track: [
                    "source_version",
                    "station_active_radio_desc",
                    "ref_profile_id",
                    "pkt_direction",
                    "track_condition_type",
                  ],

                  tsr: [
                    "source_version",
                    "ref_profile_id",
                    "pkt_direction",
                    "tsr_status",
                    "tsr_class",
                    "tsr_whistle",
                  ],
                };

                return map[sub]?.includes(k);
              })
              .map(([event, values]) => (
                <Box key={event}>
                  <Typography fontSize={13}>{event}</Typography>
                  {values.map((v) => (
                    <FormControlLabel
                      key={v}
                      control={
                        <Checkbox
                          checked={(selectedStatic[event] || []).includes(v)}
                          onChange={() => toggleStatic(event, v)}
                        />
                      }
                      label={v}
                    />
                  ))}
                </Box>
              ))}
          </Stack>
        )}

        {/* <Divider sx={{ my: 2 }} /> */}

        {/* ================= COMM ================= */}
        {/* <FormControlLabel
                    control={
                        <Checkbox
                            checked={bothComm}
                            onChange={(e) => setBothComm(e.target.checked)}
                        />
                    }
                    label="Both Loco & Station Communication"
                /> */}
      </DialogContent>

      <DialogActions>
        <Tooltip title="Close dialog">
          <Button onClick={onClose}>Cancel</Button>
        </Tooltip>
        <Tooltip title="Apply selected filters">
          <Button variant="contained" onClick={handleApply}>
            Apply
          </Button>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}
