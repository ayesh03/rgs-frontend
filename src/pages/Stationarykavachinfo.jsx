import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";

import { Select, MenuItem } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import MovingIcon from "@mui/icons-material/Moving";
import PaginationControls from "../components/PaginationControls";
import ColumnFilterDialog from "../components/ColumnFilterDialog";
import StationaryKavachTable from "../components/LocoMovementTable";

import useTableFilter from "../hooks/useFilterTable";
import { useAppContext } from "../context/AppContext";
import {
  decode,
  DEST_LOCO_SOS_MAP,
  TRAIN_SECTION_TYPE_MAP,
  PKT_TYPE_MAP,
  AUTHORITY_TYPE_MAP,
  REQ_SHORTEN_MA_MAP,
  TRAIN_LEN_INFO_STATUS_MAP,
  TRAIN_LEN_INFO_TYPE_MAP,
  NEXT_STN_COMM_MAP,
  SPEED_CLASS_TYPE_MAP,
  SPEED_VALUE_FORMAT,
  GRADIENT_DIR_MAP,
  GRADIENT_VALUE_FORMAT,
  LC_MANNING_MAP,
  LC_CLASS_MAP,
  AUTO_WHISTLE_MAP,
  AUTO_WHISTLE_TYPE_MAP,
  TURNOUT_SPEED_FORMAT,
  DUP_TAG_DIR_MAP,
  TRACK_CONDITION_MAP,
  TSR_STATUS_MAP,
  TSR_CLASS_MAP,
  GEN_SOS_MAP,
  TDMA_SLOT_FORMAT,
  FREQUENCY_FORMAT,
  SUB_PKT_TYPE_MA_MAP,
  SIGNAL_STOP_MAP,
  SIGNAL_OVERRIDE_MAP,
  SIGNAL_LINE_NAME_MAP,
  SIGNAL_TYPE_MAP,
  SIGNAL_ASPECT_MAP,
  formatSignalLineNo,
  formatAuthorizedSpeed,
  LC_SUFFIX_MAP,
  formatDistDupTag,
  TSR_SPEED_FORMAT,
  formatLCNumericId,
  formatLCDistance,
  SUB_PKT_TYPE_LC_MAP,
  ABS_LOC_RESET_MAP,
  ADJ_LOCO_DIR_MAP,
  TSR_WHISTLE_MAP,
  KAVACH_VERSION_MAP,
} from "../utils/stationaryKavachFormatter";


const MA_COLUMNS = [
  { key: "sub_pkt_type_ma", label: "Sub Packet Type" },
  { key: "sub_pkt_length_ma", label: "Sub Packet Length" },

  // { key: "frame_number", label: "Frame No" },

  { key: "ma_frame_offset", label: "Frame Offset" },
  { key: "dest_loco_sos", label: "Dest Loco SOS" },
  { key: "train_section_type", label: "Train Section Type" },

  { key: "cur_signal_aspect", label: "Current Signal Aspect" },
  { key: "next_signal_aspect", label: "Next Signal Aspect" },
  { key: "approaching_signal_dist_m", label: "Approaching Signal Dist" },
  { key: "authority_type", label: "Authority Type" },
  { key: "authorized_speed", label: "Authorized Speed" },
  { key: "ma_distance_m", label: "MA Distance (w.r.t Signal)" },
  { key: "req_shorten_ma", label: "Request Shorten MA" },
  { key: "new_ma_distance_m", label: "New MA Distance" },
  { key: "trn_len_info_sts", label: "Train Length Info Status" },
  { key: "trn_len_info_type", label: "Train Length Info Type" },
  { key: "ref_frame_num_tlm", label: "Ref Frame Num TLM" },
  { key: "ref_offset_int_tlm", label: "Ref Offset Int TLM" },
  { key: "next_station_comm", label: "Next Station Comm" },
  { key: "approaching_station_id", label: "Approaching Station ID" },


  //CUR_SIG_ASP decoded 6 fields
  { key: "sig_stop", label: "Signal Stop" },
  { key: "sig_override", label: "Signal Override" },
  { key: "sig_type", label: "Signal Type" },
  { key: "sig_line_name", label: "Signal Line Name" },
  { key: "sig_line_no", label: "Signal Line No" },
];

const SSP_COLUMNS = [
  { key: "sub_pkt_type_ssp", label: "Sub Packet Type" },
  { key: "sub_pkt_len_ssp", label: "Sub Packet Length" },
  { key: "lm_speed_info_cnt", label: "Speed Info Count" },

  // { key: "frame_number", label: "Frame No" },

  { key: "distance_m", label: "Static Speed Distance " },
  { key: "speed_class", label: "Speed Class" },

  { key: "lm_static_speed_value_raw", label: "Speed Raw" },
  { key: "universal_speed_kmph", label: "Universal Speed" },

  { key: "speed_A_kmph", label: "Speed A " },
  { key: "speed_B_kmph", label: "Speed B " },
  { key: "speed_C_kmph", label: "Speed C " },
];

const GRADIENT_COLUMNS = [
  { key: "sub_pkt_type_grad", label: "Sub Packet Type" },
  { key: "sub_pkt_len_grad", label: "Sub Packet Length" },
  { key: "lm_grad_info_cnt", label: "Gradient Info Count" },

  // { key: "frame_number", label: "Frame No" },

  { key: "distance_m", label: "Gradient Distance " },
  { key: "direction", label: "Direction " },
  { key: "gradient_raw", label: "Gradient Raw Value" },
];

const LC_COLUMNS = [
  // =============================
  // Annexure Header Fields
  // =============================
  { key: "sub_pkt_type_lc", label: "Sub Packet Type" },
  { key: "sub_pkt_len_lc", label: "Sub Packet Length" },
  { key: "lm_lc_info_cnt", label: "LC Info Count" },

  // { key: "frame_number", label: "Frame No" },

  // =============================
  // Annexure Raw Fields
  // =============================
  // { key: "lm_lc_distance", label: "LM LC Distance (Raw)" },
  // { key: "lm_lc_id_numeric", label: "LM LC ID Numeric" },
  // { key: "lm_lc_id_alpha_suffix", label: "LM LC ID Suffix" },
  // { key: "lm_lc_manning_type", label: "LM LC Manning Type" },
  // { key: "lm_lc_class", label: "LM LC Class" },
  // { key: "lm_lc_autowhistling_enabled", label: "LM Auto Whistle Enabled" },
  // { key: "lm_lc_auto_whistling_type", label: "LM Auto Whistle Type" },

  // =============================
  // Simplified UI Fields
  // =============================
  { key: "distance_m", label: "Distance" },
  { key: "lc_id_numeric", label: "LC ID" },
  { key: "lc_id_suffix", label: "LC ID Suffix" },
  { key: "manning_type", label: "Manning" },
  { key: "lc_class", label: "LC Class" },
  { key: "auto_whistling_enabled", label: "Auto Whistle Enabled" },
  { key: "auto_whistling_type", label: "Auto Whistle Type" },
];

const TURNOUT_COLUMNS = [
  // =============================
  // Annexure Header
  // =============================
  { key: "sub_pkt_type_to", label: "Sub Packet Type" },
  { key: "sub_pkt_len_to", label: "Sub Packet Length" },
  { key: "to_cnt", label: "TO Count" },

  // { key: "frame_number", label: "Frame No" },

  // // =============================
  // // Annexure Raw Fields
  // // =============================
  // { key: "lm_to_speed_raw", label: "LM TO Speed (Raw)" },
  // { key: "lm_diff_dist_to", label: "LM Diff Dist TO (Raw)" },
  // { key: "lm_to_speed_rel_dist", label: "LM TO Speed Rel Dist (Raw)" },

  // =============================
  // Simplified UI Fields
  // =============================
  { key: "turnout_speed_code", label: "Speed" },
  { key: "start_distance_m", label: "Start Distance " },
  { key: "release_distance_m", label: "Release Distance " },
];

const TAG_COLUMNS = [
  { key: "sub_pkt_type_tag", label: "Sub Packet Type" },
  { key: "sub_pkt_len_tag", label: "Sub Packet Length" },

  { key: "dist_dup_tag_m", label: "Dup Tag Dist" },
  { key: "route_rfid_count", label: "Route RFID Count" },

  { key: "rfid_tag_id", label: "RFID ID" },
  { key: "dist_next_rfid_m", label: "Next RFID Dist" },
  { key: "dup_tag_dir", label: "Dup Direction" },

  { key: "abs_loc_reset", label: "Location Reset" },
  { key: "loc_reset_start_dist_m", label: "Reset Start Distance" },
  { key: "adj_loco_dir", label: "Adj Loco Direction" },
  { key: "abs_loc_correction_m", label: "Abs Location Correction" },
  { key: "adjacent_line_count", label: "Adjacent Line Count" },
  { key: "adjacent_line_tins", label: "Adjacent Line TINs" },
];

const TRACK_COLUMNS = [
  { key: "sub_pkt_type_track", label: "Sub Packet Type" },
  { key: "sub_pkt_len_track", label: "Sub Packet Length" },
  // { key: "frame_number", label: "Frame No" },
  { key: "track_condition_count", label: "Track Condition Count" },
  { key: "track_condition_type", label: "Type" },
  { key: "start_dist_m", label: "Start Dist" },
  { key: "length_m", label: "Length" },
];
const TSR_COLUMNS = [
  { key: "sub_pkt_type_tsr", label: "Sub Packet Type" },
  { key: "sub_pkt_len_tsr", label: "Sub Packet Length" },

  // REQUIRED FIELDS
  { key: "tsr_status", label: "TSR Status" },
  { key: "tsr_info_cnt", label: "TSR Info Count" },

  { key: "tsr_id", label: "TSR ID" },
  { key: "tsr_distance_m", label: "Distance (m)" },
  { key: "tsr_length_m", label: "Length (m)" },
  { key: "tsr_class", label: "Class" },

  { key: "tsr_universal_speed_kmph", label: "Universal Speed" },
  { key: "tsr_classA_speed", label: "Speed A" },
  { key: "tsr_classB_speed", label: "Speed B" },
  { key: "tsr_classC_speed", label: "Speed C" },

  { key: "tsr_whistle", label: "TSR Whistle" },
];


const ACCESS_COLUMNS = [
  { key: "pkt_type", label: "Packet Type" },
  { key: "pkt_length", label: "Packet Length" },
  // { key: "frame_number", label: "Frame No" },
  { key: "source_stn_id", label: "Source Station ID" },
  { key: "source_version", label: "Version" },
  { key: "stn_location_m", label: "Station Location " },
  { key: "dest_loco_id", label: "Destination Loco ID" },
  { key: "uplink_freq_channel", label: "Uplink Channel" },
  { key: "downlink_freq_channel", label: "Downlink Channel" },
  { key: "tdma_timeslot", label: "TDMA Timeslot" },
  { key: "stn_random_rs", label: "Station Random RS" },
  { key: "stn_tdma", label: "Station TDMA" },
  // { key: "mac_code", label: "MAC Code" },
  // { key: "pkt_crc", label: "Packet CRC" },
];

const EMERGENCY_COLUMNS = [
  { key: "pkt_type", label: "Packet Type" },
  { key: "pkt_length", label: "Packet Length" },
  // { key: "frame_number", label: "Frame No" },
  { key: "source_stn_id", label: "Source Station ID" },
  { key: "source_version", label: "Version" },
  { key: "stn_location_m", label: "Station Location " },
  { key: "gen_sos_call", label: "General SOS Call" },
  { key: "pkt_crc", label: "Packet CRC" },
];

export const formatMovementAuthorityRow = (row) => {
  const r = { ...row };

  /* Packet Type */
  if (r.pkt_type !== undefined)
    r.pkt_type = decode(PKT_TYPE_MAP, r.pkt_type);

  /* ===================== MA ===================== */

  if (r.sub_pkt_type_ma !== undefined)
    r.sub_pkt_type_ma = decode(SUB_PKT_TYPE_MA_MAP, r.sub_pkt_type_ma);

  if (r.dest_loco_sos !== undefined)
    r.dest_loco_sos = decode(DEST_LOCO_SOS_MAP, r.dest_loco_sos);

  if (r.train_section_type !== undefined)
    r.train_section_type = decode(TRAIN_SECTION_TYPE_MAP, r.train_section_type);

  if (r.authority_type !== undefined)
    r.authority_type = decode(AUTHORITY_TYPE_MAP, r.authority_type);

  if (r.req_shorten_ma !== undefined)
    r.req_shorten_ma = decode(REQ_SHORTEN_MA_MAP, r.req_shorten_ma);

  if (r.trn_len_info_sts !== undefined)
    r.trn_len_info_sts = decode(TRAIN_LEN_INFO_STATUS_MAP, r.trn_len_info_sts);

  if (r.trn_len_info_type !== undefined)
    r.trn_len_info_type = decode(TRAIN_LEN_INFO_TYPE_MAP, r.trn_len_info_type);

  if (r.next_station_comm !== undefined)
    r.next_station_comm = decode(NEXT_STN_COMM_MAP, r.next_station_comm);

  if (r.sig_stop !== undefined)
    r.sig_stop = decode(SIGNAL_STOP_MAP, r.sig_stop);

  if (r.sig_override !== undefined)
    r.sig_override = decode(SIGNAL_OVERRIDE_MAP, r.sig_override);

  if (r.sig_line_name !== undefined)
    r.sig_line_name = decode(SIGNAL_LINE_NAME_MAP, r.sig_line_name);

  if (r.sig_line_no !== undefined)
    r.sig_line_no = formatSignalLineNo(r.sig_line_no);

  if (r.sig_type !== undefined)
    r.sig_type = decode(SIGNAL_TYPE_MAP, r.sig_type);

  if (r.cur_signal_aspect !== undefined)
    r.cur_signal_aspect = decode(SIGNAL_ASPECT_MAP, r.cur_signal_aspect);

  if (r.next_signal_aspect !== undefined)
    r.next_signal_aspect = decode(SIGNAL_ASPECT_MAP, r.next_signal_aspect);

  if (r.authorized_speed !== undefined)
    r.authorized_speed = formatAuthorizedSpeed(r.authorized_speed);

  /* ===================== SSP ===================== */

  if (r.speed_class !== undefined)
    r.speed_class = decode(SPEED_CLASS_TYPE_MAP, r.speed_class);

  if (r.lm_static_speed_value_raw !== undefined)
    r.lm_static_speed_value_raw =
      SPEED_VALUE_FORMAT(r.lm_static_speed_value_raw);

  if (r.universal_speed_kmph !== undefined)
    r.universal_speed_kmph = SPEED_VALUE_FORMAT(r.universal_speed_kmph);

  if (r.speed_A_kmph !== undefined)
    r.speed_A_kmph = SPEED_VALUE_FORMAT(r.speed_A_kmph);

  if (r.speed_B_kmph !== undefined)
    r.speed_B_kmph = SPEED_VALUE_FORMAT(r.speed_B_kmph);

  if (r.speed_C_kmph !== undefined)
    r.speed_C_kmph = SPEED_VALUE_FORMAT(r.speed_C_kmph);

  /* ===================== GRADIENT ===================== */
  if (r.gradient_raw !== undefined && r.distance_m !== undefined) {
    r.distance_m = `${(r.distance_m / 1000).toFixed(3)} km`;
  }

  if (r.direction !== undefined)
    r.direction = decode(GRADIENT_DIR_MAP, r.direction);

  if (r.gradient_raw !== undefined)
    r.gradient_raw = GRADIENT_VALUE_FORMAT(r.gradient_raw);

  /* ===================== LC ===================== */

  if (r.sub_pkt_type_lc !== undefined)
    r.sub_pkt_type_lc = decode(SUB_PKT_TYPE_LC_MAP, r.sub_pkt_type_lc);

  if (r.lc_id_numeric !== undefined && r.distance_m !== undefined)
    r.distance_m = formatLCDistance(r.distance_m);

  if (r.lc_id_numeric !== undefined)
    r.lc_id_numeric = formatLCNumericId(r.lc_id_numeric);

  if (r.lc_id_suffix !== undefined)
    r.lc_id_suffix = decode(LC_SUFFIX_MAP, r.lc_id_suffix);

  if (r.manning_type !== undefined)
    r.manning_type = decode(LC_MANNING_MAP, r.manning_type);

  if (r.lc_class !== undefined)
    r.lc_class = decode(LC_CLASS_MAP, r.lc_class);

  if (r.auto_whistling_enabled !== undefined)
    r.auto_whistling_enabled = decode(AUTO_WHISTLE_MAP, r.auto_whistling_enabled);

  if (r.auto_whistling_type !== undefined)
    r.auto_whistling_type = decode(AUTO_WHISTLE_TYPE_MAP, r.auto_whistling_type);


  /* ===================== TURNOUT ===================== */

  if (r.turnout_speed_code !== undefined)
    r.turnout_speed_code = TURNOUT_SPEED_FORMAT(r.turnout_speed_code);

  /* ===================== TAG ===================== */

  if (r.sub_pkt_type_tag !== undefined)
    r.sub_pkt_type_tag = "Tag Linking Information";

  if (r.dist_dup_tag_m !== undefined)
    r.dist_dup_tag_m = formatDistDupTag(r.dist_dup_tag_m);

  if (r.dist_next_rfid_m !== undefined)
    r.dist_next_rfid_m = `${r.dist_next_rfid_m} meters`;

  if (r.dup_tag_dir !== undefined)
    r.dup_tag_dir = decode(DUP_TAG_DIR_MAP, r.dup_tag_dir);

  if (r.abs_loc_reset !== undefined) {
    const decoded = decode(ABS_LOC_RESET_MAP, r.abs_loc_reset);
    r.abs_loc_reset = decoded;

    // If no reset → mark dependent fields as Not Applicable
    if (r.abs_loc_reset === "No Reset") {
      r.loc_reset_start_dist_m = "NA";
      r.adj_loco_dir = "NA";
      r.abs_loc_correction_m = "NA";
      r.adjacent_line_count = "NA";
      r.adjacent_line_tins = "NA";
    }
  }


  if (r.adj_loco_dir !== undefined)
    r.adj_loco_dir = decode(ADJ_LOCO_DIR_MAP, r.adj_loco_dir);


  /* ===================== TRACK ===================== */

  if (r.sub_pkt_type_track !== undefined)
    r.sub_pkt_type_track = "Track Condition Data";


  if (r.track_condition_type !== undefined)
    r.track_condition_type = decode(TRACK_CONDITION_MAP, r.track_condition_type);

  if (r.start_dist_m !== undefined)
    r.start_dist_m = `${r.start_dist_m} meters`;

  if (r.length_m !== undefined)
    r.length_m = `${r.length_m} meters`;


  /* ===================== TSR ===================== */

  if (r.sub_pkt_type_tsr !== undefined)
    r.sub_pkt_type_tsr = "Temporary Speed Restriction Profile";

  if (r.tsr_status !== undefined)
    r.tsr_status = decode(TSR_STATUS_MAP, r.tsr_status);

  if (r.tsr_distance_m !== undefined)
    r.tsr_distance_m = `${r.tsr_distance_m} meters`;

  if (r.tsr_length_m !== undefined)
    r.tsr_length_m = `${r.tsr_length_m} meters`;

  if (r.tsr_class !== undefined)
    r.tsr_class = decode(TSR_CLASS_MAP, r.tsr_class);

  if (r.tsr_universal_speed_kmph !== undefined)
    r.tsr_universal_speed_kmph =
      TSR_SPEED_FORMAT(r.tsr_universal_speed_kmph);

  if (r.tsr_classA_speed !== undefined)
    r.tsr_classA_speed = TSR_SPEED_FORMAT(r.tsr_classA_speed);

  if (r.tsr_classB_speed !== undefined)
    r.tsr_classB_speed = TSR_SPEED_FORMAT(r.tsr_classB_speed);

  if (r.tsr_classC_speed !== undefined)
    r.tsr_classC_speed = TSR_SPEED_FORMAT(r.tsr_classC_speed);

  // Do NOT decode whistle if backend already sends string

  /* ===================== ACCESS ===================== */

  if (r.source_version !== undefined)
    r.source_version = decode(KAVACH_VERSION_MAP, r.source_version);

  if (r.stn_location_m !== undefined)
    r.stn_location_m = `${r.stn_location_m} meters`;

  if (r.tdma_timeslot !== undefined)
    r.tdma_timeslot = TDMA_SLOT_FORMAT(r.tdma_timeslot);

  if (r.stn_tdma !== undefined)
    r.stn_tdma = TDMA_SLOT_FORMAT(r.stn_tdma);

  if (r.uplink_freq_channel !== undefined)
    r.uplink_freq_channel = FREQUENCY_FORMAT(r.uplink_freq_channel);

  if (r.downlink_freq_channel !== undefined)
    r.downlink_freq_channel = FREQUENCY_FORMAT(r.downlink_freq_channel);


  /* ===================== EMERGENCY ===================== */

  if (r.pkt_type !== undefined)
    r.pkt_type = decode(PKT_TYPE_MAP, r.pkt_type);

  if (r.source_version !== undefined)
    r.source_version = decode(KAVACH_VERSION_MAP, r.source_version);

  if (r.stn_location_m !== undefined)
    r.stn_location_m = `${r.stn_location_m}`;

  if (r.gen_sos_call !== undefined)
    r.gen_sos_call = decode(GEN_SOS_MAP, r.gen_sos_call);


  return r;
};




const StationaryKavachInfo = forwardRef(({ tableType }, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(false);
  const [subPacket, setSubPacket] = useState("ma");

  const [allRows, setAllRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);

  const [visibleKeys, setVisibleKeys] = useState(
    MA_COLUMNS.map((c) => c.key)
  );


  /* ================= CONTEXT ================= */
  const { fromDate, toDate, isDateRangeValid } = useAppContext();
const { selectedFile } = useOutletContext();

  const { filteredRows, setFilter, clearFilters } = useTableFilter(rows);

  const rowsPerPage = isMobile ? 6 : 10;

  /* ================= COLUMN SELECTION ================= */
  const getColumns = () => {

    if (tableType === "station_access") return ACCESS_COLUMNS;
    if (tableType === "station_emergency") return EMERGENCY_COLUMNS;

    // default → Regular (MA)
    if (subPacket === "ma") return MA_COLUMNS;
    if (subPacket === "ssp") return SSP_COLUMNS;
    if (subPacket === "gradient") return GRADIENT_COLUMNS;
    if (subPacket === "lc") return LC_COLUMNS;
    if (subPacket === "turnout") return TURNOUT_COLUMNS;
    if (subPacket === "tag") return TAG_COLUMNS;
    if (subPacket === "track") return TRACK_COLUMNS;
    if (subPacket === "tsr") return TSR_COLUMNS;

    return MA_COLUMNS;
  };


  const columns = getColumns();



  /* ================= FILTER ON TYPE CHANGE ================= */
  useEffect(() => {
    if (!allRows.length) {
      setRows([]);
      return;
    }
    if (tableType !== "station_regular") {
      setRows(allRows);
      setPage(1);
      clearFilters();
      return;
    }

    let flattened = [];

    allRows.forEach((packet) => {

      if (subPacket === "ma") {
        flattened.push(packet);
      }

      if (subPacket === "ssp" && packet.static_speed_profile) {
        packet.static_speed_profile.forEach((ssp) => {
          flattened.push({
            frame_number: packet.frame_number,

            // SSP Header fields
            sub_pkt_type_ssp: packet.sub_pkt_type_ssp,
            sub_pkt_len_ssp: packet.sub_pkt_len_ssp,
            lm_speed_info_cnt: packet.lm_speed_info_cnt,

            // Entry fields
            ...ssp,
          });
        });
      }


      if (subPacket === "gradient" && packet.gradient_profile) {
        packet.gradient_profile.forEach((g) => {
          flattened.push({
            frame_number: packet.frame_number,

            sub_pkt_type_grad: packet.sub_pkt_type_grad,
            sub_pkt_len_grad: packet.sub_pkt_len_grad,
            lm_grad_info_cnt: packet.lm_grad_info_cnt,

            ...g,
          });
        });
      }

      if (subPacket === "lc" && packet.lc_gate_profile) {
        packet.lc_gate_profile.forEach((lc) => {
          flattened.push({
            frame_number: packet.frame_number,

            sub_pkt_type_lc: packet.sub_pkt_type_lc,
            sub_pkt_len_lc: packet.sub_pkt_len_lc,
            lm_lc_info_cnt: packet.lm_lc_info_cnt,

            ...lc,
          });
        });
      }
      if (subPacket === "turnout" && packet.turnout_speed_profile) {
        packet.turnout_speed_profile.forEach((t) => {
          flattened.push({
            frame_number: packet.frame_number,

            sub_pkt_type_to: packet.sub_pkt_type_to,
            sub_pkt_len_to: packet.sub_pkt_len_to,
            to_cnt: packet.to_cnt,

            ...t,
          });
        });
      }

      if (subPacket === "tag" && packet.rfid_list) {
        packet.rfid_list.forEach((r) => {
          flattened.push({
            frame_number: packet.frame_number,

            sub_pkt_type_tag: packet.sub_pkt_type_tag,
            sub_pkt_len_tag: packet.sub_pkt_len_tag,

            // Main fields
            dist_dup_tag_m: packet.dist_dup_tag_m,
            route_rfid_count: packet.route_rfid_count,

            // Per RFID entry
            dist_next_rfid_m: r.dist_next_rfid_m,
            rfid_tag_id: r.rfid_tag_id,
            dup_tag_dir: r.dup_tag_dir,

            // Location reset section
            abs_loc_reset: packet.abs_loc_reset,
            loc_reset_start_dist_m: packet.loc_reset_start_dist_m,
            adj_loco_dir: packet.adj_loco_dir,
            abs_loc_correction_m: packet.abs_loc_correction_m,
            adjacent_line_count: packet.adjacent_line_count,
            adjacent_line_tins: packet.adjacent_line_tins,
          });
        });
      }
      if (subPacket === "track" && packet.track_conditions) {
        packet.track_conditions.forEach((tc) => {
          flattened.push({
            frame_number: packet.frame_number,
            track_condition_count: packet.track_condition_count,
            sub_pkt_type_track: packet.sub_pkt_type_track,
            sub_pkt_len_track: packet.sub_pkt_len_track,

            track_condition_type: tc.track_condition_type,
            start_dist_m: tc.start_dist_m,
            length_m: tc.length_m,
          });
        });
      }


      if (subPacket === "tsr" && packet.tsr_list) {
        packet.tsr_list.forEach((tsr) => {
          flattened.push({
            frame_number: packet.frame_number,
            sub_pkt_type_tsr: packet.sub_pkt_type_tsr,
            sub_pkt_len_tsr: packet.sub_pkt_len_tsr,
            tsr_status: packet.tsr_status,
            tsr_info_cnt: packet.tsr_info_cnt,
            ...tsr,
          });
        });
      }
    });

    setRows(flattened);
    setPage(1);
    clearFilters();

  }, [subPacket, allRows]);



  useEffect(() => {
    const hiddenByDefault = columns
      .filter(
        (c) =>
          !c.key.toLowerCase().includes("sub_pkt_type") &&
          !c.key.toLowerCase().includes("sub_pkt_len") &&
          c.key !== "pkt_type" &&
          c.key !== "pkt_length"
      )
      .map((c) => c.key);

    setVisibleKeys(hiddenByDefault);
  }, [subPacket, tableType]);




  /* ================= DATA FETCH (TEMP) ================= */
  const generate = async () => {
  if (!fromDate || !toDate) {
    alert("Please select From and To date");
    return;
  }

  if (!selectedFile) {
    alert("Please select BIN file");
    return;
  }

  if (!isDateRangeValid) {
    alert("Invalid date range");
    return;
  }

  setLoading(true);
  setRows([]);
  clearFilters();

  try {
    const normalizeDate = (v) =>
      v && v.length === 16 ? `${v}:00` : v;

    let endpoint = "regular";

    if (tableType === "station_access") endpoint = "access";
    if (tableType === "station_emergency") endpoint = "emergency";

    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const fileBuffer = await selectedFile.arrayBuffer();

    const res = await fetch(
  `${API_BASE}/api/stationary/${endpoint}/by-date?from=${encodeURIComponent(normalizeDate(fromDate))}&to=${encodeURIComponent(normalizeDate(toDate))}`,
  {
    method: "POST",
    body: fileBuffer,
    headers: {
      "Content-Type": "application/octet-stream",
    },
  }
);


    const json = await res.json();

    if (json.success === false) {
      throw new Error(json.error || "Backend error");
    }

    const mapped = (json.data || []).map((r, idx) => {
      const dt = new Date(r.event_time);
      return {
        id: idx + 1,
        date: dt.toISOString().slice(0, 10),
        time: dt.toTimeString().slice(0, 8),
        ...r,
      };
    });

    setAllRows(mapped);
    setPage(1);

  } catch (err) {
    console.error("Stationary Kavach Info fetch error:", err);
    alert(err.message);
  } finally {
    setLoading(false);
  }
};


  const clear = () => {
    setRows([]);
    setPage(1);
    clearFilters();
  };

  /* ================= EXPOSE API ================= */
  useImperativeHandle(ref, () => ({
    generate,
    clear,

    getFilteredRows: () => {
      return filteredRows.map((row) => {
        const formatted = formatMovementAuthorityRow(row);

        // remove packet type & length from export
        const { pkt_type, pkt_length, ...rest } = formatted;
        return rest;
      });
    },

    getAllRows: () => {
      return rows.map((row) => {
        const formatted = formatMovementAuthorityRow(row);

        // remove packet type & length from export
        const { pkt_type, pkt_length, ...rest } = formatted;
        return rest;
      });
    },
    getSubPacket: () => subPacket,
    getVisibleColumns: () => {
      // remove packet type & length columns
      return columns.filter(
        (c) => c.key !== "pkt_type" && c.key !== "pkt_length"
      );
    },

    openColumnDialog: () => setColumnDialogOpen(true),
    searchByStation: (value) =>
      setFilter("stationary_kavach_id", value),
  }));


  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  /* ================= UI ================= */
  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Stack direction="row" spacing={0.5} sx={{ mb: 0.5 }}>
        <MovingIcon color="primary" fontSize="small" />
        <Typography fontWeight={900} fontSize="0.75rem">
          Stationary Kavch Info
        </Typography>
      </Stack>
      {tableType === "station_regular" && (
        <Box sx={{ mb: 1 }}>
          <Select
            size="small"
            value={subPacket}
            onChange={(e) => setSubPacket(e.target.value)}
          >
            <MenuItem value="ma">Movement Authority</MenuItem>
            <MenuItem value="ssp">Static Speed Profile</MenuItem>
            <MenuItem value="gradient">Gradient</MenuItem>
            <MenuItem value="lc">LC Gate</MenuItem>
            <MenuItem value="turnout">Turnout</MenuItem>
            <MenuItem value="tag">Tag Linking</MenuItem>
            <MenuItem value="track">Track Condition</MenuItem>
            <MenuItem value="tsr">TSR</MenuItem>
          </Select>
        </Box>
      )}

      <AnimatePresence>
        {loading ? (
          <LinearProgress />
        ) : (
          <Card variant="outlined">
            <CardContent sx={{ p: 0 }}>
              {filteredRows.length ? (
                <StationaryKavachTable
                  rows={paginatedRows.map(formatMovementAuthorityRow)}


                  columns={columns}
                  visibleKeys={visibleKeys}
                />

              ) : (
                <Box
                  sx={{
                    minHeight: 280,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="caption" fontWeight={700}>
                    No Stationary Kavch Data Found.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </AnimatePresence>

      {filteredRows.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 1,
            mb: 0.5,
          }}
        >
          <PaginationControls
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            size="small"
          />
        </Box>
      )}

      <ColumnFilterDialog
        open={columnDialogOpen}
        values={columns.map((c) => c.label)}
        selectedValues={visibleKeys.map(
          (k) => columns.find((c) => c.key === k)?.label
        )}
        onClose={() => setColumnDialogOpen(false)}
        onApply={(labels) => {
          setVisibleKeys(
            columns.filter((c) => labels.includes(c.label)).map((c) => c.key)
          );
          setColumnDialogOpen(false);
        }}
      />
    </Box>
  );
});

export default StationaryKavachInfo;
