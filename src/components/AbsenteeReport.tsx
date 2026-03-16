import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { fetchApi } from "@/lib/apiClient";
import { format } from "date-fns";
import { AlertTriangle, Loader2, Phone, Calendar, Download } from "lucide-react";

interface AbsenteeInfo {
  memberId: string;
  memberName: string;
  phone: string | null;
  consecutiveAbsences: number;
  lastPresentDate: string | null;
}

export default function AbsenteeReport() {
  const { toast } = useToast();
  const [absentees, setAbsentees] = useState<AbsenteeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAbsenteeData();
  }, []);

  const fetchAbsenteeData = async () => {
    try {
      // Get all members
      const members = await fetchApi("/members");

      // Get all member attendance records ordered by date
      const attendanceRecords = await fetchApi("/attendance");

      if (!attendanceRecords || attendanceRecords.length === 0) {
        setAbsentees([]);
        setIsLoading(false);
        return;
      }

      // Get member attendance data
      const memberAttendance = await fetchApi("/attendance/details");

      // Create a map of attendance records by id
      const recordDateMap = new Map();
      attendanceRecords.forEach((r: any) => {
        recordDateMap.set(r.id, r.attendance_date);
      });

      // Process each member
      const absenteeList: AbsenteeInfo[] = [];

      for (const member of members || []) {
        // Get this member's attendance sorted by date (most recent first)
        const memberRecords = (memberAttendance || [])
          .filter((ma: any) => ma.member_id === member.id)
          .map((ma: any) => ({
            ...ma,
            is_present: ma.is_present || ma.is_present === 1,
            date: recordDateMap.get(ma.attendance_record_id) || "",
          }))
          .filter((ma: any) => ma.date) // ensure date exists
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Count consecutive absences from most recent
        let consecutiveAbsences = 0;
        let lastPresentDate: string | null = null;

        for (const record of memberRecords) {
          if (!record.is_present) {
            consecutiveAbsences++;
          } else {
            lastPresentDate = record.date;
            break;
          }
        }

        // If never present, check if they have any records
        if (lastPresentDate === null && memberRecords.length > 0) {
          // Find earliest record to show "never present"
          const presentRecord = memberRecords.find(r => r.is_present);
          lastPresentDate = presentRecord?.date || null;
        }

        // Only include members with 3+ consecutive absences
        if (consecutiveAbsences >= 3) {
          absenteeList.push({
            memberId: member.id,
            memberName: member.full_name,
            phone: member.phone,
            consecutiveAbsences,
            lastPresentDate,
          });
        }
      }

      // Sort by consecutive absences (highest first)
      absenteeList.sort((a, b) => b.consecutiveAbsences - a.consecutiveAbsences);

      setAbsentees(absenteeList);
    } catch (error: any) {
      console.error("Error fetching absentee data:", error);
      toast({
        title: "Error",
        description: "Failed to load absentee report.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (absentees.length === 0) return;

    const headers = ["Name", "Phone", "Consecutive Absences", "Last Present"];
    const rows = absentees.map(a => [
      a.memberName,
      a.phone || "N/A",
      a.consecutiveAbsences.toString(),
      a.lastPresentDate ? format(new Date(a.lastPresentDate), "MMM dd, yyyy") : "Never",
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `absentee-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Absentee report downloaded as CSV.",
    });
  };

  if (isLoading) {
    return (
      <Card className="border-border/40">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-lg">Follow-Up Required</CardTitle>
              <CardDescription className="text-xs">
                Members with 3+ consecutive absences
              </CardDescription>
            </div>
          </div>
          {absentees.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {absentees.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No Follow-Ups Needed</h3>
            <p className="text-sm text-muted-foreground">
              All members have attended recently or have fewer than 3 consecutive absences.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold">Member</TableHead>
                  <TableHead className="text-xs font-semibold">Phone</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Absences</TableHead>
                  <TableHead className="text-xs font-semibold">Last Present</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absentees.map((absentee) => (
                  <TableRow key={absentee.memberId} className="border-border/40 hover:bg-muted/30">
                    <TableCell className="py-3">
                      <span className="font-medium text-sm">{absentee.memberName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {absentee.phone || "No phone"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center justify-center h-7 min-w-[2rem] px-2 rounded-md text-sm font-medium ${absentee.consecutiveAbsences >= 5
                          ? "bg-destructive/20 text-destructive"
                          : "bg-destructive/10 text-destructive"
                        }`}>
                        {absentee.consecutiveAbsences}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {absentee.lastPresentDate
                          ? format(new Date(absentee.lastPresentDate), "MMM dd, yyyy")
                          : "Never"
                        }
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {absentee.phone ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8 text-xs"
                          onClick={() => window.open(`tel:${absentee.phone}`, "_self")}
                        >
                          <Phone className="h-3 w-3" />
                          Call
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">No phone</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
