import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ClipboardCheck, Loader2, Save, Users } from "lucide-react";

interface Member {
  id: string;
  full_name: string;
}

interface AttendanceEntry {
  memberId: string;
  present: boolean;
}

export default function ManualAttendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("id, full_name")
        .order("full_name", { ascending: true });

      if (error) throw error;
      
      setMembers(data || []);
      setAttendance((data || []).map(m => ({ memberId: m.id, present: false })));
    } catch (error: any) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to load members.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAttendance = (memberId: string) => {
    setAttendance(prev => 
      prev.map(a => 
        a.memberId === memberId ? { ...a, present: !a.present } : a
      )
    );
  };

  const markAllPresent = () => {
    setAttendance(prev => prev.map(a => ({ ...a, present: true })));
  };

  const markAllAbsent = () => {
    setAttendance(prev => prev.map(a => ({ ...a, present: false })));
  };

  const handleSaveAttendance = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      const presentCount = attendance.filter(a => a.present).length;
      const absentCount = attendance.filter(a => !a.present).length;
      const totalMembers = attendance.length;

      const { error } = await supabase
        .from("attendance_records")
        .insert({
          user_id: user.id,
          file_name: `Manual Entry - ${format(new Date(attendanceDate), "MMM dd, yyyy")}`,
          file_path: `manual/${user.id}/${Date.now()}`,
          attendance_date: attendanceDate,
          total_members: totalMembers,
          present_count: presentCount,
          absent_count: absentCount,
          notes: `Manual attendance entry for ${presentCount} present, ${absentCount} absent`,
        });

      if (error) throw error;

      toast({
        title: "Attendance Saved",
        description: `Recorded ${presentCount} present, ${absentCount} absent for ${format(new Date(attendanceDate), "MMM dd, yyyy")}.`,
      });

      // Reset attendance
      setAttendance(members.map(m => ({ memberId: m.id, present: false })));
      setAttendanceDate(format(new Date(), "yyyy-MM-dd"));
    } catch (error: any) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = attendance.filter(a => a.present).length;
  const absentCount = attendance.filter(a => !a.present).length;

  if (isLoading) {
    return (
      <Card className="border-border/40">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (members.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="text-center py-12 px-4">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No members found</h3>
          <p className="text-sm text-muted-foreground">Add members first to mark attendance manually.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <ClipboardCheck className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-lg">Manual Attendance</CardTitle>
            <CardDescription className="text-xs">Mark attendance for each member</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="manualDate" className="text-xs font-medium text-muted-foreground">Date</Label>
            <Input
              id="manualDate"
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="bg-muted/30 border-border/40"
            />
          </div>
          <div className="flex gap-2 items-end">
            <Button variant="outline" size="sm" onClick={markAllPresent} className="text-xs">
              All Present
            </Button>
            <Button variant="outline" size="sm" onClick={markAllAbsent} className="text-xs">
              All Absent
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-success/10 text-success font-medium">
            Present: {presentCount}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive font-medium">
            Absent: {absentCount}
          </span>
        </div>

        <ScrollArea className="h-[300px] rounded-md border border-border/40 p-4">
          <div className="space-y-2">
            {members.map((member) => {
              const entry = attendance.find(a => a.memberId === member.id);
              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    entry?.present 
                      ? "bg-success/10 border border-success/20" 
                      : "bg-muted/30 border border-border/40 hover:bg-muted/50"
                  }`}
                  onClick={() => toggleAttendance(member.id)}
                >
                  <Checkbox
                    checked={entry?.present || false}
                    onCheckedChange={() => toggleAttendance(member.id)}
                    className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                  />
                  <span className={`text-sm font-medium ${entry?.present ? "text-success" : "text-foreground"}`}>
                    {member.full_name}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <Button 
          className="w-full gap-2" 
          onClick={handleSaveAttendance}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Attendance
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
