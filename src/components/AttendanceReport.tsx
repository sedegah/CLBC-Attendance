import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  FileDown,
  Printer,
  Calendar,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Award,
  AlertTriangle,
  CheckCircle2,
  Download
} from "lucide-react";
import {
  LineChart,
  Line,
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
  const printRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [dateRange, setDateRange] = useState<"all" | "month" | "custom">("month");
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [memberAttendance, setMemberAttendance] = useState<MemberAttendance[]>([]);
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
      const recordIds = (records || []).map((r: any) => r.id);

      let memberStats: MemberAttendance[] = [];

      if (recordIds.length > 0) {
        const attendance = await fetchApi("/attendance/details");

        memberStats = (members || []).map((member: any) => {
          const memberRecords = (attendance || []).filter((a: any) => a.member_id === member.id && recordIds.includes(a.attendance_record_id));
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

      setMemberAttendance(memberStats);

      const totalSessions = records?.length || 0;
      const totalPresentTally = records?.reduce((sum, r) => sum + (r.present_count || 0), 0) || 0;
      const totalAbsentTally = records?.reduce((sum, r) => sum + (r.absent_count || 0), 0) || 0;
      const totalTracked = records?.reduce((sum, r) => sum + (r.total_members || 0), 0) || 0;
      const avgAttendance = totalTracked > 0 ? Math.round((totalPresentTally / totalTracked) * 100) : 0;

      const attendanceRates = records?.map(r =>
        r.total_members > 0 ? Math.round((r.present_count / r.total_members) * 100) : 0
      ) || [];

      const regularCount = memberStats.filter(m => m.attendance_rate >= 75).length;
      const moderateCount = memberStats.filter(m => m.attendance_rate >= 50 && m.attendance_rate < 75).length;
      const atRiskCount = memberStats.filter(m => m.attendance_rate < 50).length;

      setSummary({
        totalSessions,
        totalMembers: memberStats.length,
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
      description: "Compiling high-resolution report...",
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

      // 1. Decorative Header Bar
      doc.setFillColor(30, 58, 138); // Primary deep blue #1E3A8A
      doc.rect(0, 0, pageWidth, 6, "F");

      // Load logo if available
      try {
        const logoData = await getBase64Image(clbcLogo);
        if (logoData) {
          doc.addImage(logoData, "PNG", margin, currentY + 2, 20, 20);
        }
      } catch (e) {
        console.warn("Logo could not be rendered in PDF:", e);
      }

      // Title & Subtitles
      const textStartX = margin + 24;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text("CHANGED LIFE BAPTIST CHURCH", textStartX, currentY + 7);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.text("OFFICIAL ATTENDANCE & MINISTRY REPORT", textStartX, currentY + 13);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Reporting Period: ${getDateRangeLabel()}`, textStartX, currentY + 18);
      doc.text(`Generated on: ${format(new Date(), "MMMM dd, yyyy 'at' hh:mm a")}`, textStartX, currentY + 23);

      currentY += 28;

      // Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 6;

      // 2. Executive KPI Cards
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Executive Summary", margin, currentY);
      currentY += 4;

      const cardWidth = (pageWidth - margin * 2 - 12) / 4;
      const cardHeight = 18;

      const kpis = [
        { label: "Total Sessions", value: `${summary.totalSessions}`, color: [30, 58, 138] },
        { label: "Members Tracked", value: `${summary.totalMembers}`, color: [15, 23, 42] },
        { label: "Avg Attendance", value: `${summary.avgAttendance}%`, color: [22, 101, 52] },
        { label: "Total Presences", value: `${summary.totalPresentTally}`, color: [37, 99, 235] },
      ];

      kpis.forEach((kpi, idx) => {
        const x = margin + idx * (cardWidth + 4);
        // Card background
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, "FD");

        // KPI Value
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
        doc.text(kpi.value, x + cardWidth / 2, currentY + 7.5, { align: "center" });

        // KPI Label
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label, x + cardWidth / 2, currentY + 13.5, { align: "center" });
      });

      currentY += cardHeight + 6;

      // Category Summary Pill Bar
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 10, 1.5, 1.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("Member Engagement Levels:", margin + 4, currentY + 6.5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(22, 101, 52);
      doc.text(`High (≥75%): ${summary.regularCount}`, margin + 50, currentY + 6.5);

      doc.setTextColor(180, 83, 9);
      doc.text(`Moderate (50-74%): ${summary.moderateCount}`, margin + 90, currentY + 6.5);

      doc.setTextColor(185, 28, 28);
      doc.text(`Needs Follow-up (<50%): ${summary.atRiskCount}`, margin + 135, currentY + 6.5);

      currentY += 15;

      // 3. Service / Session Breakdown Table
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
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
        head: [["#", "Session Date", "Total Tracked", "Present", "Absent", "Attendance Rate"]],
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
          1: { cellWidth: 55, halign: "left" },
          2: { cellWidth: 28, halign: "center" },
          3: { cellWidth: 28, halign: "center", textColor: [22, 101, 52] },
          4: { cellWidth: 28, halign: "center", textColor: [220, 38, 38] },
          5: { cellWidth: 33, halign: "center", fontStyle: "bold" },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;

      // 4. Member Attendance Breakdown Table
      // Check if we need a new page for member details
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = margin + 6;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("2. Individual Member Attendance Breakdown", margin, currentY);
      currentY += 3;

      const memberRows = memberAttendance.map((m, i) => {
        let status = "Needs Follow-up";
        if (m.attendance_rate >= 75) status = "Excellent (≥75%)";
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
      });

      autoTable(doc, {
        startY: currentY,
        head: [["#", "Member Name", "Phone", "Sessions", "Present", "Absent", "Rate", "Status"]],
        body: memberRows.length > 0 ? memberRows : [["—", "No member records found", "—", "—", "—", "—", "—", "—"]],
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
            if (val.includes("Excellent")) {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fontStyle = "bold";
            } else if (val.includes("Moderate")) {
              data.cell.styles.textColor = [180, 83, 9];
            } else {
              data.cell.styles.textColor = [220, 38, 38];
            }
          }
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;

      // 5. Sign-off / Verification Block
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = margin + 10;
      }

      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 24, 2, 2, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);

      const col1 = margin + 8;
      const col2 = margin + (pageWidth - margin * 2) / 2 + 8;

      doc.text("Prepared By: ___________________________", col1, currentY + 8);
      doc.text("Date: ___________________________", col1, currentY + 17);

      doc.text("Pastor / Lead Signature: ___________________________", col2, currentY + 8);
      doc.text("Official Stamp: ___________________________", col2, currentY + 17);

      // Add Page Numbers and Footer to all pages
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

      // Save PDF file
      const fileName = `CLBC_Attendance_Report_${selectedMonth || "Export"}_${format(new Date(), "yyyyMMdd")}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF Export Complete",
        description: `Downloaded ${fileName}`,
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
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* High-Quality Print Styles */}
      <style>
        {`
          @media print {
            body {
              background: white !important;
              color: black !important;
              font-family: Arial, sans-serif !important;
            }
            body * {
              visibility: hidden;
            }
            .print-container, .print-container * {
              visibility: visible;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              margin: 0;
              background: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
            .print-header {
              border-bottom: 2px solid #1e3a8a;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .print-container table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 20px;
            }
            .print-container th, .print-container td {
              border: 1px solid #cbd5e1;
              padding: 6px 10px;
              font-size: 11px;
            }
            .print-container th {
              background-color: #f1f5f9 !important;
              font-weight: bold;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-break {
              page-break-before: auto;
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      <Card className="border-border/40 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Attendance Reports & Analytics
              </CardTitle>
              <CardDescription className="mt-1">
                Official ministry statistics, session trends, and member attendance records
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap no-print">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="gap-2 border-primary/20 hover:bg-primary/5"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                onClick={exportProfessionalPdf}
                disabled={isExportingPdf}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                {isExportingPdf ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download Official PDF
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Date Range Filters - Hidden on print */}
          <div className="no-print flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-xl border border-border/40 items-end">
            <div className="space-y-2 flex-1 sm:flex-none">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Filter Mode</Label>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                <SelectTrigger className="w-full sm:w-40 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">By Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "month" && (
              <div className="space-y-2 flex-1 sm:flex-none">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Select Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full sm:w-48 bg-background">
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
                <div className="space-y-2 flex-1 sm:flex-none">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full sm:w-44 bg-background"
                  />
                </div>
                <div className="space-y-2 flex-1 sm:flex-none">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full sm:w-44 bg-background"
                  />
                </div>
              </>
            )}

            <div className="text-xs text-muted-foreground pb-2 ml-auto hidden md:block">
              Showing: <span className="font-semibold text-foreground">{getDateRangeLabel()}</span>
            </div>
          </div>

          {/* Printable & Interactive Content */}
          <div ref={printRef} className="print-container space-y-8">
            {/* Report Header - For Print Mode */}
            <div className="hidden print:block print-header">
              <div className="flex items-center gap-4 mb-2">
                <img src={clbcLogo} alt="CLBC Logo" className="h-14 w-14 object-contain" />
                <div>
                  <h1 className="text-xl font-bold text-blue-900 tracking-tight">CHANGED LIFE BAPTIST CHURCH</h1>
                  <p className="text-sm font-semibold text-gray-700">Official Attendance & Ministry Report</p>
                  <p className="text-xs text-gray-500">Period: {getDateRangeLabel()} | Generated: {format(new Date(), "MMMM dd, yyyy")}</p>
                </div>
              </div>
            </div>

            {/* Summary Statistics Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Key Metrics Summary
                </h3>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {summary.totalSessions} Sessions Recorded
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3 sm:p-4 text-center">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-primary mb-1.5" />
                  <p className="text-2xl font-bold text-primary">{summary.totalSessions}</p>
                  <p className="text-xs text-muted-foreground">Total Sessions</p>
                </div>
                <div className="bg-slate-500/5 dark:bg-slate-500/10 border border-slate-500/20 rounded-xl p-3 sm:p-4 text-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-foreground mb-1.5" />
                  <p className="text-2xl font-bold text-foreground">{summary.totalMembers}</p>
                  <p className="text-xs text-muted-foreground">Members Tracked</p>
                </div>
                <div className="bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 rounded-xl p-3 sm:p-4 text-center">
                  <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-green-600 dark:text-green-400 mb-1.5" />
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.avgAttendance}%</p>
                  <p className="text-xs text-muted-foreground">Avg Attendance Rate</p>
                </div>
                <div className="bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 sm:p-4 text-center">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-blue-600 dark:text-blue-400 mb-1.5" />
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.highestAttendance}%</p>
                  <p className="text-xs text-muted-foreground">Peak Attendance</p>
                </div>
                <div className="bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 rounded-xl p-3 sm:p-4 text-center col-span-2 md:col-span-1">
                  <UserX className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-amber-600 dark:text-amber-400 mb-1.5" />
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.lowestAttendance}%</p>
                  <p className="text-xs text-muted-foreground">Lowest Attendance</p>
                </div>
              </div>

              {/* Member Engagement Breakdown Bar */}
              <div className="mt-4 p-3 bg-muted/40 rounded-xl border border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-muted-foreground">Engagement Breakdown:</span>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    High (≥75%): {summary.regularCount} members
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Moderate (50-74%): {summary.moderateCount} members
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Follow-up Needed (&lt;50%): {summary.atRiskCount} members
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Charts Section (Screen View) */}
            {attendanceRecords.length > 0 && (
              <div className="space-y-6 no-print">
                {/* Attendance Trend Chart */}
                <div className="bg-card rounded-xl p-4 sm:p-6 border border-border/40 shadow-sm">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-primary" />
                    Attendance Rate Timeline
                  </h3>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={attendanceRecords.map((r) => ({
                          date: format(parseISO(r.attendance_date), "MMM dd"),
                          fullDate: format(parseISO(r.attendance_date), "MMM dd, yyyy"),
                          rate: r.total_members > 0 ? Math.round((r.present_count / r.total_members) * 100) : 0,
                          present: r.present_count,
                          absent: r.absent_count,
                        }))}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          className="text-muted-foreground"
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          className="text-muted-foreground"
                          tickLine={false}
                          domain={[0, 100]}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                          labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                          formatter={(value: number) => [`${value}%`, "Attendance Rate"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="rate"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorRate)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Present vs Absent Bar Chart & Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-4 sm:p-6 border border-border/40 shadow-sm">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Present vs Absent by Session
                    </h3>
                    <div className="h-64 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={attendanceRecords.map((r) => ({
                            date: format(parseISO(r.attendance_date), "MMM dd"),
                            present: r.present_count,
                            absent: r.absent_count,
                          }))}
                          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10 }}
                            className="text-muted-foreground"
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            className="text-muted-foreground"
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: "12px" }} />
                          <Bar dataKey="present" name="Present" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="absent" name="Absent" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl p-4 sm:p-6 border border-border/40 shadow-sm">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-primary" />
                      Overall Attendance Distribution
                    </h3>
                    <div className="h-64 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Present",
                                value: summary.totalPresentTally,
                                color: "hsl(142, 76%, 36%)",
                              },
                              {
                                name: "Absent",
                                value: summary.totalAbsentTally,
                                color: "hsl(0, 84%, 60%)",
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                          >
                            <Cell fill="hsl(142, 76%, 36%)" />
                            <Cell fill="hsl(0, 84%, 60%)" />
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                            formatter={(value: number, name: string) => [value, name]}
                          />
                          <Legend wrapperStyle={{ fontSize: "12px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Session Breakdown */}
            <div className="print-break">
              <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Service Sessions Breakdown
              </h3>
              {attendanceRecords.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No attendance records found for this period.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/40">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Session Date</TableHead>
                        <TableHead className="text-center">Total Tracked</TableHead>
                        <TableHead className="text-center">Present</TableHead>
                        <TableHead className="text-center">Absent</TableHead>
                        <TableHead className="text-center">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map((record, idx) => {
                        const rate =
                          record.total_members > 0
                            ? Math.round((record.present_count / record.total_members) * 100)
                            : 0;
                        return (
                          <TableRow key={record.id}>
                            <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                            <TableCell className="font-medium">
                              {format(parseISO(record.attendance_date), "EEE, MMM dd, yyyy")}
                            </TableCell>
                            <TableCell className="text-center font-medium">{record.total_members}</TableCell>
                            <TableCell className="text-center text-green-600 dark:text-green-400 font-semibold">
                              {record.present_count}
                            </TableCell>
                            <TableCell className="text-center text-red-600 dark:text-red-400 font-semibold">
                              {record.absent_count}
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  rate >= 75
                                    ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                    : rate >= 50
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                }`}
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
              )}
            </div>

            {/* Member Attendance Details */}
            <div className="print-break">
              <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Member Attendance Breakdown
              </h3>
              {memberAttendance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No member attendance data found for this period.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/40">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Member Name</TableHead>
                        <TableHead className="hidden sm:table-cell">Phone</TableHead>
                        <TableHead className="text-center">Sessions</TableHead>
                        <TableHead className="text-center">Present</TableHead>
                        <TableHead className="text-center">Absent</TableHead>
                        <TableHead className="text-center">Rate</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {memberAttendance.map((member, index) => (
                        <TableRow key={member.member_id}>
                          <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="font-medium">{member.member_name}</TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {member.phone || "—"}
                          </TableCell>
                          <TableCell className="text-center font-medium">{member.total_sessions}</TableCell>
                          <TableCell className="text-center text-green-600 dark:text-green-400 font-semibold">
                            {member.present_count}
                          </TableCell>
                          <TableCell className="text-center text-red-600 dark:text-red-400 font-semibold">
                            {member.absent_count}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-bold text-foreground">{member.attendance_rate}%</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                member.attendance_rate >= 75
                                  ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                  : member.attendance_rate >= 50
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                              }`}
                            >
                              {member.attendance_rate >= 75
                                ? "Excellent"
                                : member.attendance_rate >= 50
                                ? "Moderate"
                                : "Needs Follow-up"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Footer - For Print */}
            <div className="hidden print:block text-center mt-12 pt-6 border-t border-gray-300 text-xs text-gray-500">
              <div className="flex justify-between items-center mb-4 text-left">
                <div>
                  <p>Prepared By: ________________________________</p>
                  <p className="mt-1">Date: ________________________________</p>
                </div>
                <div>
                  <p>Pastor / Ministry Lead: ________________________________</p>
                  <p className="mt-1">Signature & Stamp: ________________________________</p>
                </div>
              </div>
              <p>Changed Life Baptist Church (C.L.B.C) — Confidential Ministry Attendance Record</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
