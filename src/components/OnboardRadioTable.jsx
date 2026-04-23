import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
} from "@mui/material";

import { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export default function OnboardRadioTable({ rows = [], visibleColumns = [] }) {
  const [openRows, setOpenRows] = useState({});
  const [openSubRows, setOpenSubRows] = useState({});
  const [openInnerRows, setOpenInnerRows] = useState({});

  return (
    <TableContainer component={Box} sx={{ overflowX: "auto" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 40, bgcolor: "#1a1a1a" }} />

            {[
              { key: "event_time", label: "Event Time" },
              { key: "msg_type", label: "Message Type" },
              { key: "kavach_id", label: "Kavach ID" },
              { key: "nms_id", label: "NMS ID" },
              { key: "version", label: "Version" },
              { key: "radio_pkt_count", label: "Radio Count" },

            ].map((col) =>
              !visibleColumns.length || visibleColumns.includes(col.label) ? (
                <TableCell
                  key={col.key}
                  sx={{
                    bgcolor: "#1a1a1a",
                    color: "rgba(255,255,255,0.4)",
                    fontWeight: 800,
                  }}
                >
                  {col.label.toUpperCase()}
                </TableCell>
              ) : null,
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, i) => (
            <>
              {/* MAIN ROW */}
              <TableRow
                key={i}
                sx={{
                  "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                  "& td": {
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.8)",
                  },
                }}
              >
                <TableCell>
                  <IconButton
                    size="small"
                    sx={{ color: "#fff !important" }}
                    onClick={() =>
                      setOpenRows((prev) => ({
                        ...prev,
                        [i]: !prev[i],
                      }))
                    }
                  >
                    {openRows[i] ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </IconButton>
                </TableCell>

                {[
                  { key: "event_time", label: "Event Time" },
                  { key: "msg_type", label: "Message Type" },
                  { key: "kavach_id", label: "Kavach ID" },
                  { key: "nms_id", label: "NMS ID" },
                  { key: "version", label: "Version" },
                  { key: "radio_pkt_count", label: "Radio Count" },
                ].map((col) =>
                  !visibleColumns.length ||
                  visibleColumns.includes(col.label) ? (
                    <TableCell key={col.key}>{row[col.key] ?? "-"}</TableCell>
                  ) : null,
                )}
              </TableRow>

              {/* LEVEL 1 */}
              {openRows[i] && (
                <TableRow>
                  <TableCell
                    colSpan={
                      1 + (visibleColumns.length ? visibleColumns.length : 10) // total default columns
                    }
                  >
                    <Box sx={{ p: 1, bgcolor: "#0d1117" }}>
                      {row.sub_packets.map((pkt, j) => {
                        const key = `${row.id}-${j}`;

                        return (
                          <Box key={j} sx={{ mb: 1 }}>
                            <Box display="flex" alignItems="center">
                              {pkt.sub_packets &&
                                pkt.sub_packets.length > 0 && (
                                  <IconButton
                                    size="small"
                                    sx={{ color: "#fff !important" }}
                                    onClick={() =>
                                      setOpenSubRows((prev) => ({
                                        ...prev,
                                        [key]: !prev[key],
                                      }))
                                    }
                                  >
                                    {openSubRows[key] ? (
                                      <KeyboardArrowUpIcon />
                                    ) : (
                                      <KeyboardArrowDownIcon />
                                    )}
                                  </IconButton>
                                )}

                              <Typography
                                sx={{ color: "#4dabf7", fontWeight: 700 }}
                              >
                                {pkt.packet}
                              </Typography>
                              {(!pkt.sub_packets ||
                                pkt.sub_packets.length === 0) && (
                                <TableContainer sx={{ mt: 1 }}>
                                  <Table size="small">
                                    {/* HEADER */}
                                    <TableHead>
                                      <TableRow>
                                        {Object.keys(pkt).map((k) => {
                                          if (
                                            k === "packet" ||
                                            k === "sub_packets"
                                          )
                                            return null;

                                          if (
                                            visibleColumns.length &&
                                            !visibleColumns.includes(k)
                                          )
                                            return null;

                                          return (
                                            <TableCell
                                              key={k}
                                              sx={{
                                                color: "#4dabf7",
                                                fontWeight: 700,
                                                fontSize: "0.7rem",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {k}
                                            </TableCell>
                                          );
                                        })}
                                      </TableRow>
                                    </TableHead>

                                    {/* VALUES */}
                                    <TableBody>
                                      <TableRow>
                                        {Object.entries(pkt).map(([k, v]) => {
                                          if (
                                            k === "packet" ||
                                            k === "sub_packets"
                                          )
                                            return null;

                                          if (
                                            visibleColumns.length &&
                                            !visibleColumns.includes(k)
                                          )
                                            return null;

                                          return (
                                            <TableCell
                                              key={k}
                                              sx={{
                                                fontSize: 13,
                                                color: "rgba(255,255,255,0.7)",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {String(v)}
                                            </TableCell>
                                          );
                                        })}
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              )}
                            </Box>

                            {/* LEVEL 2 */}
                            {openSubRows[key] && (
                              <Box sx={{ pl: 4, mt: 1 }}>
                                {pkt.sub_packets?.map((sp, idx) => {
                                  const innerKey = `${row.id}-${j}-${idx}`;

                                  return (
                                    <Box key={idx} sx={{ mb: 1 }}>
                                      {/* LEVEL 3 HEADER */}
                                      <Box display="flex" alignItems="center">
                                        <IconButton
                                          size="small"
                                          sx={{ color: "#fff !important" }}
                                          onClick={() =>
                                            setOpenInnerRows((prev) => ({
                                              ...prev,
                                              [innerKey]: !prev[innerKey],
                                            }))
                                          }
                                        >
                                          {openInnerRows[innerKey] ? (
                                            <KeyboardArrowUpIcon />
                                          ) : (
                                            <KeyboardArrowDownIcon />
                                          )}
                                        </IconButton>

                                        <Typography
                                          sx={{
                                            color: "#4dabf7",
                                            fontWeight: 800,
                                            fontSize: "0.8rem",
                                          }}
                                        >
                                          {sp.type}
                                        </Typography>
                                      </Box>

                                      {openInnerRows[innerKey] && (
                                        <TableContainer sx={{ mt: 1, ml: 4 }}>
                                          <Table size="small">
                                            {/* HEADER */}
                                            <TableHead>
                                              <TableRow>
                                                {Object.keys(sp).map((k) => {
                                                  if (k === "type") return null;

                                                  if (
                                                    visibleColumns.length &&
                                                    !visibleColumns.includes(k)
                                                  )
                                                    return null;

                                                  return (
                                                    <TableCell
                                                      key={k}
                                                      sx={{
                                                        color: "#4dabf7",
                                                        fontWeight: 700,
                                                        fontSize: "0.85rem",
                                                        whiteSpace: "nowrap",
                                                      }}
                                                    >
                                                      {k}
                                                    </TableCell>
                                                  );
                                                })}
                                              </TableRow>
                                            </TableHead>

                                            {/* VALUES */}
                                            <TableBody>
                                              <TableRow>
                                                {Object.entries(sp).map(
                                                  ([k, v]) => {
                                                    if (k === "type")
                                                      return null;

                                                    if (
                                                      visibleColumns.length &&
                                                      !visibleColumns.includes(
                                                        k,
                                                      )
                                                    )
                                                      return null;

                                                    return (
                                                      <TableCell
                                                        key={k}
                                                        sx={{
                                                          fontSize: 13,
                                                          color:
                                                            "rgba(255,255,255,0.7)",
                                                          whiteSpace: "nowrap",
                                                        }}
                                                      >
                                                        {String(v)}
                                                      </TableCell>
                                                    );
                                                  },
                                                )}
                                              </TableRow>
                                            </TableBody>
                                          </Table>
                                        </TableContainer>
                                      )}
                                    </Box>
                                  );
                                })}
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
