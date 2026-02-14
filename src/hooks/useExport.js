import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCellValue } from "../utils/locoFormatters";
import { formatFaultCellValue } from "../utils/faultFormatter";

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

    // ---------------- ONBOARD ----------------
    if (reportType === "onboard") return "LVK_OR";
    if (reportType === "access") return "LVK_AR";

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


    return "REPORT";
  };

  /* ================= EXCEL EXPORT ================= */
  const exportExcel = (
    rows,
    columns,
    reportType,
    subPacket
  ) => {

    if (!rows || !rows.length) return;

    // if (reportType?.startsWith("station_")) {
    //   columns = columns.filter(
    //     (c) =>
    //       !c.key.toLowerCase().includes("pkt_type") &&
    //       !c.key.toLowerCase().includes("pkt_len") &&
    //       !c.key.toLowerCase().includes("pkt_length")
    //   );
    // }

    const data = rows.map(row =>
      Object.fromEntries(
        columns.map(col => [
          col.label,
          formatFaultCellValue(row, col.key)
        ])
      )
    );

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

    saveAs(blob, `${reportCode}_${timestamp}.xlsx`);
  };

  /* ================= PDF EXPORT ================= */
  const exportPDF = (
    rows,
    columns,
    reportType,
    subPacket
  ) => {

    if (!rows || !rows.length) return;

    // if (reportType?.startsWith("station_")) {
    //   columns = columns.filter(
    //     (c) =>
    //       !c.key.toLowerCase().includes("pkt_type") &&
    //       !c.key.toLowerCase().includes("pkt_len") &&
    //       !c.key.toLowerCase().includes("pkt_length")
    //   );
    // }

    const doc = new jsPDF("l", "pt", "a4");

    doc.setFontSize(14);
    doc.text("INDIAN RAILWAYS - CIKMS RGS", 40, 40);

    autoTable(doc, {
      startY: 60,
      head: [columns.map(col => col.label.toUpperCase())],
      body: rows.map(row =>
        columns.map(col =>
          reportType === "fault_station" || reportType === "fault_loco"
            ? formatFaultCellValue(row, col.key)
            : formatCellValue(row, col.key)
        )
      ),

      theme: "striped",
      styles: { fontSize: 7 },
    });


    const timestamp = getDateTimeStamp();
    const reportCode = getReportCode(reportType, subPacket);

    doc.save(`${reportCode}_${timestamp}.pdf`);
  };

  return {
    exportExcel,
    exportPDF,
  };
}
