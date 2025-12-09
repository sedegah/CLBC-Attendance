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
  AlertTriangle
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
    },
    {
      title: "Members Tracked",
      value: totalMembersTracked.toString(),
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Total Present",
      value: totalPresent.toString(),
      icon: UserPlus,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Avg. Attendance Rate",
      value: `${avgAttendanceRate}%`,
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={clbcLogo} alt="C.L.B.C Logo" className="h-10 w-auto" />
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold text-foreground leading-tight">C.L.B.C</span>
                <span className="text-xs text-muted-foreground leading-tight">Church Management</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member'}
                </span>
              </div>
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 border-primary/20 hover:bg-primary/5">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-dark to-secondary p-8 text-primary-foreground">
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard className="h-8 w-8" />
              <h1 className="text-2xl md:text-3xl font-bold">Welcome back!</h1>
            </div>
            <p className="text-primary-foreground/80 max-w-xl">
              Track attendance, manage records, and keep your church community organized all in one place.
            </p>
          </div>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="bg-muted/30 border border-border/40">
            <TabsTrigger value="attendance" className="gap-2 data-[state=active]:bg-background">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2 data-[state=active]:bg-background">
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Manual</span>
            </TabsTrigger>
            <TabsTrigger value="followup" className="gap-2 data-[state=active]:bg-background">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Follow-Up</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2 data-[state=active]:bg-background">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6 mt-0">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {memberStats.map((stat, index) => (
                <Card key={index} className="group border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 overflow-hidden">
                  <CardContent className="p-5 relative">
                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bgColor} rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-70 transition-opacity`} />
                    <div className="relative z-10 space-y-3">
                      <div className={`h-10 w-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Upload Section */}
              <Card className="lg:col-span-1 border-border/40 border-dashed border-2 hover:border-primary/40 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Upload Attendance</CardTitle>
                      <CardDescription className="text-xs">Excel or CSV files</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="attendanceDate" className="text-xs font-medium text-muted-foreground">Select Date</Label>
                    <Input
                      id="attendanceDate"
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="bg-muted/30 border-border/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file" className="text-xs font-medium text-muted-foreground">Attendance File</Label>
                    <div className="relative">
                      <Input
                        ref={fileInputRef}
                        id="file"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="cursor-pointer bg-muted/30 border-border/40 file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:cursor-pointer"
                      />
                    </div>
                  </div>
                  {isUploading && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 text-primary text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing file...</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Include a "Status" or "Present" column with values like "Present/Absent" or "P/A".
                  </p>
                </CardContent>
              </Card>

              {/* Attendance Records Table */}
              <Card className="lg:col-span-2 border-border/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Attendance History</CardTitle>
                        <CardDescription className="text-xs">{attendanceRecords.length} records total</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : attendanceRecords.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">No records yet</h3>
                      <p className="text-sm text-muted-foreground">Upload your first attendance file to get started.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/40 hover:bg-transparent">
                            <TableHead className="text-xs font-semibold">Date</TableHead>
                            <TableHead className="text-xs font-semibold hidden md:table-cell">File</TableHead>
                            <TableHead className="text-xs font-semibold text-center">Present</TableHead>
                            <TableHead className="text-xs font-semibold text-center">Absent</TableHead>
                            <TableHead className="text-xs font-semibold text-center">Rate</TableHead>
                            <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendanceRecords.slice(0, 8).map((record) => (
                            <TableRow key={record.id} className="border-border/40 hover:bg-muted/30">
                              <TableCell className="py-3">
                                <div className="font-medium text-sm">
                                  {format(new Date(record.attendance_date), "MMM dd")}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(record.attendance_date), "yyyy")}
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <span className="text-sm text-muted-foreground truncate max-w-[120px] block">
                                  {record.file_name}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center justify-center h-7 min-w-[2rem] px-2 rounded-md bg-success/10 text-success text-sm font-medium">
                                  {record.present_count}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center justify-center h-7 min-w-[2rem] px-2 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                                  {record.absent_count}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-sm font-semibold text-foreground">
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
                                    className="h-8 w-8 hover:bg-secondary/10 hover:text-secondary"
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
                      {attendanceRecords.length > 8 && (
                        <div className="text-center py-3 border-t border-border/40">
                          <span className="text-sm text-muted-foreground">
                            Showing 8 of {attendanceRecords.length} records
                          </span>
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
    </div>
  );
};

export default Dashboard;
