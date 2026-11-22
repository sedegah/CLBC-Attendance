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
    FileText,
    UploadCloud,
    Calendar,
    Trash2,
    Download,
    Loader2,
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
        if (!selectedFile) {
            toast({
                title: "No file selected",
                description: "Please choose an Excel or CSV file first.",
                variant: "destructive",
            });
            return;
        }

        if (!user) return;

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
            label: "Total records",
            value: totalRecords.toString(),
            isRate: false,
        },
        {
            label: "Members tracked",
            value: totalMembersTracked.toString(),
            isRate: false,
        },
        {
            label: "Total present",
            value: totalPresent.toString(),
            isRate: false,
        },
        {
            label: "Average attendance rate",
            value: `${avgAttendanceRate}%`,
            isRate: true,
        },
    ];

    return (
        <div className="min-h-screen bg-[#F4F7FB]">
            <Navigation variant="dashboard" />

            <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
                {/* Welcome */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0F3E6B] sm:text-4xl">
                            Welcome back, {userName}
                        </h1>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Dashboard overview for the C.L.B.C management system
                        </p>
                    </div>
                    <p className="text-sm font-medium text-[#0F3E6B] sm:pt-1.5 sm:text-right">
                        {currentDate}
                    </p>
                </div>

                <Tabs defaultValue="attendance" className="mt-7">
                    <TabsList className="flex h-auto w-full flex-wrap items-center justify-start gap-x-5 gap-y-2 rounded-none border-b border-slate-200 bg-transparent p-0 sm:gap-x-7">
                        <TabsTrigger value="attendance" className="-mb-px rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-[13px] font-medium text-slate-500 shadow-none transition-colors hover:text-[#0F3E6B] data-[state=active]:border-[#C62828] data-[state=active]:bg-transparent data-[state=active]:text-[#C62828] data-[state=active]:shadow-none sm:text-sm">
                            Attendance
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="-mb-px rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-[13px] font-medium text-slate-500 shadow-none transition-colors hover:text-[#0F3E6B] data-[state=active]:border-[#C62828] data-[state=active]:bg-transparent data-[state=active]:text-[#C62828] data-[state=active]:shadow-none sm:text-sm">
                            Manual entry
                        </TabsTrigger>
                        <TabsTrigger value="followup" className="-mb-px rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-[13px] font-medium text-slate-500 shadow-none transition-colors hover:text-[#0F3E6B] data-[state=active]:border-[#C62828] data-[state=active]:bg-transparent data-[state=active]:text-[#C62828] data-[state=active]:shadow-none sm:text-sm">
                            Absentee follow-up
                        </TabsTrigger>
                        <TabsTrigger value="members" className="-mb-px rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-[13px] font-medium text-slate-500 shadow-none transition-colors hover:text-[#0F3E6B] data-[state=active]:border-[#C62828] data-[state=active]:bg-transparent data-[state=active]:text-[#C62828] data-[state=active]:shadow-none sm:text-sm">
                            Members
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="-mb-px rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-[13px] font-medium text-slate-500 shadow-none transition-colors hover:text-[#0F3E6B] data-[state=active]:border-[#C62828] data-[state=active]:bg-transparent data-[state=active]:text-[#C62828] data-[state=active]:shadow-none sm:text-sm">
                            Reports
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="attendance" className="mt-6 space-y-5">
                        {/* Stats */}
                        <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-slate-200/80 shadow-sm">
                            <div className="grid grid-cols-2 gap-px lg:grid-cols-4">
                                {memberStats.map((stat) => (
                                    <div key={stat.label} className="bg-white p-5 sm:p-6">
                                        <p className="text-xs font-medium text-slate-500 sm:text-sm">
                                            {stat.label}
                                        </p>
                                        <p
                                            className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${
                                                stat.isRate ? "text-[#C62828]" : "text-[#0F3E6B]"
                                            }`}
                                        >
                                            {stat.value}
                                        </p>
                                        {stat.isRate && (
                                            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                                                <div
                                                    className="h-full rounded-full bg-[#C62828]"
                                                    style={{ width: `${avgAttendanceRate}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-5">
                            {/* Upload attendance */}
                            <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
                                <h2 className="font-serif text-xl font-bold text-[#0F3E6B]">
                                    Upload attendance
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Process an Excel or CSV file.
                                </p>

                                <div className="mt-5 space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="attendanceDate"
                                            className="text-xs font-semibold text-[#0F3E6B]"
                                        >
                                            Service date
                                        </Label>
                                        <div className="relative mt-1.5">
                                            <Input
                                                id="attendanceDate"
                                                type="date"
                                                value={attendanceDate}
                                                onChange={(e) => setAttendanceDate(e.target.value)}
                                                className="h-10 rounded-lg border-slate-200 bg-white pr-10 text-sm focus-visible:ring-[#1F6FB5]"
                                            />
                                            <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="file"
                                            className="text-xs font-semibold text-[#0F3E6B]"
                                        >
                                            Attendance file
                                        </Label>
                                        <div className="mt-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50/40 px-4 py-6 text-center">
                                            <UploadCloud className="mx-auto h-7 w-7 text-[#C62828]" />
                                            <p className="mt-2 truncate text-xs text-slate-500">
                                                {selectedFile ? selectedFile.name : "No file chosen"}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="mt-3 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-1.5 text-xs font-semibold text-[#0F3E6B] shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Choose file
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                id="file"
                                                type="file"
                                                accept=".xlsx,.xls,.csv"
                                                onChange={handleFileSelect}
                                                disabled={isUploading}
                                                className="sr-only"
                                            />
                                        </div>
                                    </div>

                                    {isUploading && (
                                        <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-[#1F6FB5]">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Processing file... Please wait.</span>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleProcessAttendance}
                                        disabled={isUploading}
                                        className="w-full rounded-lg bg-[#C62828] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#B71C1C] disabled:cursor-not-allowed disabled:opacity-60"
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

                            {/* Attendance history */}
                            <div className="rounded-lg border border-slate-200/80 bg-white shadow-sm lg:col-span-3">
                                <div className="p-5 pb-0 sm:p-6 sm:pb-0">
                                    <h2 className="font-serif text-xl font-bold text-[#0F3E6B]">
                                        Attendance history
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {attendanceRecords.length} recent{" "}
                                        {attendanceRecords.length === 1 ? "record" : "records"}
                                    </p>
                                </div>

                                {isLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="h-8 w-8 animate-spin text-[#1F6FB5]" />
                                    </div>
                                ) : attendanceRecords.length === 0 ? (
                                    <div className="px-4 py-14 text-center">
                                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                            <FileText className="h-7 w-7 text-slate-400" />
                                        </div>
                                        <h3 className="text-base font-semibold text-slate-900">
                                            No attendance records
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Upload your first attendance file to start tracking history.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-5 overflow-x-auto">
                                        <Table className="min-w-[560px]">
                                            <TableHeader>
                                                <TableRow className="border-slate-200/70 bg-slate-50/80 hover:bg-slate-50/80">
                                                    <TableHead className="pl-5 text-xs font-medium text-slate-500 sm:pl-6">
                                                        Date
                                                    </TableHead>
                                                    <TableHead className="text-xs font-medium text-slate-500">
                                                        File
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
                                                    <TableHead className="pr-5 text-right text-xs font-medium text-slate-500 sm:pr-6">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {attendanceRecords.slice(0, 8).map((record) => {
                                                    const rate =
                                                        record.total_members > 0
                                                            ? Math.round(
                                                                  (record.present_count / record.total_members) * 100
                                                              )
                                                            : 0;

                                                    return (
                                                        <TableRow
                                                            key={record.id}
                                                            className="border-slate-100 hover:bg-slate-50/60"
                                                        >
                                                            <TableCell className="py-4 pl-5 sm:pl-6">
                                                                <div className="text-sm font-medium text-[#0F3E6B]">
                                                                    {format(
                                                                        new Date(record.attendance_date),
                                                                        "MMM dd, yyyy"
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-slate-400">
                                                                    {format(new Date(record.created_at), "HH:mm")}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="block max-w-[150px] truncate text-sm text-slate-600">
                                                                    {record.file_name || "Manual attendance"}
                                                                </span>
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
                                                            <TableCell className="text-center">
                                                                <span className="text-sm font-medium text-slate-700">
                                                                    {rate}%
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="pr-5 text-right sm:pr-6">
                                                                <div className="flex items-center justify-end gap-0.5">
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
                                                                        className="h-8 w-8 rounded-lg text-[#C62828] hover:bg-rose-50 hover:text-[#B71C1C]"
                                                                        onClick={() => handleDelete(record)}
                                                                        title="Delete record"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="manual" className="mt-6">
                        <ManualAttendance onAttendanceSaved={fetchAttendanceRecords} />
                    </TabsContent>

                    <TabsContent value="followup" className="mt-6">
                        <AbsenteeReport />
                    </TabsContent>

                    <TabsContent value="members" className="mt-6">
                        <MembersManager />
                    </TabsContent>

                    <TabsContent value="reports" className="mt-6">
                        <AttendanceReport />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );

};

export default Dashboard;
