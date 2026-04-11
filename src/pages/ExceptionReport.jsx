import { forwardRef, useImperativeHandle, useState } from "react";
import { Box, Typography } from "@mui/material";
import LocoMovement from "./LocoMovement";
import { useRef } from "react";
const ExceptionReport = forwardRef((props, ref) => {
  const innerRef = props.innerRef;
  const [typeState, setTypeState] = useState("Emergency Brake");
  const typeRef = useRef("Emergency Brake");

  useImperativeHandle(ref, () => ({
    generate: async () => {
      await innerRef.current.generate();

      innerRef.current.clearFilters();

      switch (typeRef.current) {
        case "Emergency Brake":
          innerRef.current.setFilter("brake_applied_status", (v) => Number(v) === 4);
          break;

        case "Loco SOS":
          innerRef.current.setFilter("emergency_status", (v) => Number(v) === 2);
          break;

        case "Override Mode":
          innerRef.current.setFilter("loco_mode", (v) => Number(v) === 5);
          break;

        case "Trip Mode":
          innerRef.current.setFilter("loco_mode", (v) => Number(v) === 7);
          break;
      }
    },
    clear: () => innerRef.current.clear(),
    setFilter: innerRef.current.setFilter,
    clearFilters: innerRef.current.clearFilters,
    getFilteredRows: innerRef.current.getFilteredRows,
    getAllRows: innerRef.current.getAllRows,
    getVisibleColumns: innerRef.current.getVisibleColumns,
    openColumnDialog: innerRef.current.openColumnDialog,
    setType: (t) => {
      typeRef.current = t;
      setTypeState(t);
    },
  }));

  return null;
});

export default ExceptionReport;