import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    LayoutDashboard,
    LogOut,
    Loader2,
    ClipboardCheck,
    AlertTriangle,
    FileBadge2,
    Image,
    BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import clbcLogo from "@/assets/clbc-logo.png";
import MembersManager from "@/components/MembersManager";
import ManualAttendance from "@/components/ManualAttendance";
import AbsenteeReport from "@/components/AbsenteeReport";
import AttendanceReport from "@/components/AttendanceReport";
import { GalleryManager } from "@/components/GalleryManager";
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
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(format(new Date(), "yyyy-MM-dd"));

    // Determine user name for personalization
    const userName = user?.user_metadata?.full_name 
                     || user?.email?.split('@')[0] 
                     || 'Church Administrator';
    
    // Determine current day and date for the banner
    const currentDate = format(new Date(), "EEEE, MMMM dd, yyyy");

    // Fetch attendance records
    useEffect(() => {
        fetchAttendanceRecords();
    }, []);

    const fetchAttendanceRecords = async () => {
        try {
            const { data, error } = await supabase
                .from("attendance_records")
                .select("*")
                .order("attendance_date", { ascending: false });

            if (error) throw error;
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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        // Validate file type
        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv"
        ];
        if (!validTypes.includes(file.type) && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls") && !file.name.endsWith(".csv")) {
            toast({
                title: "Invalid file",
                description: "Please upload an Excel file (.xlsx, .xls) or CSV file.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);

        try {
            // Read and parse the Excel file
            const arrayBuffer = await file.arrayBuffer();
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

            // Upload file to storage
            const filePath = `${user.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from("attendance-files")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Save attendance record to database
            const { error: insertError } = await supabase
                .from("attendance_records")
                .insert({
                    user_id: user.id,
                    file_name: file.name,
                    file_path: filePath,
                    attendance_date: attendanceDate,
                    total_members: totalMembers,
                    present_count: presentCount,
                    absent_count: absentCount,
                });

            if (insertError) throw insertError;

            toast({
                title: "Upload successful",
                description: `Processed ${totalMembers} members: ${presentCount} present, ${absentCount} absent.`,
            });

            // Refresh the list
            fetchAttendanceRecords();
            
            // Reset file input
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
            // Delete from storage
            await supabase.storage
                .from("attendance-files")
                .remove([record.file_path]);

            // Delete from database
            const { error } = await supabase
                .from("attendance_records")
                .delete()
                .eq("id", record.id);

            if (error) throw error;

            toast({
                title: "Deleted",
                description: "Attendance record removed.",
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
            const { data, error } = await supabase.storage
                .from("attendance-files")
                .download(record.file_path);

            if (error) throw error;

            const url = URL.createObjectURL(data);
            const a = document.createElement("a");
            a.href = url;
            a.download = record.file_name;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error("Download error:", error);
            toast({
                title: "Download failed",
                description: "Failed to download file.",
                variant: "destructive",
            });
        }
    };

    const handleSignOut = async () => {
        await signOut();
        toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
        });
        navigate("/");
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
            color: "text-primary",
            bgColor: "bg-primary/10",
            darkBgColor: "dark:bg-primary/20",
        },
        {
            title: "Members Tracked",
            value: totalMembersTracked.toString(),
            icon: Users,
            color: "text-secondary",
            bgColor: "bg-secondary/10",
            darkBgColor: "dark:bg-secondary/20",
        },
        {
            title: "Total Present",
            value: totalPresent.toString(),
            icon: UserPlus,
            color: "text-green-600 dark:text-green-400", // Using a dedicated green for success
            bgColor: "bg-green-600/10 dark:bg-green-400/10",
            darkBgColor: "dark:bg-green-400/20",
        },
        {
            title: "Avg. Attendance Rate",
            value: `${avgAttendanceRate}%`,
            icon: TrendingUp,
            color: "text-amber-500 dark:text-amber-400", // Using a dedicated amber/accent
            bgColor: "bg-amber-500/10 dark:bg-amber-400/10",
            darkBgColor: "dark:bg-amber-400/20",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/5">
            {/* Header (No change) */}
            <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <img src={clbcLogo} alt="C.L.B.C Logo" className="h-10 w-auto" />
                            <div className="hidden sm:flex flex-col">
                                <span className="text-xl font-extrabold text-foreground leading-tight tracking-tight">C.L.B.C</span>
                                <span className="text-xs text-primary-dark/70 dark:text-muted-foreground leading-tight">Church Management</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 dark:bg-muted/70 border border-border/60">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-medium text-foreground">
                                    {userName}
                                </span>
                            </div>
                            <ThemeToggle />
                            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
                                <FileBadge2 className="h-5 w-5" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleSignOut} className="gap-2 border-transparent bg-destructive/90 hover:bg-destructive shadow-md">
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10">
                
                {/* // --- REDESIGNED WELCOME BANNER ---
                // Enhanced with personalization, time context, and cleaner design.
                */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-2xl shadow-primary/20 dark:shadow-primary/30 p-5 sm:p-8 md:p-10 text-primary-foreground">
                    <div className="absolute inset-0 bg-pattern-light opacity-5 dark:opacity-10" /> 
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            {/* Personalized Greeting */}
                            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight">
                                Welcome back, <span className="text-primary-foreground/90">{userName.split(' ')[0]}!</span>
                            </h1>
                            
                            {/* Subtitle/Description */}
                            <p className="text-primary-foreground/90 max-w-2xl text-base sm:text-lg md:text-xl font-medium">
                                Dashboard Overview for C.L.B.C Management System
                            </p>
                        </div>

                        {/* Date Context and Icon */}
                        <div className="flex-shrink-0 text-left md:text-right">
                            <p className="text-xs sm:text-sm font-light text-primary-foreground/80 uppercase tracking-widest mb-1">
                                Today is
                            </p>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground/80 hidden xs:block" />
                                <span className="text-base sm:text-xl md:text-2xl font-semibold">{currentDate}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* // --- END REDESIGNED WELCOME BANNER --- 
                */}
                
                {/* Tabs for different sections (No change) */}
                <Tabs defaultValue="attendance" className="space-y-6">
                    <TabsList className="bg-muted/50 dark:bg-muted/30 border border-border/40 rounded-lg p-1 sm:p-1.5 flex flex-wrap gap-1 h-auto">
                        <TabsTrigger value="attendance" className="gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="font-semibold hidden xs:inline">Attendance</span>
                            <span className="font-semibold xs:hidden">Upload</span>
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                            <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="font-semibold hidden xs:inline">Manual Entry</span>
                            <span className="font-semibold xs:hidden">Manual</span>
                        </TabsTrigger>
                        <TabsTrigger value="followup" className="gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="font-semibold hidden sm:inline">Absentee Follow-Up</span>
                            <span className="font-semibold sm:hidden">Follow-Up</span>
                        </TabsTrigger>
                        <TabsTrigger value="members" className="gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="font-semibold">Members</span>
                        </TabsTrigger>
                        <TabsTrigger value="gallery" className="gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                            <Image className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="font-semibold">Gallery</span>
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="font-semibold hidden sm:inline">Reports</span>
                            <span className="font-semibold sm:hidden">Report</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="attendance" className="space-y-6 sm:space-y-8 mt-0">
                        {/* Stats Grid (No change) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                            {memberStats.map((stat, index) => (
                                <Card key={index} className="group border-border/40 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/5 overflow-hidden">
                                    <CardContent className="p-3 sm:p-4 md:p-6 relative">
                                        {/* Decorative element (uses new color properties) */}
                                        <div className={`absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 ${stat.bgColor} ${stat.darkBgColor} rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />
                                        <div className="relative z-10 space-y-2 sm:space-y-4">
                                            <div className={`h-8 w-8 sm:h-10 md:h-12 sm:w-10 md:w-12 rounded-lg sm:rounded-xl ${stat.bgColor} flex items-center justify-center shadow-md`}>
                                                <stat.icon className={`h-4 w-4 sm:h-5 md:h-6 sm:w-5 md:w-6 ${stat.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">{stat.value}</p>
                                                <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5 truncate">{stat.title}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                            {/* Upload Section */}
                            <Card className="lg:col-span-1 border-border/40 border-dashed border-2 hover:border-primary/50 transition-colors duration-300 shadow-lg bg-background/80 backdrop-blur-sm">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                                            <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base sm:text-xl font-bold">Upload Attendance</CardTitle>
                                            <CardDescription className="text-xs sm:text-sm">Process Excel or CSV files</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 sm:space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="attendanceDate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Date</Label>
                                        <div className="relative">
                                            <Input
                                                id="attendanceDate"
                                                type="date"
                                                value={attendanceDate}
                                                onChange={(e) => setAttendanceDate(e.target.value)}
                                                className="bg-muted/50 dark:bg-muted/30 border-border/40 text-sm sm:text-base py-5 sm:py-6 pr-10"
                                            />
                                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="file" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attendance File</Label>
                                        <div className="relative">
                                            <Input
                                                ref={fileInputRef}
                                                id="file"
                                                type="file"
                                                accept=".xlsx,.xls,.csv"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                                className="cursor-pointer bg-muted/50 dark:bg-muted/30 border-border/40 text-xs sm:text-sm file:bg-primary file:text-primary-foreground file:border-0 file:rounded-full file:px-3 sm:file:px-4 file:py-1 sm:file:py-1.5 file:mr-2 sm:file:mr-3 file:cursor-pointer file:font-medium file:text-xs sm:file:text-sm hover:file:bg-primary/90 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    {isUploading && (
                                        <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-primary/10 text-primary text-xs sm:text-sm font-medium border border-primary/20">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Processing file... Please wait.</span>
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
                                        **File Format Tip:** Ensure your file includes a column titled "Status," "Present," or "Attendance" for correct processing.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Attendance Records Table (No change) */}
                            <Card className="lg:col-span-2 border-border/40 shadow-lg">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center shadow-sm">
                                                <Calendar className="h-5 w-5 text-secondary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-bold">Attendance History</CardTitle>
                                                <CardDescription className="text-sm">{attendanceRecords.length} recent records</CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-16">
                                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                        </div>
                                    ) : attendanceRecords.length === 0 ? (
                                        <div className="text-center py-16 px-4">
                                            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4 border border-border/40">
                                                <FileText className="h-8 w-8 text-muted-foreground/50" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-foreground mb-1">No Attendance Records</h3>
                                            <p className="text-sm text-muted-foreground">Upload your first attendance file using the section on the left to start tracking history.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto -mx-6 px-6">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-border/40 bg-muted/50 dark:bg-muted/30 hover:bg-muted/50 dark:hover:bg-muted/30">
                                                        <TableHead className="text-sm font-bold text-foreground">Date</TableHead>
                                                        <TableHead className="text-sm font-bold text-foreground hidden md:table-cell">File Name</TableHead>
                                                        <TableHead className="text-sm font-bold text-foreground text-center">Present</TableHead>
                                                        <TableHead className="text-sm font-bold text-foreground text-center">Absent</TableHead>
                                                        <TableHead className="text-sm font-bold text-foreground text-center">Rate</TableHead>
                                                        <TableHead className="text-sm font-bold text-foreground text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {attendanceRecords.slice(0, 8).map((record) => (
                                                        <TableRow key={record.id} className="border-border/40 hover:bg-muted/30 transition-colors duration-200">
                                                            <TableCell className="py-3.5">
                                                                <div className="font-semibold text-base text-foreground">
                                                                    {format(new Date(record.attendance_date), "MMM dd, yyyy")}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {format(new Date(record.created_at), "HH:mm")}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell">
                                                                <span className="text-sm text-muted-foreground truncate max-w-[150px] block font-mono">
                                                                    {record.file_name}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className="inline-flex items-center justify-center h-8 min-w-[3rem] px-3 rounded-full bg-green-600/10 text-green-600 dark:text-green-400 text-sm font-bold">
                                                                    {record.present_count}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className="inline-flex items-center justify-center h-8 min-w-[3rem] px-3 rounded-full bg-destructive/10 text-destructive text-sm font-bold">
                                                                    {record.absent_count}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className={`text-sm font-bold ${record.total_members > 0 && (record.present_count / record.total_members) * 100 > 75 ? 'text-primary' : 'text-amber-500'}`}>
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
                                                                        className="h-8 w-8 hover:bg-secondary/10 text-secondary"
                                                                        onClick={() => handleDownload(record)}
                                                                        title="Download file"
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
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
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="manual" className="mt-0">
                        {/* Manual Attendance Component */}
                        <ManualAttendance />
                    </TabsContent>

                    <TabsContent value="followup" className="mt-0">
                        {/* Absentee Report Component */}
                        <AbsenteeReport />
                    </TabsContent>
                    
                    <TabsContent value="members" className="mt-0">
                        {/* Members Manager Component */}
                        <MembersManager />
                    </TabsContent>

                    <TabsContent value="gallery" className="mt-0">
                        {/* Gallery Manager Component */}
                        <GalleryManager />
                    </TabsContent>

                    <TabsContent value="reports" className="mt-0">
                        {/* Attendance Report Component */}
                        <AttendanceReport />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default Dashboard;
