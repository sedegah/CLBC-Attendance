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
  ChevronRight,
  BarChart3,
  FileSpreadsheet,
  CheckCircle,
  XCircle
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
      borderColor: "border-primary/20",
      description: "Attendance files uploaded"
    },
    {
      title: "Members Tracked",
      value: totalMembersTracked.toString(),
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/20",
      description: "Total member entries"
    },
    {
      title: "Total Present",
      value: totalPresent.toString(),
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-200",
      description: "Present member count"
    },
    {
      title: "Avg. Attendance Rate",
      value: `${avgAttendanceRate}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-200",
      description: "Overall attendance rate"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img src={clbcLogo} alt="C.L.B.C Logo" className="h-9 w-auto" />
                <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
                <div className="hidden sm:flex flex-col">
                  <span className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-tight">Attendance Dashboard</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">C.L.B.C Management System</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member'}
                </span>
              </div>
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/")}
                className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary"
              >
                Home
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut} 
                className="gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Welcome back!</h1>
                  <p className="text-blue-100 mt-1">Dashboard Overview</p>
                </div>
              </div>
              <p className="text-white/90 max-w-xl text-sm md:text-base">
                Track attendance, manage records, and keep your church community organized all in one place.
              </p>
            </div>
            
            <Button 
              className="gap-2 bg-white text-blue-700 hover:bg-blue-50 border-0 shadow-lg"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Upload Attendance
            </Button>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {memberStats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center justify-between">
                <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.title}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl w-full justify-start">
            <TabsTrigger 
              value="attendance" 
              className="gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded-lg px-4 py-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger 
              value="manual" 
              className="gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded-lg px-4 py-2"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Manual</span>
            </TabsTrigger>
            <TabsTrigger 
              value="followup" 
              className="gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded-lg px-4 py-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Follow-Up</span>
            </TabsTrigger>
            <TabsTrigger 
              value="members" 
              className="gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded-lg px-4 py-2"
            >
              <Users className="h-4 w-4" />
              <span>Members</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6 mt-0">
            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Upload Section */}
              <Card className="lg:col-span-1 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Upload Attendance</CardTitle>
                      <CardDescription>Excel or CSV files</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="attendanceDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="attendanceDate"
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="file" className="text-sm font-medium text-slate-700 dark:text-slate-300">Attendance File</Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity" />
                      <Input
                        ref={fileInputRef}
                        id="file"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 file:bg-blue-600 file:text-white file:border-0 file:rounded-lg file:px-4 file:py-2 file:mr-4 file:cursor-pointer hover:file:bg-blue-700 transition-colors"
                      />
                    </div>
                  </div>
                  
                  {isUploading && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Processing file...</p>
                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Please wait while we analyze your attendance data</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">File Requirements</p>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Include "Status" or "Present" column
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Accepts .xlsx, .xls, and .csv formats
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Values: "Present/Absent" or "P/A"
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Records Table */}
              <Card className="lg:col-span-2 border-slate-200 dark:border-slate-700 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Attendance History</CardTitle>
                        <CardDescription>{attendanceRecords.length} records total • Most recent first</CardDescription>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-slate-600 dark:text-slate-400 hover:text-primary"
                      onClick={fetchAttendanceRecords}
                    >
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
                      <p className="text-sm text-slate-500">Loading attendance records...</p>
                    </div>
                  ) : attendanceRecords.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-10 w-10 text-slate-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">No records yet</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Upload your first attendance file to get started.</p>
                      <Button 
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Upload First Record
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Date</TableHead>
                            <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">File Name</TableHead>
                            <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-center">Attendance</TableHead>
                            <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendanceRecords.slice(0, 8).map((record) => {
                            const attendanceRate = record.total_members > 0 
                              ? Math.round((record.present_count / record.total_members) * 100) 
                              : 0;
                            return (
                              <TableRow key={record.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                <TableCell className="py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm text-slate-900 dark:text-white">
                                        {format(new Date(record.attendance_date), "MMM dd, yyyy")}
                                      </div>
                                      <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {record.total_members} members
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                                      {record.file_name}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-4">
                                    <div className="text-center">
                                      <div className="flex items-center gap-1">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                          {record.present_count}
                                        </span>
                                      </div>
                                      <span className="text-xs text-slate-500">Present</span>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                                    <div className="text-center">
                                      <div className="flex items-center gap-1">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                          {record.absent_count}
                                        </span>
                                      </div>
                                      <span className="text-xs text-slate-500">Absent</span>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                                    <div className="text-center">
                                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                                        {attendanceRate}%
                                      </div>
                                      <span className="text-xs text-slate-500">Rate</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 gap-1 text-slate-600 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-800"
                                      onClick={() => handleDownload(record)}
                                      title="Download file"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      <span className="hidden sm:inline">Download</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 gap-1 text-slate-600 hover:text-red-600 hover:border-red-200 dark:hover:border-red-800"
                                      onClick={() => handleDelete(record)}
                                      title="Delete record"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span className="hidden sm:inline">Delete</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      {attendanceRecords.length > 8 && (
                        <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-3 bg-slate-50 dark:bg-slate-800/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              Showing 8 of {attendanceRecords.length} records
                            </span>
                            <Button variant="ghost" size="sm" className="gap-1 text-blue-600 hover:text-blue-700">
                              View All
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-0">
            <ManualAttendance />
          </TabsContent>

          <TabsContent value="followup" className="mt-0">
            <AbsenteeReport />
          </TabsContent>

          <TabsContent value="members" className="mt-0">
            <MembersManager />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-12 py-6">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={clbcLogo} alt="C.L.B.C Logo" className="h-6 w-auto opacity-80" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                © {new Date().getFullYear()} C.L.B.C Church Management System
              </span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              {totalRecords} records • Last updated: {format(new Date(), "MMM dd, yyyy")}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
