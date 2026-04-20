import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { useState, useEffect } from "react";
import autoTable from "jspdf-autotable";
import { formatCellValue } from "../utils/locoFormatters";
import { formatFaultCellValue } from "../utils/faultFormatter";
import { formatTagCellValue } from "../utils/tagFormatter";
import areaLogo from "../assets/arecaLogo.png";
import { TAG_ALL_COLUMNS } from "../constants/tagColumns";
import { TAG_TYPE_COLUMNS } from "../constants/tagColumns";
export default function useExport() {
  /* ================= TIMESTAMP ================= */
  const getDateTimeStamp = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");

    return (
      pad(now.getDate()) +
      pad(now.getMonth() + 1) +
      String(now.getFullYear()).slice(-2) +
      "_" +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds())
    );
  };

  /* ================= REPORT CODE ================= */
  const getReportCode = (reportType, subPacket) => {
    if (reportType === "exception") {
      const map = {
        "Emergency Brake": "EB",
        "Loco SOS": "LSOS",
        "Override Mode": "OVR",
        "Trip Mode": "TRP",
      };

      const suffix = map[subPacket] || "GEN";

      return `LVK_EX_${suffix}`;
    }

    if (reportType === "onboard") return "LVK_OR";
    if (reportType === "access") return "LVK_AR";

    if (reportType === "route_rfid") return "ROUTE_RFID";

    // ---------------- STATIONARY REGULAR ----------------
    if (reportType === "station_regular") {
      const subMap = {
        ma: "MA",
        ssp: "SSP",
        gradient: "GRAD",
        lc: "LC",
        turnout: "TOUT",
        tag: "TAG",
        track: "TC",
        tsr: "TSR",
      };

      const tabCode = subMap[subPacket] || "MA";

      return `SVK_SR_${tabCode}`;
    }

    // ---------------- STATIONARY ACCESS ----------------
    if (reportType === "station_access") return "SVK_AA";

    // ---------------- STATIONARY EMERGENCY ----------------
    if (reportType === "station_emergency") return "SVK_EM";

    if (reportType === "fault_station") return "FLT_STN";
    if (reportType === "fault_loco") return "FLT_LOCO";

    // ---------------- INTERLOCKING ----------------
    if (reportType === "interlocking") return "INT_LCK";

    // ---------------- HEALTH ----------------
    if (reportType === "health_stationary") return "HLTH_STN";
    if (reportType === "health_onboard") return "HLTH_OB";

    // ---------------- RSSI ----------------
    if (reportType === "rssi_loco") return "RSSI_LOCO";
    if (reportType === "rssi_stationary") return "RSSI_STN";

    if (reportType === "tag_data") return "TAG_DATA";

    return "REPORT";
  };
  const getReportTitle = (reportType, subPacket) => {
    if (reportType === "onboard") return "ONBOARD REGULAR REPORT";
    if (reportType === "access") return "ONBOARD ACCESS REPORT";

    if (reportType === "route_rfid") return "ROUTE RFID REPORT";

    if (reportType === "exception") {
      const map = {
        "Emergency Brake": "EMERGENCY BRAKE REPORT",
        "Loco SOS": "LOCO SOS REPORT",
        "Override Mode": "OVERRIDE MODE REPORT",
        "Trip Mode": "TRIP MODE REPORT",
      };

      return map[subPacket] || "LOCO EXCEPTION REPORT";
    }

    if (reportType === "station_regular") {
      const map = {
        ma: "MOVEMENT AUTHORITY REPORT",
        ssp: "STATIC SPEED PROFILE REPORT",
        gradient: "GRADIENT REPORT",
        lc: "LEVEL CROSSING REPORT",
        turnout: "TURNOUT REPORT",
        tag: "TAG REPORT",
        track: "TRACK CONDITION REPORT",
        tsr: "TEMPORARY SPEED RESTRICTION REPORT",
      };
      return map[subPacket] || "STATIONARY REGULAR REPORT";
    }

    if (reportType === "station_access")
      return "STATIONARY ACCESS AUTHORITY REPORT";
    if (reportType === "station_emergency")
      return "STATIONARY EMERGENCY REPORT";

    if (reportType === "fault_station") return "STATION FAULT REPORT";
    if (reportType === "fault_loco") return "LOCO FAULT REPORT";

    if (reportType === "interlocking") return "INTERLOCKING REPORT";

    if (reportType === "health_stationary") return "STATIONARY HEALTH REPORT";
    if (reportType === "health_onboard") return "ONBOARD HEALTH REPORT";

    // ---------------- RSSI ----------------
    if (reportType === "rssi_loco") return "LOCO RSSI REPORT";
    if (reportType === "rssi_stationary") return "STATIONARY RSSI REPORT";

    if (reportType === "tag_data") return "TAG DATA REPORT";
    return "KAVACH REPORT";
  };

  /* ================= EXCEL EXPORT ================= */
  const exportExcel = (rows, columns, reportType, subPacket) => {
    if (!rows || !rows.length) return;

    const isLoco = reportType === "onboard" || reportType === "access";

    const data = [];

    rows.forEach((row) => {
      // MAIN ROW (UNCHANGED LOGIC)
      const mainRow = Object.fromEntries(
        columns.map((col) => [
          col.label,
          reportType === "onboard" ||
          reportType === "access" ||
          reportType === "route_rfid"
            ? formatCellValue(row, col.key)
            : reportType === "rssi_loco" || reportType === "rssi_stationary"
              ? (row[col.key] ?? "-")
              : reportType === "interlocking" && col.key === "date"
                ? `${row.date || ""} ${row.time || ""}`
                : reportType === "health_stationary" ||
                    reportType === "health_onboard"
                  ? (row[col.key] ?? "-")
                  : reportType === "tag_data"
                    ? formatTagCellValue(row, col.key)
                    : formatFaultCellValue(row, col.key),
        ]),
      );

      data.push(mainRow);

      if (reportType === "tag_data" && row.tags?.length) {
        row.tags.forEach((tag) => {
          const TYPE_MAP = {
            9: "NORMAL",
            10: "LC",
            11: "ADJACENT",
            12: "JUNCTION",
          };

          const tagType = TYPE_MAP[Number(tag.tag_type)] || "NORMAL";
          const allowedKeys = TAG_TYPE_COLUMNS[tagType] || [];

          const subRow = Object.fromEntries(
            columns.map((col) => {
              if (allowedKeys.includes(col.key)) {
                return [col.label, formatTagCellValue(tag, col.key)];
              }
              return [col.label, ""];
            }),
          );
          data.push(subRow);
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    worksheet["!cols"] = columns.map(() => ({ wch: 18 }));
    XLSX.utils.book_append_sheet(workbook, worksheet, "CIKMS Data Logs");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const timestamp = getDateTimeStamp();
    const reportCode = getReportCode(reportType, subPacket);

    if (reportType === "route_rfid") {
      saveAs(blob, `route_rfid_report_${timestamp}.xlsx`);
    } else {
      saveAs(blob, `${reportCode}_${timestamp}.xlsx`);
    }
  };

  /* ================= PDF EXPORT ================= */
  const exportPDF = (rows, columns, reportType, subPacket) => {
    if (!rows || !rows.length) return;

    const isStation = reportType === "station_regular";
    const isLoco = reportType === "onboard" || reportType === "access";
    const doc = new jsPDF(
      "l",
      "pt",
      isStation ? [columns.length * 80, 841.89] : "a3",
    );
    const timestamp = getDateTimeStamp();
    const reportCode = getReportCode(reportType, subPacket);

    autoTable(doc, {
      startY: 60,
      margin: { top: 60, bottom: 40 },
      head: [columns.map((col) => col.label.toUpperCase())],
      body: (() => {
        const body = [];

        rows.forEach((row) => {
          body.push(
            columns.map((col) =>
              reportType === "fault_station" || reportType === "fault_loco"
                ? formatFaultCellValue(row, col.key)
                : reportType === "rssi_loco" || reportType === "rssi_stationary"
                  ? (row[col.key] ?? "-")
                  : reportType === "health_stationary" ||
                      reportType === "health_onboard"
                    ? (row[col.key] ?? "-")
                    : reportType === "route_rfid"
                      ? (row[col.key] ?? "-")
                      : reportType === "tag_data"
                        ? formatTagCellValue(row, col.key)
                        : formatCellValue(row, col.key),
            ),
          );

          if (reportType === "tag_data" && row.tags?.length) {
  row.tags.forEach((tag) => {
    const TYPE_MAP = {
      9: "NORMAL",
      10: "LC",
      11: "ADJACENT",
      12: "JUNCTION",
    };

    const tagType = TYPE_MAP[Number(tag.tag_type)] || "NORMAL";
    const allowedKeys = TAG_TYPE_COLUMNS[tagType] || [];

    body.push(
      columns.map((col) =>
        allowedKeys.includes(col.key)
          ? formatTagCellValue(tag, col.key)
          : ""
      )
    );
  });
}
        });

        return body;
      })(),
      styles: isStation
        ? { fontSize: 5.5, cellPadding: 2, overflow: "linebreak" }
        : isLoco
          ? { fontSize: 6.5, cellPadding: 2 }
          : { fontSize: 9 },

      headStyles: isStation
        ? { fontSize: 6, cellPadding: 2, halign: "center" }
        : isLoco
          ? { fontSize: 7 }
          : { fontSize: 10 },
      columnStyles: isStation
        ? Object.fromEntries(
            columns.map((_, i) => [i, { cellWidth: "auto", minCellWidth: 22 }]),
          )
        : {},
      didDrawPage: (data) => {
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const reportTitle = getReportTitle(reportType, subPacket);

        // --- HEADER ---
        doc.setTextColor(40, 107, 206);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(`KAVACH REPORT GENERATING SYSTEM - ${reportTitle}`, 40, 45);
        doc.addImage(areaLogo, "PNG", pageWidth - 100, 17, 60, 30);

        // --- FOOTER ---
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);

        // Confidential text
        const footerText =
          "This document is confidential. Using it any purpose without permission of Areca Embedded Systems Pvt. Ltd. is strictly prohibited.";
        doc.text(footerText, 40, pageHeight - 20);

        const timeText = `Generated: ${new Date().toLocaleString()}`;
        doc.text(timeText, pageWidth - 200, pageHeight - 20);

        const pageNumber = `Page ${doc.internal.getNumberOfPages()}`;
        doc.text(pageNumber, pageWidth - 60, pageHeight - 20);

        // Reset for table content
        doc.setTextColor(0, 0, 0);
      },
    });

    if (reportType === "route_rfid") {
      doc.save(`route_rfid_report_${timestamp}.pdf`);
    } else {
      doc.save(`${reportCode}_${timestamp}.pdf`);
    }
  };
  return {
    exportExcel,
    exportPDF,
  };
}
