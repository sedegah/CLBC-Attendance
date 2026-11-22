import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Users,
    TrendingUp,
    UserPlus,
    FileText,
    Upload,
    Calendar,
    Trash2,
    Download,
    Loader2,
    ClipboardCheck,
    AlertTriangle,
    BarChart3
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { fetchApi, API_BASE_URL } from "@/lib/apiClient";
import { Navigation } from "@/components/Navigation";
import MembersManager from "@/components/MembersManager";
import ManualAttendance from "@/components/ManualAttendance";
import AbsenteeReport from "@/components/AbsenteeReport";
import AttendanceReport from "@/components/AttendanceReport";
import * as XLSX from "xlsx";
import { format } from "date-fns";

interface AttendanceRecord {
    id: string;
    file_name: string;
    file_path: string;
    attendance_date: string;
    total_members: number;
    present_count: number;
    absent_count: number;
    notes: string | null;
    created_at: string;
}

const Dashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Determine user name for personalization — use full_name from our custom auth
    const rawName = (user as any)?.full_name || user?.email?.split('@')[0] || 'Church Administrator';
    const userName = rawName.split(' ')[0]; // Show only first name

    // Determine current day and date for the banner
    const currentDate = format(new Date(), "EEEE, MMMM dd, yyyy");

    // Fetch attendance records
    useEffect(() => {
        fetchAttendanceRecords();
    }, []);

    const fetchAttendanceRecords = async () => {
        try {
            const data = await fetchApi("/attendance");
            setAttendanceRecords(data || []);
        } catch (error: any) {
            console.error("Error fetching attendance:", error);
            toast({
                title: "Error",
                description: "Failed to load attendance records.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isSupportedFile = (file: File) => {
        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv"
        ];

        return validTypes.includes(file.type) ||
            file.name.endsWith(".xlsx") ||
            file.name.endsWith(".xls") ||
            file.name.endsWith(".csv");
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (!isSupportedFile(file)) {
            toast({
                title: "Invalid file",
                description: "Please upload an Excel file (.xlsx, .xls) or CSV file.",
                variant: "destructive",
            });
            event.target.value = "";
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
    };

    const handleProcessAttendance = async () => {
        if (!selectedFile || !user) return;

        setIsUploading(true);

        try {
            // Read and parse the Excel file
            const arrayBuffer = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            // Calculate attendance stats from the data
            const totalMembers = jsonData.length;
            let presentCount = 0;
            let absentCount = 0;

            jsonData.forEach((row: any) => {
                const status = String(row.Status || row.status || row.Present || row.present || row.Attendance || row.attendance || "").toLowerCase();
                if (status === "present" || status === "p" || status === "yes" || status === "1" || status === "true") {
                    presentCount++;
                } else {
                    absentCount++;
                }
            });

            // Upload file & save attendance record via Worker API
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('attendance_date', attendanceDate);
            formData.append('total_members', String(totalMembers));
            formData.append('present_count', String(presentCount));
            formData.append('absent_count', String(absentCount));

            await fetchApi("/attendance", {
                method: 'POST',
                body: formData,
            });

            toast({
                title: "Upload successful",
                description: `Processed ${totalMembers} members: ${presentCount} present, ${absentCount} absent.`,
            });

            // Refresh the list
            fetchAttendanceRecords();

            // Reset file input
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            toast({
                title: "Upload failed",
                description: error.message || "Failed to upload attendance file.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (record: AttendanceRecord) => {
        try {
            await fetchApi(`/attendance/${record.id}`, { method: "DELETE" });

            toast({
                title: "Record deleted",
                description: `Attendance record for ${record.attendance_date} has been deleted.`,
            });

            fetchAttendanceRecords();
        } catch (error: any) {
            console.error("Delete error:", error);
            toast({
                title: "Delete failed",
                description: error.message || "Failed to delete record.",
                variant: "destructive",
            });
        }
    };

    const handleDownload = async (record: AttendanceRecord) => {
        try {
            const token = localStorage.getItem('token');
            // If uploaded file exists in R2, download original file
            if (record.file_path && record.file_name) {
                const url = `${API_BASE_URL}/attendance/download/${record.id}`;
                const response = await fetch(url, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = objectUrl;
                    a.download = record.file_name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(objectUrl);
                    toast({
                        title: "Downloaded",
                        description: `Downloaded ${record.file_name}`,
                    });
                    return;
                }
            }

            // Fallback for manual attendance entries: Generate XLSX spreadsheet
            let memberRows: any[] = [];
            try {
                const details = await fetchApi('/attendance/details');
                const members = await fetchApi('/members');
                if (Array.isArray(details) && Array.isArray(members)) {
                    const sessionDetails = details.filter((d: any) => d.attendance_record_id === record.id);
                    if (sessionDetails.length > 0) {
                        memberRows = members.map((m: any) => {
                            const found = sessionDetails.find((d: any) => d.member_id === m.id);
                            return {
                                "Member Name": m.full_name,
                                "Phone": m.phone || "—",
                                "Email": m.email || "—",
                                "Status": found ? (found.is_present ? "Present" : "Absent") : "Present"
                            };
                        });
                    }
                }
            } catch (e) {
                console.warn("Could not fetch individual member details for sheet:", e);
            }

            const dataToExport = memberRows.length > 0 ? memberRows : [
                {
                    "Session Date": record.attendance_date,
                    "Total Expected": record.total_members,
                    "Present Count": record.present_count,
                    "Absent Count": record.absent_count,
                    "Attendance Rate": `${record.total_members > 0 ? Math.round((record.present_count / record.total_members) * 100) : 0}%`,
                    "Notes": record.notes || "Manual Attendance Record"
                }
            ];

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Attendance");
            const fileName = `CLBC_Attendance_${record.attendance_date || "record"}.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast({
                title: "Downloaded",
                description: `Exported attendance sheet as ${fileName}`,
            });
        } catch (error: any) {
            console.error("Download error:", error);
            toast({
                title: "Download failed",
                description: error.message || "Failed to download file.",
                variant: "destructive",
            });
        }
    };

    // Calculate stats from real data
    const totalRecords = attendanceRecords.length;
    const totalMembersTracked = attendanceRecords.reduce((sum, r) => sum + r.total_members, 0);
    const totalPresent = attendanceRecords.reduce((sum, r) => sum + r.present_count, 0);
    const avgAttendanceRate = totalMembersTracked > 0
        ? Math.round((totalPresent / totalMembersTracked) * 100)
        : 0;

    const memberStats = [
        {
            title: "Total Records",
            value: totalRecords.toString(),
            icon: FileText,
            iconClass: "bg-blue-50 text-blue-600",
            glowClass: "bg-blue-50/70",
        },
        {
            title: "Members Tracked",
            value: totalMembersTracked.toString(),
            icon: Users,
            iconClass: "bg-sky-50 text-sky-600",
            glowClass: "bg-sky-50/70",
        },
        {
            title: "Total Present",
            value: totalPresent.toString(),
            icon: UserPlus,
            iconClass: "bg-emerald-50 text-emerald-600",
            glowClass: "bg-emerald-50/70",
        },
        {
            title: "Avg. Attendance Rate",
            value: `${avgAttendanceRate}%`,
            icon: TrendingUp,
            iconClass: "bg-amber-50 text-amber-500",
            glowClass: "bg-amber-50/70",
        },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navigation variant="dashboard" />

            <main
                className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(15, 62, 107, 0.06) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            >
                <div className="space-y-6 sm:space-y-8">
                    {/* Welcome banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B2D4F] via-[#0F3E6B] to-[#1B4F82] px-6 py-8 text-white shadow-[0_20px_50px_rgba(15,62,107,0.25)] sm:rounded-3xl sm:px-10 sm:py-10">
                        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-[#388CD4]/10 blur-3xl" />

                        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                    Welcome back, {userName}!
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm font-medium text-white/75 sm:text-base lg:text-lg">
                                    Dashboard Overview for C.L.B.C Management System
                                </p>
                            </div>

                            <div className="flex-shrink-0 md:text-right">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                                    Today is
                                </p>
                                <div className="mt-1.5 flex items-center gap-2 md:justify-end">
                                    <Calendar className="h-5 w-5 text-white/70" />
                                    <span className="text-lg font-semibold sm:text-xl lg:text-2xl">
                                        {currentDate}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="attendance" className="space-y-6">
                        <TabsList className="mx-auto flex h-auto w-full flex-wrap items-center justify-center gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1.5 shadow-sm sm:gap-1.5">
                            <TabsTrigger value="attendance" className="gap-1.5 rounded-xl border border-transparent px-2.5 py-2 text-xs font-semibold text-slate-600 transition-all data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-[#0F3E6B] data-[state=active]:shadow-sm sm:gap-2 sm:px-4 sm:text-sm">
                                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden xs:inline">Attendance</span>
                                <span className="xs:hidden">Upload</span>
                            </TabsTrigger>
                            <TabsTrigger value="manual" className="gap-1.5 rounded-xl border border-transparent px-2.5 py-2 text-xs font-semibold text-slate-600 transition-all data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-[#0F3E6B] data-[state=active]:shadow-sm sm:gap-2 sm:px-4 sm:text-sm">
                                <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden xs:inline">Manual Entry</span>
                                <span className="xs:hidden">Manual</span>
                            </TabsTrigger>
                            <TabsTrigger value="followup" className="gap-1.5 rounded-xl border border-transparent px-2.5 py-2 text-xs font-semibold text-slate-600 transition-all data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-[#0F3E6B] data-[state=active]:shadow-sm sm:gap-2 sm:px-4 sm:text-sm">
                                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Absentee Follow-Up</span>
                                <span className="sm:hidden">Follow-Up</span>
                            </TabsTrigger>
                            <TabsTrigger value="members" className="gap-1.5 rounded-xl border border-transparent px-2.5 py-2 text-xs font-semibold text-slate-600 transition-all data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-[#0F3E6B] data-[state=active]:shadow-sm sm:gap-2 sm:px-4 sm:text-sm">
                                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span>Members</span>
                            </TabsTrigger>
                            <TabsTrigger value="reports" className="gap-1.5 rounded-xl border border-transparent px-2.5 py-2 text-xs font-semibold text-slate-600 transition-all data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-[#0F3E6B] data-[state=active]:shadow-sm sm:gap-2 sm:px-4 sm:text-sm">
                                <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Reports</span>
                                <span className="sm:hidden">Report</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="attendance" className="mt-0 space-y-6 sm:space-y-8">
                            {/* Stats grid */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                                {memberStats.map((stat) => (
                                    <div
                                        key={stat.title}
                                        className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_2px_12px_rgba(15,62,107,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,62,107,0.08)] sm:p-5 lg:p-6"
                                    >
                                        <div className={`pointer-events-none absolute -right-7 -top-7 h-24 w-24 rounded-full ${stat.glowClass} transition-transform duration-500 group-hover:scale-110`} />

                                        <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconClass} sm:h-12 sm:w-12`}>
                                            <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>

                                        <div className="relative mt-4 sm:mt-5">
                                            <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                                                {stat.value}
                                            </p>
                                            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                                                {stat.title}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Upload + history */}
                            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                                <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_2px_12px_rgba(15,62,107,0.04)] sm:p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1F6FB5]">
                                            <Upload className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">Upload Attendance</h2>
                                            <p className="text-xs text-slate-500 sm:text-sm">Process Excel or CSV files</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="attendanceDate" className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                                Select Date
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="attendanceDate"
                                                    type="date"
                                                    value={attendanceDate}
                                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                                    className="h-11 rounded-lg border-slate-200 bg-slate-50/70 pr-10 text-sm focus-visible:ring-[#1F6FB5]"
                                                />
                                                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="file" className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                                Attendance File
                                            </Label>
                                            <Input
                                                ref={fileInputRef}
                                                id="file"
                                                type="file"
                                                accept=".xlsx,.xls,.csv"
                                                onChange={handleFileSelect}
                                                disabled={isUploading}
                                                className="h-11 cursor-pointer rounded-lg border-slate-200 bg-slate-50/70 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-[#0F3E6B] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#164C80] sm:text-sm"
                                            />
                                        </div>

                                        {isUploading && (
                                            <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-[#1F6FB5]">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Processing file... Please wait.</span>
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleProcessAttendance}
                                            disabled={!selectedFile || isUploading}
                                            className="w-full rounded-lg bg-[#C62828] py-2.5 text-sm font-semibold text-white hover:bg-[#B71C1C] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isUploading ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Processing...
                                                </span>
                                            ) : (
                                                "Process attendance"
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_2px_12px_rgba(15,62,107,0.04)] lg:col-span-2">
                                    <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
                                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1F6FB5]">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">Attendance History</h2>
                                            <p className="text-xs text-slate-500 sm:text-sm">
                                                {attendanceRecords.length} recent records
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-5 sm:p-6">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center py-16">
                                                <Loader2 className="h-10 w-10 animate-spin text-[#1F6FB5]" />
                                            </div>
                                        ) : attendanceRecords.length === 0 ? (
                                            <div className="px-4 py-16 text-center">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                                                    <FileText className="h-8 w-8 text-slate-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-slate-900">No Attendance Records</h3>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Upload your first attendance file using the section on the left to start tracking history.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="-mx-5 overflow-x-auto sm:-mx-6">
                                                <div className="min-w-[640px] px-5 sm:px-6">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow className="border-slate-200/70 bg-slate-50/80 hover:bg-slate-50/80">
                                                                <TableHead className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Date</TableHead>
                                                                <TableHead className="hidden text-[11px] font-bold uppercase tracking-wide text-slate-500 md:table-cell">File Name</TableHead>
                                                                <TableHead className="text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">Present</TableHead>
                                                                <TableHead className="text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">Absent</TableHead>
                                                                <TableHead className="text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">Rate</TableHead>
                                                                <TableHead className="text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {attendanceRecords.slice(0, 8).map((record) => (
                                                                <TableRow key={record.id} className="border-slate-100 hover:bg-slate-50/60">
                                                                    <TableCell className="py-4">
                                                                        <div className="text-sm font-semibold text-slate-900">
                                                                            {format(new Date(record.attendance_date), "MMM dd, yyyy")}
                                                                        </div>
                                                                        <div className="text-xs text-slate-400">
                                                                            {format(new Date(record.created_at), "HH:mm")}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="hidden md:table-cell">
                                                                        <span className="block max-w-[180px] truncate text-sm text-slate-500">
                                                                            {record.file_name || "Manual Attendance"}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        <span className="inline-flex h-7 min-w-[2.5rem] items-center justify-center rounded-full bg-emerald-50 px-2.5 text-sm font-bold text-emerald-600">
                                                                            {record.present_count}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        <span className="inline-flex h-7 min-w-[2.5rem] items-center justify-center rounded-full bg-rose-50 px-2.5 text-sm font-bold text-rose-600">
                                                                            {record.absent_count}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        <span className={`text-sm font-bold ${record.total_members > 0 && (record.present_count / record.total_members) * 100 > 75 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                                                            {record.total_members > 0
                                                                                ? Math.round((record.present_count / record.total_members) * 100)
                                                                                : 0}%
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className="flex items-center justify-end gap-1">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 rounded-lg text-[#1F6FB5] hover:bg-blue-50 hover:text-[#0F3E6B]"
                                                                                onClick={() => handleDownload(record)}
                                                                                title="Download file"
                                                                            >
                                                                                <Download className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                                                                onClick={() => handleDelete(record)}
                                                                                title="Delete record"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="manual" className="mt-0">
                            <ManualAttendance onAttendanceSaved={fetchAttendanceRecords} />
                        </TabsContent>

                        <TabsContent value="followup" className="mt-0">
                            <AbsenteeReport />
                        </TabsContent>

                        <TabsContent value="members" className="mt-0">
                            <MembersManager />
                        </TabsContent>

                        <TabsContent value="reports" className="mt-0">
                            <AttendanceReport />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
