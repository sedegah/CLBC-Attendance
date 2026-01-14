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
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";
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
  LineChart as LineChartIcon
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

      // Fetch attendance records
      let recordsQuery = supabase
        .from("attendance_records")
        .select("id, attendance_date, total_members, present_count, absent_count")
        .order("attendance_date", { ascending: true });

      if (start) recordsQuery = recordsQuery.gte("attendance_date", start);
      if (end) recordsQuery = recordsQuery.lte("attendance_date", end);

      const { data: records, error: recordsError } = await recordsQuery;
      if (recordsError) throw recordsError;

      setAttendanceRecords(records || []);

      // Fetch members
      const { data: members, error: membersError } = await supabase
        .from("members")
        .select("id, full_name, phone")
        .order("full_name");

      if (membersError) throw membersError;

      // Fetch member attendance for these records
      const recordIds = (records || []).map(r => r.id);
      
      let memberStats: MemberAttendance[] = [];
      
      if (recordIds.length > 0) {
        const { data: attendance, error: attendanceError } = await supabase
          .from("member_attendance")
          .select("member_id, is_present, attendance_record_id")
          .in("attendance_record_id", recordIds);

        if (attendanceError) throw attendanceError;

        // Calculate stats per member
        memberStats = (members || []).map(member => {
          const memberRecords = (attendance || []).filter(a => a.member_id === member.id);
          const presentCount = memberRecords.filter(a => a.is_present).length;
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

        memberStats.sort((a, b) => b.attendance_rate - a.attendance_rate);
      }

      setMemberAttendance(memberStats);

      // Calculate summary
      const totalSessions = records?.length || 0;
      const totalPresent = records?.reduce((sum, r) => sum + r.present_count, 0) || 0;
      const totalTracked = records?.reduce((sum, r) => sum + r.total_members, 0) || 0;
      const avgAttendance = totalTracked > 0 ? Math.round((totalPresent / totalTracked) * 100) : 0;
      
      const attendanceRates = records?.map(r => 
        r.total_members > 0 ? Math.round((r.present_count / r.total_members) * 100) : 0
      ) || [];

      setSummary({
        totalSessions,
        totalMembers: memberStats.length,
        avgAttendance,
        highestAttendance: Math.max(...attendanceRates, 0),
        lowestAttendance: attendanceRates.length > 0 ? Math.min(...attendanceRates) : 0,
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

  const handlePrint = () => {
    window.print();
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
      return `${format(parseISO(start), "MMM dd, yyyy")} - ${format(parseISO(end), "MMM dd, yyyy")}`;
    }
    return "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style>
        {`
          @media print {
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
              padding: 20px;
              background: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
            .print-container table {
              border-collapse: collapse;
              width: 100%;
            }
            .print-container th, .print-container td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .print-container th {
              background-color: #f3f4f6 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-break {
              page-break-before: always;
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
                Attendance Report
              </CardTitle>
              <CardDescription className="mt-1">
                Comprehensive attendance statistics and member breakdown
              </CardDescription>
            </div>
            <Button onClick={handlePrint} className="gap-2 no-print">
              <Printer className="h-4 w-4" />
              Print / Export PDF
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Date Range Filters - Hidden on print */}
          <div className="no-print flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg border border-border/40">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                <SelectTrigger className="w-full sm:w-40">
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
              <div className="space-y-2">
                <Label>Select Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getMonthOptions().map(month => (
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
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full sm:w-44"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full sm:w-44"
                  />
                </div>
              </>
            )}
          </div>

          {/* Printable Content */}
          <div ref={printRef} className="print-container space-y-8">
            {/* Report Header - For Print */}
            <div className="hidden print:block text-center mb-8">
              <h1 className="text-2xl font-bold">C.L.B.C Attendance Report</h1>
              <p className="text-gray-600">{getDateRangeLabel()}</p>
              <p className="text-sm text-gray-500">Generated on {format(new Date(), "MMMM dd, yyyy 'at' h:mm a")}</p>
            </div>

            {/* Summary Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Summary Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-3 sm:p-4 text-center">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-primary mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-primary">{summary.totalSessions}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Sessions</p>
                </div>
                <div className="bg-secondary/10 dark:bg-secondary/20 rounded-lg p-3 sm:p-4 text-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-secondary mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-secondary">{summary.totalMembers}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Members Tracked</p>
                </div>
                <div className="bg-green-500/10 dark:bg-green-500/20 rounded-lg p-3 sm:p-4 text-center">
                  <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{summary.avgAttendance}%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Avg Attendance</p>
                </div>
                <div className="bg-blue-500/10 dark:bg-blue-500/20 rounded-lg p-3 sm:p-4 text-center">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.highestAttendance}%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Highest Rate</p>
                </div>
                <div className="bg-amber-500/10 dark:bg-amber-500/20 rounded-lg p-3 sm:p-4 text-center col-span-2 md:col-span-1">
                  <UserX className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-amber-600 dark:text-amber-400 mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.lowestAttendance}%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Lowest Rate</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            {attendanceRecords.length > 0 && (
              <div className="space-y-6 no-print">
                {/* Attendance Trend Chart */}
                <div className="bg-muted/20 rounded-lg p-4 sm:p-6 border border-border/40">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-primary" />
                    Attendance Trend
                  </h3>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={attendanceRecords.map(r => ({
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
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
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
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                          labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                          formatter={(value: number) => [`${value}%`, 'Attendance Rate']}
                        />
                        <Area
                          type="monotone"
                          dataKey="rate"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRate)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Present vs Absent Bar Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-muted/20 rounded-lg p-4 sm:p-6 border border-border/40">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Present vs Absent by Session
                    </h3>
                    <div className="h-64 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={attendanceRecords.map(r => ({
                            date: format(parseISO(r.attendance_date), "MMM dd"),
                            present: r.present_count,
                            absent: r.absent_count,
                          }))}
                          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
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
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Bar dataKey="present" name="Present" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="absent" name="Absent" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Overall Attendance Pie Chart */}
                  <div className="bg-muted/20 rounded-lg p-4 sm:p-6 border border-border/40">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-primary" />
                      Overall Attendance Distribution
                    </h3>
                    <div className="h-64 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { 
                                name: 'Present', 
                                value: attendanceRecords.reduce((sum, r) => sum + r.present_count, 0),
                                color: 'hsl(142, 76%, 36%)'
                              },
                              { 
                                name: 'Absent', 
                                value: attendanceRecords.reduce((sum, r) => sum + r.absent_count, 0),
                                color: 'hsl(0, 84%, 60%)'
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                          >
                            <Cell fill="hsl(142, 76%, 36%)" />
                            <Cell fill="hsl(0, 84%, 60%)" />
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            formatter={(value: number, name: string) => [value, name]}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Top Attendees Chart */}
                {memberAttendance.length > 0 && (
                  <div className="bg-muted/20 rounded-lg p-4 sm:p-6 border border-border/40">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Top 10 Attendees by Rate
                    </h3>
                    <div className="h-64 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={memberAttendance.slice(0, 10).map(m => ({
                            name: m.member_name.length > 15 ? m.member_name.substring(0, 15) + '...' : m.member_name,
                            fullName: m.member_name,
                            rate: m.attendance_rate,
                            present: m.present_count,
                            absent: m.absent_count,
                          }))}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                          <XAxis 
                            type="number" 
                            domain={[0, 100]} 
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => `${v}%`}
                          />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            tick={{ fontSize: 11 }}
                            width={100}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
                            formatter={(value: number) => [`${value}%`, 'Attendance Rate']}
                          />
                          <Bar 
                            dataKey="rate" 
                            name="Rate"
                            radius={[0, 4, 4, 0]}
                          >
                            {memberAttendance.slice(0, 10).map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={
                                  entry.attendance_rate >= 75 
                                    ? 'hsl(142, 76%, 36%)' 
                                    : entry.attendance_rate >= 50 
                                      ? 'hsl(45, 93%, 47%)' 
                                      : 'hsl(0, 84%, 60%)'
                                } 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Session Breakdown */}
            <div className="print-break">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Session Breakdown
              </h3>
              {attendanceRecords.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No attendance records found for this period.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Present</TableHead>
                        <TableHead className="text-center">Absent</TableHead>
                        <TableHead className="text-center">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map((record) => {
                        const rate = record.total_members > 0 
                          ? Math.round((record.present_count / record.total_members) * 100) 
                          : 0;
                        return (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {format(parseISO(record.attendance_date), "EEE, MMM dd, yyyy")}
                            </TableCell>
                            <TableCell className="text-center">{record.total_members}</TableCell>
                            <TableCell className="text-center text-green-600 dark:text-green-400">{record.present_count}</TableCell>
                            <TableCell className="text-center text-red-600 dark:text-red-400">{record.absent_count}</TableCell>
                            <TableCell className="text-center">
                              <span className={`font-semibold ${rate >= 75 ? 'text-green-600 dark:text-green-400' : rate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
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
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Member Attendance Details
              </h3>
              {memberAttendance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No member attendance data found for this period.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Member Name</TableHead>
                        <TableHead className="hidden sm:table-cell">Phone</TableHead>
                        <TableHead className="text-center">Sessions</TableHead>
                        <TableHead className="text-center">Present</TableHead>
                        <TableHead className="text-center">Absent</TableHead>
                        <TableHead className="text-center">Rate</TableHead>
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
                          <TableCell className="text-center">{member.total_sessions}</TableCell>
                          <TableCell className="text-center text-green-600 dark:text-green-400">{member.present_count}</TableCell>
                          <TableCell className="text-center text-red-600 dark:text-red-400">{member.absent_count}</TableCell>
                          <TableCell className="text-center">
                            <span className={`inline-flex items-center justify-center min-w-12 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              member.attendance_rate >= 75 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : member.attendance_rate >= 50 
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {member.attendance_rate}%
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
            <div className="hidden print:block text-center mt-8 pt-4 border-t text-sm text-gray-500">
              <p>C.L.B.C Church Management System</p>
              <p>This report was automatically generated.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
