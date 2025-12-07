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
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import clbcLogo from "@/assets/clbc-logo.png";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={clbcLogo} alt="C.L.B.C Logo" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground leading-tight">C.L.B.C</span>
                <span className="text-xs text-muted-foreground leading-tight">Dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>Welcome,</span>
                <span className="font-medium text-foreground">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member'}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Track and manage attendance records</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {memberStats.map((stat, index) => (
            <Card key={index} className="border-border/60 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Section */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Attendance
            </CardTitle>
            <CardDescription>
              Upload an Excel file (.xlsx, .xls) or CSV with attendance data. 
              Include a "Status" or "Present" column with values like "Present/Absent" or "P/A".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="attendanceDate">Attendance Date</Label>
                <Input
                  id="attendanceDate"
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="file">Excel/CSV File</Label>
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
            {isUploading && (
              <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing file...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Records Table */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Attendance History
            </CardTitle>
            <CardDescription>View and manage uploaded attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No attendance records yet.</p>
                <p className="text-sm">Upload your first Excel file to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                      <TableHead className="text-center">Rate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {format(new Date(record.attendance_date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {record.file_name}
                        </TableCell>
                        <TableCell className="text-center">{record.total_members}</TableCell>
                        <TableCell className="text-center text-success font-medium">
                          {record.present_count}
                        </TableCell>
                        <TableCell className="text-center text-destructive font-medium">
                          {record.absent_count}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.total_members > 0 
                            ? Math.round((record.present_count / record.total_members) * 100) 
                            : 0}%
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(record)}
                              title="Download file"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(record)}
                              className="text-destructive hover:text-destructive"
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
      </main>
    </div>
  );
};

export default Dashboard;
