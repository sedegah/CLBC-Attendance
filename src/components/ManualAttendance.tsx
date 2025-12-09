import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ClipboardCheck, Loader2, Save, Users, Search, Check, X } from "lucide-react";

interface Member {
  id: string;
  full_name: string;
  phone: string | null;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("id, full_name, phone")
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

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(m => m.full_name.toLowerCase().includes(query));
  }, [members, searchQuery]);

  const toggleAttendance = (memberId: string) => {
    setAttendance(prev => 
      prev.map(a => 
        a.memberId === memberId ? { ...a, present: !a.present } : a
      )
    );
  };

  const markPresent = (memberId: string) => {
    setAttendance(prev => 
      prev.map(a => 
        a.memberId === memberId ? { ...a, present: true } : a
      )
    );
    setSearchQuery("");
  };

  const markAbsent = (memberId: string) => {
    setAttendance(prev => 
      prev.map(a => 
        a.memberId === memberId ? { ...a, present: false } : a
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      const presentCount = attendance.filter(a => a.present).length;
      const absentCount = attendance.filter(a => !a.present).length;
      const totalMembers = attendance.length;

      // Create attendance record
      const { data: record, error: recordError } = await supabase
        .from("attendance_records")
        .insert({
          user_id: user.id,
          file_name: `Manual Entry - ${format(new Date(attendanceDate), "MMM dd, yyyy")}`,
          file_path: `manual/${user.id}/${Date.now()}`,
          attendance_date: attendanceDate,
          total_members: totalMembers,
          present_count: presentCount,
          absent_count: absentCount,
          notes: `Manual attendance: ${presentCount} present, ${absentCount} absent`,
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Insert individual member attendance
      const memberAttendanceRecords = attendance.map(a => ({
        attendance_record_id: record.id,
        member_id: a.memberId,
        is_present: a.present,
      }));

      const { error: attendanceError } = await supabase
        .from("member_attendance")
        .insert(memberAttendanceRecords);

      if (attendanceError) throw attendanceError;

      toast({
        title: "Attendance Saved",
        description: `Recorded ${presentCount} present, ${absentCount} absent for ${format(new Date(attendanceDate), "MMM dd, yyyy")}.`,
      });

      // Reset attendance
      setAttendance(members.map(m => ({ memberId: m.id, present: false })));
      setAttendanceDate(format(new Date(), "yyyy-MM-dd"));
      setSearchQuery("");
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
  const presentMembers = members.filter(m => attendance.find(a => a.memberId === m.id)?.present);

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
            <CardDescription className="text-xs">Search and mark members as present</CardDescription>
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
        </div>

        {/* Search to mark present */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Search Member to Mark Present</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Type member name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 border-border/40"
            />
          </div>
          
          {/* Search results dropdown */}
          {searchQuery.trim() && (
            <div className="border border-border/40 rounded-lg bg-card max-h-[200px] overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground text-center">No members found</div>
              ) : (
                filteredMembers.map((member) => {
                  const isPresent = attendance.find(a => a.memberId === member.id)?.present;
                  return (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer border-b border-border/20 last:border-b-0 ${
                        isPresent ? "bg-success/10" : ""
                      }`}
                      onClick={() => markPresent(member.id)}
                    >
                      <span className="text-sm font-medium">{member.full_name}</span>
                      {isPresent ? (
                        <span className="text-xs text-success flex items-center gap-1">
                          <Check className="h-3 w-3" /> Present
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Click to mark present</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Attendance summary */}
        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-success/10 text-success font-medium">
            Present: {presentCount}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive font-medium">
            Absent: {absentCount}
          </span>
        </div>

        {/* Present members list */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Members Marked Present ({presentCount})
          </Label>
          <ScrollArea className="h-[200px] rounded-md border border-border/40 p-3">
            {presentMembers.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No members marked present yet. Search above to add.
              </div>
            ) : (
              <div className="space-y-2">
                {presentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-success/10 border border-success/20"
                  >
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium text-foreground">{member.full_name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => markAbsent(member.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <p className="text-xs text-muted-foreground">
          All members not marked present will be recorded as absent when you save.
        </p>

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
              Save Attendance ({presentCount} present, {absentCount} absent)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
