import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fetchApi } from "@/lib/apiClient";
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";
import clbcLogo from "@/assets/clbc-logo.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Loader2,
  Printer,
  Calendar,
  Users,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface AttendanceRecord {
  id: string;
  attendance_date: string;
  total_members: number;
  present_count: number;
  absent_count: number;
}

interface MemberAttendance {
  member_id: string;
  member_name: string;
  phone: string | null;
  total_sessions: number;
  present_count: number;
  absent_count: number;
  attendance_rate: number;
}

export default function AttendanceReport() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [dateRange, setDateRange] = useState<"all" | "month" | "custom">("month");
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [memberAttendance, setMemberAttendance] = useState<MemberAttendance[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalSessions: 0,
    totalMembers: 0,
    avgAttendance: 0,
    highestAttendance: 0,
    lowestAttendance: 0,
    totalPresentTally: 0,
    totalAbsentTally: 0,
    regularCount: 0,
    moderateCount: 0,
    atRiskCount: 0,
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange, startDate, endDate, selectedMonth]);

  const getDateFilters = () => {
    if (dateRange === "all") {
      return { start: null, end: null };
    } else if (dateRange === "month") {
      const monthDate = parseISO(selectedMonth + "-01");
      return {
        start: format(startOfMonth(monthDate), "yyyy-MM-dd"),
        end: format(endOfMonth(monthDate), "yyyy-MM-dd"),
      };
    } else {
      return { start: startDate, end: endDate };
    }
  };

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const { start, end } = getDateFilters();

      const queryParams = new URLSearchParams();
      if (start) queryParams.append('start', start);
      if (end) queryParams.append('end', end);
      const queryString = queryParams.toString();

      const records: AttendanceRecord[] = await fetchApi(`/attendance${queryString ? `?${queryString}` : ''}`);
      setAttendanceRecords(records || []);

      const members = await fetchApi("/members");
      setAllMembers(members || []);
      const recordIds = (records || []).map((r: any) => r.id);

      let memberStats: MemberAttendance[] = [];

      if (recordIds.length > 0) {
        const attendance = await fetchApi("/attendance/details");

        if (Array.isArray(attendance) && attendance.length > 0) {
          memberStats = (members || []).map((member: any) => {
            const memberRecords = (attendance || []).filter(
              (a: any) => a.member_id === member.id && recordIds.includes(a.attendance_record_id)
            );
            const presentCount = memberRecords.filter((a: any) => a.is_present || a.is_present === 1).length;
            const totalSessions = memberRecords.length;

            return {
              member_id: member.id,
              member_name: member.full_name,
              phone: member.phone,
              total_sessions: totalSessions,
              present_count: presentCount,
              absent_count: totalSessions - presentCount,
              attendance_rate: totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0,
            };
          }).filter(m => m.total_sessions > 0);

          memberStats.sort((a, b) => b.attendance_rate - a.attendance_rate || a.member_name.localeCompare(b.member_name));
        }
      }

      setMemberAttendance(memberStats);

      const totalSessions = records?.length || 0;
      const totalPresentTally = records?.reduce((sum, r) => sum + (r.present_count || 0), 0) || 0;
      const totalAbsentTally = records?.reduce((sum, r) => sum + (r.absent_count || 0), 0) || 0;
      const totalTracked = records?.reduce((sum, r) => sum + (r.total_members || 0), 0) || 0;
      const avgAttendance = totalTracked > 0 ? Math.round((totalPresentTally / totalTracked) * 100) : 0;

      const attendanceRates = records?.map(r =>
        r.total_members > 0 ? Math.round((r.present_count / r.total_members) * 100) : 0
      ) || [];

      // Determine accurate total members count
      const totalMembersCount =
        memberStats.length > 0
          ? memberStats.length
          : members?.length > 0
          ? members.length
          : records?.[0]?.total_members || 0;

      const regularCount = memberStats.filter(m => m.attendance_rate >= 75).length;
      const moderateCount = memberStats.filter(m => m.attendance_rate >= 50 && m.attendance_rate < 75).length;
      const atRiskCount = memberStats.filter(m => m.attendance_rate < 50).length;

      setSummary({
        totalSessions,
        totalMembers: totalMembersCount,
        avgAttendance,
        highestAttendance: attendanceRates.length > 0 ? Math.max(...attendanceRates) : 0,
        lowestAttendance: attendanceRates.length > 0 ? Math.min(...attendanceRates) : 0,
        totalPresentTally,
        totalAbsentTally,
        regularCount,
        moderateCount,
        atRiskCount,
      });

    } catch (error: any) {
      console.error("Error fetching report data:", error);
      toast({
        title: "Error",
        description: "Failed to load attendance report.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthOptions = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      months.push({
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy"),
      });
    }
    return months;
  };

  const getDateRangeLabel = () => {
    const { start, end } = getDateFilters();
    if (!start && !end) return "All Time";
    if (start && end) {
      return `${format(parseISO(start), "MMMM dd, yyyy")} – ${format(parseISO(end), "MMMM dd, yyyy")}`;
    }
    return "Custom Date Range";
  };

  const getBase64Image = async (url: string): Promise<string> => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve("");
        reader.readAsDataURL(blob);
      });
    } catch {
      return "";
    }
  };

  const exportProfessionalPdf = async () => {
    setIsExportingPdf(true);
    toast({
      title: "Generating PDF",
      description: "Compiling official report for Changed Life Baptist Church...",
    });

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      let currentY = margin;

      // 1. Top Decorative Bar
      doc.setFillColor(30, 58, 138); // Deep Navy Blue
      doc.rect(0, 0, pageWidth, 5, "F");

      // Load church logo
      try {
        const logoData = await getBase64Image(clbcLogo);
        if (logoData) {
          doc.addImage(logoData, "PNG", margin, currentY + 2, 20, 20);
        }
      } catch (e) {
        console.warn("Logo rendering skipped:", e);
      }

      // Church Header Titles
      const textStartX = margin + 24;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(30, 58, 138);
      doc.text("CHANGED LIFE BAPTIST CHURCH", textStartX, currentY + 6.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(71, 85, 105);
      doc.text("OFFICIAL ATTENDANCE & MINISTRY REPORT", textStartX, currentY + 12.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Reporting Period: ${getDateRangeLabel()}`, textStartX, currentY + 17.5);
      doc.text(`Generated: ${format(new Date(), "MMMM dd, yyyy 'at' hh:mm a")}`, textStartX, currentY + 22.5);

      currentY += 27;

      // Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 6;

      // 2. Executive Summary KPI Cards (4 Balanced Cards)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Executive Summary", margin, currentY);
      currentY += 4;

      const cardWidth = (pageWidth - margin * 2 - 9) / 4;
      const cardHeight = 17;

      const kpis = [
        { label: "Total Sessions", value: `${summary.totalSessions}`, color: [30, 58, 138] },
        { label: "Members Tracked", value: `${summary.totalMembers}`, color: [15, 23, 42] },
        { label: "Avg Attendance", value: `${summary.avgAttendance}%`, color: [22, 101, 52] },
        { label: "Peak Attendance", value: `${summary.highestAttendance}%`, color: [37, 99, 235] },
      ];

      kpis.forEach((kpi, idx) => {
        const x = margin + idx * (cardWidth + 3);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12.5);
        doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
        doc.text(kpi.value, x + cardWidth / 2, currentY + 7, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label, x + cardWidth / 2, currentY + 13, { align: "center" });
      });

      currentY += cardHeight + 6;

      // 3. Service Sessions Breakdown Table
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text("1. Service Sessions Breakdown", margin, currentY);
      currentY += 3;

      const sessionRows = attendanceRecords.map((r, i) => {
        const rate = r.total_members > 0 ? Math.round((r.present_count / r.total_members) * 100) : 0;
        return [
          `${i + 1}`,
          format(parseISO(r.attendance_date), "EEE, MMM dd, yyyy"),
          `${r.total_members}`,
          `${r.present_count}`,
          `${r.absent_count}`,
          `${rate}%`,
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [["#", "Session Date", "Total Tracked", "Present", "Absent", "Rate"]],
        body: sessionRows.length > 0 ? sessionRows : [["—", "No sessions in this period", "—", "—", "—", "—"]],
        margin: { left: margin, right: margin },
        theme: "striped",
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: [255, 255, 255],
          fontSize: 8.5,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 41, 59],
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 60, halign: "left" },
          2: { cellWidth: 28, halign: "center" },
          3: { cellWidth: 28, halign: "center", textColor: [22, 101, 52] },
          4: { cellWidth: 28, halign: "center", textColor: [220, 38, 38] },
          5: { cellWidth: 28, halign: "center", fontStyle: "bold" },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 9;

      // 4. Member Attendance Breakdown Table
      if (currentY > pageHeight - 65) {
        doc.addPage();
        currentY = margin + 6;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text("2. Member Attendance Breakdown", margin, currentY);
      currentY += 3;

      const memberRows = memberAttendance.length > 0
        ? memberAttendance.map((m, i) => {
            let status = "Needs Follow-up";
            if (m.attendance_rate >= 75) status = "High (≥75%)";
            else if (m.attendance_rate >= 50) status = "Moderate (50-74%)";

            return [
              `${i + 1}`,
              m.member_name,
              m.phone || "—",
              `${m.total_sessions}`,
              `${m.present_count}`,
              `${m.absent_count}`,
              `${m.attendance_rate}%`,
              status,
            ];
          })
        : allMembers.map((m, i) => [
            `${i + 1}`,
            m.full_name,
            m.phone || "—",
            `${summary.totalSessions}`,
            "—",
            "—",
            "—",
            "Active Member",
          ]);

      autoTable(doc, {
        startY: currentY,
        head: [["#", "Member Name", "Phone", "Sessions", "Present", "Absent", "Rate", "Status"]],
        body: memberRows.length > 0 ? memberRows : [["—", "No members recorded", "—", "—", "—", "—", "—", "—"]],
        margin: { left: margin, right: margin },
        theme: "striped",
        headStyles: {
          fillColor: [51, 65, 85],
          textColor: [255, 255, 255],
          fontSize: 8.5,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 41, 59],
        },
        columnStyles: {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: 48, halign: "left" },
          2: { cellWidth: 28, halign: "left" },
          3: { cellWidth: 18, halign: "center" },
          4: { cellWidth: 16, halign: "center", textColor: [22, 101, 52] },
          5: { cellWidth: 16, halign: "center", textColor: [220, 38, 38] },
          6: { cellWidth: 16, halign: "center", fontStyle: "bold" },
          7: { cellWidth: 32, halign: "center" },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 7) {
            const val = String(data.cell.raw);
            if (val.includes("High")) {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fontStyle = "bold";
            } else if (val.includes("Moderate")) {
              data.cell.styles.textColor = [180, 83, 9];
            } else if (val.includes("Needs")) {
              data.cell.styles.textColor = [220, 38, 38];
            }
          }
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;

      // 5. Official Verification Block
      if (currentY > pageHeight - 38) {
        doc.addPage();
        currentY = margin + 10;
      }

      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 2, 2, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);

      const col1 = margin + 8;
      const col2 = margin + (pageWidth - margin * 2) / 2 + 8;

      doc.text("Prepared By: Kimathi Sedegah", col1, currentY + 7.5);
      doc.text(`Date: ${format(new Date(), "MMMM dd, yyyy")}`, col1, currentY + 15.5);

      doc.text("Pastor / Lead Signature: ___________________________", col2, currentY + 7.5);
      doc.text("Official Stamp: ___________________________", col2, currentY + 15.5);

      // Page Numbers and Footer
      const totalPages = (doc.internal as any).getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text("Changed Life Baptist Church (C.L.B.C) — Confidential Ministry Attendance Record", margin, pageHeight - 6);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: "right" });
      }

      const fileName = `CLBC_Attendance_Report_${selectedMonth || "Export"}_${format(new Date(), "yyyyMMdd")}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF Downloaded",
        description: `Saved as ${fileName}`,
      });
    } catch (error: any) {
      console.error("PDF generation failed:", error);
      toast({
        title: "PDF Export Failed",
        description: error?.message || "Could not generate PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    const printIframe = document.createElement("iframe");
    printIframe.style.position = "fixed";
    printIframe.style.right = "0";
    printIframe.style.bottom = "0";
    printIframe.style.width = "0";
    printIframe.style.height = "0";
    printIframe.style.border = "0";
    document.body.appendChild(printIframe);

    const sessionRowsHtml = attendanceRecords.length > 0
      ? attendanceRecords.map((r, i) => {
          const rate = r.total_members > 0 ? Math.round((r.present_count / r.total_members) * 100) : 0;
          const badgeColor = rate >= 75 ? "#15803d; background: #dcfce7;" : rate >= 50 ? "#b45309; background: #fef3c7;" : "#b91c1c; background: #fee2e2;";
          return `
            <tr>
              <td style="text-align: center; color: #6b7280;">${i + 1}</td>
              <td style="font-weight: 500;">${format(parseISO(r.attendance_date), "EEE, MMM dd, yyyy")}</td>
              <td style="text-align: center;">${r.total_members}</td>
              <td style="text-align: center; color: #16a34a; font-weight: 600;">${r.present_count}</td>
              <td style="text-align: center; color: #dc2626; font-weight: 600;">${r.absent_count}</td>
              <td style="text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-weight: 600; font-size: 10px; color: ${badgeColor}">${rate}%</span></td>
            </tr>
          `;
        }).join("")
      : `<tr><td colspan="6" style="text-align: center; padding: 16px; color: #6b7280;">No attendance records found for this period.</td></tr>`;

    const memberRowsHtml = memberAttendance.length > 0
      ? memberAttendance.map((m, i) => {
          let statusText = "Needs Follow-up";
          let statusStyle = "color: #b91c1c; background: #fee2e2;";
          if (m.attendance_rate >= 75) {
            statusText = "High (≥75%)";
            statusStyle = "color: #15803d; background: #dcfce7;";
          } else if (m.attendance_rate >= 50) {
            statusText = "Moderate (50-74%)";
            statusStyle = "color: #b45309; background: #fef3c7;";
          }
          return `
            <tr>
              <td style="text-align: center; color: #6b7280;">${i + 1}</td>
              <td style="font-weight: 500;">${m.member_name}</td>
              <td style="color: #6b7280;">${m.phone || "—"}</td>
              <td style="text-align: center;">${m.total_sessions}</td>
              <td style="text-align: center; color: #16a34a; font-weight: 600;">${m.present_count}</td>
              <td style="text-align: center; color: #dc2626; font-weight: 600;">${m.absent_count}</td>
              <td style="text-align: center; font-weight: bold;">${m.attendance_rate}%</td>
              <td style="text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-weight: 600; font-size: 10px; ${statusStyle}">${statusText}</span></td>
            </tr>
          `;
        }).join("")
      : allMembers.length > 0
      ? allMembers.map((m, i) => `
          <tr>
            <td style="text-align: center; color: #6b7280;">${i + 1}</td>
            <td style="font-weight: 500;">${m.full_name}</td>
            <td style="color: #6b7280;">${m.phone || "—"}</td>
            <td style="text-align: center;">${summary.totalSessions}</td>
            <td style="text-align: center;">—</td>
            <td style="text-align: center;">—</td>
            <td style="text-align: center;">—</td>
            <td style="text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-weight: 500; font-size: 10px; color: #1d4ed8; background: #dbeafe;">Active Member</span></td>
          </tr>
        `).join("")
      : `<tr><td colspan="8" style="text-align: center; padding: 16px; color: #6b7280;">No member records found.</td></tr>`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CLBC Attendance Report - ${getDateRangeLabel()}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 12mm 12mm 12mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
            }
            body {
              background: #ffffff;
              padding: 0;
              font-size: 11px;
              line-height: 1.4;
            }
            .header {
              display: flex;
              align-items: center;
              gap: 16px;
              border-bottom: 2px solid #1e3a8a;
              padding-bottom: 12px;
              margin-bottom: 14px;
            }
            .header img {
              width: 52px;
              height: 52px;
              object-fit: contain;
            }
            .header-title h1 {
              font-size: 16px;
              font-weight: 800;
              color: #1e3a8a;
              letter-spacing: -0.3px;
            }
            .header-title h2 {
              font-size: 11px;
              font-weight: 700;
              color: #475569;
              margin-top: 1px;
            }
            .header-title p {
              font-size: 9.5px;
              color: #64748b;
              margin-top: 2px;
            }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
              margin-bottom: 14px;
            }
            .kpi-card {
              border: 1px solid #e2e8f0;
              background: #f8fafc;
              border-radius: 6px;
              padding: 8px;
              text-align: center;
            }
            .kpi-card .val {
              font-size: 16px;
              font-weight: 800;
              color: #1e3a8a;
            }
            .kpi-card .lbl {
              font-size: 8.5px;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.4px;
              margin-top: 1px;
            }
            .engagement-bar {
              background: #f1f5f9;
              border-radius: 6px;
              padding: 6px 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 9.5px;
              margin-bottom: 14px;
              border: 1px solid #e2e8f0;
            }
            .sec-title {
              font-size: 11px;
              font-weight: 700;
              color: #0f172a;
              margin: 12px 0 6px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 14px;
              font-size: 10px;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 5px 8px;
              text-align: left;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 700;
              color: #1e293b;
              text-align: center;
            }
            .signoff-box {
              margin-top: 18px;
              border: 1px solid #cbd5e1;
              background: #fafafa;
              border-radius: 6px;
              padding: 10px 14px;
              page-break-inside: avoid;
            }
            .signoff-cols {
              display: flex;
              justify-content: space-between;
              font-size: 9.5px;
              color: #334155;
            }
            .signoff-cols div p {
              margin-bottom: 6px;
            }
            .confidential-footer {
              margin-top: 14px;
              text-align: center;
              font-size: 8.5px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${clbcLogo}" alt="CLBC Logo" />
            <div class="header-title">
              <h1>CHANGED LIFE BAPTIST CHURCH</h1>
              <h2>OFFICIAL ATTENDANCE & MINISTRY REPORT</h2>
              <p>Period: ${getDateRangeLabel()} &nbsp;|&nbsp; Generated on ${format(new Date(), "MMMM dd, yyyy 'at' hh:mm a")}</p>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="val">${summary.totalSessions}</div>
              <div class="lbl">Total Sessions</div>
            </div>
            <div class="kpi-card">
              <div class="val">${summary.totalMembers}</div>
              <div class="lbl">Members Tracked</div>
            </div>
            <div class="kpi-card">
              <div class="val" style="color: #16a34a;">${summary.avgAttendance}%</div>
              <div class="lbl">Avg Attendance Rate</div>
            </div>
            <div class="kpi-card">
              <div class="val" style="color: #2563eb;">${summary.highestAttendance}%</div>
              <div class="lbl">Peak Attendance</div>
            </div>
          </div>

          <div class="engagement-bar">
            <span style="font-weight: bold; color: #475569;">Engagement Breakdown:</span>
            <span style="color: #15803d; font-weight: 600;">High (≥75%): ${summary.regularCount}</span>
            <span style="color: #b45309; font-weight: 600;">Moderate (50-74%): ${summary.moderateCount}</span>
            <span style="color: #b91c1c; font-weight: 600;">Needs Follow-up (&lt;50%): ${summary.atRiskCount}</span>
          </div>

          <div class="sec-title">1. Service Sessions Breakdown</div>
          <table>
            <thead>
              <tr>
                <th style="width: 25px;">#</th>
                <th style="text-align: left;">Session Date</th>
                <th>Total Tracked</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              ${sessionRowsHtml}
            </tbody>
          </table>

          <div class="sec-title">2. Member Attendance Breakdown</div>
          <table>
            <thead>
              <tr>
                <th style="width: 25px;">#</th>
                <th style="text-align: left;">Member Name</th>
                <th style="text-align: left;">Phone</th>
                <th>Sessions</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${memberRowsHtml}
            </tbody>
          </table>

          <div class="signoff-box">
            <div class="signoff-cols">
              <div>
                <p>Prepared By: <strong>Kimathi Sedegah</strong></p>
                <p>Date: <strong>${format(new Date(), "MMMM dd, yyyy")}</strong></p>
              </div>
              <div>
                <p>Pastor / Ministry Lead: _____________________________</p>
                <p>Signature & Stamp: _____________________________</p>
              </div>
            </div>
          </div>

          <div class="confidential-footer">
            Changed Life Baptist Church (C.L.B.C) — Confidential Ministry Attendance Record
          </div>
        </body>
      </html>
    `;

    const doc = printIframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(printIframe)) {
            document.body.removeChild(printIframe);
          }
        }, 2000);
      }, 300);
    } else {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#1F6FB5]" />
      </div>
    );
  }

  const rateBadgeClass = (rate: number) =>
    rate >= 75
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : rate >= 50
      ? "bg-amber-50 text-amber-700 border border-amber-200"
      : "bg-rose-50 text-rose-700 border border-rose-200";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#0F3E6B]">
            Attendance reports
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Official ministry statistics, session trends, and member records
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="h-10 gap-2 rounded-lg border-slate-200 bg-white text-sm font-semibold text-[#0F3E6B] shadow-sm hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={exportProfessionalPdf}
            disabled={isExportingPdf}
            className="h-10 gap-2 rounded-lg bg-[#C62828] text-sm font-semibold text-white shadow-sm hover:bg-[#B71C1C] disabled:opacity-60"
          >
            {isExportingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download official PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="w-full sm:w-48">
            <Label className="text-xs font-semibold text-[#0F3E6B]">Filter mode</Label>
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
              <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-slate-200 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">By month</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateRange === "month" && (
            <div className="w-full sm:w-52">
              <Label className="text-xs font-semibold text-[#0F3E6B]">Select month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-slate-200 bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {dateRange === "custom" && (
            <>
              <div className="w-full sm:w-44">
                <Label className="text-xs font-semibold text-[#0F3E6B]">Start date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border-slate-200 bg-white text-sm focus-visible:ring-[#1F6FB5]"
                />
              </div>
              <div className="w-full sm:w-44">
                <Label className="text-xs font-semibold text-[#0F3E6B]">End date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border-slate-200 bg-white text-sm focus-visible:ring-[#1F6FB5]"
                />
              </div>
            </>
          )}

          <div className="text-xs text-slate-500 lg:ml-auto lg:pb-2.5">
            Showing <span className="font-semibold text-[#0F3E6B]">{getDateRangeLabel()}</span>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-serif text-lg font-bold text-[#0F3E6B]">Key metrics</h3>
          <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#1F6FB5]">
            {summary.totalSessions} {summary.totalSessions === 1 ? "session" : "sessions"} recorded
          </span>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-slate-200/80 shadow-sm">
          <div className="grid grid-cols-2 gap-px lg:grid-cols-4">
            <div className="bg-white p-5 sm:p-6">
              <p className="text-xs font-medium text-slate-500 sm:text-sm">Total sessions</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#0F3E6B] sm:text-4xl">
                {summary.totalSessions}
              </p>
              <p className="mt-1 text-xs text-slate-400">Services held in period</p>
            </div>

            <div className="bg-white p-5 sm:p-6">
              <p className="text-xs font-medium text-slate-500 sm:text-sm">Members tracked</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#0F3E6B] sm:text-4xl">
                {summary.totalMembers}
              </p>
              <p className="mt-1 text-xs text-slate-400">Active church members</p>
            </div>

            <div className="bg-white p-5 sm:p-6">
              <p className="text-xs font-medium text-slate-500 sm:text-sm">Average attendance</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600 sm:text-4xl">
                {summary.avgAttendance}%
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${summary.avgAttendance}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {summary.totalPresentTally} total attendance mark
                {summary.totalPresentTally === 1 ? "" : "s"}
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6">
              <p className="text-xs font-medium text-slate-500 sm:text-sm">Peak attendance</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#1F6FB5] sm:text-4xl">
                {summary.highestAttendance}%
              </p>
              <p className="mt-1 text-xs text-slate-400">Lowest: {summary.lowestAttendance}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {attendanceRecords.length > 0 && (
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="font-serif text-lg font-bold text-[#0F3E6B]">
              Attendance rate timeline
            </h3>
            <div className="mt-4 h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={attendanceRecords.map((r) => ({
                    date: format(parseISO(r.attendance_date), "MMM dd"),
                    fullDate: format(parseISO(r.attendance_date), "MMM dd, yyyy"),
                    rate:
                      r.total_members > 0
                        ? Math.round((r.present_count / r.total_members) * 100)
                        : 0,
                  }))}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="reportRateFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1F6FB5" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#1F6FB5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    tickLine={false}
                    axisLine={{ stroke: "#E2E8F0" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: 8,
                      boxShadow: "0 8px 24px rgba(15, 62, 107, 0.12)",
                    }}
                    labelStyle={{ color: "#0F3E6B", fontWeight: 600 }}
                    labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                    formatter={(value: number) => [`${value}%`, "Attendance rate"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#1F6FB5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#reportRateFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-serif text-lg font-bold text-[#0F3E6B]">
                Present vs absent
              </h3>
              <div className="mt-4 h-60 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceRecords.map((r) => ({
                      date: format(parseISO(r.attendance_date), "MMM dd"),
                      present: r.present_count,
                      absent: r.absent_count,
                    }))}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#64748B" }}
                      tickLine={false}
                      axisLine={{ stroke: "#E2E8F0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: 8,
                        boxShadow: "0 8px 24px rgba(15, 62, 107, 0.12)",
                      }}
                      labelStyle={{ color: "#0F3E6B", fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", color: "#475569" }} />
                    <Bar
                      dataKey="present"
                      name="Present"
                      fill="#16A34A"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="absent"
                      name="Absent"
                      fill="#C62828"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-serif text-lg font-bold text-[#0F3E6B]">
                Overall distribution
              </h3>
              <div className="mt-4 h-60 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Present",
                          value: summary.totalPresentTally,
                        },
                        {
                          name: "Absent",
                          value: summary.totalAbsentTally,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={{ stroke: "#CBD5E1", strokeWidth: 1 }}
                    >
                      <Cell fill="#16A34A" />
                      <Cell fill="#C62828" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: 8,
                        boxShadow: "0 8px 24px rgba(15, 62, 107, 0.12)",
                      }}
                      formatter={(value: number, name: string) => [value, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", color: "#475569" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session breakdown */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-[#0F3E6B]">
            Session breakdown
          </h3>
        </div>

        {attendanceRecords.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
            <Calendar className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">
              No attendance records found for this period.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow className="border-slate-200/70 bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="pl-5 text-xs font-medium text-slate-500 sm:pl-6">
                      Session date
                    </TableHead>
                    <TableHead className="text-center text-xs font-medium text-slate-500">
                      Total tracked
                    </TableHead>
                    <TableHead className="text-center text-xs font-medium text-slate-500">
                      Present
                    </TableHead>
                    <TableHead className="text-center text-xs font-medium text-slate-500">
                      Absent
                    </TableHead>
                    <TableHead className="pr-5 text-center text-xs font-medium text-slate-500 sm:pr-6">
                      Attendance rate
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => {
                    const rate =
                      record.total_members > 0
                        ? Math.round((record.present_count / record.total_members) * 100)
                        : 0;

                    return (
                      <TableRow
                        key={record.id}
                        className="border-slate-100 hover:bg-slate-50/60"
                      >
                        <TableCell className="py-4 pl-5 font-medium text-[#0F3E6B] sm:pl-6">
                          {format(parseISO(record.attendance_date), "EEE, MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-center text-sm text-slate-600">
                          {record.total_members}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-emerald-100 px-1.5 text-xs font-bold text-emerald-700">
                            {record.present_count}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-rose-100 px-1.5 text-xs font-bold text-rose-600">
                            {record.absent_count}
                          </span>
                        </TableCell>
                        <TableCell className="pr-5 text-center sm:pr-6">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${rateBadgeClass(
                              rate
                            )}`}
                          >
                            {rate}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Member breakdown */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-[#0F3E6B]">
            Member breakdown
          </h3>
        </div>

        {memberAttendance.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="border-slate-200/70 bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="pl-5 text-xs font-medium text-slate-500 sm:pl-6">
                      Member
                    </TableHead>
                    <TableHead className="hidden text-xs font-medium text-slate-500 sm:table-cell">
                      Phone
                    </TableHead>
                    <TableHead className="text-center text-xs font-medium text-slate-500">
                      Sessions
                    </TableHead>
                    <TableHead className="text-center text-xs font-medium text-slate-500">
                      Present
                    </TableHead>
                    <TableHead className="text-center text-xs font-medium text-slate-500">
                      Absent
                    </TableHead>
                    <TableHead className="text-center text-xs font-medium text-slate-500">
                      Rate
                    </TableHead>
                    <TableHead className="pr-5 text-center text-xs font-medium text-slate-500 sm:pr-6">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberAttendance.map((member) => (
                    <TableRow
                      key={member.member_id}
                      className="border-slate-100 hover:bg-slate-50/60"
                    >
                      <TableCell className="py-4 pl-5 font-medium text-[#0F3E6B] sm:pl-6">
                        {member.member_name}
                      </TableCell>
                      <TableCell className="hidden text-sm text-slate-500 sm:table-cell">
                        {member.phone || "—"}
                      </TableCell>
                      <TableCell className="text-center text-sm text-slate-600">
                        {member.total_sessions}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-emerald-100 px-1.5 text-xs font-bold text-emerald-700">
                          {member.present_count}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-rose-100 px-1.5 text-xs font-bold text-rose-600">
                          {member.absent_count}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold text-[#0F3E6B]">
                        {member.attendance_rate}%
                      </TableCell>
                      <TableCell className="pr-5 text-center sm:pr-6">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${rateBadgeClass(
                            member.attendance_rate
                          )}`}
                        >
                          {member.attendance_rate >= 75
                            ? "High"
                            : member.attendance_rate >= 50
                            ? "Moderate"
                            : "Follow-up"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : allMembers.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <Table className="min-w-[520px]">
                <TableHeader>
                  <TableRow className="border-slate-200/70 bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="pl-5 text-xs font-medium text-slate-500 sm:pl-6">
                      Member
                    </TableHead>
                    <TableHead className="text-xs font-medium text-slate-500">Phone</TableHead>
                    <TableHead className="pr-5 text-center text-xs font-medium text-slate-500 sm:pr-6">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allMembers.map((member) => (
                    <TableRow
                      key={member.id}
                      className="border-slate-100 hover:bg-slate-50/60"
                    >
                      <TableCell className="py-4 pl-5 font-medium text-[#0F3E6B] sm:pl-6">
                        {member.full_name}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {member.phone || "—"}
                      </TableCell>
                      <TableCell className="pr-5 text-center sm:pr-6">
                        <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#1F6FB5]">
                          Active member
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">No member records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
